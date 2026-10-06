# HOTELIQ

HOTELIQ is a premium hotel revenue intelligence and decision-support platform for hotel managers and revenue teams. It combines revenue analytics, occupancy demand monitoring, short-term forecasting, anomaly detection, scenario simulation, and AI-assisted investigation grounded in the supplied hotel dataset.

## Quick start

1. Copy `.env.example` to `.env` and adjust values.
2. Create the Python environment and install dependencies:
   - `python -m venv .venv`
   - `. .venv/Scripts/activate`
   - `pip install -r api/requirements.txt`
   - `pip install -r ml/requirements.txt`
3. Install web dependencies:
   - `npm --prefix web install`
4. Run ingestion:
   - `python scripts/ingest.py "data/raw/Hotel book.csv"`
5. Start the stack:
   - `docker compose up --build`
   - or run backend and frontend directly.

## Repository structure

- `api/` – FastAPI backend and analytics endpoints
- `web/` – Next.js + Tailwind frontend
- `ml/` – forecasting, anomaly, and evaluation code
- `data/` – raw and processed hotel data
- `docs/` – product and technical documentation
- `scripts/` – ingestion and validation utilities

## Dataset note

This application uses the actual CSV at `data/raw/Hotel book.csv` and treats it as the ground truth source. Derived metrics are clearly separated from source values and documented in `docs/data-dictionary.md`.

## Documentation

See the docs folder for architecture, analytics methodology, forecasting, optimization, API reference, and testing guidance.

## Technology stack

- Next.js + TypeScript + Tailwind
- FastAPI + Pydantic + SQLAlchemy
- PostgreSQL via Docker
- Pandas + NumPy + scikit-learn
- Recharts + Framer Motion + Lucide
- Pytest + Vitest + Playwright

## Important business constraints

- No fabricated hotel metrics
- Forecasting is short-term and constrained by limited data
- AI explanations link to actual facts from data queries and model outputs
- All major features are backed by real analytics logic

## Local commands

- `python scripts/ingest.py "data/raw/Hotel book.csv"`
- `python scripts/validate_data.py "data/raw/Hotel book.csv"`
- `npm --prefix web run dev`
- `npm --prefix web run build`
- `pytest api/tests -q`
- `docker compose up --build`

## License

Internal project demo.
