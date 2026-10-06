from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_data_health_endpoint():
    response = client.get('/api/data-health')
    assert response.status_code == 200
    payload = response.json()
    assert 'quality_score' in payload
    assert payload['records'] > 0


def test_overview_endpoint():
    response = client.get('/api/overview')
    assert response.status_code == 200
    payload = response.json()
    assert len(payload['kpis']) >= 6
