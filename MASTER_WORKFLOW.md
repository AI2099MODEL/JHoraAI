# JHora AI Professional - Master Workflow & Architecture Audit

This document details the canonical architecture, master execution pipelines, and module audits for the **JHora AI Professional Astrological Platform**. It aligns the active codebase and documentation with the simplified final architecture and eliminates any duplicated responsibilities, incorrect workflows, or documentation inconsistencies.

---

## 1. Master Workflow Architecture Diagram

The JHora AI platform utilizes a deterministic linear pipeline separating static natal potential from dynamic timing and rule-based decision modeling.

```
USER PROFILE
      │
      ▼
Astronomical Calculator
      │
      ▼
KP Calculation Engine
      │
      ▼
KP Knowledge Book
      │
      ▼
Store inside User Profile

────────────────────────────────────

Prediction Request

↓

KP Rulebook

↓

Rule Engine

↓

Evidence Engine

↓

Decision Engine

↓

Timeline Engine

↓

Event Book

↓

Report Engine
```

---

## 2. Core Engine Responsibilities & Modules

| Engine / Module | Core Responsibility | Persistence Strategy |
| :--- | :--- | :--- |
| **Astronomical Calculator** | Responsible ONLY for astronomical calculations (planetary longitudes, house cusps, transits). | Transient/Stateless (cached per session) |
| **KP Calculation Engine** | Responsible ONLY for converting horoscope calculations into deterministic KP data. It generates Planets, Houses, Cusps, Star Lords, Sub Lords, Significators, Planet Strengths, House Strengths, and Natal Event Promise. It builds the KP Knowledge Book. | Run once on profile creation or recalculation |
| **KP Knowledge Book** | Permanent deterministic repository containing ONLY static natal KP information. Stored once inside the User Profile. NEVER regenerated during predictions. | Permanent inside UserProfile JSON |
| **KP Rulebook** | Permanent repository of classical KP rules. Contains ONLY rules, grouped by Marriage, Career, Business, Finance, Property, Vehicle, Education, Children, Travel, Foreign Settlement, Health, Litigation, Spiritual, Longevity, General. No calculations, no prediction or execution logic. | Static File Asset |
| **Rule Engine** | Responsible ONLY for executing KP rules and producing Rule Results. Must NOT generate evidence, generate events, calculate confidence, or store results. | Stateless Execution |
| **Evidence Engine** | Responsible ONLY for collecting: Supporting Evidence, Blocking Evidence, Satisfied Rules, Failed Rules, Evidence Weight, and Rule Lineage by aggregating Rule Results. | Stateless Execution |
| **Decision Engine** | Responsible ONLY for evaluating: Natal Promise + DBA + Transit + Evidence -> Final Decision. No persistence. | Stateless Execution |
| **Timeline Engine** | Responsible ONLY for estimating: Activation Window, Timing Range, Activation Strength, and Priority Window. It must NOT create events. (Terms like Delay or Acceleration are interpretations, not engine responsibilities). | Stateless Execution |
| **Event Book** | The Single Source of Truth repository. It must NOT decide events, execute rules, or evaluate astrology. Its responsibility is ONLY to persist: Event ID, Decision, Evidence, Timeline, Confidence, Rule Lineage, Audit Trail, and History. (Workflow: Decision Engine -> Event Candidate -> Event Book -> Persist). | Persistent User Event Collection |
| **Report Engine** | Reads ONLY from the Event Book to produce PDF, UI, Dashboard, and API representations. No astrology calculations or rule evaluations occur here. | Render-Time Generator (PDF / UI) |

---

## 3. Data Division Principles

### A. Static Natal Data (KP Knowledge Book)
The static dataset stored inside the User Profile contains:
• Planets  
• Houses  
• Cusps  
• Star Lords  
• Sub Lords  
• Significators  
• Planet Strengths  
• House Strengths  
• Natal Event Promise  
• KP Knowledge Book Version  

### B. Dynamic Context Data
The dynamic context data supplied with every prediction query contains:
• Current DBA (Dasha-Bhukti-Antara)  
• Current Transit Coordinates  
• Current Date  
• Current Time  
• User Event History (optional)  
• User Notes (optional)  

---

## 4. Discrepancy & Duplication Audit

### A. Completed Module Cleanup: `EventEngineView.tsx` Deprecation
*   **The Resolution:**
    *   The orphaned component `src/components/EventEngineView.tsx` has been deleted from the codebase.
    *   All active logic and step definitions reside cleanly inside `AstrologicalReasoningEngine.tsx` and map directly to database metrics.

### B. Zero Duplication Rule Verification
*   **Rule Engine** does NOT generate evidence.
*   **Evidence Engine** does NOT execute rules.
*   **Decision Engine** does NOT store events.
*   **Timeline Engine** does NOT create events.
*   **Event Book** does NOT evaluate astrology.
*   **Report Engine** does NOT calculate astrology.

### C. Architecture Simplification
*   Internal helper classes like **KP Rule Registry**, **KP Rule Matcher**, and **KP Rule Execution Context** remain private internal implementation classes if required by the codebase, but they are never exposed as independent architectural engines or workflow stages in this master architecture.

---

## 5. Design Guidelines for JHora AI Engines

To preserve the simplicity, determinism, and maintainability of the JHora AI platform, developers and agents must adhere to these rules:

1.  **Strict Profile Storage Isolation:** No astrological mappings, transits, or local interpretations should be computed when saving a profile. Save the exact raw JSON from the JHora API and load it back cleanly.
2.  **No Telemetry Clutter:** Maintain clean, display-oriented user interfaces. Do not add mock terminal lines, container port configurations, or network status circles.
3.  **Linear Propagation Hierarchy:** Keep rule checks stateless. The matcher should consume the static KB + dynamic context and return an immutable evidence object. Let the downstream decision engine handle the verdict.

---

------------------------------------------------------------

ARCHITECTURAL PRINCIPLES

1. Every business module has exactly one responsibility.

2. Static natal knowledge is calculated exactly once.

3. Dynamic timing is calculated on demand.

4. KP Knowledge Book is the permanent deterministic repository.

5. KP Rulebook stores rules only.

6. Rule Engine executes rules only.

7. Evidence Engine aggregates evidence only.

8. Decision Engine determines the verdict only.

9. Timeline Engine determines timing only.

10. Event Book stores results only.

11. Report Engine renders results only.

12. Internal helper classes are implementation details and must never appear as business architecture.

13. No module may perform another module's responsibility.

14. All processing must remain deterministic, immutable where appropriate, traceable, auditable, and maintainable.

------------------------------------------------------------

