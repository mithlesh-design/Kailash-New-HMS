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
