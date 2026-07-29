# VedicAstro OpenAPI Endpoints Specification
This document provides the technical specification of the REST API interface exposed by the VedicAstro FastAPI service.

---

## 1. REST Endpoint Summary

| HTTP Method | Route | Request Schema | Response Schema | Description |
|---|---|---|---|---|
| **`GET`** | `/` | *None* | Plain JSON object | Service health check & welcome message. |
| **`POST`** | `/get_all_horoscope_data` | `ChartInput` (JSON) | Complete Horoscope JSON | Calculates planetary and house coordinates, planet and house wise significators, aspects, and Vimshottari Dasha. |
| **`POST`** | `/get_all_horary_data` | `HoraryChartInput` (JSON)| Complete Horary JSON | Finds the exact time when the Ascendant matches a horary number (1-249) for a given date, then calculates full chart data. |

---

## 2. Request Data Schemas (JSON Parameters)

### A. `ChartInput` (Natal / Event Calculations)
Used to calculate traditional natal horoscopes, transits, and general event charts.
```json
{
  "year": 1995,
  "month": 8,
  "day": 15,
  "hour": 17,
  "minute": 30,
  "second": 0,
  "utc": "+05:30",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "ayanamsa": "Krishnamurti",
  "house_system": "Placidus",
  "return_style": null
}
```

#### Schema Specifications:
*   **`year`** (integer, Required): Birth or event year (e.g., `1995`).
*   **`month`** (integer, Required): Month of the year (`1` to `12`).
*   **`day`** (integer, Required): Day of the month (`1` to `31`).
*   **`hour`** (integer, Required): Local 24-hour hour (`0` to `23`).
*   **`minute`** (integer, Required): Local minute (`0` to `59`).
*   **`second`** (integer, Required): Local second (`0` to `59`).
*   **`utc`** (string, Required): UTC offset string. MUST start with `+` or `-` followed by `HH:MM` (e.g., `"+05:30"`, `"-04:00"`).
*   **`latitude`** (float, Required): Latitude coordinate of the location ($-90.0$ to $90.0$).
*   **`longitude`** (float, Required): Longitude coordinate of the location ($-180.0$ to $180.0$).
*   **`ayanamsa`** (string, Optional, Default: `"Lahiri"`): Sidereal ayanamsa correction mode. Supported values:
    *   `"Lahiri"`, `"Lahiri_1940"`, `"Lahiri_VP285"`, `"Lahiri_ICRC"`
    *   `"Raman"`
    *   `"Krishnamurti"`, `"Krishnamurti_Senthilathiban"`
*   **`house_system`** (string, Optional, Default: `"Equal"`): House cusp math system. Supported values:
    *   `"Placidus"` *(Strongly recommended for KP Astrology)*
    *   `"Equal"`, `"Equal 2"`, `"Whole Sign"`
*   **`return_style`** (string, Optional, Default: `null`): Set to `"dataframe_records"` to structure `consolidated_chart_data` differently.

---

### B. `HoraryChartInput` (KP Horary 1-249 Calculations)
Used to calculate the exact astronomical moment corresponding to an astrologer's horary question seed.
```json
{
  "horary_number": 108,
  "year": 2026,
  "month": 7,
  "day": 15,
  "hour": 9,
  "minute": 0,
  "second": 0,
  "utc": "+05:30",
  "latitude": 11.0168,
  "longitude": 76.9558,
  "ayanamsa": "Krishnamurti",
  "house_system": "Placidus",
  "return_style": null
}
```

#### Schema Specifications:
*   **`horary_number`** (integer, Required): Horary seed selection. MUST be between `1` and `249` inclusive.
*   Other parameters are identical to `ChartInput` and serve as the space-time anchor from which the search for the exact Ascendant begins.

---

## 3. Response JSON Structure

The JSON payload returned by both endpoints is identical and structured under 7 keys:
```json
{
  "planets_data": [ ... ],
  "houses_data": [ ... ],
  "planet_significators": [ ... ],
  "planetary_aspects": [ ... ],
  "house_significators": [ ... ],
  "vimshottari_dasa_table": { ... },
  "consolidated_chart_data": { ... }
}
```

Detailed definitions of these sub-objects are fully cataloged in **`VEDICASTRO_JSON_SAMPLES.md`**.
