# VedicAstro Astrological Feature Matrix
This matrix audits the implementation status, technical location, inputs, outputs, dependencies, and Swiss Ephemeris usage for every key Krishnamurti Paddhati (KP) and Vedic feature.

---

## Feature Implementation Matrix

| ID | Feature | Status | Implementation Details |
|---|---|---|---|
| **1** | **KP Cusps** | **✓ Fully Supported** | Unequal Placidus house boundaries computed sidereally. |
| **2** | **Star Lords** | **✓ Fully Supported** | Nakshatra (Star) Lord matching for both planets and house cusps. |
| **3** | **Sub Lords** | **✓ Fully Supported** | Precise mathematical sublord divisions (1-249) for planets and cusps. |
| **4** | **Sub-Sub Lords** | **✓ Fully Supported** | Third-level subdivision (SSL) for ultra-precise cuspal interlink analysis. |
| **5** | **Planet Significators** | **✓ Fully Supported** | Generates standard KP ABCD significators for all planets. |
| **6** | **House Significators** | **✓ Fully Supported** | Generates standard KP ABCD significators for all 12 houses. |
| **7** | **Ruling Planets** | **✓ Partially Supported** | Ingredients (Lagna & Moon Lords) are calculated; compilation is left to the client. |
| **8** | **KP Horary** | **✓ Fully Supported** | Solves for the exact time on a day when the Ascendant matches a horary seed (1-249). |
| **9** | **KP Transit** | **✓ Fully Supported** | Calculates real-time planetary star-lord and sub-lord placements. |
| **10**| **KP Dashas** | **✓ Fully Supported** | Computes Vimshottari Dasha & Bhukti (Level 2) start/end dates. |
| **11**| **Birth Time Rectification**| **✗ Not Supported** | No native solver, though ingredients are available. |

---

## Deep Feature-by-Feature Technical Audit

### 1. KP Cusps
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_houses_data_from_chart(self, chart)`
*   **REST Endpoint:** 
    *   `POST /get_all_horoscope_data` $\rightarrow$ `houses_data`
    *   `POST /get_all_horary_data` $\rightarrow$ `houses_data`
*   **Input:** `chart` (an active `flatlib.Chart` object containing house coordinates calculated in Placidus mode)
*   **Output:** List of `HousesData` NamedTuples, each containing:
    *   `Object` (Roman numeral e.g., 'I', 'II', 'III')
    *   `HouseNr` (1 to 12)
    *   `Rasi` (Zodiac Sign)
    *   `LonDecDeg` (Absolute Zodiac Longitude)
    *   `SignLonDMS` (Zodiac Degree in DMS string format)
    *   `SignLonDecDeg` (Zodiac Degree in decimal)
    *   `DegSize` (House cusp span in degrees)
    *   `Nakshatra` (Constellation name)
    *   `RasiLord` (Sign Lord name)
    *   `NakshatraLord` (Star Lord name)
    *   `SubLord` (Sub Lord name)
    *   `SubSubLord` (Sub-Sub Lord name)
*   **Dependencies:** `flatlib`, `collections`
*   **Swiss Ephemeris Usage:** Indirectly. flatlib queries `pyswisseph`'s `swe.houses` to calculate coordinates based on latitude/longitude coordinates and julian date.

### 2. Star Lords
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_rl_nl_sl_data(self, deg)`
*   **REST Endpoint:** Included dynamically within `planets_data` (`NakshatraLord`) and `houses_data` (`NakshatraLord`) in both `POST` endpoints.
*   **Input:** `deg` (float, absolute zodiac longitude from `0.0` to `360.0`)
*   **Output:** Dictionary with key `"NakshatraLord"` (string: `"Ketu"`, `"Venus"`, `"Sun"`, `"Moon"`, `"Mars"`, `"Rahu"`, `"Jupiter"`, `"Saturn"`, or `"Mercury"`) and `"Nakshatra"` name.
*   **Dependencies:** None (pure Python division)
*   **Swiss Ephemeris Usage:** None (runs on calculated longitude coordinates)

### 3. Sub Lords
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_rl_nl_sl_data(self, deg)`
*   **REST Endpoint:** Included dynamically within `planets_data` (`SubLord`) and `houses_data` (`SubLord`) in both `POST` endpoints.
*   **Input:** `deg` (float, absolute zodiac longitude)
*   **Output:** Dictionary with key `"SubLord"` (string) mapping the coordinate to one of the 249 sublord boundaries of KP.
*   **Dependencies:** None (pure Python division)
*   **Swiss Ephemeris Usage:** None

### 4. Sub-Sub Lords
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_rl_nl_sl_data(self, deg)`
*   **REST Endpoint:** Included dynamically within `planets_data` (`SubSubLord`) and `houses_data` (`SubSubLord`) in both `POST` endpoints.
*   **Input:** `deg` (float)
*   **Output:** Dictionary with key `"SubSubLord"` (string) mapping to the third-tier Vimshottari subdivision.
*   **Dependencies:** None
*   **Swiss Ephemeris Usage:** None

### 5. Planet Significators
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_planet_wise_significators(self, planets_data, houses_data)`
*   **REST Endpoint:**
    *   `POST /get_all_horoscope_data` $\rightarrow$ `planet_significators`
    *   `POST /get_all_horary_data` $\rightarrow$ `planet_significators`
*   **Input:** `planets_data` (NamedTuple list from `get_planets_data_from_chart`), `houses_data` (NamedTuple list from `get_houses_data_from_chart`)
*   **Output:** List of `PlanetSignificators` NamedTuples, each mapping:
    *   `Planet` (string name of planet)
    *   `A` (int, house occupied by its Star Lord)
    *   `B` (int, house occupied by the planet itself)
    *   `C` (list of ints, houses owned by its Star Lord)
    *   `D` (list of ints, houses owned by the planet itself)
*   **Dependencies:** None (logical mapping)
*   **Swiss Ephemeris Usage:** None

### 6. House Significators
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_house_wise_significators(self, planets_data, houses_data)`
*   **REST Endpoint:**
    *   `POST /get_all_horoscope_data` $\rightarrow$ `house_significators`
    *   `POST /get_all_horary_data` $\rightarrow$ `house_significators`
*   **Input:** `planets_data`, `houses_data`
*   **Output:** List of `HouseSignificators` NamedTuples, mapping:
    *   `House` (string e.g., 'I', 'II')
    *   `A` (list of strings, planets whose Star Lord is in this house)
    *   `B` (list of strings, planets occupying this house)
    *   `C` (list of strings, planets whose Star Lord is the Rasi Lord of this house)
    *   `D` (string, the Rasi Lord of this house)
*   **Dependencies:** None (logical mapping)
*   **Swiss Ephemeris Usage:** None

### 7. Ruling Planets
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** Implicit. There is no dedicated `get_ruling_planets()` method. Instead, ruling planet ingredients are automatically calculated and exposed under `planets_data` (where the Lagna/Ascendant is row 0 and Moon is row 2).
*   **REST Endpoint:** Included dynamically in `planets_data` (Lagna Rasi Lord, Star Lord, Sub Lord; Moon Rasi Lord, Star Lord).
*   **Input:** None
*   **Output:** None (extracted from response fields)
*   **Dependencies:** None
*   **Swiss Ephemeris Usage:** None

### 8. KP Horary
*   **File:** `vedicastro/horary_chart.py`
*   **Class / Functions:**
    *   `get_horary_ascendant_degree(horary_number)`
    *   `find_exact_ascendant_time(year, month, day, utc_offset, lat, lon, horary_number, ayanamsa)`
*   **REST Endpoint:** `POST /get_all_horary_data`
*   **Input:** `HoraryChartInput` schema:
    *   `horary_number` (int, `1` to `249`)
    *   `year`, `month`, `day`, `hour`, `minute`, `second` (ints)
    *   `utc` (string e.g., `"+05:30"`)
    *   `latitude`, `longitude` (floats)
    *   `ayanamsa` (string, defaults to `"Krishnamurti"`)
    *   `house_system` (string, defaults to `"Placidus"`)
*   **Output:**
    *   Exact matched datetime
    *   Full calculated planet table (`planets_data`)
    *   Full calculated house table (`houses_data`)
    *   Significators and aspects charts
*   **Dependencies:** `pyswisseph`, `polars`, `/vedicastro/data/KP_SL_Divisions.csv`
*   **Swiss Ephemeris Usage:** Direct. Uses `swe.houses_ex` to run rapid coordinate-matching loops and `swe.set_sid_mode` to calculate sidereal positions using the specified ayanamsa.

### 9. KP Transit
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `get_transit_details(self)`
*   **REST Endpoint:** Not exposed as an active endpoint in `VedicAstroAPI.py`, but fully functional as a library method.
*   **Input:** None (uses instance state)
*   **Output:** List of `TransitDetails` NamedTuples, each mapping:
    *   `timestamp` (string)
    *   `PlanetName` (string)
    *   `PlanetLon` (float, absolute longitude)
    *   `PlanetSign` (string, zodiac sign)
    *   `Nakshatra` (string constellation)
    *   `NakshatraLord` (string star lord)
    *   `SubLord` (string sublord)
    *   `SubLordSign` (string, zodiac sign occupied by sublord)
    *   `isRetrograde` (boolean)
*   **Dependencies:** `flatlib`, `collections`
*   **Swiss Ephemeris Usage:** Indirect (via flatlib's coordinate lookups).

### 10. KP Dashas (Vimshottari Dasha)
*   **File:** `vedicastro/VedicAstro.py`
*   **Class:** `VedicHoroscopeData`
*   **Function:** `compute_vimshottari_dasa(self, chart)`
*   **REST Endpoint:**
    *   `POST /get_all_horoscope_data` $\rightarrow$ `vimshottari_dasa_table`
    *   `POST /get_all_horary_data` $\rightarrow$ `vimshottari_dasa_table`
*   **Input:** `chart` (`flatlib.Chart` object)
*   **Output:** A nested dictionary containing 9 Mahadashas. For each Mahadasha:
    *   `start` (string `"DD-MM-YYYY"`)
    *   `end` (string `"DD-MM-YYYY"`)
    *   `bhuktis` (dict of 9 sub-periods, each containing start and end dates)
*   **Dependencies:** `dateutil.relativedelta`, `datetime`
*   **Swiss Ephemeris Usage:** Indirect (via Moon's calculated longitude).

### 11. Birth Time Rectification
*   **Status:** **✗ Not Supported**
*   **Commentary:** There are no functions in the codebase designed to perform BTR. Since BTR involves comparing the native's ruling planets at birth to their life events or matching the Lagna Sub-Sub Lord's relationship to parental/sibling indicators, it is an analytical overlay. The codebase provides the raw tools (cuspal sub-sub lords and planet properties) but does not implement any automatic or manual solver for rectification.
