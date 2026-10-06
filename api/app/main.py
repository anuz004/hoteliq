from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

API_DIR = Path(__file__).resolve().parent.parent
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from app.routes import agent, anomalies, bookings, customers, demand, forecast, health, optimization, overview, revenue, system

app = FastAPI(title='HOTELIQ API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health.router, prefix='/api')
app.include_router(overview.router, prefix='/api')
app.include_router(revenue.router, prefix='/api')
app.include_router(demand.router, prefix='/api')
app.include_router(bookings.router, prefix='/api')
app.include_router(customers.router, prefix='/api')
app.include_router(forecast.router, prefix='/api')
app.include_router(anomalies.router, prefix='/api')
app.include_router(optimization.router, prefix='/api')
app.include_router(system.router, prefix='/api')
app.include_router(agent.router, prefix='/api')


@app.get('/')
def root() -> dict[str, str]:
    return {'message': 'HOTELIQ API is running'}
