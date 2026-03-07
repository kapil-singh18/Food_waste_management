# ML Service

This service loads the two `.pkl` models in the repo-level `models/` folder and exposes HTTP endpoints used by the Node backend.

## Setup

From `code/ml-service`:

```bash
python -m pip install -r requirements.txt
```

## Run

From `code/ml-service`:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 5001
```

## Endpoints

- `GET /health`
- `POST /predict` (food waste model)
- `POST /recommend` (dish recommender model)

