from __future__ import annotations

from typing import Iterable, Optional

import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin


class DataFrameSelector(BaseEstimator, TransformerMixin):
    """
    Minimal transformer used by the pickled sklearn Pipeline(s).

    The serialized model(s) reference `src.utils.DataFrameSelector`, so this
    module path and class name must exist for unpickling to succeed.
    """

    def __init__(self, attribute_names: Optional[Iterable[str]] = None):
        self.attribute_names = list(attribute_names) if attribute_names is not None else None

    def fit(self, X, y=None):  # noqa: N803 - sklearn signature convention
        return self

    def transform(self, X):  # noqa: N803 - sklearn signature convention
        df = _coerce_to_dataframe(X)

        if not self.attribute_names:
            return df

        for col in self.attribute_names:
            if col not in df.columns:
                df[col] = 0

        return df.loc[:, self.attribute_names]


def _coerce_to_dataframe(X) -> pd.DataFrame:  # noqa: N802 - keep internal helper small
    if isinstance(X, pd.DataFrame):
        return X

    if isinstance(X, dict):
        return pd.DataFrame([X])

    if isinstance(X, list):
        if len(X) == 0:
            return pd.DataFrame()
        if isinstance(X[0], dict):
            return pd.DataFrame(X)

    return pd.DataFrame(X)

