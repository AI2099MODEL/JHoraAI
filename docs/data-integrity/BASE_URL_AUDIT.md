# Base URL Audit
**Date:** July 15, 2026
**Subject:** Precise catalog of Base URLs and external domains queried.

This audit checks the entire codebase for external domains, APIs, and relative endpoints to verify whether any external Jagannatha Hora microservice or cloud endpoint is being contacted.

---

## 1. Internal & API Route Base URLs

### Client-Side Relative Base URL
* **Base URL:** `/api`
* **Full Resolved URL:** `http://localhost:3000/api`
* **Purpose:** All frontend-to-backend communication is routed through local relative URLs on port `3000`.

### Express Server Port & Host Binding
* **Host:** `0.0.0.0`
* **Port:** `3000`
* **Purpose:** Standard Node.js container routing.

---

## 2. External API Domains & Base URLs

### Geocoding Services
1. **Open-Meteo Geocoding API**
   * **URL:** `https://geocoding-api.open-meteo.com/v1/search`
   * **Purpose:** Resolves city/location query strings into latitude, longitude, and timezone offsets during horoscope creation.
2. **OpenStreetMap Nominatim Reverse Geocoding API**
   * **URL:** `https://nominatim.openstreetmap.org/reverse`
   * **Purpose:** Performs reverse coordinates lookup to display real-time current location labels.

### Google Gemini API
* **Base URL:** Managed internally by `@google/genai` Node.js client SDK.
* **Purpose:** Powers server-side astrological reading queries and remedies suggestions in the JHora Chat interface.

---

## 3. Absence of External JHora Cloud Run Base URL
There are **NO** external Jagannatha Hora calculation API endpoints (such as `https://jagannatha-hora-*.run.app`) configured or present in any file in this repository. 
* All calculations are hosted locally on our Express server at `http://localhost:3000` inside `server.ts` or executed in `src/lib/astrology.ts`.
