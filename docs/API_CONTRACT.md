# Project Ivy — API Contract (Rough)

**Living document.** This is a rough API contract and will be updated as the project builds (e.g. when auth is added, when new resources or fields are introduced). Use it to align frontend and backend and refine endpoints over time.

See also: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [RAW_IDEAS.md](RAW_IDEAS.md).

---

## Base URL and versioning

- **Base path:** All APIs live under `/api/v1/`.
- **Request/response:** JSON for request and response bodies unless otherwise noted (e.g. file upload/download).
- **CORS:** Backend configures CORS to allow the frontend origin, per [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md).

---

## Context (pre-auth / dev)

Until authentication and RBAC are implemented, context is passed explicitly so establishment- and patient-scoped behavior is testable.

- **Establishment context:** Use header `X-Establishment-Id` (or query param `establishment_id`) for establishment-scoped endpoints. Required when listing or creating records, appointments, etc. in a clinician/establishment context.
- **Patient context:** Use header `X-Patient-Id` (or query param `patient_id`) for patient-scoped endpoints (e.g. dashboard, medications, observations). Later this will be replaced by “current user as patient” from auth.

---

## Resource endpoints (revisable)

| Area | Endpoints | Notes |
|------|-----------|--------|
| **Establishments** | `GET /api/v1/establishments`, `GET /api/v1/establishments/:id` | List establishments; get one (e.g. for establishment page). |
| **Patients** | `GET /api/v1/patients`, `GET /api/v1/patients/:id`, `POST /api/v1/patients` | Filter by `X-Establishment-Id` when in establishment context; patient-centric views may ignore or scope differently. |
| **Records** | `GET /api/v1/establishments/:id/records`, `POST /api/v1/establishments/:id/records` (multipart PDF), `GET /api/v1/records/:id` (metadata), `GET /api/v1/records/:id/file` (download) | Records grouped by establishment; upload returns record ID and file reference. |
| **Appointments** | `GET /api/v1/establishments/:id/appointments`, `POST /api/v1/establishments/:id/appointments`, `GET /api/v1/appointments/:id`, `PATCH /api/v1/appointments/:id` | Query params e.g. `?patient_id=`, `?past=`, `?upcoming=`; link to records via appointment ID on record or body. |
| **Medications** | `GET /api/v1/patients/:id/medications`, `POST /api/v1/patients/:id/medications`, `GET /api/v1/medications/:id`, `PATCH /api/v1/medications/:id`, `GET /api/v1/patients/:id/medications/reminders`, `POST /api/v1/medications/:id/adherence` | Active/inactive, instructions, reminders; adherence for daily tracker and streaks. |
| **Monitoring** | `POST /api/v1/observations` (ingestion), `GET /api/v1/patients/:id/observations` | Ingestion: body with source (manual/device), metric_type, value(s), timestamp, optional device_id. List supports filters (metric_type, date range) for charts. |
| **AI** | `POST /api/v1/ai/chat`, `GET /api/v1/ai/insights` (or `POST`) | Chat: patient context from header/body, message history and record context server-side. Insights: patient-scoped, returns proactive alerts (e.g. BP trend). |
| **Dashboard** | `GET /api/v1/dashboard` | Aggregate for current patient: stats summary, recent visits/records, medication reminders, upcoming appointments, optional AI summary. |

---

## Conventions

- **HTTP verbs:** Use GET for list and detail, POST for create, PATCH for partial update. Use DELETE where soft delete or hard delete is supported.
- **Errors:** Use a consistent error shape, e.g. `{ "error": "<message>", "code": "<optional_code>" }`, with appropriate HTTP status codes (4xx, 5xx).
- **Auth and RBAC:** This contract will be revisited when auth and real RBAC are added; context headers will be replaced or supplemented by tokens/sessions and server-side enforcement.
