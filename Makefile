PYTHON ?= python3

.PHONY: up down run test seed ingest format

up:
	docker compose up -d postgres redis

down:
	docker compose down

run:
	$(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

test:
	$(PYTHON) -m pytest

seed:
	$(PYTHON) scripts/seed_demo_data.py

ingest:
	$(PYTHON) scripts/ingest_sample_documents.py

format:
	$(PYTHON) -m ruff format .

