# Data Flow Diagram
**Date:** July 15, 2026
**Subject:** High-level visualization of data transit through the JHora client-server stack.

---

## 1. High-Level Architecture Flow

```
+--------------------------------------------------------------+
|                        USER INTERFACE                        |
|   (src/App.tsx, src/components/*, src/lib/indexedDb.ts)     |
+------------------------------+-------------------------------+
                               |
                   HTTP POST   |   /api/astrology/calculate
                               v
+--------------------------------------------------------------+
|                     EXPRESS API GATEWAY                      |
|                         (server.ts)                          |
+------------------------------+-------------------------------+
                               |
            Function Call      |   calculateAstrology(...)
                               v
+--------------------------------------------------------------+
|                  CORE ASTROLOGY CALCULATOR                   |
|                    (src/lib/astrology.ts)                    |
+--------------------------------------------------------------+
```

---

## 2. Layer-by-Layer Data Mapping

### A. Raw JSON Payload
This is the raw HTTP request body transmitted across the network:
* **Key Fields:** `date`, `time`, `latitude`, `longitude`, `timezone`, `location`, `name`

### B. Kotlin-Aligned Horoscope Response (`/api/jhora/horoscope`)
The server exposes an endpoint mimicking the exact contract requested by the Kotlin mobile app:
* **`birth_details`**: `{ name, date, time, place, latitude, longitude, timezone }`
* **`horoscope`**:
  * **`calendar_info`**: `{ tithi, nakshatra, yoga, karana }`
  * **`ayanamsa_value`**: `24.152`
  * **`sphuta`**: Mapping of planets to `{ longitude, sign, degree, nakshatra, pada, house, strength }`
  * **`divisional_charts`**: `{ D1, D9 }`
  * **`nakshatra_pada`**: `{ Planet: "Nakshatra (Pada X)" }`
  * **`yogas`**: `{ yoga_list: { YogaName: { name, type, description, isPresent, explanation } } }`
  * **`doshas`**: List of present Dosha names.

### C. Client Domain Model (`src/lib/astrology.ts`)
The TypeScript interface representation used to manage state inside the React client:
* **`AstrologyData`**:
  * `birthDetails`
  * `lagna`: `{ sign, degree, signIndex }`
  * `planets`: Array of planet metadata.
  * `rasiChart`: `{ [house]: string[] }`
  * `navamsaChart`: `{ [house]: string[] }`
  * `dashas`: `DashaPeriod[]` (Vimshottari only)
  * `yogas`
  * `doshas`
  * `muhurtas`

### D. Offline Database Schema (IndexedDB Caching)
The client-side storage table maps structural SQLite concepts to browser key-value object stores:
* **Store Name:** `horoscopes`
* **Key Path:** `id` (Auto-generated UUID)
* **Index Keys:** Composite lookup on `date`, `time`, `latitude`, `longitude`.
* **Payload Saved:** Complete `AstrologyData` serialized BLOB.
