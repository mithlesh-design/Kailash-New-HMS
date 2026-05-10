# Kailash HMS — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-05-09  
**Project:** kailash-hms-prototype  
**Owner:** Kailash Healthcare  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Users & Roles](#4-users--roles)
5. [System Architecture](#5-system-architecture)
6. [Tech Stack](#6-tech-stack)
7. [Module Specifications](#7-module-specifications)
   - 7.1 [Login / Role Selector](#71-login--role-selector)
   - 7.2 [Patient Self Check-In Kiosk](#72-patient-self-check-in-kiosk)
   - 7.3 [Patient Portal](#73-patient-portal)
   - 7.4 [Doctor Portal](#74-doctor-portal)
   - 7.5 [Nurse Portal](#75-nurse-portal)
   - 7.6 [Emergency (ER) Portal](#76-emergency-er-portal)
   - 7.7 [Reception Portal](#77-reception-portal)
   - 7.8 [Pharmacy Portal](#78-pharmacy-portal)
   - 7.9 [Laboratory Portal](#79-laboratory-portal)
   - 7.10 [Radiology Portal](#710-radiology-portal)
   - 7.11 [Admission / Bed Management Portal](#711-admission--bed-management-portal)
   - 7.12 [Billing Portal](#712-billing-portal)
   - 7.13 [Discharge Portal](#713-discharge-portal)
   - 7.14 [Insurance / TPA Portal](#714-insurance--tpa-portal)
   - 7.15 [Operation Theater (OT) Portal](#715-operation-theater-ot-portal)
   - 7.16 [Inventory Portal](#716-inventory-portal)
   - 7.17 [Housekeeping Portal](#717-housekeeping-portal)
   - 7.18 [Quality & Compliance Portal](#718-quality--compliance-portal)
   - 7.19 [Admin Portal](#719-admin-portal)
8. [AI Features](#8-ai-features)
9. [Cross-Cutting Concerns](#9-cross-cutting-concerns)
10. [Data Models](#10-data-models)
11. [Route Map](#11-route-map)
12. [State Management](#12-state-management)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Compliance](#14-compliance)
15. [Future Roadmap](#15-future-roadmap)

---

## 1. Executive Summary

**Kailash HMS** is an enterprise-grade, AI-assisted Hospital Management System built for modern Indian healthcare facilities. It is a prototype web application that covers the complete patient journey — from self check-in at a kiosk all the way through discharge — across 17 role-specific portals. The system is designed to eliminate paper-based workflows, reduce patient wait times, enable AI-assisted clinical decision support, and provide real-time visibility to all hospital stakeholders.

The prototype is implemented as a client-side Next.js application with all state managed via Zustand stores and rich mock data. It is production-ready in architecture and is designed to be backed by a real API layer.

---

## 2. Product Overview

| Attribute | Value |
|---|---|
| Product Name | Kailash HMS |
| Type | Hospital Management System (HMS) |
| Deployment | Web (responsive, desktop-first) |
| Entry Point | Role-selector login page |
| Active Roles | 17 |
| Key Differentiators | AI triage, AI pre-brief for doctors, AI anomaly detection, predictive maintenance, DISHA compliance |
| Tagline | *Intelligent Healthcare Operations* |

### Patient Journey Overview

```
Walk-in / Ambulance
        ↓
Self Check-In Kiosk (QR)  OR  Reception Registration
        ↓
OPD Queue → Vitals → Consultation → [Lab / Radiology / Pharmacy]
        ↓ (if admitted)
Admission → Bed Assignment → Ward / ICU / OT
        ↓
Discharge Clearance (5-pillar) → Exit Clearance → Follow-up
```

---

## 3. Goals & Success Metrics

### Primary Goals
- Reduce OPD patient wait time through token-based queue management
- Give every doctor AI-generated pre-briefs before entering a consultation
- Provide real-time bed occupancy and admission visibility
- Digitise the discharge process with a structured 5-pillar clearance system
- Centralise quality and safety incident tracking

### Success Metrics

| Metric | Target |
|---|---|
| Average OPD wait time | < 20 minutes |
| Pharmacy dispensing time | < 10 minutes per prescription |
| Bed turnaround after discharge | < 2 hours |
| Discharge summary completion | < 30 minutes of patient leaving ward |
| Lab TAT compliance | ≥ 90% within expected TAT |
| AI pre-brief usage by doctors | ≥ 85% of consultations |
| Patient satisfaction score | ≥ 87% |
| Audit task completion | ≥ 90% per week |

---

## 4. Users & Roles

The system supports **17 distinct roles**, each with its own portal, navigation, and permissions.

| # | Role | ID Format | Department | Primary Responsibility |
|---|---|---|---|---|
| 1 | **Patient** | PT-##### | — | Self-service: queue, records, billing, appointments |
| 2 | **Doctor** | DR-#### | Various | Consultation, e-prescription, orders |
| 3 | **Nurse** | NR-### | Ward | Vitals, medication, rounds, tasks |
| 4 | **Emergency** | ER-### | Emergency Room | ER triage, trauma tracking |
| 5 | **Reception** | RC-### | OPD | Registration, queue management |
| 6 | **Pharmacy** | PH-### | Pharmacy | Prescription dispensing |
| 7 | **Lab** | LB-### | Pathology | Sample tracking, results |
| 8 | **Radiology** | RAD-### | Radiology | Scan scheduling, reporting |
| 9 | **Bed Manager** | BM-### | Admission Desk | Bed allocation, admission requests |
| 10 | **Billing** | BL-### | Billing Dept | Bill generation, payments |
| 11 | **Discharge** | DC-### | Discharge Desk | Discharge clearance, summaries |
| 12 | **Insurance/TPA** | INS-### | TPA Desk | Claims, pre-auth |
| 13 | **OT** | OT-### | Operation Theater | Procedure scheduling, checklist |
| 14 | **Inventory** | INV-### | Procurement | Asset and stock management |
| 15 | **Housekeeping** | HK-#### | Housekeeping | Bed cleaning, ward upkeep |
| 16 | **Quality** | QA-#### | Quality & Compliance | Incidents, audits |
| 17 | **Admin** | ADM-## | Hospital Management | Analytics, staff, operations |

### Role Groups

**Clinical:** Patient, Doctor, Nurse, Emergency  
**Operations:** Reception, Pharmacy, Lab, Radiology  
**Management:** Admin, Insurance/TPA, Inventory  
**Inpatient Care:** Bed Manager, Billing, Discharge, OT, Housekeeping, Quality

---

## 5. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
│  ┌───────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │  Layouts  │  │    Pages    │  │     Components     │  │
│  │ AppShell  │  │ Per-module  │  │  Features / UI     │  │
│  │ RoleGuard │  │  dashboards │  │  AiPreBrief        │  │
│  └───────────┘  └─────────────┘  │  AISummaryWidget   │  │
│                                  │  PatientCard       │  │
│                                  └────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │               Zustand State Layer (16 stores)        │ │
│  │  useAuthStore  usePatientStore  useEmergencyStore     │ │
│  │  useConsultationStore  useAdmissionStore              │ │
│  │  useBillingStore  useDischargeStore  useLabStore      │ │
│  │  useRadiologyStore  usePharmacyStore  useOTStore      │ │
│  │  useWardStore  useInsuranceStore  useInventoryStore   │ │
│  │  useHRStore  useQualityStore  useFollowupStore        │ │
│  │  useHousekeepingStore                                 │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

- **No backend API** in the prototype — all state is in-memory via Zustand with rich mock data.
- **RoleGuard** component restricts page access based on `useAuthStore.activeRole`.
- **AppShell** provides the navigation sidebar and top bar, adapting per role.
- Each role has an isolated **layout** (`/[role]/layout.tsx`) that wraps the role's pages.

---

## 6. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.4 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | 5.0.13 |
| Animation | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.14.0 |
| Toasts | Sonner | 2.0.7 |
| QR Codes | qrcode.react | 4.2.0 |
| Class Utilities | clsx + tailwind-merge | Latest |
| Linting | ESLint + eslint-config-next | 9.x |

---

## 7. Module Specifications

---

### 7.1 Login / Role Selector

**Route:** `/`

**Description:** The public entry point. On the left panel, branding visuals and feature highlights. On the right, a role-selector grid organized into three groups (Clinical, Operations, Management). Selecting a role sets the active user in `useAuthStore` and navigates to that role's dashboard.

**Key Features:**
- Split-panel layout (left: brand, right: role selector)
- 11+ role cards with color-coded icons
- Animated card entry via Framer Motion
- Demo environment banner
- "Patient Self Check-In (Public Kiosk)" shortcut button to `/checkin`
- Mobile-responsive (left panel collapses, single-column layout)

**Acceptance Criteria:**
- Clicking any role card instantly navigates to the correct dashboard
- All 17 role portals are accessible
- No authentication credentials required (demo mode)

---

### 7.2 Patient Self Check-In Kiosk

**Routes:** `/checkin`, `/checkin/intake`

**Description:** A public-facing kiosk for walk-in patients to self-register without needing reception staff. Supports QR code scanning. Generates a token number and adds the patient to the OPD queue.

**Key Features:**
- QR code interface (via qrcode.react)
- Intake form for patient details (name, phone, symptoms, etc.)
- Automatic token number assignment
- Estimated wait time calculation
- Adds patient to `usePatientStore.patients` and `queue`

**Acceptance Criteria:**
- New patient appears in Reception and Doctor's queues after check-in
- Token number is sequential and unique
- Estimated wait time is calculated as `token × 4 minutes`

---

### 7.3 Patient Portal

**Routes:** `/patient/*`

**Pages:**
- `/patient/dashboard` — Overview: current token status, next appointment, recent visits
- `/patient/queue` — Live queue position with status (waiting → vitals → consulting → pharmacy → billing → done)
- `/patient/waiting` — Waiting room view with estimated time
- `/patient/appointments` — Upcoming and past appointments; book new / cancel
- `/patient/records` — Visit history with prescriptions per visit
- `/patient/billing` — View bills and payment status
- `/patient/followup` — Follow-up reminders and scheduling

**Data Sources:** `usePatientStore`, `useBillingStore`, `useFollowupStore`

**Queue Status Flow:**
```
waiting → vitals → consulting → pharmacy → billing → done
```

**Triage Levels:** Low (green) | Medium (yellow) | High (orange) | Critical (red)

**Acceptance Criteria:**
- Patient can see their current position in real time
- Appointments can be booked and cancelled
- Visit history shows all past visits with prescriptions
- Bill breakdown visible with insurance coverage amounts

---

### 7.4 Doctor Portal

**Routes:** `/doctor/*`

**Pages:**
- `/doctor/dashboard` — Today's queue, pending actions, stats
- `/doctor/consultation` — Active consultation workspace
- `/doctor/records` — Patient record lookup
- `/doctor/schedule` — Day/week schedule view

**Data Sources:** `useConsultationStore`, `usePatientStore`, `useLabStore`, `useRadiologyStore`

**Consultation Workspace Features:**

| Feature | Detail |
|---|---|
| AI Pre-Brief | AI-generated summary of patient history, symptoms, and suggested actions before doctor enters room |
| AI Suggestions | Inline suggestions (e.g. "Consider CBC + CRP", "Rule out bacterial infection") — doctor can accept to add to notes |
| Voice Dictation | Toggle dictation mode (`isDictating`) for hands-free note entry |
| Notes | Free-text clinical notes |
| Diagnosis | Structured diagnosis field |
| E-Prescriptions | Add/remove medicines with dosage, duration, instructions |
| Lab Orders | Order tests with priority (Routine/Urgent); mark sent to lab |
| Radiology Orders | Order scans (X-Ray/MRI/CT Scan/Ultrasound) with body part and priority |
| Referrals | Refer to specialist with urgency flag |
| Admission Order | Order admission with bed type preference; sent to Bed Manager |
| Send to Pharmacy | One-click dispatch of prescription to pharmacy queue |

**Consultation Flow:**
```
Select Patient → AI Pre-Brief → Examine → Notes + Diagnosis
→ Add Prescriptions / Lab / Radiology / Referral / Admission
→ Send to Pharmacy → Next Patient
```

**Acceptance Criteria:**
- Sending to pharmacy creates entry in `usePharmacyStore`
- Lab order creates entry in `useLabStore`
- Radiology order creates entry in `useRadiologyStore`
- Admission order creates entry in `useAdmissionStore`
- Consultation resets when switching to next patient

---

### 7.5 Nurse Portal

**Routes:** `/nurse/*`

**Pages:**
- `/nurse/dashboard` — Ward stats (active nurses, available beds), alert summary
- `/nurse/patients` — All admitted patients with vitals and condition
- `/nurse/rounds` — Doctor rounds notes per patient
- `/nurse/tasks` — Nursing task list (medication, tests, instructions)

**Data Sources:** `useWardStore`

**Patient Bed States:** Stable | Critical | Discharging

**Rounds Note Categories:** observation | medication | test | instruction

**Vitals Tracked:** HR (heart rate), BP (blood pressure), Temperature, SpO2

**AI Alert Conditions (auto-evaluated on vitals update):**
- HR > 110 → condition becomes Critical
- SpO2 < 93% → condition becomes Critical
- Temp > 101°F → condition becomes Critical
- Sepsis Risk alert surfaced (e.g., "Sepsis Risk Detected")

**Medication Routes:** Oral | IV | IM

**IV Drip Tracking:** Fluid type, rate (ml/hr), start time, status (Running/Completed/Paused)

**Acceptance Criteria:**
- Vitals update triggers automatic condition re-evaluation
- AI alerts are dismissible per patient
- Rounds notes are timestamped and author-attributed
- Tasks derived from rounds notes appear in task list

---

### 7.6 Emergency (ER) Portal

**Routes:** `/emergency/*`

**Pages:**
- `/emergency/dashboard` — Active trauma count, Code Blue counter, ER queue overview
- `/emergency/triage` — Triage patient management

**Data Sources:** `useEmergencyStore`

**Triage Severity Levels:**

| Color | Label | Clinical Meaning |
|---|---|---|
| Red | Immediate | Life-threatening; treat now |
| Yellow | Urgent | Serious; treat within 30 min |
| Green | Minor | Non-urgent; can wait |

**Triage Patient Fields:** name, ETA, severity, chief complaint, ambulance ID

**Actions:**
- Add patient to triage queue (from ambulance or walk-in)
- Admit patient (removes from triage, decrements active trauma count)
- Track active traumas and Code Blue events

**Acceptance Criteria:**
- Red severity increases `activeTraumas` count
- Admitting a patient removes them from queue and updates counts
- Ambulance ID is optional (walk-in patients may not have one)

---

### 7.7 Reception Portal

**Routes:** `/reception/*`

**Pages:**
- `/reception/dashboard` — OPD stats, today's registrations, queue summary
- `/reception/patients` — All registered patients; add new walk-in
- `/reception/queue` — Live OPD queue with status per patient

**Data Sources:** `usePatientStore`, `useAuthStore`

**Patient Registration Fields:** name, age, gender, phone, blood group, doctor, department, symptoms, history, triage level

**Queue Management:**
- View all patients and their current status
- Update patient status manually
- Print/issue token

**Acceptance Criteria:**
- New registration appears in queue immediately
- Queue reflects real-time status from doctor portal
- Walk-in registration generates next sequential token

---

### 7.8 Pharmacy Portal

**Routes:** `/pharmacy/*`

**Pages:**
- `/pharmacy/dashboard` — Prescriptions queue with prep status

**Data Sources:** `usePharmacyStore`

**Prescription Prep Status Flow:**
```
queued → preparing → ready → collected
```

**Prescription Fields:**
- Patient name, token, doctor, department
- Medicines: name, dosage, frequency, duration, quantity
- Triage level (for prioritization)
- Estimated ready time
- Patient modifications (medicines patient already has at home — can be excluded)

**Features:**
- Triage-based queue prioritization (Critical/High served first)
- Patient medication modification workflow (patient can declare medicines already possessed)
- Status update on each prescription card
- Integration: prescriptions arrive from `Doctor → Send to Pharmacy` action

**Acceptance Criteria:**
- Prescriptions sent by doctors appear instantly in pharmacy queue
- Status update transitions are one-directional (can't go backwards)
- Triage level is displayed with color coding
- Patient modifications reduce the quantity to be dispensed

---

### 7.9 Laboratory Portal

**Routes:** `/lab/*`

**Pages:**
- `/lab/dashboard` — Pending tests count, sample status overview
- `/lab/samples` — Full sample list with TAT tracking

**Data Sources:** `useLabStore`

**Sample Status Flow:**
```
Collected → Processing → Analyzing → Completed
```

**TAT (Turnaround Time) by Test:**

| Test | TAT (min) |
|---|---|
| Blood Glucose (FBS/PPBS) | 30 |
| Urine Routine/Microscopy | 45 |
| CBC / RFT / CRP | 60 |
| Lipid Profile / LFT | 90 |
| Blood Culture / HbA1c | 120 |
| Thyroid Profile (TSH) | 180 |

**AI Features:**
- AI anomaly alert on sample results (e.g., "High WBC count detected")
- Critical value flagging (`criticalValue: boolean`)
- Critical value must be acknowledged by named doctor before report is acted upon

**Integration:** Lab orders from Doctor consultation auto-create samples in this store.

**Acceptance Criteria:**
- Critical samples display red alert with unacknowledged warning
- Acknowledgment requires doctor name input
- TAT countdown visible from time of order
- Advance status action progresses sample one step

---

### 7.10 Radiology Portal

**Routes:** `/radiology/*`

**Pages:**
- `/radiology/dashboard` — Scans today count, scan queue
- `/radiology/scans` — Full scan list with status and AI findings

**Data Sources:** `useRadiologyStore`

**Scan Types:** X-Ray | MRI | CT Scan | Ultrasound

**Scan Status Flow:**
```
Scheduled → In Progress → Ready for Review → Reported
```

**TAT by Scan Type:**

| Scan | TAT (min) |
|---|---|
| X-Ray | 30 |
| Ultrasound | 45 |
| CT Scan | 60 |
| MRI | 120 |

**AI Feature:** AI auto-generates findings on scan completion (e.g., "Potential L4-L5 Herniation")

**Integration:** Radiology orders from Doctor consultation auto-create scans in this store.

**Acceptance Criteria:**
- Scan order from doctor appears immediately in radiology queue
- AI finding surfaced after "Ready for Review" status
- `reportReady` flag set when status reaches "Reported"
- Priority (Routine/Urgent) displayed with appropriate visual weight

---

### 7.11 Admission / Bed Management Portal

**Routes:** `/admission/*`

**Pages:**
- `/admission/dashboard` — Admission requests queue, summary stats
- `/admission/beds` — Visual bed map with status per bed

**Data Sources:** `useAdmissionStore`

**Bed Types:** General Ward | ICU | Semi-Private | Private Room | Day Care

**Bed Statuses:** Available | Occupied | Cleaning | Reserved | Maintenance

**Admission Request Status Flow:**
```
Pending → Assigned → Admitted | Cancelled
```

**Bed Assignment Logic:**
- Gender-aware allocation (Male / Female / Any)
- Triage level visible on request card
- Payer type (Cashless / General) displayed for financial planning

**Actions:**
- Assign a specific bed to a pending admission request
- Mark an occupied bed for cleaning (on patient discharge)
- Confirm bed is clean and ready (set Available)
- Cancel an admission request

**Integration:**
- Admission orders from Doctor consultation create requests here
- Housekeeping picks up "Cleaning" beds
- Discharge portal marks beds for cleaning on patient exit

**Acceptance Criteria:**
- Available beds shown with ward and floor context
- Assigning a bed marks it Occupied and updates the request to Assigned
- Beds in Maintenance are visually distinct and unselectable

---

### 7.12 Billing Portal

**Routes:** `/billing/*`

**Pages:**
- `/billing/dashboard` — All active bills, total outstanding
- `/billing/patient/[id]` — Individual patient bill detail with line items

**Data Sources:** `useBillingStore`

**Visit Types:** OPD | IPD | Emergency | Day Care

**Charge Types:**
- consultation, lab, radiology, pharmacy, ward, procedure, consumable, nursing, ot

**Bill Lifecycle:**
```
draft → frozen → settled | dispute
```

**Payment Modes:** Cash | UPI | Card | Insurance

**Bill Fields:**
- Subtotal, Discounts, Non-payable items, Insurance covered amount, Patient due
- Paid amount, Payment mode, Receipt number

**Non-Payable Items:** Items marked `isNonPayable: true` (e.g., gloves, syringes) are excluded from patient's payable amount.

**Actions:**
- Add charge line item to patient's bill
- Freeze bill (finalise before discharge)
- Apply insurance coverage amount
- Record partial or full payment
- Generate receipt number on payment

**Acceptance Criteria:**
- Line items auto-added when lab, pharmacy, ward charges are posted from other modules
- Patient due recalculates correctly: `subtotal - discounts - nonPayables - insuranceCovered`
- Bill transitions to `settled` when `paidAmount >= patientDue`
- Frozen bills cannot have new line items added

---

### 7.13 Discharge Portal

**Routes:** `/discharge/*`

**Pages:**
- `/discharge/dashboard` — Discharge queue with clearance progress per patient

**Data Sources:** `useDischargeStore`

**5-Pillar Clearance System:**

| Pillar | Owner |
|---|---|
| Doctor | Attending physician signs off clinically |
| Nursing | Wound care, final medication, patient education done |
| Pharmacy | All medicines dispensed, final pharmacy bill reconciled |
| Billing | Final bill frozen and payment settled |
| Insurance | TPA pre-auth resolved, cashless settlement confirmed |

**Discharge Patient States:**
- `clearances`: each pillar is `pending` or `cleared`
- `blockers`: named obstacles with owner and description
- `summaryDrafted`, `summaryApproved`, `exitClearanceIssued`

**Discharge Summary:** Full clinical narrative drafted by doctor, reviewed and approved, then exit clearance issued.

**OT Integration:** Patient may show `inOT: true` with expected OT end time — clearance held until OT completes.

**Discharge Instructions:** Post-discharge care instructions for patient.

**Follow-up Date:** Scheduled follow-up appointment date stored.

**Full Discharge Flow:**
```
All 5 pillars cleared
→ No unresolved blockers
→ Summary drafted and approved
→ Exit clearance issued
→ Bed marked for cleaning → Bed Manager notified
```

**Acceptance Criteria:**
- Discharge button disabled until all clearances are `cleared`
- Each blocker has a named owner and can be resolved individually
- Exit clearance cannot be issued without approved summary
- Condition indicator (Stable/Monitoring/Critical) visible

---

### 7.14 Insurance / TPA Portal

**Routes:** `/insurance/*`

**Pages:**
- `/insurance/dashboard` — Claim portfolio summary, pending approvals count
- `/insurance/claims` — Full claims list with status and AI probability

**Data Sources:** `useInsuranceStore`

**Claim Statuses:** Pending Pre-Auth | In Process | Approved | Rejected

**AI Feature:** Each claim has an `aiProbability` score (0–100%) for likelihood of approval. Helps TPA desk prioritise follow-ups.

**Supported Providers:** HDFC Ergo, Star Health, ICICI Lombard (extensible)

**Payer Types (referenced across modules):** Cashless (provider name) | General | General (Cash)

**Acceptance Criteria:**
- AI probability displayed as a percentage badge
- Claims sorted by status (Pending first)
- Total claims value shown in dashboard header

---

### 7.15 Operation Theater (OT) Portal

**Routes:** `/ot/*`

**Pages:**
- `/ot/dashboard` — OT room status board, today's procedures
- `/ot/schedule` — Procedure scheduling form and upcoming list
- `/ot/checklist` — WHO Surgical Safety Checklist per procedure

**Data Sources:** `useOTStore`

**Procedure Status Flow:**
```
Scheduled → Pre-Op → In Progress → Recovery → Completed
```

**OT Room Statuses:** Available | In Use | Cleaning | Maintenance

**WHO Surgical Safety Checklist (10 items):**

| # | Item | Critical |
|---|---|---|
| 1 | Informed consent signed | Yes |
| 2 | Surgical site marked | Yes |
| 3 | NPO confirmed (fasting ≥6h) | Yes |
| 4 | Anaesthesia assessment done | Yes |
| 5 | Blood arranged (if needed) | No |
| 6 | Implants/prosthetics confirmed | No |
| 7 | Allergies rechecked | Yes |
| 8 | IV line secured | No |
| 9 | Patient ID verified | Yes |
| 10 | OT room readiness confirmed | No |

**Procedure Fields:**
- Patient, procedure name, surgeon, anaesthetist, OT room
- Scheduled time, expected duration (minutes)
- Blood requirements, implants list
- Notes (append-only log)

**Actions:**
- Schedule new procedure
- Advance procedure status
- Check/uncheck checklist items
- Add intra-operative notes

**Acceptance Criteria:**
- Procedure cannot start (In Progress) while any critical checklist item is unchecked
- `startedAt` timestamp set when status becomes In Progress
- `completedAt` timestamp set when status becomes Completed
- OT room status updates to Cleaning after procedure Completed

---

### 7.16 Inventory Portal

**Routes:** `/inventory/*`

**Pages:**
- `/inventory/dashboard` — Total asset value, low stock count, alert list
- `/inventory/stock` — Asset and consumable management

**Data Sources:** `useInventoryStore`

**Asset Categories:** Equipment | Consumable

**Asset Statuses:** Active | Low Stock | Maintenance Required

**AI Feature:** Predictive maintenance alerts on equipment (e.g., "Cooling system anomaly detected. Predict failure in 5 days.")

**Key Metrics:**
- `totalAssetsValue`: Total hospital asset value (₹)
- `lowStockItems`: Count of items below threshold

**Acceptance Criteria:**
- Maintenance Required assets shown with AI alert text
- Low Stock items highlighted with quantity
- Total asset value formatted in Indian number format

---

### 7.17 Housekeeping Portal

**Routes:** `/housekeeping/*`

**Pages:**
- `/housekeeping/dashboard` — Cleaning task queue (beds assigned for cleaning)

**Data Sources:** `useHousekeepingStore`, `useAdmissionStore` (bed cleaning status)

**Integration:**
- Beds marked "Cleaning" by Discharge or Bed Manager appear in housekeeping queue
- Housekeeping confirms bed as clean → Bed Manager sets it Available

**Acceptance Criteria:**
- Beds in Cleaning status show assigned staff name
- Completion marks bed as Available and records `lastCleaned` timestamp

---

### 7.18 Quality & Compliance Portal

**Routes:** `/quality/*`

**Pages:**
- `/quality/dashboard` — Quality metrics dashboard
- `/quality/incidents` — Incident log with reporting and resolution

**Data Sources:** `useQualityStore`

**Incident Types:** Fall | Medication Error | Healthcare-Associated Infection | Equipment Failure | Near Miss | Other

**Incident Severity:** Low | Medium | High | Critical

**Incident Status Flow:**
```
Open → Under Review → Resolved
```

**Audit Task Frequencies:** Daily | Weekly | Monthly

**Quality Metrics Dashboard:**

| Metric | Description |
|---|---|
| Falls This Month | Count of patient fall incidents |
| Medication Errors | Count of medication errors |
| HAI Count | Healthcare-Associated Infection count |
| Readmission Rate | % of patients readmitted within 30 days |
| Average LOS | Average Length of Stay (days) |
| Patient Satisfaction | % satisfaction score |
| Audit Completion % | % of scheduled audits completed |

**Actions:**
- Report new incident (type, severity, ward, patient, staff, description)
- Resolve incident with corrective action
- Complete audit task (records completed by + timestamp)
- View overdue audit tasks

**Acceptance Criteria:**
- New incident increments the corresponding metric (falls, medication errors, HAI)
- Resolved incidents store corrective action and resolution timestamp
- Overdue audit tasks visually highlighted
- Corrective actions are mandatory to resolve an incident

---

### 7.19 Admin Portal

**Routes:** `/admin/*`

**Pages:**
- `/admin/dashboard` — Hospital-wide KPIs, real-time alerts
- `/admin/analytics` — Trend charts, department performance
- `/admin/operations` — Operations control (bed occupancy, OT utilisation)
- `/admin/patients` — All-hospital patient view
- `/admin/roster` — Staff shift roster (uses `useHRStore`)
- `/admin/users` — Role and user management

**Data Sources:** All stores (read-only aggregation)

**Staff Roster (HR Module):**

**Shift Types:** Morning | Evening | Night | Off

**HR Features:**
- View 7-day shift calendar per staff member
- Edit shift assignments
- Approve / reject leave requests
- Staff list by department

**Leave Request Flow:**
```
Submitted → Pending → Approved | Rejected
```

**Acceptance Criteria:**
- Dashboard shows real-time counts from all stores
- Roster edits are persisted in `useHRStore`
- Leave approval/rejection sends notification (future: push notification)
- Admin can access all 17 role portals from admin view

---

## 8. AI Features

All AI features in the current prototype are simulated (deterministic mock data). The architecture is designed so that each can be replaced with a real AI/ML model call.

| Feature | Module | Description | Current Implementation |
|---|---|---|---|
| **AI Pre-Brief** | Doctor | Before consultation, AI summarises patient history, vitals, symptoms, and suggests diagnostic actions | `AiPreBrief` component; suggestions in `useConsultationStore.aiSuggestions` |
| **AI Consultation Suggestions** | Doctor | Inline differential diagnosis and investigation suggestions during consultation | Hardcoded suggestions; `acceptAISuggestion` appends to notes |
| **AI Triage** | Emergency | Auto-assigns severity (Red/Yellow/Green) based on chief complaint and vitals | Severity set at triage entry |
| **AI Lab Anomaly Detection** | Lab | Flags abnormal results and critical values | `aiAnomalyAlert` on `LabSample`; "High WBC count detected" |
| **AI Radiology Findings** | Radiology | Auto-generated preliminary finding on scan completion | `aiFinding` on `RadiologyScan`; "Potential L4-L5 Herniation" |
| **AI Sepsis Risk Alert** | Nurse | Detects sepsis risk from vitals pattern | `aiAlert: 'Sepsis Risk Detected'` on `PatientBed` |
| **AI Predictive Maintenance** | Inventory | Predicts equipment failure from usage patterns | `aiMaintenanceAlert` on `Asset` |
| **AI Insurance Approval Score** | Insurance | Probability score for claim approval | `aiProbability` (0–100%) on `InsuranceClaim` |
| **AI Summary Widget** | Doctor/Discharge | Summarises patient encounter for discharge summary | `AISummaryWidget` component |

---

## 9. Cross-Cutting Concerns

### Authentication & Role Guard
- `useAuthStore` holds `currentUser` and `activeRole`
- `RoleGuard` component wraps each portal's layout
- If `activeRole` doesn't match the required role, user is redirected to login
- Demo mode: any role can be selected freely

### Navigation
- `AppShell` renders role-specific sidebar navigation
- Navigation items are filtered by active role
- Breadcrumbs shown on all inner pages

### Notifications / Toasts
- `sonner` library provides toast notifications
- Used for: prescription sent, order placed, bed assigned, payment recorded, etc.

### Animations
- `framer-motion` used for page entry animations, card stagger effects, and modal transitions

### Responsive Design
- Desktop-first; all dashboards work at 1280px+ width
- Login/kiosk pages are mobile-responsive
- Sidebar collapses on small screens

### QR Code Support
- `qrcode.react` generates QR codes for patient tokens and check-in
- Kiosk mode shows QR for scan-to-register

---

## 10. Data Models

### Core Types Summary

| Store | Key Types |
|---|---|
| `useAuthStore` | `User`, `Role` |
| `usePatientStore` | `Patient`, `Appointment`, `Visit`, `QueueStatus`, `TriageLevel` |
| `useEmergencyStore` | `TriagePatient` |
| `useConsultationStore` | `Prescription`, `LabOrder`, `RadiologyOrder`, `Referral`, `AdmissionOrder` |
| `useWardStore` | `PatientBed`, `Vitals`, `RoundsNote`, `Medication`, `IVDrip` |
| `useAdmissionStore` | `Bed`, `BedStatus`, `AdmissionRequest` |
| `useBillingStore` | `Bill`, `ChargeLineItem`, `ChargeType`, `BillStatus` |
| `useDischargeStore` | `DischargePatient`, `ClearancePillar`, `DischargeBlocker` |
| `usePharmacyStore` | `PharmacyPrescription`, `PharmacyMedicine`, `PrepStatus` |
| `useLabStore` | `LabSample` |
| `useRadiologyStore` | `RadiologyScan` |
| `useOTStore` | `OTProcedure`, `OTRoom`, `ChecklistItem`, `OTStatus` |
| `useInsuranceStore` | `InsuranceClaim` |
| `useInventoryStore` | `Asset` |
| `useHRStore` | `StaffMember`, `ShiftEntry`, `LeaveRequest`, `ShiftType` |
| `useQualityStore` | `Incident`, `AuditTask`, `IncidentType`, `IncidentSeverity` |

### Patient ID Format
- OPD patients: `PT-#####` (5 digits)
- IPD patients: `PT-#####`
- Emergency: `ER-###`

### Key Cross-Module References
- `patientId` is the universal FK linking patients across all stores
- `orderedBy` doctor name links orders to staff
- `assignedBedId` links admission requests to beds
- `billId` links billing records to patients

---

## 11. Route Map

```
/                          → Role Selector (Login)
/checkin                   → Patient Kiosk Landing
/checkin/intake            → Patient Intake Form

/patient/dashboard         → Patient Overview
/patient/queue             → Queue Position
/patient/waiting           → Waiting Room
/patient/appointments      → Appointments
/patient/records           → Visit History
/patient/billing           → Bills
/patient/followup          → Follow-up

/doctor/dashboard          → Doctor Overview
/doctor/consultation       → Consultation Workspace
/doctor/records            → Patient Records Lookup
/doctor/schedule           → Schedule

/nurse/dashboard           → Ward Overview
/nurse/patients            → Patient Beds
/nurse/rounds              → Rounds Notes
/nurse/tasks               → Task List

/emergency/dashboard       → ER Overview
/emergency/triage          → Triage Queue

/reception/dashboard       → OPD Overview
/reception/patients        → Patient Registry
/reception/queue           → OPD Queue

/pharmacy/dashboard        → Prescription Queue

/lab/dashboard             → Lab Overview
/lab/samples               → Sample Tracker

/radiology/dashboard       → Radiology Overview
/radiology/scans           → Scan Queue

/admission/dashboard       → Admission Requests
/admission/beds            → Bed Map

/billing/dashboard         → All Bills
/billing/patient/[id]      → Patient Bill Detail

/discharge/dashboard       → Discharge Queue

/insurance/dashboard       → Claims Overview
/insurance/claims          → Claims List

/inventory/dashboard       → Inventory Overview
/inventory/stock           → Asset/Stock List

/ot/dashboard              → OT Overview
/ot/schedule               → OT Schedule
/ot/checklist              → Safety Checklist

/housekeeping/dashboard    → Housekeeping Tasks

/quality/dashboard         → Quality Metrics
/quality/incidents         → Incident Log

/admin/dashboard           → Admin Overview
/admin/analytics           → Analytics
/admin/operations          → Operations Control
/admin/patients            → All Patients
/admin/roster              → Staff Roster
/admin/users               → User Management

/discovery                 → Feature Discovery / Exploration
```

---

## 12. State Management

The application uses **16 Zustand stores**, each owning a specific domain. All stores are client-side singletons with no persistence layer in the prototype.

| Store File | Domain |
|---|---|
| `useAuthStore.ts` | Authentication, active user/role |
| `usePatientStore.ts` | OPD patients, queue, appointments, visits |
| `useEmergencyStore.ts` | ER triage queue, trauma counts |
| `useConsultationStore.ts` | Active consultation session state |
| `useWardStore.ts` | IPD ward patients, vitals, rounds, medications |
| `useAdmissionStore.ts` | Beds, admission requests |
| `useDischargeStore.ts` | Discharge queue, clearances, summaries |
| `useBillingStore.ts` | Bills, line items, payments |
| `usePharmacyStore.ts` | Prescription dispensing queue |
| `useLabStore.ts` | Lab samples, TAT, results |
| `useRadiologyStore.ts` | Scans, AI findings |
| `useOTStore.ts` | OT procedures, rooms, checklists |
| `useInsuranceStore.ts` | Claims, approvals |
| `useInventoryStore.ts` | Assets, stock levels |
| `useHRStore.ts` | Staff, shifts, leave requests |
| `useQualityStore.ts` | Incidents, audit tasks, quality metrics |
| `useFollowupStore.ts` | Follow-up scheduling |
| `useHousekeepingStore.ts` | Housekeeping task queue |

### Inter-Store Communication Pattern

In the prototype, stores are independent. Cross-module flows (e.g., doctor sends prescription to pharmacy) are simulated by directly calling the target store's action. In production, these would be API calls that update the backend and push real-time updates via WebSocket.

---

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Initial page load < 2s on 4G; dashboard renders < 500ms |
| **Availability** | 99.9% uptime (production target) |
| **Concurrency** | Support 200+ concurrent users per hospital deployment |
| **Accessibility** | WCAG 2.1 Level AA compliance target |
| **Browser Support** | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| **Screen Size** | Optimised for 1280px+; functional at 768px+ |
| **Security** | Role-based access control; no cross-role data leakage |
| **Data Privacy** | No PHI stored in browser localStorage in production |
| **Audit Trail** | All clinical actions timestamped and author-attributed |
| **Internationalisation** | English primary; Indian locale number/date formatting |

---

## 14. Compliance

| Standard | Status |
|---|---|
| **DISHA** (Digital Information Security in Healthcare Act) | Compliant (design target) |
| **WHO Surgical Safety Checklist** | Implemented in OT module |
| **NABH** (National Accreditation Board for Hospitals) | Quality module supports NABH audit requirements |
| **HIPAA** | Architecture supports (no PHI in transit without encryption in production) |
| **Indian IT Act 2000** | Applicable in production deployment |

---

## 15. Future Roadmap

### Phase 2 — Backend & Real-time
- REST API + WebSocket backend (Node.js / FastAPI)
- Real database (PostgreSQL + Redis for queues)
- Real-time notifications via WebSocket (bed status, critical lab values, code blue)
- JWT-based authentication with refresh tokens

### Phase 3 — AI/ML Integration
- LLM-powered doctor pre-briefs (Claude / GPT-4)
- Real anomaly detection on lab values via ML models
- NLP-based voice dictation with medical vocabulary
- Predictive LOS (Length of Stay) modelling
- AI-based sepsis early warning system

### Phase 4 — Integrations
- ABDM (Ayushman Bharat Digital Mission) integration for ABHA IDs
- HL7 FHIR compliance for interoperability
- Insurance TPA API integration (Vidal Health, MDIndia)
- Diagnostic lab instrument integration (ASTM/HL7)
- PACS integration for radiology imaging
- Payment gateway (Razorpay/PayU) for UPI/card payments
- WhatsApp/SMS notifications to patients

### Phase 5 — Mobile & Analytics
- React Native mobile app for doctors and nurses
- Advanced analytics and business intelligence dashboard
- Department-wise cost centre reporting
- Predictive inventory management

---

*This document represents the complete product specification for Kailash HMS v1.0 prototype as of 2026-05-09.*
