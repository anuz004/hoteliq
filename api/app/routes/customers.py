from fastapi import APIRouter

from app.services.analytics import get_customers

router = APIRouter()


@router.get('/customers')
def customers() -> dict:
    return get_customers()
