# Architecture

ContextWeave is a pragmatic layered memory architecture for AI applications. The MVP uses explicit working memory, durable storage, retrieval, and context packing to preserve context continuity beyond the prompt.

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

- Frontend demo layer: React + Vite interface for chat and context inspection
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
- Optimize for clarity, testability, and a credible upgrade path.

## Demo Interaction

The frontend demo calls `GET /health`, `POST /chat`, and `GET /sessions/{session_id}/context`. The chat panel makes the conversation visible, while the context inspector exposes the summary, facts, chunks, and task state that explain why the latest response is context-aware.
