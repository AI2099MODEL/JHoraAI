# Open Source KP Calculation Engines & Research Report

This report evaluates existing open-source libraries, packages, and frameworks capable of performing Krishnamurti Paddhati (KP) astrological calculations, with a focus on Placidus house cusp division, nakshatra subdivisions (sub-lords and sub-sub lords), and significator matrices.

---

## 1. Core Technical Requirements for KP Astrology
To calculate a complete KP chart, an engine must support:
- **Placidus House System**: Unlike traditional Vedic astrology which defaults to Equal House, Sriपति, or Whole Sign (Bhava Chalit), KP utilizes the **Placidus House System** where houses have unequal sizes.
- **Precision Ephemeris (Swiss Ephemeris)**: Planetary and house cusp positions must be accurate to within seconds of arc.
- **Precession Correction (Ayanamsa)**: KP requires **KP Ayanamsa** (Krishnamurti or KP New), which differs slightly from Lahiri (Chitra Paksha) Ayanamsa by about several minutes of arc.
- **Stellar Lord (Nakshatra Lord)**: Resolving which of the 27 Nakshatras a planet or cusp resides in, and mapping the planetary ruler.
- **Sub-Lord (Sub-Level Division)**: Dividing each Nakshatra into 9 unequal sub-sections proportional to the Vimshottari Dasha years of the 9 planets.
- **Sub-Sub Lord**: Further dividing the sub-lord segment into 9 secondary unequal segments.

---

## 2. Evaluation of Open Source Engines

### A. VedAstro (C# / JavaScript / Python)
- **Overview**: VedAstro is an advanced, active open-source astronomical-astrological library designed for Vedic and KP calculations.
- **KP Support**: 
  - Full support for the **Placidus** house system.
  - Native calculations for **KP Ayanamsa**.
  - Built-in nakshatra, sub-lord, and sub-sub lord calculations.
- **Language & Integration**: Written in C# but exports WebAssembly binaries and exposes a Python/JS SDK. Highly suitable for cross-platform backends.
- **Pros**: Highly active, fully documented, has visual charts built-in.
- **Cons**: High runtime memory footprint if compiled via Blazor WebAssembly on client-side.

### B. Swiss Ephemeris (`swisseph` / `sweph`)
- **Overview**: The gold standard for astronomical computation created by Astrodienst. All serious astrology software uses Swiss Ephemeris.
- **KP Support**:
  - `swe_houses_ex` function supports the **Placidus** house system (`'P'`) out-of-the-box.
  - Precession calculation supports manual ayanamsa values (to pass custom KP Precession).
- **Language & Integration**: Originally in C. Active wrappers exist for **Node.js** (`key-swisseph-api`, `swisseph`), **Python** (`pyswisseph`), and **Java**.
- **Pros**: Unmatched accuracy, extremely fast execution, runs fully offline.
- **Cons**: Requires ephemeris data files (`.se1`) for high accuracy over long periods. Does not natively calculate sub-lords; the developer must implement the Vimshottari subdivision math on top of the raw degrees.

### C. flatlib (Python)
- **Overview**: A popular Python library for traditional astrology that supports different house systems.
- **KP Support**: Supports Placidus, but needs extensions for Nakshatra sub-lord and sub-sub lord calculations.
- **Pros**: Clean code, lightweight, perfect for microservices.
- **Cons**: Python-only; requires an external microservice wrapper if integrated into a Node.js ecosystem.

### D. VedicAstro (JavaScript/TypeScript Node.js)
- **Overview**: A modern JS engine for Vedic calculations.
- **KP Support**: Supports nakshatra divisions, but lacks native Placidus coordinate mapping. Requires a combination with `swisseph` node bindings.
- **Pros**: Pure JS/TS implementation, zero external C dependencies.
- **Cons**: Still in early active development; lacks comprehensive KP significator formulas.

---

## 3. Recommended Implementation Architecture for Off-line/Self-Hosted Engines
To build an offline-first open-source KP Calculation Engine without cloud APIs, we recommend the following stack:

```
+--------------------------------------------------------+
|                      React UI                          |
+--------------------------------------------------------+
                           |
                           v  (Normalized AST Data)
+--------------------------------------------------------+
|             Node.js / Express Middleware               |
+--------------------------------------------------------+
                           |
                           v  (Sweph Longitude Coordinates)
+--------------------------------------------------------+
|          node-swisseph (Placidus Coordinate Split)     |
+--------------------------------------------------------+
                           |
                           v  (Nakshatra division mapping)
+--------------------------------------------------------+
|             Stellar & Sub-Lord Math Engine             |
|  - Divides 13°20' Nakshatras proportionally to Vimshottari |
+--------------------------------------------------------+
```

### Reference Formula for Sub-Lord Division:
For any planet or cusp at longitude $\theta$:
1. Identify the Nakshatra $N \in [1..27]$.
2. The starting boundary of Nakshatra is $\theta_0 = (N-1) \times 13.3333^\circ$.
3. Relative degree inside Nakshatra is $\Delta\theta = \theta - \theta_0$.
4. Sub-sections are proportional to:
   $$\text{Span}(Planet) = \frac{\text{Vimshottari Years}(Planet)}{120} \times 13.3333^\circ$$
5. Map $\Delta\theta$ into the cumulative spans in the standard Vimshottari order starting from the Nakshatra Lord.
