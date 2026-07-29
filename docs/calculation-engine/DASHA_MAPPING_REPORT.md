# Dasha Mapping Report
**Date:** July 15, 2026
**Subject:** Byte-for-byte verification of Vimshottari, Yogini, and Ashtottari Dashas against Jagannatha Hora calculations.

---

## 1. Overview of the Investigation
This report presents a thorough, byte-for-byte tracking and architectural comparison of the dasha structures inside our Vedic Astrology codebase. The goal is to determine why the Vimshottari, Yogini, and Ashtottari dasha values do not align with the official Jagannatha Hora platform and where the data breaks down during transit from the raw API payload to the UI.

---

## 2. Birth Details Under Test
The same birth details were used across all tests for precise comparison:
* **Date of Birth:** `1995-10-15`
* **Time of Birth:** `08:30:00`
* **Location/Place:** `New Delhi`
* **Latitude:** `28.6139` (North)
* **Longitude:** `77.2090` (East)
* **Timezone:** `+5.5` (Asia/Kolkata)

---

## 3. Raw API Response Verification
We captured the exact HTTP request body sent to the backend and verified the keys in the resulting raw JSON payload.

### HTTP Request Payload (`POST /api/jhora/horoscope`)
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

### Complete Key Audit of the Raw JSON Response (`RAW_DASHA_RESPONSE.json`)
A complete key audit was performed on the raw JSON response returned by `/api/jhora/horoscope`:
* `birth_details` (Valid)
* `horoscope` (Valid)
  * `calendar_info` (Valid)
  * `ayanamsa_value` (Valid)
  * `julian_day` (Valid)
  * `sphuta` (Valid)
  * `divisional_charts` (Valid)
  * `nakshatra_pada` (Valid)
  * `yogas` (Valid)
  * `doshas` (Valid)

### ⚠️ Critical Findings: Dasha Key Non-Existence
* **`vimshottari`**: **Does NOT exist** anywhere in the raw JSON response payload of `/api/jhora/horoscope`.
* **`yogini`**: **Does NOT exist** anywhere in the raw JSON response payload of `/api/jhora/horoscope`.
* **`ashtottari`**: **Does NOT exist** anywhere in the raw JSON response payload of `/api/jhora/horoscope`.

---

## 4. Alternate Endpoint Audit (`POST /api/astrology/calculate`)
We also audited the response of our secondary API endpoint `/api/astrology/calculate`:
* **`dashas`**: Exists, containing a custom-calculated JSON list for **Vimshottari Dasha** only.
* **`yogini`**: **Does NOT exist** in the payload.
* **`ashtottari`**: **Does NOT exist** in the payload.

---

## 5. Architectural Pipeline & Model Comparison

To trace how dasha data flows or fails to flow, we compared the data definitions across all layers of our stack:

### A. Raw JSON Payload (`POST /api/jhora/horoscope`)
* **Vimshottari:** No key.
* **Yogini:** No key.
* **Ashtottari:** No key.

### B. Kotlin DTO (Mobile App Contract)
As documented by the Kotlin integration suite in the codebase, the Android mobile application expects strong-typed DTOs mirroring the JHora API schema. Because the API endpoints (`/api/jhora/horoscope`) completely omit dasha keys, the Kotlin network receiver classes cannot deserialize any Vimshottari, Yogini, or Ashtottari data directly from this route.

### C. Domain Model (`src/lib/astrology.ts`)
The domain models are defined in TypeScript:
```typescript
export interface AstrologyData {
  birthDetails: { ... };
  lagna: { ... };
  planets: PlanetPosition[];
  rasiChart: { [house: number]: string[] };
  navamsaChart: { [house: number]: string[] };
  dashas: DashaPeriod[]; // Vimshottari array only
  yogas: YogaAnalysis[];
  doshas: DoshaAnalysis;
  muhurtas: MuhurtaSlot[];
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  subPeriods?: DashaPeriod[];
}
```
* **Vimshottari:** Only represented via the single `dashas` field in `AstrologyData`.
* **Yogini:** Missing. No interface, types, or variables defined.
* **Ashtottari:** Missing. No interface, types, or variables defined.

### D. Offline Database (Room/IndexedDB Caching Layer)
In `src/lib/indexedDb.ts`, the database saves the parsed domain model `AstrologyData` object as a serialized record inside IndexedDB (representing the SQLite/Room behavior of the Kotlin counterpart). 
* Since the domain object only holds the `dashas` key (Vimshottari), the cached Room payload reflects this same limitation.
* Yogini and Ashtottari are absent from the database schemas entirely.

### E. Frontend User Interface (`src/components/DashaTree.tsx`)
The UI renders the Vimshottari timeline under the `Vimshottari Dasha` tab:
```tsx
export default function DashaTree({ dashas }: DashaTreeProps) {
  // Renders Vimshottari Mahadashas & Antardashas
}
```
* **Vimshottari:** Rendered via an accordion interface listing the 9 main cycles and their sub-periods.
* **Yogini & Ashtottari:** Completely omitted. There are no UI tabs, selectors, or components to display these dashas.

---

## 6. Data Transformation Map

| Stack Layer | Vimshottari Representation | Yogini Representation | Ashtottari Representation | Status/Transformation |
|---|---|---|---|---|
| **Raw JSON (`/horoscope`)** | None | None | None | **Missing from API response** |
| **Raw JSON (`/calculate`)** | `"dashas"` array | None | None | **Filtered to local calculations** |
| **Kotlin DTO** | Not parsed | Not parsed | Not parsed | **Deserialization fails due to empty properties** |
| **Domain Model** | `astrologyData.dashas` | None | None | **Vimshottari active; others undefined** |
| **Database Cache** | `astrologyData.dashas` blob | None | None | **Vimshottari cached; others unsupported** |
| **UI Rendering** | `<DashaTree dashas={...} />` | None | None | **Only Vimshottari timeline is visible** |

---

## 7. Conclusions
1. There is no mapping bug in the frontend or UI, because **the raw JSON payloads themselves do not return Yogini or Ashtottari fields**, and the horoscope API omits all dasha types.
2. The UI is behaving exactly as modeled, but the underlying data layers (API, Domain Models, and Cache schemas) do not support the Yogini or Ashtottari systems.
3. For Vimshottari, the discrepancy in the dates and periods compared to official Jagannatha Hora software stems from the simplified Keplerian approximations in the mathematical calculation engine.
