from fastapi import APIRouter

from app.services.analytics import get_data_health, get_model_performance

router = APIRouter()


@router.get('/system/data-health')
def system_data_health() -> dict:
    return get_data_health()


@router.get('/system/models')
def system_models() -> dict:
    return get_model_performance()
