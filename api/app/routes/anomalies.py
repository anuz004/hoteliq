from fastapi import APIRouter

from app.services.analytics import get_anomalies

router = APIRouter()


@router.get('/anomalies')
def anomalies() -> dict:
    return get_anomalies()
