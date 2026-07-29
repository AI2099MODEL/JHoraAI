# Endpoint Mapping
**Date:** July 15, 2026
**Subject:** Full registry of active application endpoints and computation sources.

This report catalogs all active endpoints utilized by the application, their HTTP methods, resolved destinations, and physical computation components.

---

## 1. Endpoints Registry

### 1. Cast Horoscope Endpoint
* **Endpoint:** `/api/astrology/calculate`
* **HTTP Method:** `POST`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 311).
* **Generation Source:** Calculated locally on-the-fly using the local mathematical engine `src/lib/astrology.ts` -> `calculateAstrology()`.

### 2. Mobile DTO Horoscope Endpoint
* **Endpoint:** `/api/jhora/horoscope`
* **HTTP Method:** `POST`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 75).
* **Generation Source:** Populated using the local mathematical engine `src/lib/astrology.ts` -> `calculateAstrology()`.

### 3. Marriage Match Endpoint
* **Endpoint:** `/api/jhora/marriage-match` (and `/api/astrology/compatibility` legacy proxy)
* **HTTP Method:** `POST`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 165).
* **Generation Source:** Calculated locally using the local mathematical engine `src/lib/astrology.ts` -> `calculateCompatibility()`.

### 4. Transit Calculation Endpoint (Gochara)
* **Endpoint:** `/api/jhora/gochara`
* **HTTP Method:** `POST`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 210).
* **Generation Source:** Calculated locally using `src/lib/astrology.ts`.

### 5. Gemini-Powered Chart Consultation (AI Chat)
* **Endpoint:** `/api/astrology/ai-analyze`
* **HTTP Method:** `POST`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 333).
* **Generation Source:** Proxied to Google Gemini API (`gemini-3.5-flash`) with structured prompts describing the calculated astrology dataset.

### 6. Geocoding Location Autocomplete
* **Endpoint:** `/api/jhora/location/autocomplete`
* **HTTP Method:** `GET`
* **Resolved Destination:** Handled by the local Express server (`server.ts` line 46).
* **Generation Source:** Proxied to external open-source domain `geocoding-api.open-meteo.com`.
