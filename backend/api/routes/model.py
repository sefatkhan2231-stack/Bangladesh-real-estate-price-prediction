from pathlib import Path
import json

import pandas as pd
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api/model",
    tags=['Model']
)

# --------------------------------------------------
# Paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

REPORTS_DIR = BASE_DIR.parent / 'reports'

METADATA_PATH = REPORTS_DIR / 'model_metadata.json'
FEATURE_IMPORTANCE_PATH = REPORTS_DIR / "feature_importance.csv"
COMPARISON_PATH = REPORTS_DIR / "model_comparison.csv"
RESULTS_LOG_PATH = REPORTS_DIR / "result_log.json"
SHAP_IMPORTANCE_PATH = REPORTS_DIR / "shap_feature_importance.csv"

# --------------------------------------------------
# Model Information
# --------------------------------------------------

@router.get("/info")
def get_model_info():

    if not METADATA_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Model metadata not found."
        )

    with open(METADATA_PATH, "r") as file:
        metadata = json.load(file)

    return metadata

# --------------------------------------------------
# Feature Importance
# --------------------------------------------------

@router.get('/feature-importance')
def get_feature_importance():

    if not FEATURE_IMPORTANCE_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail='Feature importance file not found.'
        )

    df = pd.read_csv(FEATURE_IMPORTANCE_PATH)

    return {
        'features': df.to_dict(orient='records')
    }

# --------------------------------------------------
# Model Comparison
# --------------------------------------------------

@router.get('/comparison')
def get_model_comparison():

    if not COMPARISON_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail='Model comparison file not found.'
        )

    df = pd.read_csv(COMPARISON_PATH)

    return {
        'models': df.to_dict(orient='records')
    }

# --------------------------------------------------
# Training Results
# --------------------------------------------------

@router.get('/results')
def get_training_results():

    if not RESULTS_LOG_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail='Training results not found.'
        )

    with open(RESULTS_LOG_PATH, 'r') as file:
        results = json.load(file)

    return {
        'results': results
    }


# --------------------------------------------------
# SHAP Feature Importance
# --------------------------------------------------

@router.get('/shap')
def get_shap_importance():

    if not SHAP_IMPORTANCE_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail='SHAP feature importance file not found.'
        )

    df = pd.read_csv(SHAP_IMPORTANCE_PATH)

    return {
        'features': df.to_dict(orient='records')
    }