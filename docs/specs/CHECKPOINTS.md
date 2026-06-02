# Kailash HMS — Milestone Checkpoints

Each milestone closes with a git tag + a row here. The repo can be restored to
any checkpoint state with `git checkout <tag>` (read-only) or
`git branch <new> <tag>` (to continue from there).

## Conventions
- Tag format: `checkpoint/<milestone-id>` (annotated, with a multi-line
  description of what's included).
- Branch format: `baseline/<scope>` for long-lived rollback branches.
- A checkpoint cannot be cut if the regression suite (`scripts/regression-suite.cjs`)
  has any failure that didn't already exist at the preceding checkpoint.

## Restoration

| To | Command |
|---|---|
| Inspect a checkpoint read-only | `git checkout checkpoint/<id>` (detached HEAD) |
| Continue from a checkpoint | `git checkout -b <branch> checkpoint/<id>` |
| List checkpoints | `git tag -l 'checkpoint/*'` |
| Show what's in a checkpoint | `git show checkpoint/<id>` |

---

## Registry

| Tag | Date (IST) | Branch | Scope | Notes |
|---|---|---|---|---|
| `phase-1-complete` | 2026-06-01 | — | Phase-1 ship & GitHub push | Pre-overhaul snapshot. |
| `checkpoint/M0-baseline` | 2026-06-01 | `baseline/pre-overhaul` | Preservation contract + regression sweep + baseline screenshots | Contract = [11_Feature_Flow_Inventory_v1_0.docx](11_Feature_Flow_Inventory_v1_0.docx). |
| `checkpoint/M1-verified` | 2026-06-01 | — | Closures re-verified against src/ + live state; 09 issued | 20/20 Phase-1 closures Verified · 0 Re-opened · 32 Still-open (Phase 2) · 3 Deferred (v2). |
| `checkpoint/M2-compaction` | 2026-06-02 | — | Compact design system + Command Palette + INTUITIVE pillar | Foundation: design tokens, optimistic helper, CompactHeader/CompactKPI/KbdHint primitives. Global Cmd/Ctrl+K command palette mounted in AppShell. Three canonical surfaces compacted (Admin / Audit Trail / Doctor IPD). 04_UI_UX_Design_Blueprint_v1.1 issued. Regression 54/54. |
| `checkpoint/M3-flows` | 2026-06-02 | — | Flow completeness — Anil hero journey walked end-to-end | Flow walker covers 16 flows × ~3 steps. 11 PASS · 5 PARTIAL (defensible filter behaviours, documented in §5.1 of 12). Anil seed extended into Patient/Billing/Discharge stores. 12_Flow_Completeness_Report v1.0 issued. Regression 54/54. |
| `checkpoint/M4-wave-1` | 2026-06-02 | — | Innovation Wave 1 — clinical safety wow (S1, S2, S3, S15) | DrugSafetyReasoningCard (S1) mounted in doctor OPD Rx panel · EarlyWarningBanner (S2) on doctor IPD · CriticalValueBanner (S3) globally in AppShell for doctor + nurse with closed-loop acknowledgement · DaySummaryCard (S15) on doctor analytics. Shared ReasoningChip primitive. 10_Competitive_Innovation v1.1 issued. Regression 54/54. |
| `checkpoint/M4-wave-2` | 2026-06-02 | — | Innovation Wave 2 — operating-speed wow (S4, S5, S6) | aiCopilot intent parser + CopilotPreviewCard wired into the global Command Palette (S4) · VoiceScribeButton mounted on doctor IPD (Quick-note) + nurse rounds (AI-SOAP companion) with surface-typed fallback transcripts (S5) · OcrIntakeCard mounted at the top of the Register-Walk-in modal with three doc types (Aadhaar / insurance / lab paper), 800 ms simulated OCR, per-field confidence chips (S6). 10_Competitive_Innovation v1.2 issued. Regression 54/54. |
| `checkpoint/M4-wave-3` | 2026-06-02 | — | Innovation Wave 3 — GROWTH pillar (S7, S8) | predictiveOps engine (4 forecasters: ED arrivals · OR utilisation · ICU pressure · staffing gap) + PredictiveOpsCockpit mounted on /admin/operations (S7) · revenueGrowth engine (4 levers: denial-risk exposure · days-in-AR · charge-capture gaps · payer-mix concentration) + RevenueCycleGrowthCockpit mounted on /admin/finance (S8). Each card carries reasoning drivers + recommended action + HITL accept/dismiss. Two new audit resources (`ops_prediction`, `rcm_growth`). 10_Competitive_Innovation v1.3 issued. Regression 54/54. |
| `checkpoint/M4-wave-4` | 2026-06-02 | — | Innovation Wave 4 — Compliance Autopilot (S9, S10) | NabhEvidenceLiveCockpit mounted on /admin/compliance — one card per NABH chapter with freshest-evidence + AI suggested next-action + Open-desk HITL routing (S9) · dpdpAudit engine (5 dimensions: consent rate · RTBF SLA · export audit · breach response · RBAC discipline) + DpdpSelfAuditPanel mounted on /admin/disha with 0-100 score per dimension and overall-score badge (S10). Two new audit resources (`nabh_evidence`, `dpdp_audit`). 10_Competitive_Innovation v1.4 issued. Regression 54/54. |

---

## M0 — Baseline & Preservation Contract  (2026-06-01)

### What's in this checkpoint
- All Phase-1 work as of HEAD = `a51802e` plus the M0 deliverables.
- Restore branch `baseline/pre-overhaul` (= same commit).
- [11_Feature_Flow_Inventory_v1_0.docx](11_Feature_Flow_Inventory_v1_0.docx) — exhaustive inventory.
- [baseline-inventory.json](baseline-inventory.json) — machine-readable source.
- [baseline-screens/](baseline-screens/) — one PNG per role + the regression report JSON.
- [`scripts/regression-suite.cjs`](../../scripts/regression-suite.cjs) — re-runnable.
- [`scripts/inventory-surface.cjs`](../../scripts/inventory-surface.cjs) — re-runnable.

### Restore
```
git checkout checkpoint/M0-baseline       # detached read-only
git checkout baseline/pre-overhaul         # branch
```

### Regression contract numbers (M0)
| Metric | Count |
|---|---|
| Page routes (src/app/\*\*/page.tsx) | 162 |
| Zustand stores (src/store/use\*.ts) | 49 (45 persisted) |
| React components (src/components) | 75 |
| Mock-API surface modules (src/lib/api/) | 18 |
| onClick handlers (page-level) | 626 |
| `<button>` elements (page-level) | 563 |
| `<input>` elements (page-level) | 111 |
| Native `window.alert/confirm/prompt` sites | **0** |
| i18n locales | en (131 keys), hi (131 keys) |
| Demo patient count (mock-API table) | 18 |
| Audit trail at fresh seed | ≥ 20 events |

### Pillars to honour from M1 onward
- **0. PRESERVE** — every item in §3 / §4 / §5 / §6 of the inventory must still
  resolve after each milestone. Compaction may consolidate UI; it never deletes.
- **1. INTUITIVE** — fewer clicks, sane defaults, instant optimistic feedback.
- **2. GROWTH-FOCUSED** — surface the levers (throughput, utilisation,
  revenue capture, denial reduction, retention).
- **3. AI-CENTRIC** — HITL AI everywhere; accept/reject/modify with reasoning.

---

## M1 — Verification (2026-06-01)

### What's in this checkpoint
- All M0 deliverables (still green).
- [scripts/verify-closures.cjs](../../scripts/verify-closures.cjs) — re-runnable verifier.
- [docs/specs/verification.json](verification.json) — machine-readable verdicts.
- [docs/specs/09_Verification_Report_v1_0.docx](09_Verification_Report_v1_0.docx) — report.
- [docs/specs/screens/M1/](screens/M1/) — fresh per-role screenshots, regression report.

### Tally (against the 19 + 1 closures from 07 v1.1)
| Verdict | Count |
|---|---|
| Verified | **20** |
| Re-opened | **0** |
| Still-open (Phase 2 backlog) | 32 |
| Deferred to v2 | 3 |
| Total tracked | 55 |

### Restore
```
git checkout checkpoint/M1-verified
```

---

## M2 — Compact, Elevate & Make Intuitive (2026-06-02)

### What's in this checkpoint
- All M0 + M1 deliverables (still green).
- [src/lib/design-tokens.ts](../../src/lib/design-tokens.ts) — single source of truth for tokens.
- [src/lib/optimistic.ts](../../src/lib/optimistic.ts) — optimistic-UI helper.
- [src/components/ui/CompactHeader.tsx](../../src/components/ui/CompactHeader.tsx)
- [src/components/ui/CompactKPI.tsx](../../src/components/ui/CompactKPI.tsx)
- [src/components/ui/KbdHint.tsx](../../src/components/ui/KbdHint.tsx)
- [src/components/layout/CommandPalette.tsx](../../src/components/layout/CommandPalette.tsx) — Cmd/Ctrl+K spine.
- [src/components/layout/AppShell.tsx](../../src/components/layout/AppShell.tsx) — palette + trigger mounted (additive).
- Three compacted canonical surfaces: `admin/dashboard`, `audit/log`, `doctor/ipd`.
- [04_UI_UX_Design_Blueprint_v1.1.docx](04_UI_UX_Design_Blueprint_v1_1.docx).
- [docs/specs/screens/M2/](screens/M2/) — fresh 16 role screenshots + report.

### Pillars in scope
- **0. PRESERVE** ✅ Regression 54/54 — every M0 contract item still resolves.
- **1. INTUITIVE** ✅ Command palette + compact tokens + INTUITIVE rules documented in 04 v1.1.

### Restore
```
git checkout checkpoint/M2-compaction
```

---

## M3 — Flow Completeness (2026-06-02)

### What's in this checkpoint
- All M0 + M1 + M2 deliverables (still green).
- [scripts/flow-walker.cjs](../../scripts/flow-walker.cjs) — 16-flow Puppeteer pass.
- [docs/specs/flow-completeness.json](flow-completeness.json) — machine-readable matrix.
- [docs/specs/12_Flow_Completeness_Report_v1_0.docx](12_Flow_Completeness_Report_v1_0.docx).
- [docs/specs/screens/M3/](screens/M3/) — per-step screenshots (~50 PNGs).
- Anil seed extended to `usePatientStore` / `useBillingStore` / `useDischargeStore`
  (legacy-store marker bumped to `anil-v4`).
- Walker hardened: bootstrap+legacy marker prefix-check, hydration-resilient navigation.

### Walker totals (16 flows)
| Verdict | Count |
|---|---|
| PASS    | **11** |
| PARTIAL (defensible filter behaviours) | 5 |
| FAIL    | **0** |
| Console errors | 3 (pre-existing React 19 hydration warnings) |

### Restore
```
git checkout checkpoint/M3-flows
```

---

## M4-Wave-1 — Demo-Defining Clinical Wow (2026-06-02)

### What's in this checkpoint
- All M0 + M1 + M2 + M3 deliverables (still green).
- **S1** Drug-Safety Reasoning Card → [src/components/clinical/DrugSafetyReasoningCard.tsx](../../src/components/clinical/DrugSafetyReasoningCard.tsx), mounted in [src/app/doctor/dashboard/page.tsx](../../src/app/doctor/dashboard/page.tsx).
- **S2** Early-Warning Banner → [src/components/clinical/EarlyWarningBanner.tsx](../../src/components/clinical/EarlyWarningBanner.tsx), mounted in [src/app/doctor/ipd/page.tsx](../../src/app/doctor/ipd/page.tsx).
- **S3** Critical-Value Banner → [src/components/clinical/CriticalValueBanner.tsx](../../src/components/clinical/CriticalValueBanner.tsx), mounted globally in [src/components/layout/AppShell.tsx](../../src/components/layout/AppShell.tsx) for doctor + nurse roles.
- **S15** Day-in-Review → [src/components/doctor/DaySummaryCard.tsx](../../src/components/doctor/DaySummaryCard.tsx), mounted in [src/app/doctor/analytics/page.tsx](../../src/app/doctor/analytics/page.tsx).
- Shared **ReasoningChip** primitive at [src/components/clinical/ReasoningChip.tsx](../../src/components/clinical/ReasoningChip.tsx).
- Seed bumped to `anil-v5` — `lab_critical_callback` audit row for Anil's Trop-I added so S3 fires on first demo load.
- [docs/specs/10_Competitive_Innovation_v1_1.docx](10_Competitive_Innovation_v1_1.docx).
- [docs/specs/screens/M4-W1/](screens/M4-W1/) — 16 regression screenshots + 2 W1 close-ups.

### Pillars advanced
- **3. AI-CENTRIC** ✅ Every W1 card carries HITL accept/reject/modify + reasoning + confidence.
- **1. INTUITIVE** ✅ Transparent reasoning chips, single primary action per card.
- **0. PRESERVE** ✅ Regression 54/54.

### Restore
```
git checkout checkpoint/M4-wave-1
```

---

## M4-Wave-2 — Operating-Speed Wow (2026-06-02)

### What's in this checkpoint
- All M0 + M1 + M2 + M3 + M4-W1 deliverables (still green).
- **S4** AI Copilot — [src/lib/aiCopilot.ts](../../src/lib/aiCopilot.ts) intent parser + [src/components/clinical/CopilotPreviewCard.tsx](../../src/components/clinical/CopilotPreviewCard.tsx), wired into [src/components/layout/CommandPalette.tsx](../../src/components/layout/CommandPalette.tsx). Triggers on ≥3-word queries that include an action verb (schedule / order / draft / discharge / show / find / summarise).
- **S5** Voice Scribe — [src/components/clinical/VoiceScribeButton.tsx](../../src/components/clinical/VoiceScribeButton.tsx) (reusable across six clinical-note surfaces), mounted on [src/app/doctor/ipd/page.tsx](../../src/app/doctor/ipd/page.tsx) as a Quick-note toolbar and on [src/app/nurse/rounds/page.tsx](../../src/app/nurse/rounds/page.tsx) as a compact AI-SOAP companion next to the existing voice button.
- **S6** OCR Intake — [src/components/reception/OcrIntakeCard.tsx](../../src/components/reception/OcrIntakeCard.tsx) mounted at the top of the Register-Walk-in modal in [src/app/reception/opd/page.tsx](../../src/app/reception/opd/page.tsx). Three doc types (Aadhaar / Insurance / Lab paper), 800 ms simulated scan, per-field confidence chips, editable apply.
- [docs/specs/10_Competitive_Innovation_v1_2.docx](10_Competitive_Innovation_v1_2.docx).
- [docs/specs/screens/M4-W2/](screens/M4-W2/) — 3 W2 close-ups (S4 copilot intent preview, S5 voice scribe IPD panel, S6 OCR draft).

### Pillars advanced
- **3. AI-CENTRIC** ✅ HITL accept/reject on every W2 surface; audit emits on all three (`ai_copilot_intent`, `voice_scribe`, `ocr_intake`).
- **1. INTUITIVE** ✅ One-shot intent parsing in palette (no manual route navigation), speech → SOAP in one click, scan → form in 800 ms.
- **0. PRESERVE** ✅ Regression 54/54. Existing palette behaviour unchanged when query is short; existing nurse-rounds voice button preserved alongside the new AI-SOAP companion.

### Restore
```
git checkout checkpoint/M4-wave-2
```

---

## M4-Wave-3 — Growth Pillar (2026-06-02)

### What's in this checkpoint
- All M0 + M1 + M2 + M3 + M4-W1 + M4-W2 deliverables (still green).
- **S7** Predictive Operations Cockpit — engine at [src/lib/predictiveOps.ts](../../src/lib/predictiveOps.ts), component at [src/components/admin/PredictiveOpsCockpit.tsx](../../src/components/admin/PredictiveOpsCockpit.tsx), mounted on [src/app/admin/operations/page.tsx](../../src/app/admin/operations/page.tsx). Four forecasters: ED arrivals (next 4h), OR utilisation (next 24h), ICU bed pressure (next 24h), staffing gap (current/next shift).
- **S8** Revenue-Cycle Growth Cockpit — engine at [src/lib/revenueGrowth.ts](../../src/lib/revenueGrowth.ts), component at [src/components/admin/RevenueCycleGrowthCockpit.tsx](../../src/components/admin/RevenueCycleGrowthCockpit.tsx), mounted on [src/app/admin/finance/page.tsx](../../src/app/admin/finance/page.tsx). Four levers: denial-risk exposure, days-in-AR, charge-capture gaps, payer-mix concentration. Header shows total ₹-opportunity badge.
- [docs/specs/10_Competitive_Innovation_v1_3.docx](10_Competitive_Innovation_v1_3.docx).
- [docs/specs/screens/M4-W3/](screens/M4-W3/) — 2 W3 close-ups (S7 predictive-ops, S8 RCM-growth).

### Pillars advanced
- **2. GROWTH-FOCUSED** ✅ Two flagship cockpits surface the levers — throughput (ED/OR/ICU), staffing, denial reduction, AR aging, charge capture, payer mix — each with a ₹-impact estimate and a single primary action.
- **3. AI-CENTRIC** ✅ Every card is HITL: accept/dismiss is audit-logged under `ops_prediction` / `rcm_growth` resources.
- **1. INTUITIVE** ✅ 4-card grid pattern, consistent tone palette, one primary action per card.
- **0. PRESERVE** ✅ Regression 54/54. Both surfaces mount additively (top of page, above existing content).

### Restore
```
git checkout checkpoint/M4-wave-3
```

---

## M4-Wave-4 — Compliance Autopilot (2026-06-02)

### What's in this checkpoint
- All M0 + M1 + M2 + M3 + M4-W1 + M4-W2 + M4-W3 deliverables (still green).
- **S9** NABH Evidence Live Cockpit — component at [src/components/admin/NabhEvidenceLiveCockpit.tsx](../../src/components/admin/NabhEvidenceLiveCockpit.tsx), mounted on [src/app/admin/compliance/page.tsx](../../src/app/admin/compliance/page.tsx). One card per NABH chapter (AAC / COP / MOM / HIC / PRE / IMS / CQI / ROM / HRM) over the existing buildNabhEvidence engine. Shows event count, freshest evidence (relative time), AI suggested next-action when sparse, Open-desk HITL routing to the right remediation surface.
- **S10** DPDP / DISHA Self-Audit Panel — engine at [src/lib/dpdpAudit.ts](../../src/lib/dpdpAudit.ts), component at [src/components/admin/DpdpSelfAuditPanel.tsx](../../src/components/admin/DpdpSelfAuditPanel.tsx), mounted on [src/app/admin/disha/page.tsx](../../src/app/admin/disha/page.tsx). Five DPDP / DISHA principles scored 0-100: consent capture rate · RTBF SLA (30-day) · data-export audit coverage (purpose+requester) · breach response (72h gate) · RBAC discipline (rapid cross-role detector). Overall-score badge in header.
- [docs/specs/10_Competitive_Innovation_v1_4.docx](10_Competitive_Innovation_v1_4.docx).
- [docs/specs/screens/M4-W4/](screens/M4-W4/) — 2 W4 close-ups (S9 NABH 9-chapter grid, S10 DPDP 5-dimension scorecard).

### Pillars advanced
- **0. PRESERVE** ✅ Regression 54/54. Both surfaces mount additively (top of compliance / DISHA pages, above existing content).
- **2. GROWTH-FOCUSED** ✅ Compliance cockpit surfaces are themselves a growth lever — they cut NABH evidence prep from manual weeks to live.
- **3. AI-CENTRIC** ✅ Every card carries HITL accept/dismiss with audit-log under `nabh_evidence` / `dpdp_audit` resources.

### Restore
```
git checkout checkpoint/M4-wave-4
```
