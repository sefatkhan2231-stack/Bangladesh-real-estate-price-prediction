from typing import Any, Optional

from pydantic import BaseModel


class BatchPredictionRowResult(BaseModel):
    """Result for a single row of an uploaded batch-prediction CSV."""

    row_index: int
    success: bool
    predicted_price: Optional[float] = None
    error: Optional[str] = None
    data: dict[str, Any]


class BatchPredictionSummary(BaseModel):
    total_rows: int
    successful: int
    failed: int


class BatchPredictionResponse(BaseModel):
    summary: BatchPredictionSummary
    results: list[BatchPredictionRowResult]