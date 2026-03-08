# Decisions

## Redis For Working Memory

Redis is a good fit for short-lived conversational state because it offers low-latency reads and writes, simple key design, and natural support for rolling windows like recent messages.

## PostgreSQL For Durable Memory

PostgreSQL provides a reliable source of record for sessions, messages, facts, documents, and chunks. It is easy to inspect locally and evolves cleanly toward richer production schemas.

## Retrieval Is Abstracted

The retriever is deliberately kept behind a small interface so the MVP can use simple keyword matching while leaving a clean upgrade path to embeddings, hybrid ranking, and dedicated retrieval infrastructure.

## Kafka Is Excluded From The MVP

Kafka is valuable for high-volume event-driven systems, but it would be premature here. The MVP is focused on clarity, testability, and local operability, so synchronous orchestration is the right tradeoff.

