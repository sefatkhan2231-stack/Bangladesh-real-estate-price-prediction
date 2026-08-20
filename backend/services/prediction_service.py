from pathlib import Path

import joblib
import numpy as np
import pandas as pd

# --------------------------------------------------
# Model Path
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / 'models' / 'real_estate_price_model.joblib'

# --------------------------------------------------
# Load Model Once
# --------------------------------------------------

model = joblib.load(MODEL_PATH)

# --------------------------------------------------
# Batch Prediction Function
# --------------------------------------------------
# This is the single source of truth for running data through the trained
# pipeline (preprocessing + model). Both the single-record `/predict`
# endpoint and the CSV `/predict/batch` endpoint funnel through here so the
# exact same preprocessing/feature-engineering path is used everywhere.

def predict_price_batch(property_data_list: list[dict]) -> list[float]:

    if not property_data_list:
        return []

    # Build a single DataFrame so the pipeline's preprocessing runs once,
    # the same way it did during training/evaluation.
    df = pd.DataFrame(property_data_list)

    predict_log = model.predict(df)

    # convert predictions back to original price scale
    predicted_prices = np.expm1(predict_log)

    return [float(price) for price in predicted_prices]


# --------------------------------------------------
# Single Prediction Function
# --------------------------------------------------

def predict_price(property_data: dict) -> float:
    return predict_price_batch([property_data])[0]