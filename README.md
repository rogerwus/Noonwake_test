# Noonwake Demo Template

Baseline repo for fast demo deployments.

## What this repo gives you
- static demo site
- Docker Compose runtime
- GitHub Actions auto deploy
- self-hosted runner delivery to `demo.noonwake.ai`

## Repo variables
Set these in GitHub Actions Variables if needed:
- `APP_SLUG` (default: `noonwake-test`)
- `APP_PORT` (default: `3001`)
- `APP_DOMAIN` (default: `demo.noonwake.ai`)

## Local run
```bash
cp .env.example .env
docker compose up -d
open http://127.0.0.1:3001
```

## Deploy flow
Push to `main`:
1. runner checks out repo
2. files sync to `/opt/demo-apps/<APP_SLUG>`
3. `.env` is written from repo variables
4. `docker compose up -d`
5. smoke test runs against local port

## Purpose
Use this as the starting point for new MVP demos, landing pages, and lightweight product tests.
