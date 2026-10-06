from fastapi import APIRouter
from pydantic import BaseModel

from app.services.analytics import optimize_price

router = APIRouter()


class PriceScenarioInput(BaseModel):
    current_adr: float
    candidate_adr: float
    occupancy_baseline: float = 0.78
    available_rooms: float = 30
    demand_factor: float = 1.0


@router.get('/optimization/price')
def price() -> dict:
    return optimize_price({'current_adr': 125, 'candidate_adr': 132, 'occupancy_baseline': 0.78, 'available_rooms': 30, 'demand_factor': 1.0})


@router.post('/optimization/price')
def price_post(payload: PriceScenarioInput) -> dict:
    return optimize_price(payload.model_dump())
