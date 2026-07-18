# VedicAstro JSON Response Samples
This document catalogs real JSON structures returned by the VedicAstro endpoints, providing clear templates and validation targets.

---

## 1. `/get_all_horoscope_data` JSON Structure

```json
{
  "planets_data": [
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
    },
    {
      "Object": "Sun",
      "Rasi": "Leo",
      "isRetroGrade": false,
      "LonDecDeg": 120.45,
      "SignLonDMS": "00:27:00",
      "SignLonDecDeg": 0.45,
      "LatDMS": "00:00:00",
      "Nakshatra": "Magha",
      "RasiLord": "Sun",
      "NakshatraLord": "Ketu",
      "SubLord": "Venus",
      "SubSubLord": "Moon",
      "HouseNr": 9
    }
  ],
  "houses_data": [
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
  ],
  "planet_significators": [
    ["Sun", 8, 9, [1, 10], [9]],
    ["Moon", 9, 8, [12], [8]],
    ["Mars", 12, 1, [5, 12], [1, 5]]
  ],
  "planetary_aspects": [
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
  ],
  "house_significators": [
    ["I", ["Mars", "Sun"], ["Asc"], ["Jupiter"], "Jupiter"],
    ["II", ["Saturn"], ["Mercury"], ["Venus"], "Saturn"]
  ],
  "vimshottari_dasa_table": {
    "Ketu": {
      "start": "15-08-1995",
      "end": "12-10-1998",
      "bhuktis": {
        "Ketu": { "start": "15-08-1995", "end": "09-01-1996" },
        "Venus": { "start": "09-01-1996", "end": "10-03-1997" }
      }
    }
  },
  "consolidated_chart_data": {
    "Sagittarius": {
      "Asc": {
        "is_Retrograde": null,
        "LonDecDeg": 242.067,
        "SignLonDMS": "02:04:02",
        "SignLonDecDeg": 2.0672
      }
    }
  }
}
```

---

## 2. Field Interpretations

### A. KP ABCD Significators Format
*   **Planet Significators Structure:**
    *   `[PlanetName, A, B, [C], [D]]`
    *   **A**: House occupied by the planet's Star Lord.
    *   **B**: House occupied by the planet itself.
    *   **C**: Houses owned by the planet's Star Lord.
    *   **D**: Houses owned by the planet itself.

*   **House Significators Structure:**
    *   `[HouseRomanNumeral, [A], [B], [C], D]`
    *   **A**: Planets whose Star Lord is in this house.
    *   **B**: Planets occupying this house.
    *   **C**: Planets whose Star Lord is the Rasi Lord of this house.
    *   **D**: The Rasi Lord of this house.

---

## 3. Empty Response Structure
In case of catastrophic errors, the server returns standard HTTP error structures (FastAPI default):
```json
{
  "detail": [
    {
      "loc": ["body", "year"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```
This ensures complete compatibility with standard frontend validation frameworks.
