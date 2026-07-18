# KP API Mapping Specification (Phase 13)

This document outlines how the Express gateway endpoints map request payloads, forward them to the configured KP provider REST API, and transform responses.

## Gateway REST Endpoints

All internal requests are dispatched from the client to the `/api/kp/*` gateway to avoid exposing API keys or secrets in client browsers.

| Express Endpoint | Method | Provider Route | Description |
|---|---|---|---|
| `/api/kp/health` | `GET` | `/health` or `/kp/cusps` | Handshake verifying provider availability. |
| `/api/kp/chart` | `POST` | `/kp/chart` | Fetches coordinate points and house positions. |
| `/api/kp/cusps` | `POST` | `/kp/cusps` | Calculates house cusp longitudes (1st to 12th). |
| `/api/kp/starlords` | `POST` | `/kp/starlords` | Resolves planetary and cusp Nakshatra lords. |
| `/api/kp/sublords` | `POST` | `/kp/sublords` | Resolves planetary and cusp Sub lords. |
| `/api/kp/significators` | `POST` | `/kp/planet_significators` & `/kp/house_significators` | Calculates planet & house significator levels (1-4). |
| `/api/kp/dasha` | `POST` | `/kp/dasha` | Calculates Vimshottari Mahadasha/Antardasha intervals. |
| `/api/kp/transit` | `POST` | `/kp/transit` | Returns transit planet positions for a target date. |
| `/api/kp/horary` | `POST` | `/kp/horary` | Resolves horary map based on numbers 1-249. |

---

## Standard Payload Contract

Every proxy endpoint expects a consistent JSON request body matching the `KPParams` structure:

```json
{
  "date": "2026-07-15",
  "time": "10:48:00",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5,
  "place": "New Delhi, India",
  "horaryNumber": 108,
  "question": "Will I succeed in the current venture?",
  "targetDate": "2026-08-01"
}
```

## Mapping Example: Cusps Calculation

### 1. Request Flow
The frontend makes a POST call to `/api/kp/cusps`. The payload is normalized by the server's `parseKpParams` helper.

### 2. Provider Request Dispatch
`VedicAstroProvider` translates this payload into the provider format (e.g. mapping `latitude` to `lat`, `longitude` to `lon`, and `timezone` to `tz`) and sends it to `${KP_BASE_URL}/kp/cusps`.

### 3. Response Transformation
The raw payload returned by the provider is mapped by the static `KpMapper.toKpCuspData` method:

```typescript
// Transform loop within KpMapper
const cusps: KpCuspDetail[] = (raw.cusps || raw.houses || []).map((c: any) => ({
  houseNumber: Number(c.house_number || c.number || c.house || 1),
  longitude: Number(c.longitude || 0),
  degree: Number(c.degree || 0) % 30,
  sign: c.sign || c.zodiac_sign || "Aries",
  starLord: c.star_lord || c.nakshatra_lord || "Unknown",
  subLord: c.sub_lord || "Unknown",
  subSubLord: c.sub_sub_lord || "Unknown"
}));
```

The resulting clean object is cached and sent to the client as a standardized JSON structure.
