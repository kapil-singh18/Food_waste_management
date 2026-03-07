from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException


APP_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(APP_ROOT))
CODE_ROOT = APP_ROOT.parent           # .../code
REPO_ROOT = CODE_ROOT.parent          # .../Reckon 7.0

# Prefer models inside `code/ml-models`, fall back to legacy top-level `models/`.
PRIMARY_MODELS_DIR = CODE_ROOT / "ml-models"
FALLBACK_MODELS_DIR = REPO_ROOT / "models"
MODELS_DIR = PRIMARY_MODELS_DIR if PRIMARY_MODELS_DIR.exists() else FALLBACK_MODELS_DIR

FOOD_WASTE_MODEL_PATH = MODELS_DIR / "food_waste_model.pkl"
DISH_RECOMMENDER_MODEL_PATH = MODELS_DIR / "dish_recommender_model.pkl"


app = FastAPI(title="Reckon ML Service", version="1.0.0")

_food_waste_bundle: Optional[dict] = None
_dish_bundle: Optional[dict] = None


def _load_bundle(path: Path) -> dict:
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    bundle = joblib.load(path)
    if not isinstance(bundle, dict) or "model" not in bundle:
        raise ValueError(f"Unexpected model bundle format in {path.name}")
    return bundle


def _get_food_waste_bundle() -> dict:
    global _food_waste_bundle
    if _food_waste_bundle is None:
        _food_waste_bundle = _load_bundle(FOOD_WASTE_MODEL_PATH)
    return _food_waste_bundle


def _get_dish_bundle() -> dict:
    global _dish_bundle
    if _dish_bundle is None:
        _dish_bundle = _load_bundle(DISH_RECOMMENDER_MODEL_PATH)
    return _dish_bundle


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "models_dir": str(MODELS_DIR),
        "food_waste_model_present": FOOD_WASTE_MODEL_PATH.exists(),
        "dish_recommender_model_present": DISH_RECOMMENDER_MODEL_PATH.exists(),
    }


@app.post("/predict")
def predict(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict a single numeric value from the food waste model.

    Accepts either:
    - { "features": { ... } }
    - { ... }  (treated as features)
    - { "features": [ { ... }, { ... } ] } (batch)
    """
    bundle = _get_food_waste_bundle()
    model = bundle["model"]
    feature_names = bundle.get("feature_names")

    features = body.get("features", body)

    if isinstance(features, dict):
        X = pd.DataFrame([features])
    elif isinstance(features, list):
        if len(features) == 0:
            raise HTTPException(status_code=400, detail="features list is empty")
        if isinstance(features[0], dict):
            X = pd.DataFrame(features)
        else:
            X = pd.DataFrame([features])
    else:
        raise HTTPException(status_code=400, detail="features must be an object or an array")

    try:
        X_input = X

        if not feature_names or not isinstance(feature_names, list):
            raise ValueError("food_waste_model bundle is missing feature_names")

        X_vector = _vectorize_food_waste_inputs(X_input, feature_names)
        y = model.predict(X_vector)
    except Exception as e:  # noqa: BLE001 - surface model error to caller
        raise HTTPException(status_code=400, detail=f"Model predict failed: {e}") from e

    if hasattr(y, "tolist"):
        y = y.tolist()

    # Normalize to a single scalar response if possible.
    if isinstance(y, list) and len(y) == 1:
        prediction: Any = y[0]
    else:
        prediction = y

    return {
        "prediction": prediction,
        "model": "food_waste_model",
        "input_columns": list(X_input.columns),
        "feature_names": feature_names,
    }


def _vectorize_food_waste_inputs(raw_df: pd.DataFrame, feature_names: List[str]) -> pd.DataFrame:
    """
    Convert raw inputs into the one-hot + numeric vector expected by the stored LinearRegression.

    The saved sklearn preprocessing pipeline cannot be relied upon across sklearn versions
    (and fails on newer sklearn), so we encode the required features manually.
    """
    df = raw_df.copy()

    # Normalize likely input column names.
    rename = {
        "occupancyRate": "occupancy_rate",
        "temperatureC": "temperature_c",
        "prevDayMeals": "prev_day_meals",
        "prev7DayAvgMeals": "prev_7day_avg_meals",
        "mealsPrepared": "meals_prepared",
        "menuType": "menu_type",
        "facilityType": "facility_type",
    }
    df.rename(columns={k: v for k, v in rename.items() if k in df.columns}, inplace=True)

    out_rows: List[Dict[str, Any]] = []
    for _, row in df.iterrows():
        out: Dict[str, Any] = {name: 0 for name in feature_names}

        def get_num(key: str) -> float:
            val = row.get(key)
            try:
                return float(val)
            except Exception:
                return 0.0

        # Numeric core features.
        for key in ["occupancy_rate", "temperature_c", "prev_day_meals", "prev_7day_avg_meals", "meals_prepared"]:
            if key in out:
                out[key] = get_num(key)

        def norm_token(v: Any) -> str:
            s = str(v or "").strip().lower()
            s = s.replace(" ", "_")
            return s

        weather = norm_token(row.get("weather"))
        if "rain" in weather:
            weather = "rain"
        if weather:
            key = f"weather_{weather}"
            if key in out:
                out[key] = 1

        menu_type = norm_token(row.get("menu_type"))
        if menu_type:
            key = f"menu_type_{menu_type}"
            if key in out:
                out[key] = 1

        facility_type = norm_token(row.get("facility_type"))
        if facility_type:
            key = f"facility_type_{facility_type}"
            if key in out:
                out[key] = 1

        out_rows.append(out)

    return pd.DataFrame(out_rows, columns=feature_names)


@app.post("/recommend")
def recommend(body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Rank candidate dishes using the dish recommender model.

    Body options:
    - topK: int (default 5)
    - cuisine: str (optional)
    - menuType: str (optional)
    - maxPrepTimeMin: int (optional)
    - excludeMissingIngredients: bool (default false)
    """
    bundle = _get_dish_bundle()
    model = bundle["model"]
    feature_cols: List[str] = list(bundle.get("feature_cols") or [])
    candidates: List[dict] = list(bundle.get("candidate_dishes") or [])

    if not feature_cols or not candidates:
        raise HTTPException(status_code=500, detail="Dish model bundle is missing feature_cols or candidate_dishes")

    top_k = int(body.get("topK", 5))
    cuisine = body.get("cuisine")
    menu_type = body.get("menuType")
    max_prep = body.get("maxPrepTimeMin")
    exclude_missing = bool(body.get("excludeMissingIngredients", False))

    filtered: List[dict] = []
    for dish in candidates:
        if cuisine and str(dish.get("cuisine", "")).lower() != str(cuisine).lower():
            continue
        if menu_type and str(dish.get("menu_type", "")).lower() != str(menu_type).lower():
            continue
        if max_prep is not None and dish.get("prep_time_min") is not None:
            try:
                if int(dish["prep_time_min"]) > int(max_prep):
                    continue
            except Exception:
                pass
        if exclude_missing and dish.get("missing_ingredients"):
            continue
        filtered.append(dish)

    if not filtered:
        return {"recommendations": [], "model": "dish_recommender_model", "count": 0}

    X = pd.DataFrame(filtered)
    for col in feature_cols:
        if col not in X.columns:
            X[col] = 0
    X_feat = X.loc[:, feature_cols]

    try:
        scores = model.predict(X_feat)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=400, detail=f"Recommender predict failed: {e}") from e

    if hasattr(scores, "tolist"):
        scores = scores.tolist()

    ranked = []
    for dish, score in zip(filtered, scores):
        ranked.append(
            {
                "dishName": dish.get("dish_name"),
                "score": float(score) if score is not None else None,
                "cuisine": dish.get("cuisine"),
                "menuType": dish.get("menu_type"),
                "prepTimeMin": dish.get("prep_time_min"),
                "calories": dish.get("calories"),
                "missingIngredients": dish.get("missing_ingredients") or [],
                "ingredientCount": dish.get("ingredient_count"),
            }
        )

    ranked.sort(key=lambda x: (x["score"] is not None, x["score"]), reverse=True)
    ranked = ranked[: max(top_k, 0)]

    return {
        "recommendations": ranked,
        "model": "dish_recommender_model",
        "count": len(ranked),
        "featureCols": feature_cols,
    }

