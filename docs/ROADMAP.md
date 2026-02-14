# Project Ivy — Development Roadmap (Hackathon)

This roadmap is tuned for a **24–48 hour hackathon**. It prioritizes features that maximize demo impact, separates Core MVP from Nice-to-Haves, and organizes work into phases with actionable steps. Backend and frontend tasks are called out so a small team can parallelize. **Architectural setup comes first**; risky or time-heavy items are flagged so you can plan fallbacks.

See also: [VISION.md](VISION.md), [RAW_IDEAS.md](RAW_IDEAS.md), [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [API_CONTRACT.md](API_CONTRACT.md), [DATA_MODEL.md](DATA_MODEL.md), [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Core MVP (Must Have for Demo)

| Feature | Why it matters for demo |
|--------|--------------------------|
| **Establishment-centric records** | “Canvas for medical records” — list records by establishment, upload PDF. Core differentiator. |
| **Appointments** | Past and future per establishment; create appointment; show upcoming on dashboard. |
| **Medications** | List by patient, active on top, instructions; at least “next reminder” on dashboard. |
| **Dashboard** | Single view: upcoming appointments, medication reminders, recent records. One place that ties it together. |
| **AI Assistant (record-aware chat)** | One health hub + “ask using your data” — e.g. “Am I allowed to swim?” with context from records. Highest wow factor. |
| **Remote monitoring (manual entry + one chart)** | Manual observation entry + one trend chart (e.g. BP or weight) to show monitoring without real device integrations. |

---

## Nice-to-Haves (If Time Allows)

| Feature | Note |
|--------|------|
| **Proactive health intelligence** | Separate from chat; trend analysis + AI-generated alerts (e.g. “BP increasing…”). Time-heavy; consider one canned insight or stub. |
| **Full medication adherence** | Daily tracker + streaks per medication. Add after basic reminders work. |
| **Integrations tab** | UI placeholder only (“Connect Fitbit, Apple Watch — coming soon”). |
| **Multiple metric charts** | Blood pressure, weight, blood sugar, cholesterol — prioritize one chart first. |
| **AI breakdown of recent visits** | Optional dashboard block; depends on AI and record context. |
| **Link records to appointments in UI** | Backend supports it; UX to attach record to visit can be simplified or deferred. |

---

## Risky or Time-Heavy Items

| Item | Risk | Mitigation |
|------|------|------------|
| **AI (Gemini)** | API keys, rate limits, context-window size, prompt tuning. Can block demo if left late. | Implement AIService and chat early; use a small, fixed record context for prompts; have a fallback response (e.g. “Ask your doctor”) if the API fails. |
| **Proactive health intelligence** | Separate pipeline: trend detection + AI call + insight storage. Easy to over-scope. | Treat as nice-to-have; ship one static or simple trend-based insight if at all. |
| **PDF upload and storage** | Path handling, multipart parsing, serving files. | Implement upload and file-serving in Phase 0/1; test with a real PDF early. |
| **Dashboard aggregation** | Many data sources (appointments, reminders, records, optional AI). | Define dashboard API contract early; stub sections if needed; wire one section at a time. |

---

## PHASES AND ACTIONABLE STEPS

---

### Phase 0: Foundation (Architectural Setup)

**Goal:** Backend and frontend run locally; database exists and is seedable; API and app structure match [API_CONTRACT](API_CONTRACT.md) and [DATA_MODEL](DATA_MODEL.md). Do this first so every later phase has a stable base.

**Backend**

- [ ] Create Flask application entry point (e.g. `app.py` or `run.py`) and ensure the app runs with a single command (e.g. `flask run` or `python -m app`).
- [ ] Add `requirements.txt` with Flask, SQLAlchemy, and any other dependencies; document in README or env how to install and run.
- [ ] Set up project layout: separate modules or packages for **controllers** (HTTP/API), **services** (business logic), **models** (SQLAlchemy models). No business logic in controllers.
- [ ] Configure SQLite via environment (e.g. `DATABASE_URL`); keep config in one place (env or small config module).
- [ ] Create SQLAlchemy models for core tables per [DATA_MODEL](DATA_MODEL.md): `establishment`, `patient`, `record`, `appointment`, `medication`. Add `medication_reminder`, `adherence_log`, `observation`, `insight` if you want them in the first schema pass.
- [ ] Create database and tables (e.g. `db.create_all()` or a small init script); no migrations tool required for hackathon, but keep schema in code.
- [ ] Register API blueprint or routes under `/api/v1/`; add CORS so the frontend origin can call the API.
- [ ] Add middleware or a small helper that reads `X-Establishment-Id` and `X-Patient-Id` (or query params) and exposes “current establishment” and “current patient” for use in controllers/services.
- [ ] Add a `.env.example` (no real secrets) listing `DATABASE_URL`, `GEMINI_API_KEY` (or similar), `UPLOADS_DIR`, and any other required env vars.

**Frontend**

- [ ] Create React app with Vite (or CRA); add Tailwind CSS and Chart.js per [ARCHITECTURE](ARCHITECTURE.md).
- [ ] Configure API base URL (env or config) and, if needed, dev proxy to the backend so the frontend can call `/api/v1/...` without CORS issues in dev.
- [ ] Set up a minimal router and app shell: layout (header/nav), placeholder home or dashboard route, and a simple “Establishments” route so navigation is in place.
- [ ] Ensure one command runs the frontend (e.g. `npm run dev`).

**Data and demo readiness**

- [ ] Add a seed script or one-off step that creates at least one or two establishments and one or two patients so the app has data for demos from the start.

**Checkpoint:** Backend serves `/api/v1/` (e.g. a health or establishments stub); frontend runs and can call the API; DB has tables and seed data.

---

### Phase 1: Establishment-Centric Records (Core Demo Backbone)

**Goal:** “Canvas for medical records” — list establishments, open an establishment, see records grouped there, upload a PDF, and open/download it. This is the main structural differentiator for the demo.

**Backend**

- [x] Implement **Establishments**: `GET /api/v1/establishments`, `GET /api/v1/establishments/:id` (list and get one). Use existing models and services; enforce no tenant filter on establishment list (establishments are global).
- [x] Implement **Patients**: `GET /api/v1/patients` (optionally filter by `X-Establishment-Id` for clinician view), `GET /api/v1/patients/:id`, `POST /api/v1/patients`. Persist with audit fields.
- [x] Implement **Records**: `GET /api/v1/establishments/:id/records` (list records for that establishment; optionally by patient). Return metadata only (id, file_name, patient_id, appointment_id if set, created_at).
- [x] Implement **Record upload**: `POST /api/v1/establishments/:id/records` with multipart/form-data for PDF; validate establishment and patient (e.g. from body or context); save file to configured uploads directory; store only file path/reference and metadata in DB per [SYSTEM_DESIGN](SYSTEM_DESIGN.md).
- [x] Implement **Record download**: `GET /api/v1/records/:id` (metadata), `GET /api/v1/records/:id/file` (serve file or redirect). Ensure path safety (no directory traversal).

**Frontend**

- [x] **Establishments list page:** Fetch and display establishments; link each to establishment detail.
- [x] **Establishment detail page:** Show establishment name; fetch and list records for this establishment (by patient or flat list).
- [x] **Record upload:** On establishment detail, add “Upload PDF” (or similar); form with file input and optional patient selection; call upload API; refresh record list on success.
- [x] **Record view:** For each record, show name and a link to view/download file (opens in new tab or downloads via record file URL).

**Checkpoint:** User can open an establishment, see its records, upload a PDF, and open it. Demo narrative: “Records by establishment, like Canvas for medical records.”

---

### Phase 2: Appointments and Dashboard Skeleton

**Goal:** Appointments per establishment (past and upcoming), create an appointment, and a dashboard that shows upcoming appointments and sets up space for reminders and recent activity.

**Backend**

- [ ] Implement **Appointments**: `GET /api/v1/establishments/:id/appointments` with query params for `patient_id`, `past`, `upcoming` (or equivalent); `POST /api/v1/establishments/:id/appointments` (scheduled_at, reason, physician_name, patient_id); `GET /api/v1/appointments/:id`, `PATCH /api/v1/appointments/:id`. All scoped by establishment_id.
- [ ] Optionally: when creating or updating a record, allow `appointment_id` in body to link record to a visit.

**Frontend**

- [ ] **Establishment appointments section:** On establishment detail, add “Appointments” (or tab): list past and upcoming; support filter or tabs for past vs upcoming.
- [ ] **Create appointment:** Form (date/time, reason, physician name, patient); submit to POST appointments; refresh list.
- [ ] **Dashboard page:** Layout with sections: “Upcoming appointments” (fetch from API or from establishments’ appointments for current patient), “Recent records” (stub or real), “Medication reminders” (stub). Use `X-Patient-Id` (or current patient selector) so dashboard is patient-scoped.

**Checkpoint:** User can create and see appointments per establishment and see upcoming appointments on the dashboard. Dashboard is the central “what’s next” view.

---

### Phase 3: Medications and Reminders

**Goal:** Medications list per patient (active on top), view instructions, add medication; reminders list for dashboard; optional simple adherence and streak.

**Backend**

- [ ] Implement **Medications**: `GET /api/v1/patients/:id/medications`, `POST /api/v1/patients/:id/medications`, `GET /api/v1/medications/:id`, `PATCH /api/v1/medications/:id`. Fields: name, instructions, is_active (and optional establishment_id). Return active first when listing.
- [ ] Implement **Reminders**: `GET /api/v1/patients/:id/medications/reminders` (e.g. next N reminders across medications) and create reminder when creating/patching a medication (e.g. medication_reminder with time_of_day).
- [ ] Implement **Adherence** (MVP): `POST /api/v1/medications/:id/adherence` (e.g. body with date and taken=true); optional `GET` for adherence by medication for streak display.

**Frontend**

- [ ] **Medications tab (patient-scoped):** List medications; show “Active” header/section at top; inactive below. Each item links to detail.
- [ ] **Medication detail:** Show name, instructions, reminder time(s). Optionally: add/edit medication form.
- [ ] **Add medication:** Form (name, instructions, active, reminder time); POST to create; optionally create reminder in same flow.
- [ ] **Dashboard — medication reminders:** Consume reminders API and show “Upcoming medication” or “Take X at Y” in dashboard.
- [ ] **Adherence (nice-to-have):** Per medication, simple “Mark taken today” and display current streak; implement only if Phase 3 is ahead of schedule.

**Checkpoint:** Patient has a medications list (active on top, instructions visible); dashboard shows medication reminders. Optional: one medication with adherence and streak.

---

### Phase 4: AI Assistant (Record-Aware Chat)

**Goal:** Chat endpoint that uses the patient’s records (and optionally medications/appointments) as context; frontend chat UI; answers grounded in data and defers to doctor when uncertain. **High demo impact; implement early enough to have a fallback if Gemini is slow or failing.**

**Backend**

- [ ] Introduce **AIService** abstraction per [SYSTEM_DESIGN](SYSTEM_DESIGN.md): single module that owns prompt construction, call to Gemini (or configurable provider), and response parsing. Controllers do not call the provider directly.
- [ ] Configure Gemini (or provider): API key and model from env; document in `.env.example`.
- [ ] Implement **Chat**: `POST /api/v1/ai/chat`. Accept patient context (e.g. `X-Patient-Id` or body); load patient’s records (e.g. metadata or minimal text representation — avoid sending full PDF content initially if token-heavy), active medications, and recent appointments; build a small context string; include user message and system prompt that says “answer from records, say to ask doctor if unsure.”
- [ ] Return assistant reply in a consistent JSON shape (e.g. `{ "message": "..." }`). On provider failure, return a safe fallback message (e.g. “Please ask your doctor.”).

**Frontend**

- [ ] **Chat UI:** Place chat on dashboard (or dedicated page); input and “Send”; call `POST /api/v1/ai/chat` with current patient and message; display response. Optionally show a short “Using your records as context” note.
- [ ] Handle loading and error states (e.g. show fallback message if API fails).

**Checkpoint:** User can ask a question (e.g. “Am I allowed to swim?”) and get an answer that is explicitly based on their records (or a fallback). Demo narrative: “Record-aware AI, not a generic chatbot.”

---

### Phase 5: Remote Monitoring — Manual Entry and One Chart

**Goal:** Manual observation entry and one trend chart (e.g. blood pressure or weight) to demonstrate remote monitoring without real device integrations. Integrations tab as UI-only placeholder.

**Backend**

- [ ] Implement **Observations ingestion**: `POST /api/v1/observations` with body: patient_id (or from context), source (manual/device), metric_type (string, e.g. `blood_pressure`, `weight`), value(s), observed_at, optional device_id. Validate and persist per [API_CONTRACT](API_CONTRACT.md) and [DATA_MODEL](DATA_MODEL.md).
- [ ] Implement **Observations list**: `GET /api/v1/patients/:id/observations` with optional filters (metric_type, date_from, date_to) for charting.

**Frontend**

- [ ] **Manual entry:** Form to add observation: select metric type (e.g. Blood Pressure, Weight, Blood Sugar, Cholesterol), enter value(s) and date/time; submit to ingestion API.
- [ ] **Observations list:** Simple list by date or metric type.
- [ ] **One chart:** Use Chart.js to show trend for one metric (e.g. weight or BP over time). Fetch observations for that metric and date range; render line or bar chart.
- [ ] **Integrations tab:** Placeholder content: “Connect Fitbit, Apple Watch, etc. — coming soon.” No backend integration.

**Checkpoint:** User can log a manual observation and see a trend chart for at least one metric. “Remote monitoring” is demonstrable; integrations are clearly future work.

---

### Phase 6: Dashboard Polish and Proactive Intelligence (If Time)

**Goal:** Dashboard fully wired to real data; optional AI summary of recent visits; optional proactive insight (e.g. one trend-based or canned message). Mark proactive intelligence as nice-to-have; ship one insight or stub only if time allows.

**Backend**

- [ ] Implement **Dashboard aggregate**: `GET /api/v1/dashboard` (patient from `X-Patient-Id`): return upcoming appointments, medication reminders, recent records (or links), and optional “stats” summary. Single endpoint to reduce round trips per [SYSTEM_DESIGN](SYSTEM_DESIGN.md).
- [ ] **Optional — Proactive insights:** Endpoint or background step that computes a simple trend (e.g. BP last 2 weeks) and calls AIService to generate one short insight (e.g. “Your BP has been increasing…”); store in `insight` table. Expose `GET /api/v1/ai/insights` (or include in dashboard payload). If time is short, return a single canned insight or skip.

**Frontend**

- [ ] **Dashboard:** Replace any stubs with dashboard API: upcoming appointments, medication reminders, recent records. Ensure layout is clear and demo-ready.
- [ ] **Optional — AI summary:** One block “Summary of recent visits” that calls an endpoint or uses dashboard payload; show short text. Skip if AI or time is limited.
- [ ] **Optional — Proactive insight card:** If backend returns insights, show one card (e.g. “Your BP has been increasing; here are common factors…”). Otherwise omit.

**Checkpoint:** Dashboard is the single “health hub” view with real data; optional proactive insight adds polish without blocking the demo.

---

## Tracking Progress

- Use the checkboxes in each phase to mark steps done.
- After each phase, run through the **Checkpoint** to confirm the demo narrative for that slice.
- If ahead of schedule, pull in items from Nice-to-Haves (e.g. full adherence + streaks, second chart, link record to appointment in UI).
- If behind, protect: Phase 0, Phase 1 (records), Phase 2 (appointments + dashboard skeleton), Phase 4 (AI chat with fallback). Trim or stub Phase 3 (medications) to “list + one reminder,” Phase 5 to “manual entry only, no chart,” and Phase 6 to “dashboard with stubs only.”

---

## Summary

| Phase | Focus | Demo moment |
|-------|--------|-------------|
| **0** | Foundation | Backend + frontend run; DB seeded; API and context ready. |
| **1** | Records by establishment | “Canvas for medical records” — list, upload, view PDF. |
| **2** | Appointments + dashboard | Upcoming appointments on one dashboard. |
| **3** | Medications + reminders | Medications list, instructions, reminders on dashboard. |
| **4** | AI assistant | “Ask using your data” — record-aware chat. |
| **5** | Remote monitoring | Manual entry + one trend chart. |
| **6** | Dashboard polish (if time) | Full dashboard + optional proactive insight. |

This roadmap is revisable: adjust phase order or scope (e.g. move AI earlier, drop proactive intelligence to stub-only) based on team size and how the first phases go.
