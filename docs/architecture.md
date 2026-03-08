# Architecture

ContextWeave uses a layered memory design so the application can preserve continuity without relying on the prompt alone.

## Request Flow

1. The FastAPI layer accepts a `POST /chat` request with `session_id`, `user_id`, and `message`.
2. `ChatService` loads or creates the durable session in PostgreSQL.
3. `ContextBuilder` reads recent messages and the current summary from Redis.
4. The service loads durable facts from PostgreSQL and retrieves relevant document chunks through the retrieval abstraction.
5. The provider receives a structured context pack and generates a grounded response.
6. User and assistant messages are persisted to PostgreSQL.
7. Redis working memory is refreshed with recent messages, a compact session summary, and lightweight task state.
8. A rule-based extractor stores newly discovered facts for future turns.

## Components

- API layer: request validation and dependency wiring
- Chat service: orchestration of persistence, memory updates, and provider calls
- Redis memory store: recent messages, summaries, and task state
- Retrieval layer: chunking, ranking, and query-time retrieval
- Persistence layer: sessions, messages, facts, documents, and chunks
- Provider layer: deterministic mock for local use and optional OpenAI-backed implementation

## Design Principles

- Keep the MVP synchronous and easy to reason about.
- Separate working memory from durable memory.
- Keep retrieval pluggable so semantic search can improve later.
- Prefer deterministic behavior for local demos and tests.
- Preserve clean seams for future async and service-level evolution.

