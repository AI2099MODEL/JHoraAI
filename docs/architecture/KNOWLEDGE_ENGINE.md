# JHoraAI Professional: Astrology Knowledge Engine

This document details the architecture, schemas, and indexing mechanisms of the internal **Astrology Knowledge Engine** (Phase 32).

---

## 1. Overview

The **Knowledge Engine** serves as the authoritative repository of astrological rules, definitions, and significations. Rather than delegating basic definitions to external LLMs (which are prone to hallucinating houses, planetary rulers, and classical yoga parameters), the Knowledge Engine resolves these concepts locally using an optimized full-text keyword indexing and search system.

---

## 2. Core Schemas (`KnowledgeItem.ts`)

Every knowledge entry is represented by a strictly typed structure defining categories, target keywords, description strings, and search tags:

```typescript
export type KnowledgeCategory =
  | "planet"
  | "house"
  | "nakshatra"
  | "yoga"
  | "dosha"
  | "transit"
  | "dasha"
  | "kp"
  | "western"
  | "jaimini"
  | "future_system";

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  keyword: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}
```

---

## 3. Supported Systems & Categories

The Knowledge Repository contains pre-compiled, professional-grade rules matching classical texts and modern techniques:

| Category | Description / System Context | Example Entry |
| :--- | :--- | :--- |
| `planet` | Significators (Karakas) of classical astrology. | Sun (Soul/Govt), Saturn (Karma/lifespan) |
| `house` | Core fields of life experience (Bhava). | 10th House (Profession), 7th House (Marriage) |
| `nakshatra` | The 27 stellar mansions of Vedic charts. | Ashwini (Swiftness, healing, Ketu-ruled) |
| `yoga` | Highly specific planetary configurations. | Gaja Kesari (Jupiter-Moon auspicious alignment) |
| `dosha` | Planetary afflictions or conflicts. | Manglik Dosha (Mars marital friction placement) |
| `transit` | Dynamic celestial movements over natal points. | Sade Sati (7.5-year Shani transition) |
| `dasha` | Planetary progression timing models. | Vimshottari (120-year Nakshatra-based period) |
| `kp` | Krishnamurti Paddhati stellar subdivisions. | Sublords (Unequal Nakshatra divisions) |
| `western` | Angle aspects of modern astrology. | Aspects (Conjunction, Trine, Sextile, Square) |
| `jaimini` | Sign-based and variable significators. | Chara Karakas (Atmakaraka, Darakaraka) |
| `future_system` | Plugs for external/subsequent system modules. | Nadi (Jupiter/Saturn relative transitions) |

---

## 4. Search & Retrieval Engine (`KnowledgeIndex.ts`)

To support instant, client-side, fuzzy-like match queries, the repository is indexed upon initialization:

1. **Token Mapping**: Elements are mapped to lookup keys based on lowercase keywords, categories, and tags.
2. **Relevancy Scoring**: When a user enters a query, it is split into lookup words.
   - **Direct Keyword Match**: Grants `+10` points to the matching item.
   - **Fuzzy Token Substring Match**: Grants up to `+5` points, normalized by length ratios.
3. **Sorting**: Search results are ordered descending by accumulated relevancy score.

---

## 5. Evidence Package Synthesis (`KnowledgeEngine.ts`)

Once search matches are compiled, the `KnowledgeEngine` structures these records into an **Evidence Package**:
- **Primary Factors**: Highly relevant search hits (mapped from top hits).
- **Secondary Factors**: Secondary contextual significations.
- **Missing Parameters**: Architectural flags signaling missing calculations (e.g. transit longitude intersections), prompting the engine to request localized computations before AI dispatch.
