# JHora AI Professional - Master Workflow & Architecture Audit

This document details the canonical architecture, master execution pipelines, and module audits for the **JHora AI Professional Astrological Platform**. It aligns the active codebase with the simplified final architecture and identifies any duplicate modules, discrepancies, or legacy components.

---

## 1. Master Workflow Architecture Diagram

The JHora AI platform utilizes a deterministic linear pipeline separating static natal potential from dynamic timing and rule-based decision modeling.

```
                    USER PROFILE
                         │
                         │ (Birth Details, Preferences, History)
                         ▼
===========================================================
        INITIAL PROFILE CREATION / RECALCULATION
===========================================================
                   Birth Details
                         │
                         ▼
               Astronomical Calculator
                         │
                         ▼
               KP Calculation Engine
                         │
                         ▼
                      Generate
         • Planets & House Coordinates
         • Cusps & Significators (Levels A–F)
         • Star Lords & Sub Lords
         • Natal Promise (Primary Significators)
         • KP Strengths & Event Profiles
                         │
                         ▼
                 KP KNOWLEDGE BOOK
               (Static KP Repository)
                         │
                         ▼
             Store inside User Profile
===========================================================
                      PROFILE LOAD
===========================================================
                  User Opens Profile
                         │
                         ▼
                 Load User Profile
                         │
                         ▼
               Load KP Knowledge Book
                  (No Recalculation)
===========================================================
                  PREDICTION REQUEST
===========================================================
        User Selects Category (Marriage, Career, etc.)
                         │
                         ▼
    Current Coordinates (Date, Time, DBA, Transits)
===========================================================
                      RULE ENGINE
===========================================================
                   Load KP Rulebook
                         │
                         ▼
           Execute Only Relevant Rules
                         │
                         ▼
     Read: KP Knowledge Book + DBA + Transits
                         │
                         ▼
                 Generate Evidence
                (No Event Creation)
===========================================================
                   EVIDENCE ENGINE
===========================================================
                         Collect
        • Supporting / Obstructing Evidence
        • Satisfied / Failed Rule Triggers
        • Evidence Weights & Significations
===========================================================
                   DECISION ENGINE
===========================================================
                        Evaluate
      Natal Promise + DBA + Transit + Evidence
                         │
                         ▼
              Generate Final Decision
===========================================================
                   TIMELINE ENGINE
===========================================================
                        Estimate
    Activation Window / Likely Period / Delay / Accel
===========================================================
                      EVENT BOOK
===========================================================
               Create / Update Event (SOT)
       • Event ID, Evidence Logs, final Decision
       • Timeline, Confidence, Rule Lineage, Audit Trail
===========================================================
                     REPORT ENGINE
===========================================================
                  Read Event Book
                         │
                         ▼
      Generate PDF, UI Cards, API / Dashboard Views
===========================================================
                   PROFILE UPDATE
===========================================================
             During profile load check:
     Birth Details, Ayanamsa, Engine/Calc Versions
                         │
            ┌────────────┴────────────┐
            ▼ (If Changed)            ▼ (If Unchanged)
    Regenerate KP Knowledge Book     Reuse Existing KB
```

---

## 2. Core Engine Responsibilities

| Engine | Core Responsibility | Persistence Strategy |
| :--- | :--- | :--- |
| **Astronomical Calculator** | Calculates planetary longitudes, house cusps, and transits from raw ephemeris data. | Transient/Stateless (cached per session) |
| **KP Calculation Engine** | Converts raw coordinates into KP significators, star/sub lords, and strengths. | Run once on profile creation |
| **KP Knowledge Book** | Stores permanent, immutable natal KP structures for the user profile. | Permanent inside UserProfile JSON |
| **KP Rulebook** | Defines classical rules (e.g. Marriage, Career) with primary, supporting, and blocking houses. | Static File Asset (`master_astro_handbook.md`) |
| **Rule Engine** | Executes rule conditions against the Knowledge Book, active DBA, and transits. | Stateless Execution |
| **Evidence Engine** | Aggregates supporting, blocking, satisfied, and failed parameters. | Stateless Execution |
| **Decision Engine** | Weighs natal promise against active periods to determine eventual feasibility. | Stateless Execution |
| **Timeline Engine** | Determines exact temporal windows, delays, or accelerations. | Stateless Execution |
| **Event Book** | Serves as the single source of truth for verified predictions and audit trails. | Persistent User Event Collection |
| **Report Engine** | Compiles events and evidence into a structured, printable report format. | Render-Time Generator (PDF / UI) |

---

## 3. Discrepancy & Duplication Audit

During the source code audit, we identified **one critical duplication** and **three design discrepancies** that must be resolved to align fully with the JHora AI Professional Master Workflow.

### A. Critical Duplicate Module: `EventEngineView.tsx` vs `AstrologicalReasoningEngine.tsx`
*   **The Discrepancy:**
    *   `src/components/EventEngineView.tsx` is an **orphaned component** that is completely unused in the main application flow (it is never imported in `src/App.tsx`).
    *   It contains hardcoded engine step configurations (`DEFAULT_STEPS` representing INIT 01 to STEP 10) and simulated engines that copy the interactive layout of the active engine.
    *   `src/components/AstrologicalReasoningEngine.tsx` is the **active component** rendered under the "Astrological Reasoning Engine" sub-menu.
*   **The Resolution:**
    *   `EventEngineView.tsx` must be deprecated or removed from the active file system to eliminate development confusion.
    *   All active logic and step definitions must reside inside `AstrologicalReasoningEngine.tsx` and map directly to the database metrics.

### B. Dual-Language Signification Engines (TypeScript vs. Kotlin)
*   **The Discrepancy:**
    *   We maintain client-side TypeScript engines (`unifiedRelationshipEvidenceEngine.ts`) and backend Kotlin engines (`KpMaritalEngines.kt`, `KPRuleMatcher.kt`).
    *   In some versions, minor discrepancies in house significations exist (e.g., whether house 5 or house 9 receives secondary support priority).
*   **The Resolution:**
    *   All house significations must strictly align with the **Vedic Astrological Rules Handbook** and the **KP Eventbook**:
        *   **Marriage:** Primary `[2, 7, 11]`, Supporting `[5, 9]`, Obstructing `[1, 6, 10]`.
        *   **Separation / Divorce:** Primary `[1, 6, 10]`, Supporting `[12]`, Obstructing `[2, 7, 11]`.

### C. Violation of the Static Profile Principle (On-the-Fly Recalculations)
*   **The Discrepancy:**
    *   The JHora AI Master Workflow states: *"Calculate natal KP data once. Store it permanently in the KP Knowledge Book. Never recalculate static KP data during predictions."*
    *   However, several dashboard UI widgets currently run on-the-fly planetary computations and star-lord mapping routines on every mount, instead of loading the pre-calculated attributes directly from the pre-seeded `UserProfile.astrologyData` payload.
*   **The Resolution:**
    *   Refactor rendering components to pull significations directly from `astrologyData.significators` and cuspal properties from `astrologyData.cusps`. No client-side recalculation functions should run within the UI cards.

### D. Conflated Rule Engine and Event Book Triggers
*   **The Discrepancy:**
    *   The simplified architecture mandates that the **Rule Engine** only *generates evidence* and performs *no event creation*. Event records are only written to the **Event Book** via downstream user action.
    *   Currently, some rules execute and automatically write new instances into the event book array simultaneously, polluting the persistent state and bypassing the user's explicit curation.
*   **The Resolution:**
    *   Ensure the prediction flow is completely stateless until the user clicks "Save to Event Book", at which point a single-source-of-truth record is written with full rule lineage and confidence metrics.

---

## 4. Design Guidelines for JHora AI Engines

To preserve the simplicity, determinism, and maintainability of the JHora AI platform, developers and agents must adhere to these rules:

1.  **Strict Profile Storage Isolation:** No astrological mappings, transits, or local interpretations should be computed when saving a profile. Save the exact raw JSON from the JHora API and load it back cleanly.
2.  **No Telemetry Clutter:** Maintain clean, display-oriented user interfaces. Do not add mock terminal lines, container port configurations, or network status circles.
3.  **Linear Propagation Hierarchy:** Keep rule checks stateless. The matcher should consume the static KB + dynamic context and return an immutable evidence object. Let the downstream decision engine handle the verdict.
