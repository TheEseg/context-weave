# Frontend Demo Deploy

The public demo is a static Vite build deployed to GitHub Pages from the `frontend/` directory.

## Deployment Model

- GitHub Pages hosts only the frontend assets
- the backend is configured separately through `VITE_API_BASE_URL`
- `VITE_DEMO_MODE=true` enables a browser-only fallback demo when no backend is available

## Build Assumptions

- Vite base path: `/context-weave/`
- deployment workflow: [`.github/workflows/deploy-pages.yml`](/Users/ivanesegovic/Documents/Codex/context-weave/.github/workflows/deploy-pages.yml)
- expected public URL: `https://<github-username>.github.io/context-weave/`

## Recommended Repository Variables

- `VITE_API_BASE_URL`
- `VITE_DEMO_MODE`
