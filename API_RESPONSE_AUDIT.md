# API Response Audit: Horoscope Payload Analysis
**Date:** July 15, 2026
**Subject:** Complete schema analysis of JHora API response payloads.

---

## 1. Raw API Payload Verification (`/api/jhora/horoscope`)
We executed an offline validation curl against `/api/jhora/horoscope` to verify its top-level and nested structure.

### Request Body Sent
```json
{
  "date": "1995-10-15",
  "time": "08:30:00",
  "place": "New Delhi",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timezone": 5.5
}
```

### Complete Top-Level Keys Returned
The API returns exactly two top-level keys:
1. **`birth_details`**
2. **`horoscope`**

### Complete Audit of Nested Keys under `horoscope`
* **`calendar_info`** (Valid - Returns `tithi`, `nakshatra`, `yoga`, `karana`)
* **`ayanamsa_value`** (Valid - Float offset value)
* **`julian_day`** (Valid - Float/Integer index)
* **`sphuta`** (Valid - Longitudes, Degrees, Sign, House, Strength, and Nakshatras for all planets)
* **`divisional_charts`** (Valid - Returns `D1` and `D9` matrices)
* **`nakshatra_pada`** (Valid - Text representation of nakshatra + padas)
* **`yogas`** (Valid - Map containing active planetary conjunction analysis)
* **`doshas`** (Valid - List of active dosha strings)

---

## 2. 🚨 Critical Finding: Missing Dasha Systems
We performed a deep check for the following keys in `/api/jhora/horoscope` and `/api/astrology/calculate`:

* **`vimshottari`**: **Does NOT exist** in the raw response of the `/api/jhora/horoscope` endpoint.
* **`yogini`**: **Does NOT exist** in the raw response of either endpoint.
* **`ashtottari`**: **Does NOT exist** in the raw response of either endpoint.

---

## 3. Discrepancy Assessment
* **Public API Omissions:** The running API service lacks properties for any dasha systems inside the standard horoscope envelope.
* **Fallback Limitation:** The client UI relies on `/api/astrology/calculate` (which runs local formulas on the server side) to generate the Vimshottari dasha tree, which deviates from official Swiss Ephemeris calculations.
* **Documentation Ambiguity:** There is no evidence in the API response or schema that Yogini and Ashtottari are currently supported by the public API layers of this deployment.
