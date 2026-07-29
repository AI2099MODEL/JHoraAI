# JHoraAI Professional: Intent Engine

This document details the architecture, pattern matching rules, and confidence metrics of the **Intent Engine** (Phase 32).

---

## 1. Overview

The **Intent Engine** is the initial gatekeeper of the astrological reasoning pipeline. It automatically parses user queries in real-time, mapping natural language requests into one of the **23 standardized astrological domains**. It operates on highly optimized regex patterns and keyword dictionaries rather than sending raw inputs to expensive external parsers.

---

## 2. Standardized Astrological Domains (Intents)

The system supports 23 native categories corresponding to classical house significations (Bhavas) and timing requests:

1. **Career** (10th, 6th Houses)
2. **Marriage** (7th House, Venus/Jupiter)
3. **Finance** (2nd, 11th Houses)
4. **Business** (7th House, Mercury)
5. **Property** (4th House, Mars/Saturn)
6. **Travel** (3rd, 9th Houses)
7. **Children** (5th House, Jupiter)
8. **Health** (6th, 8th, 12th Houses)
9. **Education** (4th, 5th Houses)
10. **Foreign Settlement** (12th House)
11. **Litigation** (6th House)
12. **Government** (Sun, 10th House)
13. **Research** (8th House, occult/astrology)
14. **Politics** (10th House, Saturn/Rahu)
15. **Family** (2nd House, Moon)
16. **Communication** (3rd House, Mercury)
17. **Investments** (5th, 8th Houses)
18. **Spiritual** (9th, 12th Houses, Ketu)
19. **Daily Mood** (Moon transits)
20. **Today's Prediction** (Daily Panchanga/Gochara)
21. **Transit** (Sky placements)
22. **Compatibility** (Synastry/Guna Milan)
23. **General Horoscope** (Default overview)

---

## 3. Pattern Heuristics (`IntentClassifier.ts`)

The classification engine maps inputs to domains using highly selective regex triggers. For example:

- **Career**: `/(job|career|work|profession|boss|office|salary|interview|promotion)/i`
- **Marriage**: `/(marry|marriage|spouse|wedding|wife|husband|partner)/i`
- **Foreign Settlement**: `/(foreign|abroad|settle.*abroad|visa|passport|immigration)/i`

If no explicit triggers are matched, the system default resolves to **General Horoscope**.

---

## 4. Multi-Intent & Confidence Scoring (`IntentEngine.ts`)

The `IntentEngine` wraps the classification process with scoring metrics to measure query specificity:

- **Confidence Score**: Defaults to `0.5` for short/unmatched queries, scaling up to `0.95` based on cumulative keyword densities and message lengths.
- **Secondary Intent Extraction**: By masking the matched primary intent keywords and passing the residual query text back to the classifier, the engine determines if a second topic is present (e.g., *"Will I get a new job after marriage?"* triggers Primary: **Career**, Secondary: **Marriage**).
- **Extracted Keywords**: Exposes keyword arrays to help downstream templates highlight specific charts or Dashas.
- **Strict Separation of Concerns**: This layer operates before any prediction or generation, ensuring complete grounding.
