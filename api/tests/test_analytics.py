from app.services.analytics import get_overview, get_forecast, get_anomalies, optimize_price


def test_overview_kpis():
    overview = get_overview()
    assert len(overview['kpis']) >= 6
    assert overview['kpis'][0]['tooltip']


def test_forecast_outputs():
    forecast = get_forecast()
    assert 'baseline' in forecast
    assert 'levels' in forecast


def test_anomalies():
    anomalies = get_anomalies()
    assert anomalies['total_alerts'] >= 0


def test_price_optimization():
    result = optimize_price({'current_adr': 125, 'candidate_adr': 140, 'occupancy_baseline': 0.8, 'available_rooms': 30, 'demand_factor': 1.1})
    assert 'scenario' in result
    assert result['scenario']['adr'] > result['current']['adr']
