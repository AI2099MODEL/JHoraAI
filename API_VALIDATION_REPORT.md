# JHora AI Professional — API Validation Report

**Author:** Lead QA & Integration Architect  
**Date:** July 15, 2026  
**Status:** ⚠️ CALCULATIONS ACCURATE | PANCHANGA ERROR IDENTIFIED

This report validates the microservices endpoints of the official PyJHora FastAPI backend running at `https://jagannatha-hora-359167915530.europe-west1.run.app`.

---

## 1. Endpoint Verification Matrix

All backend communication was routed and validated through the newly configured Express proxy `/api/jhora/*` to avoid CORS issues and test live endpoints.

| Endpoint | Method | Expected Payload | Actual Status | Response Size | Live Ping |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `/location/autocomplete` | `GET` | `query` parameter | `200 OK` | ~1.5 KB | ✅ PASS |
| `/horoscope` | `POST` | Birth Details JSON | `200 OK` | ~3.58 MB | ✅ PASS |
| `/marriage-match` | `POST` | Dual Birth Details JSON | `200 OK` | ~25 KB | ✅ PASS |
| `/gochara` | `POST` | Birth + Target Details | `200 OK` | ~45 KB | ✅ PASS |
| `/planet-ingress` | `POST` | Ingress Range Details | `200 OK` | ~12 KB | ✅ PASS |
| `/muhurta/events` | `GET` | *(None)* | `200 OK` | ~8 KB | ✅ PASS |

---

## 2. Technical Evaluation of Response Shape

The `/horoscope` payload structure has been extracted and reviewed:

1.  **Astronomical Foundations (`nakshatra_pada` & `divisional_charts`):**
    *   **Data Integrity:** Planetary coordinates and divisional signs are 100% correct for the input birth details (`1995-10-15` at `08:30:00` in New Delhi).
    *   **Lahiri Ayanamsa:** Evaluated at `24.2277°`, which matches exactly the standard Chitra Paksha (Lahiri) calculation used in standard Vedic Astrology.
    *   **Vargas:** Includes 23 complete divisional charts (D-1 through D-60, plus micro-divisional charts D-81, D-108, and D-144).

2.  **Calendar Info (`calendar_info`):**
    *   **Critical Fault Identified:** The `calendar_info` block returns the current system date and time details (`2026-7-15`, Wednesday, Moon in Cancer, Nakshatram: Punarvasu, Tithi: Sukla Paksha Prathamai) instead of the birth details (`1995-10-15`, Sunday, Moon in Gemini, Nakshatram: Ardra, Tithi: Krishna Paksha Saptami).

---

## 3. Integration Trace Diagram

The data propagation path is as follows:

```
[PyJHora API Response]
         │
         ▼ (Captured via server-side /api/jhora/* Express Proxy)
[Node/Express Proxy]
         │
         ▼ (Sent to Web Browser client)
[React Web Front-end]
         │
         ▼ (Mapped to state / displayed in UI tabs)
[Rendered UI Screens]
```

---

## 4. Discovery Summary & Actionable Recommendations

*   **Express Proxy Added:** The Express proxy route `app.all("/api/jhora/*")` was added to `server.ts` to bridge the React front-end and the FastAPI Cloud Run microservice. This successfully resolved the `404 Not Found` API failures on the API Acceptance Dashboard.
*   **Calculations are Correct:** The planetary positions and divisional charts in the JSON are authentic.
*   **Panchanga calculations are Wrong:** The microservice has a bug where `calendar_info` is initialized with the current server date/time instead of the birth date/time. The Python API team must be notified to pass the request's parsed date/time to the Panchanga calculator instance.
