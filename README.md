# Centralized Medical System (Project Ivy)

A single health hub: dashboard (appointments, med reminders, monitoring), records by establishment, prescriptions, appointments, and a monitoring area with charts. The dashboard has an AI chat ready to connect to Gemini for record-aware answers.

## Prerequisites

- **Node.js** (e.g. 18+)
- **Python 3.x**
- A **Supabase** project ([supabase.com](https://supabase.com))

## Setup

### 1. Clone and environment

```bash
git clone <repo-url>
cd centralized-medical-system
```

Copy the environment template and add your keys:

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `.env` and set:

- **Backend:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_KEY` (from your Supabase project settings).
- **Frontend:** `VITE_API_URL` (e.g. `http://localhost:5000`), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

**Do not commit `.env`** or put real keys in `.env.example`.

### 2. Backend (Flask)

```bash
cd back_end
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux

pip install flask supabase python-dotenv
```

Run the API from the `back_end` folder:

```bash
# Windows (from back_end):
set FLASK_APP=app.py.py
flask run

# macOS/Linux (from back_end):
FLASK_APP=app.py.py flask run
```

Backend runs at `http://localhost:5000` by default.

### 3. Frontend (React + Vite)

```bash
cd my-react-app
npm install
npm run dev
```

Frontend runs at the URL Vite prints (e.g. `http://localhost:5173`). Ensure `.env` at the repo root (or in `my-react-app`) has the `VITE_*` variables set so the app can reach Supabase and the API.

## Project layout

- **my-react-app/** – React 19 + Vite 7 frontend; Recharts for monitoring; Supabase JS client for data.
- **back_end/** – Flask API for auth (login/signup) and any server-side Supabase usage.
- **justforjoshua/** – Project notes and summary.

## Security

- Keep `.env` out of version control (it’s in `.gitignore`).
- Use `.env.example` only as a list of variable names and placeholders; never real secrets.
