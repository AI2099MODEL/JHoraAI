# Astrology Provider Evaluation & Ranking

This document establishes a rigorous ranking system for all evaluated astrology engines and APIs, scored across key operational, financial, and astrological dimensions.

---

## 1. Ranking Criteria & Weighting

To determine the optimal backend strategy, each candidate is scored from **1 (Poor)** to **10 (Excellent)** across five categories:

1.  **Mathematical Accuracy (25% Weight):** High-precision ephemeris and coordinate matching.
2.  **Feature Depth (25% Weight):** Native out-of-the-box support for the requested system (KP or Western).
3.  **Financial Efficiency (20% Weight):** Predictable low-cost or free execution.
4.  **Security & Privacy (15% Weight):** Secure handling of user coordinates and birth data, local execution.
5.  **Maintainability & Longevity (15% Weight):** Active open-source commits or robust corporate SLAs.

---

## 2. KP Stellar Astrology Rankings

For calculations involving **Krishnamurti Paddhati (KP) Astrology**, the final rankings are:

### Rank 1: VedicAstro (Custom Sidecar / Self-Hosted)
*   *Total Score:* **9.65 / 10**
    *   *Accuracy (25%):* 10/10 (Direct native compilation of Swiss Ephemeris).
    *   *Feature Depth (25%):* 10/10 (Built-in KP 1-249 sublords, sub-sublords, ABCD significators, KP Horary, and dashas).
    *   *Financial Efficiency (20%):* 10/10 ($0 recurring execution costs).
    *   *Security & Privacy (15%):* 10/10 (100% offline, local container execution).
    *   *Maintainability (15%):* 8/10 (Requires cloud deployment maintenance, but statelessness simplifies operations).
*   *Verdict:* **The absolute gold standard for KP astrology.**

### Rank 2: Prokerala Astrology API
*   *Total Score:* **8.20 / 10**
    *   *Accuracy (25%):* 9/10 (Highly accurate server computations).
    *   *Feature Depth (25%):* 9/10 (Excellent pre-calculated KP endpoints).
    *   *Financial Efficiency (20%):* 6/10 (Paid tier increases with user scale).
    *   *Security & Privacy (15%):* 7/10 (Exposes user birth data to third-party endpoints).
    *   *Maintainability (15%):* 10/10 (Corporate SLA, zero server maintenance).
*   *Verdict:* Highly premium cloud option, best for instant integration if server hosting is completely avoided.

### Rank 3: AstrologyAPI.com
*   *Total Score:* **7.90 / 10**
    *   *Accuracy (25%):* 9/10.
    *   *Feature Depth (25%):* 8/10 (Strong KP support, but lacks some third-level sub-sublord features).
    *   *Financial Efficiency (20%):* 6/10.
    *   *Security & Privacy (15%):* 7/10.
    *   *Maintainability (15%):* 9/10.

### Rank 4: VedAstro
*   *Total Score:* **4.90 / 10**
    *   *Verdict:* High-quality code, but lacks native KP mathematical subdivisions. Unusable for KP.

---

## 3. Western Astrology Rankings

For calculations involving **Tropical Western Astrology** (Natal, Synastry, Aspects, Progressions), the final rankings are:

### Rank 1: Kerykeion (Self-Hosted Python Engine)
*   *Total Score:* **9.40 / 10**
    *   *Accuracy (25%):* 10/10 (Pinpoint Swiss Ephemeris calculations).
    *   *Feature Depth (25%):* 10/10 (Fully native Natal, Aspects, Synastry, Composite, Progressions, and beautiful SVG chart wheel generators).
    *   *Financial Efficiency (20%):* 10/10 ($0 execution fees).
    *   *Security & Privacy (15%):* 10/10 (100% offline and local).
    *   *Maintainability (15%):* 7/10 (Requires deploying a Python container; copyleft GPL license requires Sidecar isolation).
*   *Verdict:* **The absolute best open-source candidate for Western astrology.**

### Rank 2: AstrologyAPI.com
*   *Total Score:* **8.40 / 10**
    *   *Accuracy (25%):* 9/10.
    *   *Feature Depth (25%):* 10/10 (Extremely mature predictive, natal, and compatibility endpoints).
    *   *Financial Efficiency (20%):* 6/10.
    *   *Security & Privacy (15%):* 7/10.
    *   *Maintainability (15%):* 10/10 (Managed cloud service).
*   *Verdict:* Excellent enterprise cloud fallback.

### Rank 3: Python-Flatlib
*   *Total Score:* **7.15 / 10**
    *   *Verdict:* Outstanding traditional engine, but requires significant custom code to build modern Western features like synastry and solar returns.
