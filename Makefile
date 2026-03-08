PYTHON ?= python3
PYTHONPATH := .

.PHONY: up down run run-docker test test-docker seed seed-docker ingest ingest-docker format

up:
	docker compose up -d postgres redis

down:
	docker compose down

run:
	PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-docker:
	docker compose up app

test:
	PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m pytest

test-docker:
	docker compose run --rm app pytest

seed:
	PYTHONPATH=$(PYTHONPATH) $(PYTHON) scripts/seed_demo_data.py

seed-docker:
	docker compose run --rm app python scripts/seed_demo_data.py

ingest:
	PYTHONPATH=$(PYTHONPATH) $(PYTHON) scripts/ingest_sample_documents.py

ingest-docker:
	docker compose run --rm app python scripts/ingest_sample_documents.py

format:
	PYTHONPATH=$(PYTHONPATH) $(PYTHON) -m ruff format .
