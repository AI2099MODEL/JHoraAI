# Western Astrology Provider Comparison

This document provides a comparative analysis of the leading astrological engines and API providers for **Western Astrology** (Tropical calculations, Houses, Aspects, Synastry, Progressions, etc.), evaluating them on license, performance, accuracy, and depth of feature set.

---

## 1. Executive Summary

| Provider | Type | Core Language | License | Western Suitability | Recommendation |
|---|---|---|---|---|---|
| **Kerykeion** | Open-Source | Python | GPL-3.0 | **EXCELLENT** | **Primary Choice for Open-Source** |
| **AstrologyAPI.com** | Commercial API | Cloud REST | Proprietary | **EXCELLENT** | Primary Choice for Commercial API |
| **Python-Flatlib** | Open-Source | Python | GPL-3.0 | **HIGH (Traditional)**| Great for traditional/medieval calculations |
| **VedAstro** | Open-Source | C# (.NET) | MIT | **LOW** | Not Recommended (Sidereal/Vedic optimized) |
| **Astro-Charter** | Frontend Only | JavaScript / SVG| MIT | **HIGH (Rendering)** | Excellent for frontend UI drawing only |

---

## 2. In-Depth Comparison Table

| Comparative Dimension | Kerykeion | AstrologyAPI.com | Python-Flatlib | VedAstro | Astro-Charter |
|---|---|---|---|---|---|
| **Primary Use Case** | Western Charts & SVGs | Enterprise Multi-System | Traditional Western | Vedic calculations | Frontend chart drawing |
| **Coordinate System** | Tropical (Default) | Tropical & Sidereal | Tropical & Sidereal | Sidereal (Default) | None (Takes raw JSON) |
| **Aspect Grid Calculations**| Fully Native | Fully Native | Fully Native | Partial | None (Must pass in aspects) |
| **Synastry & Composite** | **Fully Native** | Fully Native | Manual Math Needed | Not Supported | Frontend Rendering Only |
| **Solar / Lunar Returns** | **Fully Native** | Fully Native | Manual Math Needed | Not Supported | None |
| **Secondary Progressions**| **Fully Native** | Fully Native | Manual Math Needed | Not Supported | None |
| **Swiss Ephemeris Core** | Yes (`pyswisseph`) | Yes | Yes (`pyswisseph`) | Yes | No (Client-side only) |
| **Self-Hosting Readiness**| **100% (Pip Package)** | No (Cloud Only) | 100% (Pip Package) | 100% (Docker Core) | 100% (NPM package) |
| **Maintenance & Stars** | ~450+ Stars / Active | Closed SDKs | ~180+ Stars / Stable | ~250+ Stars / Active | ~300+ Stars / Stable |

---

## 3. Detailed Provider Profiles

### A. Kerykeion (Python Western Engine)
*   **Aesthetic & Technical Vibe:** Modern, elegant, clean, and developer-friendly.
*   **Architecture:** Written entirely in Python. It directly wraps the Swiss Ephemeris (`pyswisseph`) for pinpoint-accurate planetary coordinates, Placidus/Koch house division, and aspect calculations. It also features a built-in SVG generator to draw beautiful, modern Western chart wheels out-of-the-box.
*   **Pros:**
    *   **Extremely rich Western feature set:** Out-of-the-box support for Natal charts, Synastry, Composite charts, Transits, and Secondary Progressions.
    *   **SVG Rendering:** Generates highly customizable vector files representing the chart wheels, making it highly compatible with modern, responsive web frontends.
    *   **Fully offline and local:** High speed, zero network delays, and total privacy.
*   **Cons:** GPL-3.0 copyleft license requires open-sourcing modifications (easily resolved by deploying it as a standalone, isolated microservice container over REST).

### B. AstrologyAPI.com
*   **Aesthetic & Technical Vibe:** Enterprise-grade cloud suite.
*   **Pros:** Highly comprehensive. Calculates precise tropical longitudes, house cusps, major and minor aspects, synastry/composite compatibility percentages, solar/lunar returns, and daily transits.
*   **Cons:** Paid commercial usage, recurring charges, network latency, and third-party dependency.

### C. Python-Flatlib
*   **Aesthetic & Technical Vibe:** Classical, medieval, and traditional.
*   **Architecture:** Python library designed for traditional astrology (Hellenistic, Medieval, and Renaissance).
*   **Pros:** Deeply accurate traditional features (almutens, dignity trees, traditional terms/faces, classical aspect calculations, houses, and lots/Arabic parts).
*   **Cons:** Does not natively support modern Western features such as Synastry, Composite charts, Solar returns, or progressions out-of-the-box; these must be coded manually using flatlib's coordinate outputs.

### D. VedAstro
*   **Aesthetic & Technical Vibe:** Vedic-focused.
*   **Pros:** Beautiful C# library, extremely comprehensive for sidereal calculations.
*   **Cons:** Unsuitable for Western astrology. It defaults to Sidereal calculations using Lahiri ayanamsa. Trying to adapt it to Tropical longitudes, modern aspect configurations, and Western house analysis is highly complex and error-prone.

### E. Astro-Charter (circular-astrology-chart)
*   **Aesthetic & Technical Vibe:** Interactive frontend visualization.
*   **Pros:** Beautiful, responsive, interactive SVG astrology charts drawn entirely in the browser using JavaScript or React.
*   **Cons:** **Not a calculation engine.** It contains no astronomical mathematical formulas or Ephemeris databases. It expects pre-calculated planet and house coordinate JSON data, making it a perfect frontend companion to a backend engine like Kerykeion.
