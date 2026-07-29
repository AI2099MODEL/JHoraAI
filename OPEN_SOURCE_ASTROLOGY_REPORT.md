# Open Source Astrology Engine Audit Report

This report evaluates the major open-source astrological calculation engines, detailing their licenses, technical dependencies, codebase health, and suitability for integration into enterprise production systems.

---

## 1. Open Source Project Inventory

### A. Kerykeion (Python)
*   **Repository:** `github.com/Kerykeion/kerykeion`
*   **License:** GNU GPL-3.0 (Copyleft)
*   **Stars:** ~450+
*   **Primary Focus:** Modern Western Astrology (Tropical, Aspects, Synastry, Composite, Progressions, SVG Chart Wheels).
*   **Tech Stack:** Python, `pyswisseph` (Swiss Ephemeris wrapper), `pydantic` (for data validation), and `jinja2` (for SVG generation).
*   **Production Readiness:** **HIGH**. Extremely clean API, well-modeled classes, and solid error handling.

### B. Python-Flatlib (Python)
*   **Repository:** `github.com/flatlib/flatlib`
*   **License:** GNU GPL-3.0 (Copyleft)
*   **Stars:** ~180+
*   **Primary Focus:** Classical, Hellenistic, and Traditional Astrology (Arabic Parts, Almutens, Dignities, Traditional Terms & Faces).
*   **Tech Stack:** Python, wraps `pyswisseph` or can fall back to standard analytical calculations.
*   **Production Readiness:** **MEDIUM**. Highly stable and mathematically robust, but development has slowed, and it does not natively provide modern features like Synastry or Composite charts.

### C. VedAstro (C#)
*   **Repository:** `github.com/VedAstro/VedAstro`
*   **License:** MIT (Permissive)
*   **Stars:** ~250+
*   **Primary Focus:** Sidereal Indian Vedic Astrology (Ashtakavarga, Shadbala, Muhurtha, Panchang, Vimshottari Dashas).
*   **Tech Stack:** C# / .NET Core, Blazor, SQL Server, Azure functions.
*   **Production Readiness:** **HIGH (for Parashari Vedic)**. Very active community, beautiful documentation, permissive license. However, it lacks native KP (Stellar) features and Western systems.

### D. pyswisseph (Python bindings for Swiss Ephemeris)
*   **Repository:** `github.com/astronexus/pyswisseph`
*   **License:** GNU GPL-2.0 or later (or commercial Swiss Ephemeris license)
*   **Stars:** ~120+
*   **Primary Focus:** Raw astronomical coordinates (ephemeris) for planets, houses, and stars.
*   **Tech Stack:** Python C-Extension wrapping Astrodienst's Swiss Ephemeris C library.
*   **Production Readiness:** **CRITICAL BASELINE**. This is not a high-level astrology library, but rather the essential mathematical foundation that powers Kerykeion, Flatlib, and our VedicAstro engine.

---

## 2. Licensing Profile Analysis

When choosing open-source components for a commercial application, licenses play a critical role:

| License Type | Candidate Engines | Commercial Constraints | Mitigation |
|---|---|---|---|
| **Permissive (MIT / Apache)** | **VedAstro**, **pyswisseph (via commercial license)** | None. Code can be bundled, modified, and closed-source. | None needed. Ideal. |
| **Copyleft (GPL-2.0 / GPL-3.0)**| **Kerykeion**, **Python-Flatlib**, **pyswisseph (default)** | **Strict copyleft.** If you import these libraries directly into your main code, you must release your entire application's source code under the GPL. | **Microservice Isolation (Sidecar Pattern):** Run Kerykeion or VedicAstro in a separate container, communicating strictly over HTTP/REST (FastAPI). This prevents GPL "linking" contagion. |

---

## 3. Dependency & Compilation Profiles

To run any of the Swiss Ephemeris-based engines, the environment must compile and load native C bindings:

1.  **C Compiler Requirements:** `pyswisseph` compiles native code. The target container must have `build-essential` (gcc, g++, make) installed.
2.  **Ephemeris Files (.eph):** While basic coordinate formulas are built-in, precise calculations require loading `.eph` data files (e.g., `sepl_18.se`, `semoy_18.se`). These files must be packaged inside the container's file system.
3.  **Python Runtime:** Standard Python 3.10+ with `python3-dev` headers is mandatory to support C extension compilation.

---

## 4. Codebase Activity and Longevity Audit

*   **Most Active:** **VedAstro** and **Kerykeion** are under active, ongoing maintenance. Pull requests are regularly merged, and bugs are patched.
*   **Stable but Dormant:** **Python-Flatlib** has not seen major feature updates recently, but its core mathematical models are complete, highly accurate, and stable. It remains a reliable dependency for core astronomical overlays.
