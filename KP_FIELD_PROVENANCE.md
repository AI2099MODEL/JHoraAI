# KP Field Provenance Report

This document details the exact provenance and calculations behind every field previously displayed inside the JHoraAI KP Stellar Module.

---

## 1. Provenance Definition Table

We classify each field into one of six categories:
1. **Returned by an API**: Fetched dynamically from a verified, documented external service.
2. **Calculated locally**: Computed offline using mathematically sound, validated algorithms.
3. **Hardcoded**: Stored as static read-only values in code.
4. **Placeholder**: Temporary visual blocks designed to be swapped with future endpoints.
5. **Generated**: Computed dynamically using simulated or non-astrological algorithms.
6. **Example**: Displayed purely as a sample illustration.

---

## 2. Field Provenance Matrix

### A. General Profile Summary
- **Field**: `profileName`, `birthDate`, `birthTime`, `location`
- **Provenance**: **Calculated locally** (derived downstream).
- **Explanation**: These fields are parsed and mapped from the active `AstrologyData` object, which is resolved dynamically by the JHora core system based on user birth details input on the main dashboard.

### B. Cusps Screen (12 Placidus House Divisions)
- **Field**: `longitude`, `degree`, `sign`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Placidus unequal house divisions require complex mathematical calculations (usually using Swiss Ephemeris coordinates). Due to local calculation restrictions in Phase 11, the coordinates were simulated by applying a simple linear $+30^\circ$ offset per house starting from the Lagna longitude.
- **Field**: `starLord`
- **Provenance**: **Calculated locally** (lookup).
- **Explanation**: Derived using a standard lookup map matching the cusp's longitude to one of the 27 Nakshatras.
- **Field**: `subLord`, `subSubLord`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Derived using a mock modulo-9 hashing function (`Math.floor(cuspLong * 100) % 9`) to select one of the nine planets.
- **Field**: `houseStrength`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Calculated using the artificial formula `100 - Math.abs(6 - h) * 4`.

### C. Planetary Placements
- **Field**: `longitude`, `degree`, `sign`, `house`
- **Provenance**: **Calculated locally** (derived downstream).
- **Explanation**: Extracted directly from JHora's internal planetary calculation payload.
- **Field**: `starLord`
- **Provenance**: **Calculated locally** (lookup).
- **Explanation**: Derived using a standard lookup map matching the planet's longitude to one of the 27 Nakshatras.
- **Field**: `subLord`, `subSubLord`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Derived using a mock modulo-9 hashing function on the planet's coordinates.

### D. Significator Matrices (Planets and Houses)
- **Field**: `planetSignificators`, `houseSignificators`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Mapped relative to the planet's house and standard offsets (Level 1 to Level 4) without executing true astronomical Lord ownership calculations.

### E. Ruling Planets (RP)
- **Field**: `dayLord`, `moonSignLord`, `moonStarLord`, `ascendantLord`, `ascendantStarLord`
- **Provenance**: **Generated** (simulated).
- **Explanation**: Hardcoded default mappings and simplified evaluations matching basic signs.

### F. KP Vimshottari Dasha
- **Field**: `planet`, `startTime`, `endTime`
- **Provenance**: **Calculated locally** (derived downstream).
- **Explanation**: Mapped directly from JHora's core Vimshottari dasha array.

### G. Transits
- **Field**: `transitTable`
- **Provenance**: **Calculated locally** (derived downstream).
- **Explanation**: Derived from current JHora planet coordinate outputs.
- **Field**: `events`
- **Provenance**: **Hardcoded / Example**.
- **Explanation**: Static objects depicting example events such as *"Moon ingress into Cancer Cusp 4"*.

### H. Horary (Prashna)
- **Field**: `resultSummary`
- **Provenance**: **Generated / Example**.
- **Explanation**: Uses a mock template engine stating success for all entered queries and seed numbers.

---

## 3. Core Mitigation Status
To ensure absolute mathematical integrity and eliminate all simulated or generated placeholder fields:
- **ALL above screens have been deactivated**.
- **Calculations have been completely stopped**.
- The user is presented with a clean Awaiting state indicating that no verified calculations are being simulated.
