import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = BASE_DIR / "models" / "real_estate_price_model.joblib"

# Change this if your cleaned sale dataset has another location
DATA_PATH = BASE_DIR.parent / "dataset" / "processed" / "featured_data.csv"

REPORTS_DIR = BASE_DIR.parent / "reports"

SHAP_OUTPUT_PATH = REPORTS_DIR / "shap_feature_importance.csv"


# ============================================================
# Configuration
# ============================================================

SAMPLE_SIZE = 1000
RANDOM_STATE = 42


# ============================================================
# Load model
# ============================================================

print("Loading saved model...")

pipeline = joblib.load(MODEL_PATH)

preprocessor = pipeline.named_steps["preprocessor"]
model = pipeline.named_steps["model"]

print("Model loaded successfully.")
print(f"Model type: {type(model)}")


# ============================================================
# Load dataset
# ============================================================

print("\nLoading sale dataset...")

df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")


# ============================================================
# Remove target
# ============================================================

target = "price"

if target not in df.columns:
    raise ValueError(
        f"Target column '{target}' was not found."
    )

X = df.drop(columns=[target])


# ============================================================
# Keep only features used by the pipeline
# ============================================================

numeric_features = [
    "area",
    "num_bath_rooms",
    "num_bed_rooms",
    "relaxation_amenity_count",
    "security_amenity_count",
    "maintenance_or_cleaning_amenity_count",
    "social_amenity_count",
    "expendable_amenity_count",
    "service_staff_amenity_count",
    "unclassify_amenity_count",
    "bedroom_not_applicable",
    "log_area",
    "total_rooms",
    "bath_bed_ratio",
    "area_per_bedroom",
    "total_amenities",
]

categorical_features = [
    "building_type",
    "building_nature",
    "city",
    "locality",
    "division",
    "zone",
]

required_features = numeric_features + categorical_features

missing_features = [
    col for col in required_features
    if col not in X.columns
]

if missing_features:
    raise ValueError(
        f"Missing features in dataset: {missing_features}"
    )

X = X[required_features]


# ============================================================
# Sample data
# ============================================================

if len(X) > SAMPLE_SIZE:

    X_sample = X.sample(
        n=SAMPLE_SIZE,
        random_state=RANDOM_STATE
    )

else:

    X_sample = X.copy()


print(
    f"Using {len(X_sample)} samples for SHAP."
)


# ============================================================
# Transform using the SAVED preprocessor
# ============================================================

print("\nTransforming data...")

X_transformed = preprocessor.transform(X_sample)

print(
    "Transformed shape:",
    X_transformed.shape
)


# ============================================================
# Convert sparse matrix to dense
# ============================================================

if hasattr(X_transformed, "toarray"):

    X_transformed = X_transformed.toarray()

else:

    X_transformed = np.asarray(X_transformed)


print(
    "Dense shape:",
    X_transformed.shape
)


# ============================================================
# Get transformed feature names
# ============================================================

feature_names = preprocessor.get_feature_names_out()

print(
    "Number of feature names:",
    len(feature_names)
)

print(
    "Number of transformed features:",
    X_transformed.shape[1]
)


if len(feature_names) != X_transformed.shape[1]:

    raise ValueError(
        "Feature name count does not match transformed feature count."
    )


# ============================================================
# SHAP
# ============================================================

print("\nCalculating SHAP values...")

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(
    X_transformed
)


# ============================================================
# Handle SHAP output
# ============================================================

if isinstance(shap_values, list):

    shap_values = shap_values[0]


shap_values = np.asarray(shap_values)

print(
    "SHAP shape:",
    shap_values.shape
)


if shap_values.shape != X_transformed.shape:

    raise ValueError(
        f"SHAP shape {shap_values.shape} does not match "
        f"feature matrix shape {X_transformed.shape}"
    )


# ============================================================
# Mean absolute SHAP importance
# ============================================================

mean_abs_shap = np.abs(shap_values).mean(axis=0)


shap_df = pd.DataFrame({
    "feature": feature_names,
    "mean_abs_shap": mean_abs_shap,
})


# ============================================================
# Clean feature names
# ============================================================

shap_df["feature"] = (
    shap_df["feature"]
    .str.replace("num__", "", regex=False)
    .str.replace("cat__", "", regex=False)
)


# ============================================================
# Sort
# ============================================================

shap_df = shap_df.sort_values(
    "mean_abs_shap",
    ascending=False
).reset_index(drop=True)


# ============================================================
# Save
# ============================================================

REPORTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

shap_df.to_csv(
    SHAP_OUTPUT_PATH,
    index=False
)


# ============================================================
# Display
# ============================================================

print("\nTop 20 SHAP features:")
print(
    shap_df.head(20).to_string(index=False)
)

print(
    f"\nSHAP results saved to:\n{SHAP_OUTPUT_PATH}"
)