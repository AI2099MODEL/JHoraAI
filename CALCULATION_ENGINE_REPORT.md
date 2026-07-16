# Calculation Engine Report: Astronomical Data Sources
**Date:** July 15, 2026
**Subject:** Detailed audit of planetary, dasha, and structural chart calculations.

---

## 1. System Breakdown by Metric

| Astrological Metric | Calculation Source | Code File / Entrypoint | Methods Used & Mathematical Basis |
|---|---|---|---|
| **Ascendant (Lagna)** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateLagna()` | Approximated using local sidereal time (LST) and terrestrial coordinate rotation based on the J2000 epoch. |
| **Planet Positions** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculatePlanets()` | Semi-analytical formulas based on Keplerian mean orbital elements (semi-major axis, eccentricity, inclination, longitude of ascending node). |
| **Nakshatras & Padas** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateAstrology()` | Sidereal longitude of the planet divided by $13^\circ 20'$ (Nakshatra span) and $3^\circ 20'$ (Pada division) under Lahiri Ayanamsa offsets. |
| **D1 Chart (Rasi)** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateAstrology()` | Map 30-degree zodiac spans relative to the calculated Ascendant house boundaries using Equal House divisions. |
| **D9 Chart (Navamsa)** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateAstrology()` | Subdivides each sign into 9 parts of $3^\circ 20'$ each, shifting placements systematically based on sign elements (Fire, Earth, Air, Water). |
| **Vimshottari Dasha** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateAstrology()` | Calculates elapsed nakshatra ratios of the Moon to determine initial dasha lord balance, followed by recursive sub-period additions over a 120-year span. |
| **Yogini Dasha** | **NOT IMPLEMENTED** | N/A | Absent from both server routes and local astrology engines. |
| **Ashtottari Dasha** | **NOT IMPLEMENTED** | N/A | Absent from both server routes and local astrology engines. |
| **Yogas** | Local Calculation Engine | `src/lib/astrology.ts` -> `analyzeYogas()` | Checks conditional spatial matrices (such as Moon-Jupiter quadratures for Gaja Kesari and Mars quadrant/exaltation signs for Ruchaka Yoga). |
| **Doshas** | Local Calculation Engine | `src/lib/astrology.ts` -> `analyzeDoshas()` | Evaluates planetary positions: Manglik (Mars in 1st, 2nd, 4th, 7th, 8th, or 12th houses), Kaal Sarp (all planets between Rahu and Ketu), Sade Sati (Saturn transit position relative to Moon's sign). |
| **Shadbala** | **NOT IMPLEMENTED** | N/A | Highly complex multi-variable strength calculation requiring high-precision planetary coordinates (Sthana, Kala, Dig, Chesta, Naisargika, Drik Balas). Not in codebase. |
| **Bhava Bala** | **NOT IMPLEMENTED** | N/A | Omitted. |
| **Ashtakavarga** | **NOT IMPLEMENTED** | N/A | Omitted. |
| **Arudhas** | **NOT IMPLEMENTED** | N/A | Omitted. |
| **Sahams** | **NOT IMPLEMENTED** | N/A | Omitted. |
| **Marriage Match** | Local Calculation Engine | `src/lib/astrology.ts` -> `calculateCompatibility()` | Compares relative Moon Nakshatras using traditional Ashtakoota rules (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, Nadi) to yield a score out of 36. |

---

## 2. Mathematical Limitations
* The local calculation engine relies on **Keplerian mean elements** and **orbital equations** with linear terms for planet longitudes.
* **The Moon's coordinates** are particularly sensitive to gravitational perturbations (lunar evection, variation, and annual equation), which can shift its position by up to $\pm 1.5^\circ$.
* In sidereal systems, a difference of $1^\circ$ in Moon longitude can skew Vimshottari dasha date boundaries by **years** and occasionally trigger incorrect Nakshatra or Pada designations.
