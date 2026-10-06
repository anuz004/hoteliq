from fastapi import APIRouter

from app.services.analytics import get_revenue

router = APIRouter()


@router.get('/revenue')
def revenue() -> dict:
    return get_revenue()
