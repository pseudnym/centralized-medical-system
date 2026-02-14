# Project Ivy — Vision

**This is a hackathon project.** Choices favor speed of development and ease of setup (e.g., local storage, SQLite in dev) so the team can demo core value quickly. Production-grade hardening, scale, and compliance can be addressed in a later phase.

## Problem statement

Medical information is fragmented across hospitals, clinics, and specialists. Patients have no single, organized view of their history—records live in different portals, paper gets lost, and answering a simple question like “Can I do this?” often means guessing or waiting for the next visit.

Tracking day-to-day health is just as scattered. Medications, appointment times, and vitals like blood pressure are spread across apps, sticky notes, and device screens. There is no one place that ties together what happened at each establishment, what to take and when, and how key numbers are trending.

Care today is mostly reactive: you go when something hurts or when a checkup is due. Patients lack proactive, record-aware insights—for example, that blood pressure has been creeping up for weeks, with context on what might be driving it—instead of discovering it only at the next appointment.

## Target users

**Primary:** Patients who want one place to see their records, appointments, medications (with reminders and tracking), manual vitals, and to ask an AI questions using their own data. They may see multiple providers and want a clear, establishment-by-establishment view plus a single dashboard for what matters today.

**Primary:** Doctors and clinicians who upload PDFs, input medications, and schedule appointments within the app. Establishments are the organizing unit: records and appointments are grouped by establishment so both patients and providers can work in a familiar, per-location structure.

## Core value proposition

**One health hub where your data works for you.**

Project Ivy is a single place for records (grouped by establishment), past and future appointments, medications with instructions and reminders, and manual health monitoring. The main dashboard gives a high-level overview of current stats, recent visits, medication reminders, and upcoming appointments—so you see what’s relevant now without digging through multiple portals.

An AI assistant uses your actual medical records as context. You can ask things like “Am I allowed to swim?” and get an inference based on your history; when the system is uncertain, it tells you to ask your doctor. That’s different from generic health chatbots: answers are grounded in your data.

Separate from the chatbot, proactive health intelligence reads your records and monitoring trends (e.g., blood pressure over time) and surfaces alerts and context—for example, “Your BP has been increasing; here are common factors that can cause this.” The goal is to make knowledge power for the patient: insights when they’re useful, not only at the next visit.

## Competitive differentiation

- **Establishment-centric records:** Like Canvas for college, but for medical records. Everything is grouped by establishment—records, past and future appointments, linked visit documentation—so the mental model is clear and matches how people already think about “my doctor at X” or “that clinic.”

- **Record-aware AI:** The assistant reasons over the patient’s real records and trends, not generic advice. It can tie activities, medications, and history together and explicitly defer to the doctor when it’s unsure.

- **Proactive health intelligence:** Beyond Q&A: the system analyzes history and monitoring data and pushes insights (e.g., BP trend alerts and contributing factors). This is a distinct feature from the conversational assistant and reflects a “knowledge is power” philosophy.

- **Unified stack:** Records, scheduling, medications (with reminders and adherence tracking like streaks), manual monitoring, and AI live in one product. No need to jump between a portal, a pill app, and a separate tracker.

- **Inclusive monitoring:** Manual entry supports non-smart devices (e.g., basic blood pressure cuffs) and one-off readings, while the design allows future integrations (Fitbit, Apple Watch, etc.) in a dedicated Integrations area so all data can feed the same trends and intelligence.

## Long-term vision

Project Ivy aims to become the patient’s single, patient-controlled command center for health—across establishments and devices—so that records, appointments, medications, and monitoring work together in one place.

- **Integrations:** Real connections to wearables and health accessories (e.g., Fitbit, Apple Watch) in the Remote Monitoring / Integrations area, so device data flows in alongside manual entry.

- **Templates:** Predefined templates for common metrics (e.g., Blood Pressure, Weight, Blood Sugar, Cholesterol) so manual entry is quick and consistent, with built-in charts for trends over time.

- **Richer intelligence:** Deeper use of records, monitoring, and appointments for proactive insights and recommendations—more alerts, better context, and clearer links between visits, medications, and trends.

- **Patient at the center:** Long-term, the vision is a single place where patients see and control their health story: every establishment, every device, and every piece of advice grounded in their own data.
