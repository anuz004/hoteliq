from fastapi import APIRouter

from app.services.analytics import get_bookings

router = APIRouter()


@router.get('/bookings')
def bookings() -> dict:
    return get_bookings()
