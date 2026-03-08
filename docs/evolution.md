# Evolution

## Stage 1: Simple Synchronous MVP

The current MVP keeps everything inside a single FastAPI application. This makes the request flow easy to trace, easy to test, and easy to run locally. Redis and PostgreSQL are external, but orchestration remains synchronous inside one process.

## Stage 2: Intermediate Async Architecture

The next practical step is to keep the API synchronous for user-facing latency while moving heavier tasks into background workers:

- asynchronous document ingestion
- embedding generation
- deferred summarization
- evaluation and analytics jobs

At this stage, a lightweight job queue is enough. The main goal is to decouple slow secondary work from the request path.

## Stage 3: Enterprise Event-Driven Platform

An enterprise evolution can decompose the MVP into dedicated services:

- API gateway
- chat orchestration service
- memory service
- retrieval service
- ingestion pipeline
- analytics and audit service

Kafka becomes appropriate at this stage as the event backbone for ingestion events, memory updates, evaluation streams, and audit trails. It is intentionally excluded from the MVP because it would add operational weight before the design needs it.

