# VedicAstro Technical Source Code Audit
**Project:** VedicAstro  
**Repository:** [github.com/diliprk/VedicAstro](https://github.com/diliprk/VedicAstro)  
**Author:** Dilip Rajkumar  
**License:** MIT License  
**Language:** Python (>= 3.11)  
**Focus:** Vedic Astrology & Krishnamurti Paddhati (KP) System  

---

## 1. Architectural Overview & Core Dependencies

VedicAstro is a highly specialized Python library designed to automate the complex calculations required by the **Krishnamurti Paddhati (KP)** system of astrology. Rather than implementing orbital mechanics from scratch, it layers KP division math, significator logic, and horary numerical solvers on top of a reliable astrometry core.

### Core Dependency Stack
1. **`pyswisseph` (v2.x / v2.10+)**: Direct Python bindings to the **Swiss Ephemeris** C library. This is the gold-standard astronomical calculation engine used for high-precision planetary coordinates (accurate to sub-arcsecond levels) and house cusp calculations.
2. **`flatlib` (specifically the `sidereal` fork from `diliprk/flatlib`)**: A traditional astrology library fork. The standard `flatlib` is Western-centric (using tropical coordinates and standard house divisions). The `sidereal` fork adds support for Hindu sidereal ayanamsas (Lahiri, Raman, Krishnamurti) and hooks them directly into `pyswisseph`.
3. **`polars` (v0.20+)**: A high-performance, Rust-backed DataFrame library. VedicAstro uses Polars instead of Pandas for loading, filtering, and manipulating KP division tables (`KP_SL_Divisions.csv`) and formatting output structures.
4. **`fastapi` & `uvicorn`**: Lightweight, modern ASGI web framework and server. These are used to expose the library's functions as high-performance, JSON-compliant REST endpoints.
5. **`timezonefinder` & `pytz`**: Automatic spatial timezone lookup. Based on latitude and longitude coordinates, it automatically resolves the IANA timezone ID and calculates exact UTC offsets for any historical date, accounting for Daylight Saving Time (DST).

---

## 2. File-by-File Technical Analysis

### A. `vedicastro/VedicAstro.py`
This is the core calculation orchestrator containing the main class `VedicHoroscopeData`.

*   **Class: `VedicHoroscopeData`**
    *   **Purpose:** Initialized with birth/event coordinates (space-time) and configurations (Ayanamsa, House System).
    *   **`__init__(self, year, month, day, hour, minute, second, latitude, longitude, tz=None, ayanamsa="Krishnamurti", house_system="Placidus")`**
        *   Uses `TimezoneFinder` to dynamically resolve `self.time_zone` if not passed.
        *   Invokes `get_utc_offset` from `utils.py` to translate local date-time into a precise decimal UTC offset.
    *   **`generate_chart(self)`**
        *   Instantiates `flatlib.datetime.Datetime` and `flatlib.geopos.GeoPos`.
        *   Constructs a `flatlib.chart.Chart` object using:
            *   `IDs = const.LIST_OBJECTS` (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Uranus, Neptune, Pluto, Rahu [North Node], Ketu [South Node], and the Ascendant).
            *   `hsys = self.get_house_system()` (defaults to Placidus `const.HOUSES_PLACIDUS`, the standard for KP).
            *   `mode = self.get_ayanamsa()` (uses flatlib's sidereal mode mapping, e.g., `const.AY_KRISHNAMURTI`).
    *   **`get_rl_nl_sl_data(self, deg)`**
        *   **The core KP subdivision engine.** It maps any absolute zodiac longitude degree (`0.0` to `360.0`) to its corresponding:
            1.  **Rasi Lord (Sign Lord):** Mapped via index `int(deg // 30)` to the standard 12 signs and their lords (`SIGN_LORDS`).
            2.  **Nakshatra (Star) & Nakshatra Lord:** Mapped via index `int(deg // 13.333333)` to the 27 Nakshatras and their lords.
            3.  **Nakshatra Pada:** Divisions of `3.33333` degrees (1/4th of a Nakshatra).
            4.  **Sub Lord (SL):** Derived from the Vimshottari Dasha proportions.
            5.  **Sub-Sub Lord (SSL):** Further division of the Sub Lord's arc proportional to Vimshottari years.
        *   *Mathematical verification of the Sub-Lord/Sub-Sub-Lord loop is detailed in Section 3.*
    *   **`get_planets_data_from_chart(self, chart, new_houses_chart=None)`**
        *   Extracts coordinates, retrograde status, and latitude for all planets.
        *   Appends the **Ascendant (Lagna)** as the first row.
        *   Injects the Rasi Lord, Nakshatra, Nakshatra Lord, Sub Lord, and Sub-Sub Lord for each planet by calling `get_rl_nl_sl_data` on its longitude.
        *   Resolves which house each planet occupies using `get_planet_in_house`.
    *   **`get_houses_data_from_chart(self, chart)`**
        *   Extracts the longitudes and sizes of all 12 house cusps.
        *   Runs `get_rl_nl_sl_data` on each cusp's longitude to calculate the **Cuspal Sign Lord, Star Lord, Sub Lord, and Sub-Sub Lord**.
    *   **`get_planet_wise_significators(self, planets_data, houses_data)`**
        *   Calculates the **KP ABCD Significators** for planets:
            *   **A (Strongest):** The house occupied by the planet's Star Lord (Nakshatra Lord).
            *   **B:** The house occupied by the planet itself.
            *   **C:** Houses owned by the planet's Star Lord (where Star Lord is Rasi Lord).
            *   **D:** Houses owned by the planet itself (where the planet is Rasi Lord).
    *   **`get_house_wise_significators(self, planets_data, houses_data)`**
        *   Calculates the **KP ABCD Significators** for houses:
            *   **A (Strongest):** Planets deposited in the star of occupants of that house (planets whose Star Lord occupies that house).
            *   **B:** Planets occupying that house.
            *   **C:** Planets deposited in the star of the owner of that house (planets whose Star Lord is the house's Rasi Lord).
            *   **D:** Owner of that house.
    *   **`compute_vimshottari_dasa(self, chart)`**
        *   Calculates the Vimshottari Dasha timeline down to the **Bhukti (Level 2)** sub-periods.
        *   Calculates the precise elapsed and remaining balance of the birth dasha based on the Moon's absolute minutes of longitude compared to the Nakshatra boundary.
        *   Projects starting dates and durations sequentially using the 120-year Vimshottari cycle.

### B. `vedicastro/horary_chart.py`
This module implements the authentic 1-249 Horary (Prasna) system of KP astrology.

*   **Data Asset: `KP_SL_Divisions.csv`**
    *   Contains the canonical KP subdivisions. It lists the boundaries of the 249 sublords spanning the zodiac.
    *   Polars loads this CSV, parses DMS strings, and calculates decimal degrees (`From_DecDeg` and `To_DecDeg`) using `dms_to_decdeg()`.
*   **`get_horary_ascendant_degree(horary_number)`**
    *   Takes a horary seed (`1` to `249`).
    *   Looks up the division number in Polars.
    *   Resolves the starting sign, its absolute starting boundary (e.g., Gemini starts at `60.0°`), and the sublord name.
    *   Returns the exact zodiac longitude where this sublord division starts.
*   **`find_exact_ascendant_time(year, month, day, utc_offset, lat, lon, horary_number, ayanamsa)`**
    *   **The KP Horary Solver.** For a given date, location, and horary number, the Ascendant of the horary chart is fixed *exactly* at the start longitude of that horary subdivision.
    *   The solver initializes the Julian Day at `00:00:00` local time and loops through a 24-hour window (`jd_start` to `jd_end`).
    *   It directly utilizes `pyswisseph` (`swe.houses_ex`) using Placidus (`b'P'`) and the sidereal flag to compute house cusps.
    *   **Adaptive Step Optimization:** To avoid slow execution and prevent overshooting the target cusp, it adjusts the step size dynamically:
        *   If $|AscLon - Target| > 10^\circ \implies$ large step size (`inc_factor = 0.005`).
        *   If $|AscLon - Target| < 0.1^\circ \implies$ microscopic step size (`inc_factor = 100`) for high-precision convergence.
    *   Once the calculated Ascendant longitude is within a tolerance of `0.0001°` to `0.001°` of the target, it builds a temporary chart to verify that the calculated Ascendant's `SubLord` matches the expected sublord in the CSV.
    *   Returns the `matched_time`, `houses_chart`, and `houses_data`.

### C. `vedicastro/utils.py`
Helper functions facilitating coordinate conversions, timezone handling, and date calculations.

*   **`dms_to_decdeg(dms_str)` / `dms_to_mins(dms_str)`**: Parses `"Degrees:Minutes:Seconds"` string coordinates into floating-point decimal degrees and absolute arcminutes.
*   **`compute_new_date(start_date, diff_value, direction)`**: Converts decimal years (e.g., Vimshottari periods) into precise Calendar years, months, days, hours, and minutes using `dateutil.relativedelta` and projects dates forwards or backwards.
*   **`get_utc_offset(timezone_loc, date)`**: Localizes a date using Python's `pytz` database, determines if DST was active at that date and location, and outputs the exact UTC offset string (e.g., `"+05:30"` or `"-04:00"`) and Python `timedelta`.

---

## 3. Mathematical Verification of KP Subdivision Logic

The mathematical heart of KP astrology is the subdivision of the 27 Nakshatras into **Sub Lords (SL)** and **Sub-Sub Lords (SSL)** based on the relative proportions of the 9 Vimshottari Dasha rulers.

### A. The Vimshottari Arc Proportion Rule
*   The total span of the zodiac is $360^\circ$.
*   There are 27 Nakshatras, each spanning exactly $13^\circ 20' = 13.333333^\circ$ (or $800$ arcminutes).
*   The Vimshottari Dasha cycle has a total span of **120 years**, distributed among the 9 planets as follows:
    *   **Ketu:** 7 years (5.83%)
    *   **Venus:** 20 years (16.67%)
    *   **Sun:** 6 years (5.00%)
    *   **Moon:** 10 years (8.33%)
    *   **Mars:** 7 years (5.83%)
    *   **Rahu:** 18 years (15.00%)
    *   **Jupiter:** 16 years (13.33%)
    *   **Saturn:** 19 years (15.83%)
    *   **Mercury:** 17 years (14.17%)
*   **Sublord Span Formula:** The arc length of a planet's Sublord division within any Nakshatra is proportional to its dasha duration:
    $$\text{Sublord Arc} = 13^\circ 20' \times \left( \frac{\text{Dasha Years}}{120} \right) = \frac{800' \times \text{Dasha Years}}{120}$$
    *   *Example (Venus Sublord):* $800' \times \frac{20}{120} = 133.33' = 2^\circ 13' 20''$.
    *   *Example (Sun Sublord):* $800' \times \frac{6}{120} = 40' = 0^\circ 40' 00''$.

### B. Mathematical Implementation Analysis in `VedicAstro.py`
Let's analyze the exact algorithm used in `get_rl_nl_sl_data(self, deg)` (Lines 241-290):

```python
# 1. Normalize degree to a single 120-degree Vimshottari cycle
deg = deg - 120 * int(deg / 120)

# 2. Cumulative loop through the 9 planetary rulers
deg_nl = 360 / 27  # Nakshatra length = 13.333333 degrees
degcum = 0
i = 0
while i < 9:
    j = i
    while True:
        # Calculate Sublord arc length
        deg_sl = deg_nl * duration[j] / 120
        k = j
        while True:
            # Calculate Sub-Sublord arc length
            deg_ss = deg_sl * duration[k] / 120
            degcum += deg_ss
            # Check if cumulative degree meets or exceeds our target degree
            if degcum >= deg:
                return {
                    "Nakshatra": NAKSHATRAS[nakshatra_index],
                    "Pada": pada, 
                    "NakshatraLord": star_lords[nakshatra_index],
                    "RasiLord": SIGN_LORDS[sign_index], 
                    "SubLord": lords[j],
                    "SubSubLord": lords[k]
                }
            k = (k + 1) % 9
            ...
```

#### Why this algorithm is highly robust:
1.  **Normalization (`deg % 120`):** The sequence of Star Lords, Sub Lords, and Sub-Sub Lords repeats exactly every $120^\circ$ (which contains $9$ full Nakshatras). Normalizing to $120^\circ$ allows a nested cumulative search loop to resolve any coordinate without storing enormous lookup arrays.
2.  **No Approximations:** It calculates the subdivisions dynamically down to the float limit of the CPU. This prevents cumulative rounding errors that frequently plaque database-lookup-based systems.
3.  **Sub-Sublord Resolution:** It carries the division to the third level (SSL) using the exact same recursive dasha ratio:
    $$\text{SSL Arc} = \text{Sublord Arc} \times \left( \frac{\text{Dasha Years}}{120} \right)$$
    This matches the advanced cuspal interlinks requirement.

---

## 4. Swiss Ephemeris Integration

VedicAstro relies on Swiss Ephemeris coordinates, handled through two pathways:

### Pathway 1: Indirect delegation via `flatlib`
When `generate_chart()` is called, `flatlib` calls `pyswisseph` functions under the hood:
*   `swe.set_sid_mode(sid_mode, 0, 0)` is called to set the chosen ayanamsa (e.g., `swe.SIDM_KRISHNAMURTI` is `const.AY_KRISHNAMURTI`).
*   `swe.calc_ut(julian_day, planet_id)` is invoked to obtain geocentric equatorial coordinates.
*   `swe.houses(julian_day, latitude, longitude, house_system_byte)` is called to calculate house cusps.

### Pathway 2: Direct invocation in `horary_chart.py`
In `find_exact_ascendant_time()`, VedicAstro bypasses flatlib's high-level classes to run direct calculations inside its optimization loop for speed:
```python
import swisseph as swe
swe.set_sid_mode(swe.SIDM_KRISHNAMURTI) # Activates KP Ayanamsa
...
cusps, _ = swe.houses_ex(current_time, lat, lon, b'P', flags = swe.FLG_SIDEREAL)
asc_lon_deg = cusps[0] # cusps[0] is always the Ascendant (1st house cusp)
```
*Why this is critical:* Running flatlib's object instantiation on every iteration of the optimization solver would be highly CPU-intensive and slow down the API. Direct C-binding calls via `pyswisseph` allow the solver to perform thousands of house calculations in milliseconds.

---

## 5. Deployment & Production Readiness Audit

### Can VedicAstro be self-hosted as JHoraAI's KP Backend?
**Yes, absolutely.** It is a perfect fit.

### Technical Advantages
1.  **Fully Open Source & Free (MIT):** No commercial licenses or hidden subscription fees.
2.  **Self-Containment:** The mathematical algorithms (sublord subdivisions) and the local `pyswisseph` engine run locally without calling any third-party external APIs.
3.  **Extensible Web Layer (FastAPI):** Exposing the calculations as REST APIs via FastAPI is trivial.
4.  **No Fakes or Mocking:** It runs genuine Swiss Ephemeris calculations, making the calculations fully production-grade and professional.

### Infrastructure Caveats for Deployment
*   **Compiled C Dependency (`pyswisseph`):** Because `pyswisseph` is a Python binding over a C library, it requires Python headers and a C compiler (`gcc`, `clang`, or MSVC) on the target host during installation. If deploying in Docker, use a debian-based python image and install `build-essential`.
*   **Ephemeris Data Files (`.se` files):** By default, `pyswisseph` uses analytical approximations which are highly accurate for general calculations. For maximum astronomical precision spanning thousands of years, the Swiss Ephemeris `.se` data files (compiled ephemerides) can be optionally downloaded and linked via `swe.set_ephe_path("/path/to/ephe")`.
*   **External `flatlib` Source:** The setup file relies on a specific git branch: `git+https://github.com/diliprk/flatlib.git@sidereal`. Production package managers (like `pip` or `npm`) should make sure this is installed securely.
