# VedicAstro API Endpoint & Payload Map
This document maps out the REST API interface exposed by the `VedicAstroAPI.py` service. It defines the endpoint URLs, HTTP methods, request schemas (with valid parameters), and the exact JSON response structures.

---

## 1. REST Endpoint Summary

| Route | Method | Payload | Description |
|---|---|---|---|
| `/` | `GET` | *None* | Service health check and welcome message. |
| `/get_all_horoscope_data` | `POST` | `ChartInput` (JSON) | Generates full natal or event chart details, house cusps, significators, Vimshottari dasha tables, and aspects. |
| `/get_all_horary_data` | `POST` | `HoraryChartInput` (JSON) | Finds the exact time on a day when the Ascendant hits a specific horary subdivision (1-249) and calculates the full KP horary chart. |

---

## 2. Request Schemas (Pydantic Models)

### A. `ChartInput` (Natal / Event Charts)
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

#### Field Specifications:
*   **`year`** (int, Required): Birth/event year (e.g. `1995`).
*   **`month`** (int, Required): Birth/event month (`1` to `12`).
*   **`day`** (int, Required): Birth/event day (`1` to `31`).
*   **`hour`** (int, Required): Local birth/event hour (`0` to `23`).
*   **`minute`** (int, Required): Local birth/event minute (`0` to `59`).
*   **`second`** (int, Required): Local birth/event second (`0` to `59`).
*   **`utc`** (string, Required): UTC offset string. MUST start with `+` or `-` followed by `HH:MM` format (e.g. `"+05:30"`, `"-04:00"`).
*   **`latitude`** (float, Required): Geocentric latitude ($-90.0$ to $90.0$).
*   **`longitude`** (float, Required): Geocentric longitude ($-180.0$ to $180.0$).
*   **`ayanamsa`** (string, Optional, Default: `"Lahiri"`): Sidereal ayanamsa to shift coordinates. Supported values:
    *   `"Lahiri"`, `"Lahiri_1940"`, `"Lahiri_VP285"`, `"Lahiri_ICRC"`
    *   `"Raman"`
    *   `"Krishnamurti"`, `"Krishnamurti_Senthilathiban"`
*   **`house_system`** (string, Optional, Default: `"Equal"`): House cusp system to partition the zodiac. Supported values:
    *   `"Placidus"` *(Strongly recommended for KP system)*
    *   `"Equal"`, `"Equal 2"`, `"Whole Sign"`
*   **`return_style`** (string, Optional, Default: `null`): Customizes consolidated chart format. Supported values: `null` or `"dataframe_records"`.

---

### B. `HoraryChartInput` (KP Horary 1-249)
```json
{
  "horary_number": 34,
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

#### Field Specifications:
*   **`horary_number`** (int, Required): KP Horary number selection. MUST be between `1` and `249` (boundaries correspond to the starting longitudes of the 249 sublords).
*   Other fields (`year`, `month`, `day`, `hour`, `minute`, `second`, `utc`, `latitude`, `longitude`, `ayanamsa`, `house_system`, `return_style`) are identical to `ChartInput` and represent the space-time anchor of the astrologer answering the question.

---

## 3. Response Schemas (JSON Output)

Both POST endpoints return a unified JSON payload with the following top-level keys:

```json
{
  "planets_data": [...],
  "houses_data": [...],
  "planet_significators": [...],
  "planetary_aspects": [...],
  "house_significators": [...],
  "vimshottari_dasa_table": {...},
  "consolidated_chart_data": {...}
}
```

### A. `planets_data`
An array of objects containing the astrological details of the 9 standard planets (plus Uranus, Neptune, Pluto) and the **Ascendant (`Asc`)** at index `0`.
```json
{
  "Object": "Asc",
  "Rasi": "Sagittarius",
  "isRetroGrade": null,
  "LonDecDeg": 242.067,
  "SignLonDMS": "02:04:02",
  "SignLonDecDeg": 2.0672,
  "LatDMS": null,
  "Nakshatra": "Mula",
  "RasiLord": "Jupiter",
  "NakshatraLord": "Ketu",
  "SubLord": "Ketu",
  "SubSubLord": "Venus",
  "HouseNr": 1
}
```

### B. `houses_data`
An array of 12 objects mapping the exact cusps (boundaries) of all 12 houses.
```json
{
  "Object": "I",
  "HouseNr": 1,
  "Rasi": "Sagittarius",
  "LonDecDeg": 242.067,
  "SignLonDMS": "02:04:02",
  "SignLonDecDeg": 2.0672,
  "DegSize": 30.22,
  "Nakshatra": "Mula",
  "RasiLord": "Jupiter",
  "NakshatraLord": "Ketu",
  "SubLord": "Ketu",
  "SubSubLord": "Venus"
}
```

### C. `planet_significators` (KP ABCD Table)
FastAPI serializes these as arrays of arrays (since they are NamedTuples without `_asdict()` conversions):
*   **Schema:** `[Planet, A, B, [C], [D]]`
```json
[
  ["Sun", 8, 9, [1, 10], [9]],
  ["Moon", 9, 8, [12], [8]],
  ["Mars", 12, 1, [5, 12], [1, 5]]
]
```

### D. `house_significators` (KP ABCD Table)
*   **Schema:** `[House, [A], [B], [C], D]`
```json
[
  ["I", ["Mars", "Sun"], ["Asc"], ["Jupiter"], "Jupiter"],
  ["II", ["Saturn"], ["Mercury"], ["Venus"], "Saturn"]
]
```

### E. `planetary_aspects`
```json
[
  {
    "P1": "Sun",
    "P2": "Moon",
    "AspectType": "Trine",
    "AspectDeg": 120,
    "AspectOrb": 1.25,
    "P1_Lon": 120.45,
    "P2_Lon": 241.70,
    "LonDiff": 121.25
  }
]
```

### F. `vimshottari_dasa_table`
A deeply nested JSON timeline representing the Vimshottari Mahadashas and their respective 9 Bhuktis:
```json
{
  "Ketu": {
    "start": "15-08-1995",
    "end": "12-10-1998",
    "bhuktis": {
      "Ketu": { "start": "15-08-1995", "end": "09-01-1996" },
      "Venus": { "start": "09-01-1996", "end": "10-03-1997" }
    }
  },
  "Venus": {
    "start": "12-10-1998",
    "end": "12-10-2018",
    "bhuktis": {
      "Venus": { "start": "12-10-1998", "end": "11-02-2002" }
    }
  }
}
```

### G. `consolidated_chart_data` (Default: grouped by Rasi)
```json
{
  "Sagittarius": {
    "Asc": {
      "is_Retrograde": null,
      "LonDecDeg": 242.067,
      "SignLonDMS": "02:04:02",
      "SignLonDecDeg": 2.0672
    },
    "Jupiter": {
      "is_Retrograde": false,
      "LonDecDeg": 245.22,
      "SignLonDMS": "05:13:12",
      "SignLonDecDeg": 5.22
    }
  }
}
```

---

## 4. REST API cURL Examples

### Example 1: Generate Natal Horoscope Data
```bash
curl -X 'POST' \
  'http://localhost:8088/get_all_horoscope_data' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
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
  "house_system": "Placidus"
}'
```

### Example 2: Generate KP Horary Chart (Seed 108)
```bash
curl -X 'POST' \
  'http://localhost:8088/get_all_horary_data' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
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
  "ayanamsa": "Krishnamurti"
}'
```
