.PHONY: install web-install api-install backend-test frontend-lint frontend-build ingest validate docker-up docker-down

install:
	python -m venv .venv
	. .venv/Scripts/activate && python -m pip install --upgrade pip && pip install -r api/requirements.txt && pip install -r ml/requirements.txt
	npm --prefix web install

api-install:
	python -m venv .venv
	. .venv/Scripts/activate && pip install -r api/requirements.txt

frontend-install:
	npm --prefix web install

backend-test:
	. .venv/Scripts/activate && pytest api/tests -q

frontend-lint:
	npm --prefix web run lint

frontend-build:
	npm --prefix web run build

ingest:
	. .venv/Scripts/activate && python scripts/ingest.py data/raw/Hotel\ book.csv --output data/processed/ingested.parquet

validate:
	. .venv/Scripts/activate && python scripts/validate_data.py data/raw/Hotel\ book.csv

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v
