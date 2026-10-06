from __future__ import annotations

from sqlalchemy import Column, Date, Float, Integer, String, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Hotel(Base):
    __tablename__ = 'hotels'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default='HotelIQ')
    city = Column(String(255), nullable=True)
    country = Column(String(255), nullable=True)


class DailyMetric(Base):
    __tablename__ = 'daily_metrics'
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True)
    revenue = Column(Float, nullable=True)
    room_revenue = Column(Float, nullable=True)
    occupancy_rate = Column(Float, nullable=True)
    adr = Column(Float, nullable=True)
    revpar = Column(Float, nullable=True)
    bookings = Column(Integer, nullable=True)
    cancellations = Column(Integer, nullable=True)
    no_shows = Column(Integer, nullable=True)
    operating_expenses = Column(Float, nullable=True)
    total_costs = Column(Float, nullable=True)


class BookingRecord(Base):
    __tablename__ = 'bookings'
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, nullable=False)
    date = Column(Date, nullable=False, index=True)
    booking_channel = Column(String(100), nullable=True)
    guest_type = Column(String(100), nullable=True)
    market_segment = Column(String(100), nullable=True)
    guest_country = Column(String(100), nullable=True)
    bookings = Column(Integer, nullable=True)
    new_bookings = Column(Integer, nullable=True)
    cancellations = Column(Integer, nullable=True)
    no_shows = Column(Integer, nullable=True)


class ForecastRun(Base):
    __tablename__ = 'forecasts'
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, nullable=False)
    forecast_date = Column(Date, nullable=False, index=True)
    model_name = Column(String(255), nullable=False)
    target_metric = Column(String(100), nullable=False)
    horizon_days = Column(Integer, nullable=False)
    mae = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    mape = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default='draft')


class DataQualityResult(Base):
    __tablename__ = 'data_quality_results'
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, nullable=False)
    run_date = Column(Date, nullable=False)
    records_processed = Column(Integer, nullable=False)
    records_accepted = Column(Integer, nullable=False)
    records_rejected = Column(Integer, nullable=False)
    missing_fields = Column(Integer, nullable=False)
    suspicious_values = Column(Integer, nullable=False)
    duplicate_rows = Column(Integer, nullable=False)
    quality_score = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
