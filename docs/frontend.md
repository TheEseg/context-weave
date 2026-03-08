# Frontend Demo

The frontend is a lightweight React + Vite demo for ContextWeave. It is not a full product UI. Its purpose is to make the layered memory architecture visible and testable in a browser.

## Purpose

The interface is designed to show four things clearly:

- the current conversation
- the active session identity
- the context the backend can currently reconstruct
- the memory and retrieval signals behind the assistant response

## Structure

- header: project branding, tagline, backend status, and API base URL
- chat panel: session controls, conversation history, input composer, and demo-session shortcut
- context inspector: session summary, extracted facts, retrieved chunks, and runtime metadata

## API Dependencies

The frontend uses only three backend endpoints:

- `GET /health`
- `POST /chat`
- `GET /sessions/{session_id}/context`

This keeps the demo layer simple while still making ContextWeave's core value easy to understand.

For public sharing, the same frontend can be deployed to GitHub Pages while pointing at a live backend through `VITE_API_BASE_URL`, or it can run in browser-only fallback mode with `VITE_DEMO_MODE=true`.
