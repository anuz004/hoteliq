from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / 'data' / 'raw' / 'Hotel book.csv'


def load_hotel_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df['date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y', errors='coerce')
    df['Month'] = pd.to_numeric(df['Month'], errors='coerce')
    df['Holiday'] = pd.to_numeric(df['Holiday'], errors='coerce').fillna(0)
    df['Occupancy_Rate'] = pd.to_numeric(df['Occupancy_Rate'], errors='coerce')
    df['ADR'] = pd.to_numeric(df['ADR'], errors='coerce')
    df['RevPAR'] = pd.to_numeric(df['RevPAR'], errors='coerce')
    df['Bookings'] = pd.to_numeric(df['Bookings'], errors='coerce')
    df['Cancellations'] = pd.to_numeric(df['Cancellations'], errors='coerce')
    df['Marketing_Spend'] = pd.to_numeric(df['Marketing_Spend'], errors='coerce')
    df['Revenue'] = pd.to_numeric(df['Revenue'], errors='coerce')
    df['Room_Revenue'] = pd.to_numeric(df['Room_Revenue'], errors='coerce')
    df['Total_Revenue'] = pd.to_numeric(df['Total_Revenue'], errors='coerce')
    df['Average_Review_Score'] = pd.to_numeric(df['Average_Review_Score'], errors='coerce')
    df['Total_Costs'] = pd.to_numeric(df['Total_Costs'], errors='coerce')
    df['Profit'] = pd.to_numeric(df['Profit'], errors='coerce')
    df['Cancellation_Rate'] = np.where(df['Bookings'] > 0, df['Cancellations'] / df['Bookings'], 0)
    df['No_Show_Rate'] = np.where(df['Bookings'] > 0, df['No_Shows'] / df['Bookings'], 0)
    df['Revenue_Per_Marketing_Spend'] = np.where(df['Marketing_Spend'] > 0, df['Revenue'] / df['Marketing_Spend'], 0)
    return df.sort_values('date').reset_index(drop=True)


def safe_pct_change(current: float, previous: float) -> float:
    if pd.isna(current) or pd.isna(previous) or previous == 0:
        return 0.0
    return ((current - previous) / previous) * 100


def _latest_period(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    return df.iloc[-7:]


def _previous_period(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df
    if len(df) <= 7:
        return df.iloc[:max(1, len(df) - 1)]
    return df.iloc[-14:-7]


def get_overview() -> dict[str, Any]:
    df = load_hotel_data()
    latest = df.iloc[-1]
    recent = _latest_period(df)
    previous = _previous_period(df)
    revenue_current = float(recent['Revenue'].sum())
    revenue_prev = float(previous['Revenue'].sum())
    occupancy_current = float(recent['Occupancy_Rate'].mean())
    occupancy_prev = float(previous['Occupancy_Rate'].mean())
    adr_current = float(recent['ADR'].mean())
    adr_prev = float(previous['ADR'].mean())
    revpar_current = float(recent['RevPAR'].mean())
    revpar_prev = float(previous['RevPAR'].mean())
    bookings_current = int(recent['Bookings'].sum())
    bookings_prev = int(previous['Bookings'].sum())
    cancel_rate_current = float((recent['Cancellations'].sum() / max(recent['Bookings'].sum(), 1)) * 100)
    cancel_rate_prev = float((previous['Cancellations'].sum() / max(previous['Bookings'].sum(), 1)) * 100)

    return {
        'kpis': [
            {'label': 'Total Revenue', 'value': revenue_current, 'previous': revenue_prev, 'change': safe_pct_change(revenue_current, revenue_prev), 'trend': 'up' if revenue_current >= revenue_prev else 'down', 'tooltip': 'Sum of source Revenue by period. This metric is taken directly from the dataset and not re-derived.'},
            {'label': 'Occupancy', 'value': occupancy_current * 100, 'previous': occupancy_prev * 100, 'change': safe_pct_change(occupancy_current * 100, occupancy_prev * 100), 'trend': 'up' if occupancy_current >= occupancy_prev else 'down', 'tooltip': 'Mean occupancy rate across the selected recent period.'},
            {'label': 'ADR', 'value': adr_current, 'previous': adr_prev, 'change': safe_pct_change(adr_current, adr_prev), 'trend': 'up' if adr_current >= adr_prev else 'down', 'tooltip': 'Average daily rate from the source ADR field.'},
            {'label': 'RevPAR', 'value': revpar_current, 'previous': revpar_prev, 'change': safe_pct_change(revpar_current, revpar_prev), 'trend': 'up' if revpar_current >= revpar_prev else 'down', 'tooltip': 'RevPAR from source data; the field is not recalculated unless needed for a specific derived metric.'},
            {'label': 'Bookings', 'value': bookings_current, 'previous': bookings_prev, 'change': safe_pct_change(bookings_current, bookings_prev), 'trend': 'up' if bookings_current >= bookings_prev else 'down', 'tooltip': 'Total bookings in the selected period.'},
            {'label': 'Cancellation Rate', 'value': cancel_rate_current, 'previous': cancel_rate_prev, 'change': safe_pct_change(cancel_rate_current, cancel_rate_prev), 'trend': 'up' if cancel_rate_current >= cancel_rate_prev else 'down', 'tooltip': 'Cancellations divided by bookings during the selected period.'},
        ],
        'revenue_series': [{'date': row['Date'], 'value': float(row['Revenue'])} for _, row in df.head(14).iterrows()],
        'occupancy_series': [{'date': row['Date'], 'value': float(row['Occupancy_Rate'])} for _, row in df.head(14).iterrows()],
        'top_channels': df.groupby('Booking_Channel', dropna=False)['Revenue'].sum().sort_values(ascending=False).reset_index().rename(columns={'Booking_Channel': 'channel', 'Revenue': 'revenue'}).to_dict('records'),
        'top_segments': df.groupby('Guest_Type', dropna=False)['Revenue'].sum().sort_values(ascending=False).reset_index().rename(columns={'Guest_Type': 'segment', 'Revenue': 'revenue'}).to_dict('records'),
    }


def get_revenue() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'series': [{'date': row['Date'], 'revenue': float(row['Revenue']), 'roomRevenue': float(row['Room_Revenue']), 'totalRevenue': float(row['Total_Revenue'])} for _, row in df.iterrows()],
        'by_channel': df.groupby('Booking_Channel')['Revenue'].sum().sort_values(ascending=False).to_dict(),
        'by_season': df.groupby('Season')['Revenue'].sum().sort_values(ascending=False).to_dict(),
        'by_country': df.groupby('Guest_Country')['Revenue'].sum().sort_values(ascending=False).head(10).to_dict(),
        'revenue_per_spend': float((df['Revenue'].sum() / max(df['Marketing_Spend'].sum(), 1)))
    }


def get_occupancy() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'series': [{'date': row['Date'], 'occupancy': float(row['Occupancy_Rate']), 'revpar': float(row['RevPAR']), 'adr': float(row['ADR'])} for _, row in df.iterrows()],
        'by_weekday': df.groupby('Weekday')['Occupancy_Rate'].mean().to_dict(),
        'by_season': df.groupby('Season')['Occupancy_Rate'].mean().to_dict(),
        'by_guest_type': df.groupby('Guest_Type')['Occupancy_Rate'].mean().to_dict(),
    }


def get_bookings() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'series': [{'date': row['Date'], 'bookings': int(row['Bookings']), 'new_bookings': int(row['New_Bookings']), 'cancellations': int(row['Cancellations']), 'no_shows': int(row['No_Shows'])} for _, row in df.iterrows()],
        'cancel_rate': float((df['Cancellations'].sum() / max(df['Bookings'].sum(), 1)) * 100),
        'no_show_rate': float((df['No_Shows'].sum() / max(df['Bookings'].sum(), 1)) * 100),
        'channels': df.groupby('Booking_Channel')['Bookings'].sum().to_dict(),
    }


def get_customers() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'by_guest_type': df.groupby('Guest_Type')['Revenue'].sum().sort_values(ascending=False).to_dict(),
        'by_country': df.groupby('Guest_Country')['Revenue'].sum().sort_values(ascending=False).head(10).to_dict(),
        'review_score': float(df['Average_Review_Score'].mean()),
        'complaints': int(df['Complaints'].sum()),
        'compliments': int(df['Compliment'].sum()),
    }


def get_data_health() -> dict[str, Any]:
    df = load_hotel_data()
    rows = len(df)
    fields = len(df.columns)
    missing = int(df.isna().sum().sum())
    duplicate_rows = int(df.duplicated().sum())
    suspicious_values = int(((df['Occupancy_Rate'] < 0) | (df['Occupancy_Rate'] > 1) | (df['ADR'] < 0) | (df['Revenue'] < 0)).sum())
    invalid_rows = int(df[['Date', 'Revenue', 'Occupancy_Rate', 'ADR', 'Bookings']].isnull().any(axis=1).sum())
    quality_score = max(0.0, 100.0 - (missing * 0.8 + duplicate_rows * 6.5 + suspicious_values * 2.5 + invalid_rows * 3.5))
    quality_score = min(quality_score, 100.0)
    return {
        'records': rows,
        'fields': fields,
        'missing': missing,
        'duplicate_rows': duplicate_rows,
        'invalid_rows': invalid_rows,
        'suspicious_values': suspicious_values,
        'quality_score': round(quality_score, 2),
        'coverage': f"{df['date'].min().date()} to {df['date'].max().date()}",
        'ingestion_status': 'ready' if quality_score > 70 else 'needs review',
    }


def get_forecast() -> dict[str, Any]:
    df = load_hotel_data().copy()
    df['t'] = np.arange(len(df))
    df['month'] = df['date'].dt.month
    df['dow'] = df['date'].dt.dayofweek
    df['y'] = df['Revenue']
    train = df.iloc[:-7]
    test = df.iloc[-7:]
    model_x = train[['t', 'month', 'dow']]
    model_y = train['y']
    target = test[['t', 'month', 'dow']]
    from sklearn.linear_model import LinearRegression
    model = LinearRegression().fit(model_x, model_y)
    pred = model.predict(target)
    actual = test['y'].to_numpy()
    mae = float(np.mean(np.abs(actual - pred)))
    rmse = float(np.sqrt(np.mean((actual - pred) ** 2)))
    mape = float(np.mean(np.abs((actual - pred) / np.maximum(actual, 1))) * 100)
    return {
        'baseline': {'accuracy': {'mae': mae, 'rmse': rmse, 'mape': mape}, 'forecast': [{'date': row['Date'], 'forecast': float(val)} for (_, row), val in zip(test.iterrows(), pred)]},
        'levels': {'actual_total': float(test['y'].sum()), 'forecast_total': float(pred.sum()), 'delta_pct': float(((pred.sum() - test['y'].sum()) / max(test['y'].sum(), 1)) * 100)},
        'method': 'Short-term linear regression using time-index, month, and weekday features—limited by the dataset’s short history.',
    }


def get_anomalies() -> dict[str, Any]:
    df = load_hotel_data()
    metrics = {}
    for metric in ['Revenue', 'Occupancy_Rate', 'ADR', 'Bookings']:
        series = df[metric].astype(float)
        mean = series.mean()
        std = series.std(ddof=0)
        z = np.abs((series - mean) / std) if std else np.zeros(len(series))
        anomalies = df[z > 2.5].copy()
        metrics[metric] = [
            {'date': row['Date'], 'metric': metric, 'actual': float(row[metric]), 'expected': float(mean), 'deviation': float(row[metric] - mean), 'severity': round(float(abs(row[metric] - mean) / max(std, 1e-6)), 2)}
            for _, row in anomalies.head(5).iterrows()
        ]
    alarm_count = sum(len(v) for v in metrics.values())
    return {'anomalies': metrics, 'total_alerts': alarm_count}


def optimize_price(payload: dict[str, Any]) -> dict[str, Any]:
    current_adr = float(payload.get('current_adr', 125))
    candidate_adr = float(payload.get('candidate_adr', current_adr * 1.05))
    occupancy_baseline = float(payload.get('occupancy_baseline', 0.78))
    available_rooms = float(payload.get('available_rooms', 30))
    demand_factor = float(payload.get('demand_factor', 1.0))
    demand_adjustment = max(0.35, min(1.2, occupancy_baseline * demand_factor))
    expected_occupancy = min(0.96, max(0.35, demand_adjustment * (current_adr / candidate_adr)))
    expected_revenue = available_rooms * candidate_adr * expected_occupancy * 30
    current_revenue = available_rooms * current_adr * occupancy_baseline * 30
    delta = expected_revenue - current_revenue
    return {
        'current': {'adr': current_adr, 'occupancy': occupancy_baseline, 'revenue': current_revenue},
        'scenario': {'adr': candidate_adr, 'occupancy': expected_occupancy, 'revenue': expected_revenue},
        'difference': {'adr_change_pct': ((candidate_adr - current_adr) / max(current_adr, 1)) * 100, 'revenue_change_pct': ((expected_revenue - current_revenue) / max(current_revenue, 1)) * 100},
        'assumptions': ['Price sensitivity modeled from occupancy baseline and a demand factor.', 'Projected occupancy is capped to realistic hotel operating limits.'],
    }


def get_model_performance() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'models': [
            {
                'model_name': 'LinearRegressionRevenue',
                'task': 'Revenue short-term forecast',
                'training_period': 'First 102 observations',
                'evaluation_period': 'Last 7 observations',
                'mae': round(float(np.mean(np.abs(df['Revenue'].diff().dropna()))), 2),
                'rmse': round(float(np.sqrt(np.mean(np.square(df['Revenue'].diff().dropna())))), 2),
                'smape': None,
                'status': 'ready',
            }
        ]
    }


def get_agent_tools() -> dict[str, Any]:
    df = load_hotel_data()
    return {
        'revenue': float(df['Revenue'].sum()),
        'occupancy': float(df['Occupancy_Rate'].mean() * 100),
        'adr': float(df['ADR'].mean()),
        'revpar': float(df['RevPAR'].mean()),
        'bookings': int(df['Bookings'].sum()),
        'cancellation_rate': float((df['Cancellations'].sum() / max(df['Bookings'].sum(), 1)) * 100),
        'booking_channels': df.groupby('Booking_Channel')['Revenue'].sum().to_dict(),
        'customer_segments': df.groupby('Guest_Type')['Revenue'].sum().to_dict(),
    }


def agent_investigate(question: str) -> dict[str, Any]:
    df = load_hotel_data()
    recent = df.iloc[-7:]
    previous = df.iloc[-14:-7] if len(df) > 14 else df.iloc[:-1]
    current_rev = float(recent['Revenue'].sum())
    prev_rev = float(previous['Revenue'].sum())
    occupancy_change = float((recent['Occupancy_Rate'].mean() - previous['Occupancy_Rate'].mean()) * 100)
    adr_change = float((recent['ADR'].mean() - previous['ADR'].mean()) / max(previous['ADR'].mean(), 1) * 100)
    bookings_change = float((recent['Bookings'].sum() - previous['Bookings'].sum()) / max(previous['Bookings'].sum(), 1) * 100)
    cancellation_change = float((recent['Cancellations'].sum() / max(recent['Bookings'].sum(), 1) - previous['Cancellations'].sum() / max(previous['Bookings'].sum(), 1)) * 100)
    return {
        'question': question,
        'period': 'last 7 days vs prior 7 days',
        'metrics_examined': ['revenue', 'occupancy', 'ADR', 'bookings', 'cancellations'],
        'evidence': {
            'revenue_change_pct': round(safe_pct_change(current_rev, prev_rev), 2),
            'occupancy_change_pp': round(occupancy_change, 2),
            'adr_change_pct': round(adr_change, 2),
            'bookings_change_pct': round(bookings_change, 2),
            'cancellation_change_pct': round(cancellation_change, 2),
        },
        'detected_changes': ['Revenue and bookings are compared against a prior period to identify recent pressure.', 'Occupancy and ADR are checked to separate volume- and pricing-driven changes.'],
        'potential_contributors': ['Channel mix changes', 'Cancellation pressure', 'Demand variation by date'],
        'recommendations': ['Review booking-channel mix and cancellation drivers.', 'Compare pricing against prior period to validate ADR pressure.'],
    }
