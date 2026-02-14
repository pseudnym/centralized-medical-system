## Technology Stack

### Backend
- Flask (Python)
- SQLite (initial development database)
- SQLAlchemy ORM
- Modular MVC-style project structure

Flask was chosen for its simplicity and rapid development speed, making it ideal for hackathon iteration. SQLite will be used during development for lightweight, zero-configuration storage. The architecture will remain database-agnostic so that PostgreSQL or another production-grade database can be introduced later without major refactoring.

Authentication and role-based access control will be implemented in a later phase, as the initial focus is on demonstrating core data flow, AI integration, and remote monitoring functionality.

### Frontend
- React (Vite or Create React App)
- Tailwind CSS
- Chart.js for data visualization

React provides a flexible component-based structure suitable for dashboards and health data views. Tailwind enables rapid UI development with consistent design patterns. Chart.js is used to visualize health metrics, trends, and monitoring data in an intuitive way for demo purposes.

### AI Layer
- Centralized AI service module within backend
- AI requests abstracted behind a service layer

All AI-related logic will be isolated in a dedicated service to prevent business logic leakage into controllers and to allow future replacement or expansion of the AI provider.

### Infrastructure Philosophy
- Backend and frontend are separated into independent services.
- Clear separation between controllers (HTTP handling), services (business logic), and models (database).
- Designed for easy migration to:
  - PostgreSQL
  - Role-based authentication
  - Multi-hospital multi-tenant support

---

## File structure

This section is updated as the project grows. Current layout after Phase 0:

**Repository root**

| Path | Purpose |
|------|---------|
| `app.py` | Flask entry point; loads env and exposes `create_app()` for `flask run` or `python -m app`. |
| `requirements.txt` | Python dependencies (Flask, Flask-SQLAlchemy, Flask-CORS, python-dotenv, SQLAlchemy). |
| `.env.example` | Template for env vars (DATABASE_URL, UPLOADS_DIR, FRONTEND_ORIGIN, etc.). Copy to `.env`. |
| `README.md` | Setup, run, and seed instructions. |

**Backend (`backend/`)**

| Path | Purpose |
|------|---------|
| `backend/__init__.py` | App factory: creates Flask app, configures db, CORS, and blueprints; runs `db.create_all()`. |
| `backend/config.py` | Loads configuration from environment (DATABASE_URL, UPLOADS_DIR, FRONTEND_ORIGIN). |
| `backend/models/` | SQLAlchemy models (establishment, patient, user, record, appointment, medication, medication_reminder, adherence_log, observation, insight). One file per entity; `__init__.py` imports all for registration. |
| `backend/controllers/` | HTTP handlers only; one blueprint per area (e.g. `health.py`, `establishments.py`). Registered under `/api/v1/`. |
| `backend/services/` | Business logic; thin in Phase 0, expanded in later phases. |
| `backend/middleware/` | Request hooks (e.g. `context.py` sets `g.establishment_id`, `g.patient_id` from headers/query). |

**Frontend (`frontend/`)**

| Path | Purpose |
|------|---------|
| `frontend/src/main.jsx` | Entry point; mounts App with React Router and Tailwind. |
| `frontend/src/App.jsx` | Root layout (header/nav) and route definitions; outlet for child routes. |
| `frontend/src/api.js` | API helpers (e.g. `getHealth()`, `getEstablishments()`); uses `VITE_API_BASE_URL` when set. |
| `frontend/src/pages/` | Route-level components (Home, Establishments, etc.). |
| `frontend/index.html` | HTML shell; script loads `src/main.jsx`. |
| `frontend/vite.config.js` | Vite config; dev proxy `/api` → backend (e.g. `http://localhost:5000`). |
| `frontend/tailwind.config.js` | Tailwind content paths and theme. |
| `frontend/package.json` | Dependencies: React, react-router-dom, Chart.js, react-chartjs-2, Tailwind/PostCSS. |

**Scripts and docs**

| Path | Purpose |
|------|---------|
| `scripts/seed.py` | Seeds demo data (establishments, patients); idempotent. |
| `docs/` | Vision, roadmap, system design, API contract, data model, and this architecture doc. |
