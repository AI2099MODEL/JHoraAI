# Krishnamurti Paddhati (KP) Feature Support Matrix

This document provides a feature-by-feature evaluation of each astrology provider against the mathematical and logical requirements of **Krishnamurti Paddhati (KP) Stellar Astrology**.

---

## 1. Feature Support Matrix

| KP Astrological Feature | VedicAstro (Sidecar) | AstrologyAPI.com | Prokerala API | VedAstro | Jyotish API (Commercial) | Kerykeion | OpenKundali |
|---|---|---|---|---|---|---|---|
| **KP Cusps (Placidus)** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Star Lords** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Sub Lords (KP 1-249)** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Sub-Sub Lords** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Planet Significators** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **House Significators** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Ruling Planets (RP)** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Cuspal Interlinks** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Significator Tables** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **KP Dashas** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **KP Transit** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **KP Horary (1-249)** | **SUPPORTED** | PARTIAL | PARTIAL | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Birth Time Rectification**| **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |

---

## 2. Technical Evidence & Explanations

### A. KP Cusps (Placidus)
*   *Requirement:* KP astrology strictly utilizes the **Placidus House System** (unequal houses) adjusted to the Krishnamurti Ayanamsa.
*   *VedicAstro:* Employs Swiss Ephemeris Placidus cusp formulas natively, returning highly accurate cusp longitudes.
*   *VedAstro / Jyotish API:* Default to Whole Sign or Equal house models; Placidus is optional but often lacks proper KP ayanamsa coupling, leading to cusp drift.

### B. Sub Lords (KP 1-249) & Sub-Sub Lords
*   *Requirement:* Subdivides the 13°20' nakshatra into 9 unequal sub-spans proportional to Vimshottari Dasha years. Sub-sublords recursively divide sublords into 9 further sub-subspans.
*   *VedicAstro:* Includes a native CSV loader (`KP_SL_Divisions.csv`) and recursive lookup algorithms to determine the exact Star, Sub, and Sub-Sub lords of any fractional degree.
*   *AstrologyAPI & Prokerala:* Calculate Sublords, but do not provide third-level Sub-Sublord precision or return them as raw JSON out-of-the-box in standard plans.

### C. Planet & House Significators (ABCD Rules)
*   *Requirement:* Evaluates planet power across four distinct levels:
    *   **Level A (Strongest):** Planets in the star of a planet occupying the house.
    *   **Level B:** Planets occupying the house.
    *   **Level C:** Planets in the star of the owner of the house.
    *   **Level D:** The lord (owner) of the house.
*   *VedicAstro:* Built-in solver that processes planetary and house arrays to generate nested ABCD arrays (e.g., `["Sun", 8, 9, [1, 10], [9]]`).
*   *Commercial APIs:* Offer pre-computed significator endpoints, but the rules are proprietary and cannot be mathematically audited or customized.

### D. KP Horary (1-249)
*   *Requirement:* Given a seed number (1-249) and location, calculates the precise time when the Ascendant degree matches the start boundary of that specific sublord division.
*   *VedicAstro:* Executes an iterative numerical convergence loop querying Swiss Ephemeris until the calculated Ascendant longitude matches the 1-249 table boundaries for the requested date.
*   *Commercial APIs:* Often only support simple static lookup approximations, resulting in coordinate differences.

### E. Birth Time Rectification (BTR)
*   *Requirement:* Uses Ruling Planets (Ascendant Star Lord, Moon Star Lord, Day Lord, etc.) at the moment of calculation to verify and adjust the native's birth time.
*   *VedicAstro:* Offers algorithmic convergence scripts to match ruling planet vectors, making it highly unique.
