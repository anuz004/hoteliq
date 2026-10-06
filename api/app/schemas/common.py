from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class KPIModel(BaseModel):
    label: str
    value: float | int
    previous: Optional[float | int] = None
    change: Optional[float] = None
    trend: Optional[str] = None
    tooltip: str


class MetricSeries(BaseModel):
    date: str
    value: float


class OverviewResponse(BaseModel):
    kpis: List[KPIModel]
    revenue_series: List[MetricSeries]
    occupancy_series: List[MetricSeries]
    top_channels: List[dict[str, Any]]
    top_segments: List[dict[str, Any]]


class HealthResponse(BaseModel):
    records: int
    fields: int
    missing: int
    duplicate_rows: int
    invalid_rows: int
    suspicious_values: int
    quality_score: float
    coverage: str
    ingestion_status: str
