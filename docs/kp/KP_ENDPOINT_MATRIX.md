# KP Endpoint Matrix Specification (Phase 16)

This matrix maps out every KP REST endpoint integrated within our full-stack architecture, including their request parameters and target mapping functions.

## Endpoint Mapping Overview

| Client Route (Express Proxy) | Provider Endpoint (FastAPI Microservice) | HTTP Method | Request Payload Params | Domain Model Target |
| :--- | :--- | :---: | :--- | :--- |
| `/api/kp/chart` | `/kp/chart` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpChart` |
| `/api/kp/cusps` | `/kp/cusps` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpCuspData` |
| `/api/kp/starlords` | `/kp/starlords` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpStarLords` |
| `/api/kp/sublords` | `/kp/sublords` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpSubLords` |
| `/api/kp/subsublords` | `/kp/subsublords` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpSubSubLords` |
| `/api/kp/planet-significators`| `/kp/planet_significators` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpPlanetSignificators`|
| `/api/kp/house-significators` | `/kp/house_significators` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpHouseSignificators` |
| `/api/kp/ruling-planets` | `/kp/ruling_planets` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpRulingPlanetsData` |
| `/api/kp/dasha` | `/kp/dasha` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `place` | `KpDashaData` |
| `/api/kp/transit` | `/kp/transit` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `target_date`| `KpTransitDetails` |
| `/api/kp/horary` | `/kp/horary` | `POST` | `date`, `time`, `lat`, `lon`, `tz`, `horary_number`, `question` | `KpHoraryDetails` |
| `/api/kp/health` | `/health` | `GET` | *None* | `boolean` status probe |

---

## Response Verification Notes

1. **Proxy Path Separation**: All outgoing requests are safely proxied through our Node.js container backend (`server.ts`) to hide any third-party credentials.
2. **Payload Safety**: Responses from `/api/kp/*` match our strict TypeScript specifications (`KpModels.ts`) before being ingested by React.
