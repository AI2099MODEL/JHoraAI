# JHoraAI Professional: Context Engine

This document outlines the architecture, pipeline, and activation rules of the **Context Engine** (Phase 32).

---

## 1. Overview

The **Context Engine** acts as the environmental sensor of the workspace. Its primary task is to synthesize the active state of the user's workspace—such as which birth profile is active, which page they are looking at, which chart is selected, and active transit positions—into a standardized, structured **Context Package**. This package is used to ground subsequent AI reasoning and query dispatch.

---

## 2. Core Structure (`ContextPackage.ts`)

The Context Package is a unified, immutable interface holding full operational state markers:

```typescript
export interface ContextPackage {
  intent: string;                     // Classified intent from Intent Engine
  currentModule: string;              // Active workspace tab (e.g., "Horoscope", "Dasha")
  selectedChart: string;              // Selected divisional layout (e.g., "D1 Natal Chart", "D9")
  birthProfile: BirthProfile | null;  // Aligned native parameters
  currentTransit: {                   // Live sky placements
    timestamp: string;
    coordinates: Record<string, { sign: string; degree: number; house: number }>;
  } | null;
  activeSystems: string[];            // Astrological techniques active in query
  requestedDomain: string;            // Primary topic category
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}
```

---

## 3. Context Builder (`ContextBuilder.ts`)

The `ContextBuilder` aggregates inputs across independent components (conversations, profiles, preferences) at the moment of query submission. This isolates the calculation and state-tracking parts from the AI reasoning components.

---

## 4. Evaluation & System Recommendations (`ContextEngine.ts`)

Once assembled, the context package is evaluated to recommend specific subsystems and focus houses based on the native's query. This ensures that only relevant factors are fed into downstream calculation and reasoning pipelines:

| Topic / Intent | Recommended Systems | Target Focus Houses | Justification |
| :--- | :--- | :--- | :--- |
| **Career** | JHora, KP | `10`, `6`, `2`, `11` | 10th rules vocation; 6th rules employment; 2nd/11th rule income. KP sublords verify timing. |
| **Marriage** | JHora, Jaimini | `7`, `2`, `11` | 7th rules union; 2nd rules family increment. Jaimini Upapada reveals spouse status. |
| **Finance** | JHora | `2`, `11`, `5`, `8` | 2nd is accumulated wealth; 11th is incoming gains; 5th/8th rule investments. |
| **Foreign Settlement** | JHora, Nadi | `12`, `9`, `3`, `4` | 12th house rules long-distance settlement; 9th/3rd rule journeys. |
| **Spiritual** | JHora, Jaimini | `9`, `12`, `5`, `8` | 9th house rules guru and dharma; 12th rules moksha and retreat. |
| **Compatibility** | KP, Western | `7`, `5`, `11` | Synchronizes western aspect overlays with KP sublord compatibility scores. |

---

## 5. Architectural Flow

```
[User Input] 
     ↓
[ContextBuilder] ── (Reads active Profile + active Module + sky Transits)
     ↓
[ContextPackage] 
     ↓
[ContextEngine] ── (Resolves Focus Houses + Recommends target systems to load)
```
This isolates the reasoning logic, making it highly testable and independent of external LLM runtimes.
