# Root Cause Analysis: JHora Dasha Discrepancy & Calculation Engine
**Date:** July 15, 2026
**Investigator:** JHora AI Integration Expert

---

## Executive Summary
A comprehensive investigation was launched to identify why Vimshottari, Yogini, and Ashtottari dasha values, along with planetary degrees, do not align perfectly with the desktop or web version of Jagannatha Hora. 

This report documents three primary root causes and outlines the exact differences between our implementation and the high-precision astronomical requirements of Vedic Astrology (Jyotish).

---

## Root Cause 1: Keplerian Approximations vs. High-Precision Ephemeris
The fundamental cause of discrepancies in planetary positions and Vimshottari dasha dates is the use of simplified local orbital formulas.

1. **Precision Levels of Astro-Calculations:**
   * **Jagannatha Hora (Desktop):** Uses the **Swiss Ephemeris** (a C/C++ library containing highly precise semi-analytical models adjusted to JPL DE405/DE431 ephemerides). It tracks gravitational perturbations, lunar evection, nutation, and relativistic light deflection to a fraction of an arcsecond.
   * **Our local engine (`src/lib/astrology.ts`):** Uses **Keplerian mean elements** and simplified orbital equations. It assumes planets move along simple elliptical paths with linear progress terms.

2. **Dasha Sensitivity to the Moon's Longitude:**
   * In the Vimshottari dasha system, the starting Nakshatra and its remaining time balance are calculated from the exact sidereal longitude of the Moon:
     $$\text{Remaining Years} = \text{Dasha Lord Years} \times \left(1 - \frac{\text{Moon Longitude} \pmod{13^\circ 20'}}{13^\circ 20'}\right)$$
   * Because of this sensitivity, even a tiny perturbation error of **0.25° (15 arcminutes)** in the Moon's longitude shifts the start/end dates of the main Mahadasha cycles and secondary Antardashas by **months or years**, causing visible discrepancies when compared to Jagannatha Hora.

---

## Root Cause 2: Complete Omission of Yogini and Ashtottari Systems in Code
The reason Yogini and Ashtottari Dashas do not align or display is simple: **they have not been implemented in any layer of the codebase.**

1. **No Mathematical Formulations:**
   * **Yogini Dasha:** Requires mapping the Moon's Nakshatra to a 36-year cyclic recurrence across 8 Yoginis (Mangala, Pingala, Dhanya, Bhramari, Bhadrika, Ulka, Siddha, Sankata).
   * **Ashtottari Dasha:** Requires a 108-year cyclic model of 8 planetary lords (Ketu is excluded).
   * There are **zero** formulas, constants, or functions defined for Yogini or Ashtottari calculations in `src/lib/astrology.ts`.

2. **UI & Data Schema Deficiencies:**
   * The `<DashaTree>` UI component and IndexedDB local caching structures only recognize and render the standard Vimshottari list. There are no UI tabs or selectors to display alternate systems.

---

## Root Cause 3: API Response Payload Structural Omission
Our standard endpoint `/api/jhora/horoscope` completely omits dasha timelines from its output envelope.

* As documented in `RAW_DASHA_RESPONSE.json`, the response of `/api/jhora/horoscope` contains details for `birth_details`, `calendar_info`, `sphuta`, `divisional_charts`, `nakshatra_pada`, `yogas`, and `doshas`, but leaves out all dasha systems entirely.
* Therefore, the client application is forced to use secondary or legacy endpoints like `/api/astrology/calculate` to render any dasha information.

---

## Resolution Strategy and Next Steps
1. **Integrate High-Precision Ephemeris:** Migrate the local calculation engine (`src/lib/astrology.ts`) to use a WebAssembly port of the Swiss Ephemeris (`@asg09/swiss-ephemeris` or equivalent) to achieve sub-arcsecond coordinate matching.
2. **Implement Yogini and Ashtottari Systems:** Code the mathematical formulas for Yogini and Ashtottari cycles inside the dasha calculation module.
3. **Align Endpoints:** Upgrade the response of `/api/jhora/horoscope` to include `vimshottari`, `yogini`, and `ashtottari` arrays.
4. **Update UI Selectors:** Add a tabbed navigation selector to the Dasha tab allowing users to switch between the three systems.
