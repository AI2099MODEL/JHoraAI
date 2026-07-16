# JHora AI Data Provenance Audit Report

This document serves as the official **Data Provenance Report** for JHora AI. It establishes a rigorous, field-level audit trace for every astrological coordinate, strength metric, dasha timeline, and interpretive analysis rendered in the application.

By enforcing strict traceability, we ensure absolute transparency for the end user, drawing clear boundaries between official astronomical computations, client-side astrological derivations, artificial intelligence interpretations, and static application configurations.

---

## 1. Classification Taxonomy

To prevent data contamination and ensure absolute design transparency, every single field displayed in the user interface is classified into exactly one of four mutually exclusive categories:

| Class Code | Category Name | Description / Governance |
| :--- | :--- | :--- |
| **SOURCE_A** | **Official JHora API** | Returned directly as a first-class value by the official python/pyjhora microservice. No mathematical transformations are performed locally. |
| **SOURCE_B** | **Locally Derived** | Calculated deterministically in the TypeScript/Node runtime using official API output as raw feeds. Employs classic astrological algorithms. |
| **SOURCE_C** | **AI Generated** | Constructed dynamically on-demand using the Google Gemini model. Highly subjective interpretations, explicitly bounded in contextual cards. |
| **SOURCE_D** | **Hardcoded / Placeholder** | Pre-set, static UI parameters or simulated assets that do not represent active live-client calculations. |

---

## 2. Architectural Data Flow & Provenance Path

The JHora AI application operates a secure, full-stack architecture that maintains strict separation of concerns to protect secrets and ensure high-fidelity calculations.

```
+-------------------------------------------------------------------------------------------------+
|                                     1. USER BROWSER CLIENT                                      |
|  - Renders UI Views (Lagna, Vargas, Ashtakavarga, Dashas, Transits)                             |
|  - Captures input (Name, Date, Time, Location Coordinates, Target Dates)                        |
|  - Executes local derivations (Koota calculations, Sade Sati phase analysis)                     |
+-----------------------------------------------------------------+-------------------------------+
                                                                  |
                                                           HTTP POST / GET
                                                                  v
+-----------------------------------------------------------------+-------------------------------+
|                                     2. EXPRESS API GATEWAY                                      |
|  - Proxies requests to downstream microservices securely                                        |
|  - Keeps GEMINI_API_KEY completely hidden from client side                                      |
|  - Houses Pluggable KP Service model and switches provider sources                              |
+------------------------------------+----------------------------+-------------------------------+
                                     |                            |
                               HTTP POST                      HTTP POST
                                     v                            v
+------------------------------------+-------+    +---------------++------------------------------+
|       3. PYTHON PYJHORA CORE       |    |       4. GOOGLE GEMINI API (ai.models)        |
|  - Runs Swiss Ephemeris calculations       |    - Executed via `@google/genai` server-side     |
|  - Renders true planet longitudes,         |    - System-instructed under traditional Jyotish  |
|    Shadbala tables, and Ashtakavarga       |    - Grounded on the official SOURCE_A input      |
+--------------------------------------------+    +-----------------------------------------------+
```

### End-to-End Execution Trace
1. **Request Ingestion**: The user enters their birth data in `HoroscopeDashboard.tsx`.
2. **Proxy Gateway Dispatch**: The local Express server intercepts `/api/astrology/calculate`, wrapping the client request.
3. **Primary Computation**: The request is routed to PyJHora (`https://jagannatha-hora-359167915530.europe-west1.run.app/horoscope`).
4. **JSON Mapping**: The response is returned to the client and fed through `jhoraMapper.ts`. Here:
   - Primary attributes are mapped directly (**SOURCE_A**).
   - Local calculators derive secondary indicators like Nakshatra-based Kootas and Shani Sade Sati (**SOURCE_B**).
5. **Contextual Enrichment**: For qualitative deep dives, the mapped data is bundled into a standardized structured payload and submitted server-side to the Gemini API (`/api/astrology/ai-analyze`), outputting professional markdown insights (**SOURCE_C**).

---

## 3. Strict Secrets & Key Security Management

To comply with enterprise security baselines and our system constraints, JHora AI enforces the following key protection protocols:

1. **No Client-Exposed Secret Keys**: The Gemini API key (`GEMINI_API_KEY`) is **NEVER** transmitted to or stored in the browser client. It remains entirely server-side.
2. **Lazy SDK Initialization**: The Google GenAI client is initialized lazily at request time in `server.ts` rather than at module load. If the secret key is missing, the application fails gracefully for that specific request without crashing the backend web container.
3. **Clean Client-Side Environment Separation**: Only client-safe, public configuration variables (such as public Firebase project metadata) are exposed via the `VITE_` prefix and handled in the React application environment.

---

## 4. API Acceptance Validation & Verification

JHora AI maintains a live self-test and verification portal (`ApiAcceptanceDashboard.tsx` and `WhatComesBackExplorer.tsx`) to execute deterministic contract validation against running microservices. This provides a clear, real-time diagnostic framework to confirm that the API matches our strict mapping expectations.
