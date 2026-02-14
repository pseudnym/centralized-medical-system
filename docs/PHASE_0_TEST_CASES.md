# Phase 0 — Test cases

Use this checklist to confirm the foundation is ready before moving on. Run with the backend and (for frontend tests) the frontend dev server.

---

## 1. Backend starts

| # | Step | Expected |
|---|------|----------|
| 1.1 | From project root: `pip install -r requirements.txt` | Installs without error. |
| 1.2 | `set FLASK_APP=app:create_app` then `flask run` (or `python -m app`) | Server starts on http://127.0.0.1:5000; no traceback. |

---

## 2. API — Health (no DB)

| # | Step | Expected |
|---|------|----------|
| 2.1 | Open **http://localhost:5000/api/v1/health** in a browser. | JSON: `{"status": "ok"}`. |
| 2.2 | PowerShell: `Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health"` | Same JSON; no error. |

---

## 3. API — Establishments (empty DB)

| # | Step | Expected |
|---|------|----------|
| 3.1 | With a **fresh** DB (no seed yet), open **http://localhost:5000/api/v1/establishments**. | JSON: `[]`. |
| 3.2 | PowerShell: `Invoke-RestMethod -Uri "http://localhost:5000/api/v1/establishments"` | Same; empty array. |

---

## 4. Seed script

| # | Step | Expected |
|---|------|----------|
| 4.1 | Stop the backend. From project root: `python scripts/seed.py`. | Prints: `Seeded 2 establishments and 2 patients.` |
| 4.2 | Run `python scripts/seed.py` again. | Prints: `Establishments already exist; skipping seed.` (idempotent). |
| 4.3 | Start the backend again. Open **http://localhost:5000/api/v1/establishments**. | JSON array with 2 items: "City General Hospital" (123 Main St), "Riverside Clinic" (456 Oak Ave). Each has `id`, `name`, `address`. |

---

## 5. API — 404 and error shape

| # | Step | Expected |
|---|------|----------|
| 5.1 | Open **http://localhost:5000/**. | 404; JSON: `{"code": "NOT_FOUND", "error": "..."}`. |
| 5.2 | Open **http://localhost:5000/api/v1/nonexistent**. | Same 404 JSON. |

---

## 6. Frontend — Build and run

| # | Step | Expected |
|---|------|----------|
| 6.1 | `cd frontend`, then `npm install`. | Installs without error. |
| 6.2 | `npm run dev`. | Vite starts; app at http://localhost:5173. |
| 6.3 | With **backend also running** on 5000, open **http://localhost:5173**. | Project Ivy header and nav (Home, Establishments); no CORS or console errors. |

---

## 7. Frontend — Home and Establishments

| # | Step | Expected |
|---|------|----------|
| 7.1 | Click **Home**. | "Dashboard" heading and short welcome text. |
| 7.2 | Click **Establishments**. | "Establishments" heading and a list of 2 items: City General Hospital, Riverside Clinic (with addresses). |
| 7.3 | If you had **not** run the seed: Establishments page would show "No establishments." | (Optional) Delete or rename the DB file, run backend + seed again to re-verify 7.2. |

---

## 8. Context headers (optional)

| # | Step | Expected |
|---|------|----------|
| 8.1 | Request with header: `Invoke-RestMethod -Uri "http://localhost:5000/api/v1/health" -Headers @{"X-Establishment-Id"="1"; "X-Patient-Id"="1"}` | 200; backend sets `g.establishment_id` and `g.patient_id` (no visible change on health; used in later phases). |

---

## Pass criteria

- **Must pass:** 1.x, 2.x, 3.x, 4.x, 5.1, 6.x, 7.1, 7.2.
- **Optional:** 5.2, 7.3, 8.1.

If all must-pass cases succeed, Phase 0 is validated and you can move forward.
