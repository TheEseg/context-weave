# Testing

ContextWeave uses three complementary test layers so context continuity behavior stays easy to verify as the project evolves.

## Unit Tests

Unit tests validate deterministic building blocks:

- summary generation
- fact extraction
- document chunking
- context assembly

These tests should stay fast and run without external services.

## Integration Tests

Integration tests validate:

- Redis working memory behavior
- SQLAlchemy persistence behavior
- the basic `POST /chat` flow

The test suite uses SQLite and `fakeredis` to keep local feedback fast while preserving the application wiring.

## Scenario Tests

Scenario tests exercise context continuity over multiple turns. The main scenario proves that a user can define the architecture stack, move to another topic, and later ask for the chosen stack while still getting a grounded answer.

## End-To-End Tests

Playwright covers the demo UI itself:

- desktop app load and control visibility
- demo session loading with a populated context inspector
- chat interaction and continuity updates
- mobile layout, scrolling, and inspector accessibility

These tests run the frontend in `VITE_DEMO_MODE=true` so the suite stays deterministic and does not depend on the live backend.

### Running Playwright

```bash
cd frontend
npm install
npx playwright install chromium
npm run test:e2e
```

Optional modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

## What Success Looks Like

- deterministic unit results
- durable storage behavior remains stable
- working memory is updated after each turn
- the chat endpoint returns grounded responses without external model access
- continuity scenarios keep passing as the architecture evolves
- the repository remains easy to inspect and safe to extend
