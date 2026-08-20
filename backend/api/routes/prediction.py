import io

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import ValidationError

from schemas.batch_prediction import (
    BatchPredictionResponse,
    BatchPredictionRowResult,
    BatchPredictionSummary,
)
from schemas.prediction import (
    PropertyPredictionRequest,
    PropertyPredictionResponse,
)

from services.prediction_service import predict_price, predict_price_batch


router = APIRouter(
    prefix="/api",
    tags=["Prediction"],
)

# --------------------------------------------------
# Single Prediction
# --------------------------------------------------

@router.post(
    "/predict",
    response_model=PropertyPredictionResponse,
)
def predict(property_data: PropertyPredictionRequest):

    predicted_price = predict_price(
        property_data.model_dump()
    )

    return PropertyPredictionResponse(
        predicted_price=predicted_price
    )


# --------------------------------------------------
# Batch Prediction (CSV upload)
# --------------------------------------------------

MAX_BATCH_ROWS = 5000

# Columns every row must have. Amenity counts are treated as optional and
# default to 0 when missing, matching the defaults on PropertyPredictionRequest.
REQUIRED_COLUMNS = [
    "area",
    "building_type",
    "building_nature",
    "num_bath_rooms",
    "num_bed_rooms",
    "city",
    "locality",
    "zone",
    "division",
]

OPTIONAL_AMENITY_COLUMNS = [
    "relaxation_amenity_count",
    "security_amenity_count",
    "maintenance_or_cleaning_amenity_count",
    "social_amenity_count",
    "expendable_amenity_count",
    "service_staff_amenity_count",
    "unclassify_amenity_count",
]


def _format_validation_error(exc: Exception) -> str:
    """Turn a pydantic ValidationError into a short, user-facing message."""

    if isinstance(exc, ValidationError):
        parts = []
        for err in exc.errors():
            field = ".".join(str(loc) for loc in err.get("loc", []))
            parts.append(f"{field}: {err.get('msg')}")
        return "; ".join(parts)

    return "This row could not be validated."


def _json_safe(record: dict) -> dict:
    """Replace NaN/NaT values (which are not valid JSON) with None."""

    safe = {}
    for key, value in record.items():
        if isinstance(value, float) and pd.isna(value):
            safe[key] = None
        else:
            safe[key] = value
    return safe


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
)
async def predict_batch(file: UploadFile = File(...)):

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a file with a .csv extension.",
        )

    raw_bytes = await file.read()

    if not raw_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    try:
        df = pd.read_csv(io.BytesIO(raw_bytes))
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file could not be parsed as a CSV. Please check its formatting.",
        )

    if df.empty or len(df.columns) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded CSV has no data rows.",
        )

    if len(df) > MAX_BATCH_ROWS:
        raise HTTPException(
            status_code=400,
            detail=f"The uploaded CSV has {len(df)} rows, which exceeds the "
                   f"maximum of {MAX_BATCH_ROWS} rows per batch upload.",
        )

    missing_columns = [
        column for column in REQUIRED_COLUMNS if column not in df.columns
    ]

    if missing_columns:
        raise HTTPException(
            status_code=400,
            detail=(
                "CSV is missing required column(s): "
                f"{', '.join(missing_columns)}"
            ),
        )

    # Amenity counts are optional; fill absent columns with 0 without
    # touching any column the user actually provided.
    for column in OPTIONAL_AMENITY_COLUMNS:
        if column not in df.columns:
            df[column] = 0

    # Keep an untouched copy of exactly what was uploaded, in original order.
    original_records = df.to_dict(orient="records")

    validated_indices: list[int] = []
    validated_features: list[dict] = []
    row_errors: dict[int, str] = {}

    for row_index, record in enumerate(original_records):
        cleaned = dict(record)

        # Treat a missing amenity value in an otherwise-present column as 0.
        for column in OPTIONAL_AMENITY_COLUMNS:
            if pd.isna(cleaned.get(column)):
                cleaned[column] = 0

        try:
            validated = PropertyPredictionRequest(**cleaned)
            validated_indices.append(row_index)
            validated_features.append(validated.model_dump())
        except ValidationError as exc:
            row_errors[row_index] = _format_validation_error(exc)
        except Exception as exc:  # defensive: never leak internals
            row_errors[row_index] = "This row could not be validated."

    predicted_by_index: dict[int, float] = {}

    if validated_features:
        try:
            prices = predict_price_batch(validated_features)
        except Exception:
            # Don't leak internal model/pipeline errors to the client.
            raise HTTPException(
                status_code=500,
                detail=(
                    "The prediction model failed to process the uploaded "
                    "data. Please verify the file and try again."
                ),
            )

        predicted_by_index = dict(zip(validated_indices, prices))

    results: list[BatchPredictionRowResult] = []

    for row_index, record in enumerate(original_records):
        if row_index in predicted_by_index:
            results.append(
                BatchPredictionRowResult(
                    row_index=row_index,
                    success=True,
                    predicted_price=predicted_by_index[row_index],
                    error=None,
                    data=_json_safe(record),
                )
            )
        else:
            results.append(
                BatchPredictionRowResult(
                    row_index=row_index,
                    success=False,
                    predicted_price=None,
                    error=row_errors.get(row_index, "This row could not be validated."),
                    data=_json_safe(record),
                )
            )

    successful = len(predicted_by_index)
    total = len(original_records)

    return BatchPredictionResponse(
        summary=BatchPredictionSummary(
            total_rows=total,
            successful=successful,
            failed=total - successful,
        ),
        results=results,
    )