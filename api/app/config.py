from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / 'data' / 'raw' / 'Hotel book.csv'


class Settings(BaseModel):
    app_name: str = 'HOTELIQ API'
    api_version: str = '1.0.0'
    database_url: str = os.getenv('DATABASE_URL', 'sqlite:///./hoteliq.db')
    data_path: str = str(DATA_PATH)


@lru_cache
def get_settings() -> Settings:
    return Settings()
