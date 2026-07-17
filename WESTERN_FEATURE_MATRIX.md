# Western Astrology Feature Support Matrix

This document provides a feature-by-feature evaluation of each astrology provider against the astronomical and astrological requirements of **Western Astrology**.

---

## 1. Feature Support Matrix

| Western Astrological Feature | Kerykeion | AstrologyAPI.com | Python-Flatlib | VedAstro | Astro-Charter |
|---|---|---|---|---|---|
| **Natal Chart (Tropical)** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE |
| **Planet Positions** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE |
| **Houses (Placidus/Koch)** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE |
| **Aspect Grid (Major/Minor)**| **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE |
| **Synastry Chart** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Composite Chart** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE | NOT AVAILABLE |
| **Solar Return** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Lunar Return** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Secondary Progressions** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Primary Directions** | PARTIAL | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Transits** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE |
| **Retrogrades** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE |
| **Asteroids (Chiron, Ceres)** | **SUPPORTED** | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Arabic Parts (Lots)** | NOT AVAILABLE | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE |
| **Midpoints** | PARTIAL | **SUPPORTED** | PARTIAL | NOT AVAILABLE | NOT AVAILABLE |
| **Fixed Stars** | PARTIAL | **SUPPORTED** | **SUPPORTED** | NOT AVAILABLE | NOT AVAILABLE |

---

## 2. Technical Evidence & Explanations

### A. Aspect Grids & Orbs
*   *Requirement:* Calculates exact angular distances between planets (Conjunction $0^{\circ}$, Sextile $60^{\circ}$, Square $90^{\circ}$, Trine $120^{\circ}$, Opposition $180^{\circ}$) within customized orb tolerances.
*   *Kerykeion:* Features a native aspect calculator with configurable orbs that outputs nested JSON object structures detailing aspect type, exact angles, and orbs.
*   *AstrologyAPI:* Returns comprehensive pre-calculated aspect arrays.

### B. Synastry & Composite Charts
*   *Requirement:* Synastry compares the direct planetary placements of two individual charts. Composite charts calculate the mathematical midpoints of all corresponding planetary pairs to generate a new unified "relationship" chart.
*   *Kerykeion:* Has native helper classes `Synastry` and `Composite` that automate these mathematical transformations and generate combined aspect tables.
*   *Python-Flatlib:* Lacks direct classes; developers must manually extract coordinates for both charts and compute midpoints programmatically.

### C. Predictive Techniques (Progressions & Returns)
*   *Requirement:* 
    *   **Secondary Progressions:** Translates one day of real time post-birth to one year of progressed life (e.g., coordinates for a 30-year-old are taken from Day 30 post-birth).
    *   **Solar/Lunar Returns:** Finds the exact date and time when the transiting Sun or Moon returns to the identical degree-minute-second occupied in the natal chart.
*   *Kerykeion:* Fully automates progressed coordinate tracking and solar return epoch matching.
*   *Python-Flatlib:* Requires complex scripting of iterative Swisseph coordinate lookups to find exact matching return dates.

### D. Arabic Parts, Midpoints, and Fixed Stars
*   *Requirement:* Traditional calculation layers (e.g., Part of Fortune = $Asc + Moon - Sun$) and tracking of massive celestial coordinates (e.g., Algol, Regulus).
*   *Python-Flatlib:* Excels at traditional Western calculations. Includes native algorithms for traditional Arabic parts and planetary strength/dignity trees.
*   *Kerykeion:* Mostly focused on modern Western astrology (planets, aspects, modern houses). Its fixed star and midpoint support is partial, relying on raw Swisseph bindings.
