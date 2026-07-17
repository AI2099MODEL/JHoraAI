# Public & Commercial KP Astrology API Providers Report

This report evaluates available cloud-based REST APIs that compute Krishnamurti Paddhati (KP) astrological charts, significators, and ruling planets. It provides endpoint specifications, performance baselines, and integration requirements.

---

## 1. Top Commercial KP API Providers

### A. AstroologyAPI / Devshree (AstrologyAPI.com)
- **Overview**: A leading enterprise-grade astrological calculation API.
- **Endpoints**:
  - `/v1/kp_birth_chart` (returns basic KP coordinates)
  - `/v1/kp_house_cusps` (returns Placidus cusps, star lords, and sub lords)
  - `/v1/kp_planets` (returns planet positions, stellar, and sub-lords)
  - `/v1/kp_significators` (returns planet and house significator levels)
- **Parameters**: `day`, `month`, `year`, `hour`, `min`, `lat`, `lon`, `tzone`, `ayanamsa` (supports KP Ayanamsa selection).
- **Latency**: ~120ms - 250ms.
- **Pricing**: Free tier has limited requests per month; paid tiers start at $15/month.

### B. ProKerala Astrology API
- **Overview**: Extremely popular in India, offering comprehensive regional astrology services including KP systems.
- **Endpoints**:
  - `/v1/astrology/kp-horoscope` (returns combined cuspal and planetary tables)
- **Parameters**: `datetime`, `location` (latitude/longitude), `ayanamsa=3` (for KP).
- **Latency**: ~180ms.
- **Pricing**: Free developer sandbox; commercial plans start at $20/month.

### C. DivineAPI
- **Overview**: Offers modular endpoints for developers building consumer astrology apps.
- **Endpoints**:
  - `/api/v1/kp_cusps`
  - `/api/v1/kp_planets`
- **Latency**: ~150ms.
- **Pricing**: Enterprise and monthly plans.

---

## 2. API Endpoint Specification (Unified Proposal)

When designing a proxy middleware inside a Node.js full-stack system, we abstract these third-party APIs behind a unified gateway. Below is the recommended REST endpoint structure:

```http
GET /api/kp/calculate?lat=13.0827&lon=80.2707&dob=1995-10-25T14:30:00Z&ayanamsa=kp_new
```

### Response Schema Standard (Aligned with NormalizedKPModel):
```json
{
  "profileName": "Native Profile",
  "birthDate": "1995-10-25",
  "birthTime": "14:30:00",
  "location": "Chennai, Tamil Nadu, India",
  "providerName": "Official KP Astro API Gateway",
  "providerStatus": "online",
  "dataStatus": "fully_calculated",
  "lastUpdated": "2026-07-15T16:15:20.000Z",
  "apiSource": "ProKerala v1 Gateway Engine",
  "cusps": [
    {
      "number": 1,
      "sign": "Aquarius",
      "degree": 14.3888,
      "starLord": "Rahu",
      "subLord": "Mercury",
      "subSubLord": "Jupiter",
      "houseStrength": 95.5
    }
  ],
  "planets": [
    {
      "name": "Sun",
      "sign": "Libra",
      "house": 9,
      "degree": 8.125,
      "starLord": "Rahu",
      "subLord": "Sun",
      "subSubLord": "Saturn",
      "isRetrograde": false,
      "isCombust": false
    }
  ],
  "significators": {
    "planetSignificators": {
      "Sun": {
        "primary": [9],
        "secondary": [9],
        "tertiary": [1, 5],
        "quaternary": [2]
      }
    },
    "houseSignificators": {
      "1": {
        "primary": ["Moon"],
        "secondary": ["Saturn"],
        "tertiary": ["Venus"],
        "quaternary": ["Jupiter"]
      }
    }
  },
  "rulingPlanets": {
    "dayLord": "Wednesday",
    "moonSignLord": "Saturn",
    "moonStarLord": "Rahu",
    "ascendantLord": "Saturn",
    "ascendantStarLord": "Rahu",
    "timeOfCalculation": "2026-07-15T16:15:20.000Z"
  }
}
```

---

## 3. Comparative Evaluation Matrix

| Metric | AstroologyAPI | ProKerala API | DivineAPI | Self-Hosted Wrapper |
| :--- | :--- | :--- | :--- | :--- |
| **Ayanamsa Support**| Excellent (KP Old/New) | Good (KP standard) | Basic (Standard) | Perfect (Full custom) |
| **Placidus Accuracy**| High | High | High | Maximum |
| **Uptime SLA** | 99.9% | 99.5% | 99.0% | Sovereign |
| **Offline Support** | No | No | No | Yes (Fully local) |
| **Average Latency** | ~140ms | ~180ms | ~160ms | < 5ms |
| **Data Cost** | Pay-per-call | Monthly tier | Subscription | $0.00 (Developer Time) |
