# Project Ivy — Key System Design Decisions

This document captures the main system design choices for the centralized healthcare data platform. Each decision is stated clearly, justified, and evaluated for tradeoffs and scalability.

---

## 1. Application Architecture Style

**Decision:** Layered modular monolith (backend) with a separate SPA (frontend). Backend follows MVC-style separation: **Controllers** (HTTP/API), **Services** (business logic), **Models** (persistence). No microservices at launch.

**Why chosen:**
- Aligns with the stated Flask + modular MVC structure and “hackathon iteration” goal.
- Single deployable backend simplifies ops and debugging while the team is small.
- Clear layers keep AI, scheduling, records, and monitoring logic testable and swappable without crossing process boundaries.
- Establishment-centric and patient-centric flows are expressed as service calls, not distributed services.

**Tradeoffs:**
- **Pros:** One codebase, one DB, simpler deployment and local dev; no cross-service versioning or network failure modes.
- **Cons:** Scaling is vertical until you choose to extract hot paths (e.g., AI or ingestion) into separate services; one bug can affect the whole app if not well isolated by layer.

**Future scalability:**
- Services (e.g., `AIService`, `MonitoringIngestionService`, `RecordService`) can be moved into separate processes or serverless functions when needed.
- API layer stays the single contract; new backends (e.g., GraphQL or event publishers) can be added without changing service interfaces.
- If traffic grows unevenly (e.g., AI or ingestion dominates), those modules are natural candidates for extraction.

---

## 2. Database Design Strategy

**Decision:** Single logical database (SQLite in dev, PostgreSQL in production), **database-agnostic schema** via SQLAlchemy ORM. Normalized relational model with **establishment** and **patient** as first-class entities; optional soft deletes and audit fields where needed for compliance.

**Why chosen:**
- One DB matches the monolith and keeps transactions and joins simple for cross-entity flows (e.g., patient → establishments → records → appointments).
- SQLAlchemy with minimal raw SQL allows swapping SQLite → PostgreSQL (or another engine) by configuration.
- Normalization supports integrity (e.g., one establishment record, many patients linked via enrollments/visits) and avoids duplication of establishment or patient data.
- Healthcare use cases benefit from clear auditability; adding `created_at`, `updated_at`, and optional `deleted_at` from the start is low cost.

**Tradeoffs:**
- **Pros:** ACID transactions across records, appointments, medications; simple backups and point-in-time recovery; well-understood tooling.
- **Cons:** Heavy analytics or full-text search may later need read replicas, materialized views, or a dedicated analytics store; schema migrations must be managed (e.g., Alembic).

**Future scalability:**
- Read replicas for reporting and dashboards without blocking writes.
- PostgreSQL full-text search or Elasticsearch for record search if needed.
- Partitioning by `establishment_id` or `patient_id` if a single table grows very large; connection pooling (e.g., PgBouncer) for many concurrent connections.

---

## 3. Multi-Hospital Data Isolation Strategy

**Decision:** **Row-level isolation by establishment (tenant).** Every tenant-scoped table includes `establishment_id` (or equivalent FK). All queries that touch patient data in an establishment context **must** filter by the current establishment. No separate database per hospital; no separate schema-per-tenant.

**Why chosen:**
- Single database keeps ops and backups simple and supports cross-establishment views for the patient (e.g., “my records at Hospital A and Clinic B”) via a single query surface.
- Row-level tenancy is the standard approach for B2B SaaS with many small-to-medium tenants and fits “multi-hospital multi-tenant support” in the architecture.
- Patient is the linking concept: a patient can have data at multiple establishments; the platform can aggregate for the patient while each establishment only sees its own data when acting in “establishment” context.

**Tradeoffs:**
- **Pros:** One schema to migrate, one backup, simpler connection management; cross-tenant analytics and patient-centric views are straightforward.
- **Cons:** A missing `establishment_id` filter is a data-leak risk—mitigated by conventions, middleware that sets “current establishment,” and later by RBAC and automated checks; noisy neighbors possible without per-tenant limits.

**Future scalability:**
- Middleware or context that always sets and validates `establishment_id` for establishment-scoped requests; optional RLS (Row-Level Security) in PostgreSQL for defense in depth.
- Per-tenant rate limits, quotas, or dedicated pools if some establishments grow very large.
- If regulatory or contractual requirements force it, “premium” tenants could be moved to dedicated schemas or DBs behind the same API.

---

## 4. Role Modeling (Even if Auth Is Later)

**Decision:** Model **roles** and **actors** in the data model from the start: at minimum **Patient**, **Clinician** (e.g., doctor, nurse), and **Establishment admin**. Associate users (when auth exists) to one or more establishments and to a role per establishment. Support “patient viewing their own data” as a distinct access path (patient-scoped) vs “clinician viewing establishment data” (establishment-scoped).

**Why chosen:**
- Vision distinguishes “patients” and “doctors/clinicians” and uses “establishment” as the organizing unit; role modeling makes these first-class and prevents ad hoc flags.
- Deciding now how clinicians relate to establishments (e.g., many-to-many) avoids painful schema changes when RBAC is added.
- Clear separation between “current user is patient” (see own data across establishments) and “current user is clinician at establishment X” (see establishment X’s data) keeps authorization rules simple later.

**Tradeoffs:**
- **Pros:** Consistent vocabulary across features (scheduling, records, AI); easier to add permissions (e.g., “only doctors can upload records”) later; audit logs can record “role + establishment.”
- **Cons:** Slight upfront complexity (e.g., `user_establishment_roles` or equivalent); auth implementation is still deferred, so roles may be stored but not enforced until that phase.

**Future scalability:**
- When auth is added: JWT or session carries `user_id`, `establishment_id` (when in clinician context), and `role`. Middleware enforces “patient can only see self” and “clinician can only see their establishment(s).”
- Fine-grained permissions (e.g., “nurse can view but not delete”) can be added as role-permission mappings without changing the high-level role set.
- Support for “patient delegate” or “guardian” can be another role or relationship type.

---

## 5. AI Service Abstraction

**Decision:** All AI behavior is behind a **single backend AI service abstraction** (e.g., `AIService`). This layer owns: prompt construction, calling the external AI provider (e.g., OpenAI-compatible API), parsing responses, and any retries or fallbacks. Controllers and other services never call the AI provider directly. Provider-specific details (model name, API key, endpoint) are configuration.

**Why chosen:**
- Architecture explicitly requires “AI requests abstracted behind a service layer” and “future replacement or expansion of the AI provider.”
- Record-aware Q&A and proactive intelligence both need the same safeguards: no business logic in controllers, consistent handling of PII and context window, and one place to swap or add models (e.g., different model for summarization vs chat).

**Tradeoffs:**
- **Pros:** One place to change provider, add caching, rate limiting, or guardrails; easier testing with a mock AI service; consistent error handling and logging.
- **Cons:** All AI traffic goes through one module—if that module is slow or down, all AI features are affected unless the abstraction is later split (e.g., “chat” vs “insights” services).

**Future scalability:**
- Multiple implementations of the same interface (e.g., OpenAI, Azure OpenAI, local model) selected by config or feature flag.
- Optional async/queue for long-running or batch AI tasks (e.g., proactive insight generation) so HTTP requests don’t block.
- Caching of embeddings or non-personalized parts of prompts to reduce cost and latency; telemetry and A/B tests by provider or model behind the same interface.

---

## 6. Remote Monitoring Ingestion Flow

**Decision:** **Synchronous API-first ingestion** for manual and device data. Backend exposes a **single ingestion API** (e.g., REST) that accepts: source type (manual vs device/integration), metric type (e.g., blood pressure, weight), value(s), timestamp, and optional device/source identifier. The API validates, normalizes, and persists in a **monitoring/observations** store keyed by patient (and optionally establishment). No message queue or event bus at launch; optional async processing only if a specific step (e.g., AI trend analysis) is offloaded later.

**Why chosen:**
- Vision emphasizes “manual entry” and “future integrations (Fitbit, Apple Watch)” feeding “the same trends and intelligence”; one API keeps the contract stable for both.
- Synchronous flow is simpler to debug and fits “demonstrating core data flow” and “remote monitoring functionality” without introducing Kafka or RabbitMQ early.
- Normalization at ingestion (e.g., units, codes for metric types) keeps charts and AI logic simple and consistent.

**Tradeoffs:**
- **Pros:** Straightforward request/response semantics, easy to test and trace; clients get immediate success/failure; no queue ops or ordering issues.
- **Cons:** Bursty or high-volume device sync could create spikes—mitigated by rate limiting and optional batching in the client; heavy post-processing (e.g., trend detection) in the request path could increase latency unless moved to background jobs later.

**Future scalability:**
- Same API used by a “device adapter” or integration service that pulls from Fitbit/Apple Health and pushes to the ingestion API in batches.
- Optional message queue for “on new observation” events to trigger alerts or AI insights asynchronously without blocking ingestion.
- Time-series optimization (e.g., separate table or DB for high-cardinality numeric series) if monitoring data grows very large.

---

## 7. File/Image Storage

**Decision:** **Local filesystem storage** for the hackathon. All binary assets (uploaded PDFs, records, visit notes, profile or document images) are written to a single **uploads** directory (or configurable path) on the server. The database stores only **references** (e.g., relative path or filename) so the same reference-based pattern is used; no cloud or S3 setup required. Serving can be via Flask static route or a simple file-response endpoint.

**Why chosen:**
- **Simplicity:** Zero config and no external services—no cloud storage keys or buckets. Run the app and uploads “just work” on one machine.
- Keeping binaries out of the DB still applies: the database stays small and fast; only paths are stored.
- Reference-in-DB keeps the design consistent; if storage needs change later, only the backend that reads/writes files changes, not the schema or API.

**Tradeoffs:**
- **Pros:** No cloud dependency; easy to run locally and in a single-node demo; same reference pattern keeps the design simple and self-contained.
- **Cons:** Not suitable for multi-instance or serverless (no shared filesystem); backups mean backing up the uploads directory as well; no built-in CDN or pre-signed URLs—files are served by the app or same server.

**Future scalability:**
- If needed, introduce a small storage abstraction (e.g., `StorageBackend` interface); the chosen approach is local filesystem storage.
- Keep “store reference in DB, stream or redirect to file” so only the backend that writes/reads files changes; API and frontend stay the same.

---

## 8. Frontend–Backend Communication

**Decision:** **REST over HTTPS** as the primary API style. JSON for request and response bodies. Frontend (React SPA) runs in the browser and calls backend APIs by URL; CORS is configured on the backend to allow the frontend origin. No GraphQL or WebSockets at launch; WebSockets or SSE only if real-time features (e.g., live notifications) are added later.

**Why chosen:**
- REST is a good fit for CRUD and resource-oriented operations (patients, establishments, records, appointments, medications, observations) and aligns with Flask’s strengths.
- JSON is universal and easy to debug; no extra client codegen or schema sync required for an initial release.
- Stateless APIs simplify horizontal scaling and caching; session state (when auth exists) can live in tokens or cookies.

**Tradeoffs:**
- **Pros:** Simple to document (OpenAPI/Swagger optional), test with curl/Postman, and consume from React with fetch or axios; no over-fetching/under-fetching complexity.
- **Cons:** Multiple round trips for compound views (e.g., dashboard) unless the backend offers a few “view” endpoints that aggregate; no built-in subscriptions—polling or a later real-time channel if needed.

**Future scalability:**
- BFF (Backend-for-Frontend) or a few “dashboard” and “patient summary” endpoints that return aggregated JSON to reduce round trips.
- Optional GraphQL layer later if many clients need different shapes of the same data; REST can remain for internal or simple clients.
- API versioning (e.g., `/v1/...`) from the start to allow breaking changes without breaking existing clients.

---

## 9. Deployment Assumptions

**Decision:** **Backend and frontend are deployed as separate artifacts.** Backend: single Flask application process (or gunicorn/uWSGI with multiple workers), environment-based configuration (e.g., DB URL, AI provider key, uploads directory path). Frontend: static build (e.g., Vite) served by a web server or CDN. No container orchestration (e.g., Kubernetes) required at launch; **assume a single region, single environment (e.g., staging/production) or simple two-environment setup.** Secrets and config via environment variables or a minimal secrets store (e.g., env files in dev, managed secrets in production).

**Why chosen:**
- Architecture states “backend and frontend are separated into independent services”; separate deployment supports different release cadences and scaling (e.g., more API instances than static assets).
- Avoiding Kubernetes and multi-region keeps the first version operable by a small team and matches “easy migration to PostgreSQL, RBAC, multi-tenant” without mandating cloud-native complexity from day one.
- Environment-based config and secrets keep the app portable across local, staging, and production.

**Tradeoffs:**
- **Pros:** Clear boundary between API and UI; frontend can be cached or put behind a CDN; backend can scale by adding processes or machines.
- **Cons:** Two things to deploy and monitor; CORS and (if used) cookie/domain setup must be correct; no built-in auto-scaling or self-healing until a more advanced platform is adopted.

**Future scalability:**
- Containers (Docker) for consistent builds and then orchestration (e.g., ECS, Kubernetes) when ops and scaling justify it.
- Multiple backend instances behind a load balancer; stateless design supports this without change.
- Separate staging/production (and optionally per-tenant or regional) environments with the same codebase and different config.
- Managed DB, local filesystem storage for files (uploads directory), and optional managed queue as the platform grows.

---

## Summary Table

| Area | Decision | Main tradeoff |
|------|----------|----------------|
| App architecture | Layered modular monolith, separate SPA | Simplicity vs. need to extract services later |
| Database | Single DB, ORM-agnostic, normalized | ACID and simplicity vs. heavy analytics later |
| Multi-hospital | Row-level isolation by `establishment_id` | Single schema vs. strict filter discipline |
| Roles | Patient, Clinician, Establishment admin modeled now | Clear auth path later vs. slight upfront complexity |
| AI | Single backend AI service abstraction | One place to change vs. single point of failure |
| Remote monitoring | Synchronous ingestion API, single contract | Simple and traceable vs. burst handling later |
| Files | Local filesystem (uploads dir), references in DB | Ease for hackathon vs. multi-node / production scale later |
| API | REST + JSON, CORS for SPA | Simple and universal vs. many round trips for rich views |
| Deployment | Backend + frontend separate, env-based config, no K8s at start | Operable by small team vs. manual scaling at first |

This document should be updated when any of these decisions change so that the rationale and implications remain visible.
