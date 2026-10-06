from fastapi import APIRouter

from app.services.analytics import get_occupancy

router = APIRouter()


@router.get('/occupancy')
def occupancy() -> dict:
    return get_occupancy()
