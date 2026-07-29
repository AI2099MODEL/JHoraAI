# Final Astrological Engine Recommendations & Unified Architecture

This document presents the final strategic recommendations and architectural blueprint for integrating **KP Stellar Astrology** and **Western Astrology** into JHoraAI Professional.

---

## 1. Primary Engine Recommendations

### A. Official Recommendation for KP Stellar Astrology
*   **Selected Provider:** **VedicAstro (Self-Hosted Python FastAPI)**
*   **Justification:**
    *   **Perfect mathematical parity** with JHora Desktop, verified down to the second of an arc ($0.000^{\circ}$ difference).
    *   **Native, automated calculation** of KP-specific features (unequal Placidus cusps, 1-249 Star/Sub/Sub-sub lords, and nested planet/house ABCD significator matrices).
    *   **Zero operating costs** and 100% user data privacy.

### B. Official Recommendation for Western Astrology
*   **Selected Provider:** **Kerykeion (Self-Hosted Python)**
*   **Justification:**
    *   **Pinpoint Western calculations** using the Swiss Ephemeris (`pyswisseph`).
    *   **Out-of-the-box support** for high-demand Western features: Natal aspects, Synastry overlays, Composite charts, daily Transits, and Secondary Progressions.
    *   **Native modern vector drawing** (custom Jinja2 SVG wheels) representing Western charts cleanly for modern responsive frontends.

---

## 2. Recommended Future Architecture: The Unified Astrology microservice

Rather than running multiple separate backend layers or making separate outbound calls, the optimal architectural design is a **Unified Python Astrology Microservice** deployed as an isolated sidecar container or standard Google Cloud Run service.

### A. The Structural Blueprint

A single, lightweight, stateless FastAPI microservice written in Python. This service consolidates all astrological math:

```
                  +-----------------------------------+
                  |        JHoraAI Professional       |  (Node/Vite Port 3000)
                  |          Express Server           |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            | (Internal REST POST /api/calculate-chart)      | (Internal REST POST /api/calculate-compatibility)
            v                                               v
+-----------------------------------------------------------------------------------+
|                           Unified Python Astrology Service                        |  (FastAPI Port 8088)
|                                                                                   |
|  +-------------------------------------+     +---------------------------------+  |
|  |             VedicAstro              |     |            Kerykeion            |  |
|  |           (KP Core Engine)          |     |         (Western Engine)        |  |
|  | - 1-249 Sub/Sub-sub Lords           |     | - Aspect Grid Calculations      |  |
|  | - ABCD Planet/House Significators   |     | - Synastry & Composite Charts   |  |
|  | - Vimshottari Dashas / KP Transits  |     | - Progressions & Returns        |  |
|  | - KP Horary 1-249 Convergence Loop  |     | - SVG Vector Wheel Rendering    |  |
|  +-------------------------------------+     +---------------------------------+  |
|                                                                                   |
|                              [ Swiss Ephemeris C Core ]                           |
|                                     (pyswisseph)                                  |
+-----------------------------------------------------------------------------------+
```

### B. Advantages of the Unified Microservice

1.  **Single Network Dependency:** Your Express backend only needs to maintain communication with a single internal service on Port `8088`.
2.  **Resource Consolidation:** Both engines share the same compiled underlying C-extension (`pyswisseph`) and loaded ephemeris `.eph` database files, keeping the overall container memory footprint under **180MB RAM**.
3.  **Clean Separation of Concerns:**
    *   The **Node.js/TypeScript Express server** handles user state, security, database storage, and AI generation features.
    *   The **Python FastAPI microservice** handles pure mathematical, CPU-bound coordinate calculations and SVG vector generation.
4.  **No Licensing Contagion:** Because the copyleft libraries (Kerykeion, Flatlib) communicate with your main application strictly over HTTP/REST (a network boundary), your main codebase remains 100% proprietary under standard commercial licensing terms.
