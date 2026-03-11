# Noonwake Demo Template

Minimal demo template for `demo.noonwake.ai`.

## Purpose
- Fast MVP / landing page demos
- Auto deploy from GitHub Actions
- Hosted on the Noonwake demo server

## Stack
- Static HTML
- Nginx
- Docker Compose
- GitHub Actions (self-hosted runner)
- Caddy on the demo server

## Repo structure
- `site/` — static files
- `docker-compose.yml` — local/demo runtime
- `.github/workflows/deploy-demo.yml` — deploy pipeline

## Deploy behavior
Every push to `main` triggers:
1. checkout on the self-hosted runner
2. copy files to the demo app directory
3. `docker compose up -d`
4. demo update on `https://demo.noonwake.ai`

## Local preview
```bash
docker compose up -d
open http://127.0.0.1:3001
```

## Notes
This repo is the baseline template for future Noonwake demos.
