from fastapi import APIRouter

from app.services.analytics import get_forecast, get_model_performance

router = APIRouter()


@router.get('/forecast/occupancy')
def forecast_occupancy() -> dict:
    return get_forecast()


@router.get('/forecast/revenue')
def forecast_revenue() -> dict:
    return get_forecast()


@router.get('/model-performance')
def model_performance() -> dict:
    return get_model_performance()
