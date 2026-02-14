# Project Ivy — Centralized Medical System

A hackathon project: one place for medical records (by establishment), appointments, medications, monitoring, and an AI assistant. See [docs/VISION.md](docs/VISION.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

## Prerequisites

- **Python 3.10+** for the backend
- **Node 18+** and npm for the frontend

## Backend setup

1. Create a virtual environment (recommended) and install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Copy environment template and edit if needed:

   ```bash
   copy .env.example .env
   ```

   `.env` should define at least `DATABASE_URL` (default: `sqlite:///project_ivy.db`). Optionally set `FRONTEND_ORIGIN` for CORS (default: `http://localhost:5173`).

3. Run the backend:

   ```bash
   set FLASK_APP=app:create_app
   flask run
   ```

   Or:

   ```bash
   python -m app
   ```

   The API is served at `http://localhost:5000`. Health: `GET /api/v1/health`. Establishments: `GET /api/v1/establishments`.

## Seed demo data

From the project root (with the same venv active):

```bash
python scripts/seed.py
```

This creates two establishments and two patients. Run once; repeated runs skip if data already exists.

## Frontend setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173`. Vite proxies `/api` to the backend (default `http://localhost:5000`), so start the backend first for full functionality.

## Phase 0 checkpoint

- **Backend:** `flask run` or `python -m app` → `GET http://localhost:5000/api/v1/health` returns `{"status":"ok"}`; after seeding, `GET /api/v1/establishments` returns at least one establishment.
- **Frontend:** From `frontend/`, `npm run dev` → open app, go to **Establishments**; the list loads from the API (or shows “No establishments” if not seeded).
- **DB:** SQLite file `project_ivy.db` (or path in `DATABASE_URL`) is created on first run; `python scripts/seed.py` adds demo data.

## Project layout

- **backend/** — Flask app (controllers, services, models, middleware). API under `/api/v1/`.
- **frontend/** — React (Vite) + Tailwind + Chart.js.
- **docs/** — Vision, roadmap, system design, API contract, data model.
- **scripts/seed.py** — Demo data seed.
