from fastapi import APIRouter

from app.services.analytics import get_overview

router = APIRouter()


@router.get('/overview')
def overview() -> dict:
    return get_overview()
