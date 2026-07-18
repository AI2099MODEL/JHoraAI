# Execution Trace: Cast Horoscope Pipeline
**Date:** July 15, 2026
**Subject:** Precise step-by-step trace from "Calculate Horoscope" click to screen rendering.

This trace maps the entire execution flow, including functions, files, input parameters, and output schemas.

---

## Step 1: User Form Submission
* **Trigger:** User clicks the **"Calculate Horoscope"** button in the UI.
* **Component:** `src/App.tsx` (Root App Component)
* **Function:** `handleCalculate(isInitial = false)`
* **Input State:** `inputs` object
  ```json
  {
    "name": "Native",
    "date": "1995-10-15",
    "time": "08:30",
    "location": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5
  }
  ```

---

## Step 2: Client-to-Server Network Request
* **Trigger:** `handleCalculate` executes an asynchronous `fetch` call.
* **File/Location:** `src/App.tsx`
* **HTTP Method:** `POST`
* **URL:** `/api/astrology/calculate`
* **Request Payload (JSON):**
  ```json
  {
    "name": "Native",
    "date": "1995-10-15",
    "time": "08:30",
    "location": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": 5.5
  }
  ```

---

## Step 3: Backend API Endpoint Execution
* **Receiver:** Express server route handler.
* **File/Location:** `server.ts`
* **Endpoint:** `app.post("/api/astrology/calculate")`
* **Processing:**
  1. Extract parameters from `req.body`.
  2. Parse string parameters to floats and normalize.
  3. Invoke the main calculation function: `calculateAstrology(...)` in the math module.
* **Function Call:**
  ```typescript
  calculateAstrology(
    name: "Native",
    date: "1995-10-15",
    time: "08:30:00",
    location: "New Delhi, India",
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5
  )
  ```

---

## Step 4: Astrological Calculations
* **File/Location:** `src/lib/astrology.ts`
* **Function:** `calculateAstrology(...)`
* **Execution steps:**
  1. **Ayanamsa Offset calculation:** Determines Lahiri/Chitra Paksha offset (approx. 24.152°).
  2. **Sidereal Longitudes:** Computes orbital longitudes of 9 planets + Lagna (Ascendant) based on J2000 epoch and Keplerian approximations.
  3. **House Placement:** Identifies house placement (1 to 12) for each planet based on Equal House/Sripati divisions from the Lagna.
  4. **Divisional Chart Placements (D1 and D9):** Calculates Rasi (D1) and Navamsa (D9) matrices based on planet and Lagna zodiac positions.
  5. **Vimshottari Dasha periods:** Calculates 120-year timeline starting from the Moon's natal Nakshatra and elapsed longitude.
  6. **Yoga & Dosha analysis:** Evaluates planet conjuncts and house configurations (Gaja Kesari, Ruchaka, Manglik, Kaal Sarp, Sade Sati).
* **Return Value:** `AstrologyData` domain object.

---

## Step 5: Backend Response Transmission
* **Sender:** Express Route Handler (`server.ts`)
* **HTTP Status:** `200 OK`
* **Response Payload:** Clean JSON structure representing `AstrologyData`.

---

## Step 6: Client-Side State Synchronization & Offline Cache Persistence
* **File/Location:** `src/App.tsx` (Inside `handleCalculate` callback)
* **Actions:**
  1. Update state variable: `setAstrologyData(result)` which triggers a React re-render.
  2. Persist in LocalStorage: `localStorage.setItem("jhora_astrology_data", JSON.stringify(result))` (used for persistent tabs on reload).
  3. Cache in Offline Database: Invokes `saveCachedHoroscope(...)` defined in `src/lib/indexedDb.ts` to sync data with the IndexedDB cache (simulating local Room database mappings).

---

## Step 7: Screen Rendering
* **Component:** `src/App.tsx` (Parent Controller) and its modular sub-components.
* **Sub-components updated with parsed data:**
  * **Dashboard Overview:** Displays Nakshatra, Pada, Ascendant degree, and quick indicators.
  * **Birth Chart Canvas (`src/components/AstroChart.tsx`):** Draws interactive North-Indian style SVG diagrams for Rasi (D1) and Navamsa (D9) divisional charts.
  * **Dasha Timeline (`src/components/DashaTree.tsx`):** Renders the Vimshottari Mahadasha and Antardasha nested accordion table.
  * **Yogas & Doshas List:** Populates presence/absence indicators and qualitative explanation strings on screen.
