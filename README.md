# ContextWeave

**ContextWeave — context continuity beyond the prompt.**

ContextWeave is an open-source MVP for layered memory in AI applications. It combines short-term memory, persistent memory, retrieval, and context packing so assistants can preserve continuity across long and multi-session conversations without relying only on the model context window.

## Problem

Prompt windows are not enough for durable conversational continuity. Real applications need:

- recent working memory for active turns
- durable message and fact storage
- retrieval over reference documents
- a deterministic way to pack the right context for each response

## Solution Overview

ContextWeave uses:

- Redis for recent messages, summaries, and task state
- PostgreSQL for sessions, messages, facts, documents, and chunks
- a retrieval abstraction that is pgvector-ready
- a context builder that assembles grounded memory before response generation
- a mock LLM provider for local demos and an optional OpenAI-backed provider

## Architecture Overview

`POST /chat` validates input, loads the session, builds a context pack from Redis and PostgreSQL, generates a grounded response, persists both messages, updates Redis memory, refreshes the summary, and stores extracted facts.

More detail:

- [`docs/architecture.md`](/Users/ivanesegovic/Documents/Codex/context-weave/docs/architecture.md)
- [`docs/data-model.md`](/Users/ivanesegovic/Documents/Codex/context-weave/docs/data-model.md)
- [`docs/evolution.md`](/Users/ivanesegovic/Documents/Codex/context-weave/docs/evolution.md)

## MVP Scope

- FastAPI app with `GET /health` and `POST /chat`
- PostgreSQL persistence for sessions, messages, facts, documents, and chunks
- Redis working memory
- sample document ingestion from [`examples/sample_documents`](/Users/ivanesegovic/Documents/Codex/context-weave/examples/sample_documents)
- retrieval abstraction with simple keyword ranking
- deterministic summarization and heuristic fact extraction
- tests for unit, integration, and continuity scenarios
- Docker Compose for local startup

## Tech Stack

- Python 3.12
- FastAPI
- Redis
- PostgreSQL
- pgvector-ready schema
- SQLAlchemy
- Alembic
- Pydantic
- Docker Compose
- pytest

## Quick Start

### Option A: Local Python 3.12

```bash
cp .env.example .env
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
make up
make seed
make ingest
make run
```

### Option B: Docker-only

This path works even if `python3.12` is not installed on your machine.

```bash
cp .env.example .env
make up
make seed-docker
make ingest-docker
make run-docker
```

The API will be available at [http://localhost:8000](http://localhost:8000).

## Main Endpoints

- `GET /health`
- `POST /chat`

Example:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "demo-session",
    "user_id": "demo-user",
    "message": "We chose FastAPI, Redis, and PostgreSQL."
  }'
```

## Testing

Local Python 3.12:

```bash
make test
```

Docker:

```bash
make test-docker
```

## Roadmap

- Phase 1: MVP foundations
- Phase 2: stronger retrieval, background workers, ingestion APIs, CI/CD, and evaluation
- Phase 3: service decomposition, Kafka-backed events, multi-tenant support, and observability

See [`docs/roadmap.md`](/Users/ivanesegovic/Documents/Codex/context-weave/docs/roadmap.md).

## Positioning

ContextWeave is not a generic AI framework. It is a pragmatic, testable, engineering-first reference implementation for context memory.

See [`docs/positioning.md`](/Users/ivanesegovic/Documents/Codex/context-weave/docs/positioning.md).

## License

MIT. See [`LICENSE`](/Users/ivanesegovic/Documents/Codex/context-weave/LICENSE).
