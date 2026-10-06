from fastapi import APIRouter

from app.services.analytics import get_data_health

router = APIRouter()


@router.get('/health')
def health() -> dict:
    return {'status': 'ok', 'service': 'hoteliq-api'}


@router.get('/data-health')
def data_health() -> dict:
    return get_data_health()
