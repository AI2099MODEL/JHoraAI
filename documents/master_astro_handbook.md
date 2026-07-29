# JHora AI Master Evaluation & Astrology Rules Handbook

Welcome to the **Master Evaluation Handbook**, the authoritative index, registry, and rulebook for JHora AI's unified astrological engines. This document serves as the ground truth of data structures, provenances, and evaluation gates.

> **Execution Directive:** This handbook stores only the indices, data schema, structural logic, and rule conditions. Individual user data is stored dynamically within separate files in the `Users/` directory (e.g., `userprofile.json` representing the active profile). The client dashboard dynamically reads and populates these values based on the active session profile.

---

## I. ASTROLOGICAL DATA INDEX & REGISTRY

This index catalogs the primary data tables, variables, and calculation schemas dynamically populated by the JHora calculation engines.

### 100. Evaluation Data Index & Birth Registry
* **Registry Source File:** `/Users/userprofile.json` (Active selected profile payload)
* **Primary Information Source:** **Dashboard Page** (User birth inputs: Date, Time, Place/Coordinates, and selected Ayanamsa)
* **Status:** Dynamically populated based on active selected profile session.

#### Strict UserProfile Data Strategy:
1. **No Calculation/Derivation Storage**: Do NOT generate, calculate, or store any derived astrological models, mappings, interpretations, harmonics, divisional charts, friendships, dignities, strengths, yogas, doshas, remedies, or reports inside the persisted UserProfile. The UserProfile is strictly a persistent archive of raw API responses only (from the JHora/VedicAstro endpoints).
2. **Zero In-Profile Calculations**: All calculations, conversions, or interpretive rules (including KP stellar division and event rulebooks) must be run purely at render-time/runtime on the client dashboard. No pre-calculated data or static placeholder dates should be injected or hardcoded inside the stored profile payload.
3. **No Transit / Sky JSON Data**: Do NOT store or append transit coordinate data, daily sky state JSON, or daily muhurtas into the UserProfile. The profile must remain perfectly focused on the static, raw natal birth particulars and JHora's raw API horoscope output.
4. **Authentic Data Preservation**: Keep fetched raw data exactly as returned by the API with zero client-side or server-side structural tampering during the profile creation and storage phase. Mappings are implemented dynamically in downstream viewer layers.

---

### Mapped System Tables (JH1 to JH19 Consecutive Registry)

#### Table JH1: Birth Details & Astronomical Metrics
This table represents the layout schema of the primary birth particulars and lagna (ascendant) coordinates. The engine maps these parameters as the absolute mathematical foundation for divisional chart calculations, dasha timelines, and planetary transits.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Profile Name** | `string` | **Dashboard Page** / Selected Profile | Loaded dynamically from selected profile (`User.profile_name`) |
| **User Email** | `string` | **Dashboard Page** / Active Session | Loaded dynamically from selected profile session (`User.email`) |
| **Birth Date** | `string (YYYY-MM-DD)` | **Dashboard Page** Input Form | Loaded dynamically from birth parameters (`Birth.date`) |
| **Birth Time** | `string (HH:MM:SS)` | **Dashboard Page** Input Form | Loaded dynamically from birth parameters (`Birth.time`) |
| **Latitude** | `float` | **Dashboard Page** GPS Resolver | Geographical coordinates mapped via city database lookup (`Birth.latitude`) |
| **Longitude** | `float` | **Dashboard Page** GPS Resolver | Geographical coordinates mapped via city database lookup (`Birth.longitude`) |
| **Timezone** | `float` | **Dashboard Page** Coordinate Mapping| Local UTC timezone offset derived during calculation (`Birth.timezone`) |
| **Place** | `string` | **Dashboard Page** Input Form | Resolved location name from geographical coordinates database (`Birth.place`) |
| **Ayanamsa** | `string` | **Dashboard Page** Settings | Calculation mode standard selected by user (e.g., Lahiri) (`Birth.ayanamsa`) |
| **Julian Day Number**| `string` | Calculated (from Birth Date/Time) | Derived mathematically from UTC birth moment timestamp (`Birth.julian_day_number`) |
| **Sidereal Time** | `string` | Calculated (from Birth Lat/Lon/Time) | Calculated Local Sidereal Time for birth coordinates (`Birth.local_sidereal_time`) |
| **Obliquity** | `string` | Calculated (from Ephemeris) | Obliquity of the ecliptic derived for Julian epoch (`Birth.obliquity`) |
| **House System** | `string` | **Dashboard Page** Settings | Structural house division rules applied (e.g., Placidus / KP Cusps) |
| **Zodiac Sign (Lagna)** | `string` | Calculated (from Birth Parameters) | Sign rising on eastern horizon (`Vedic.ascendant.sign`) |
| **Lagna Longitude** | `string` | Calculated (from Birth Parameters) | Ascendant degree within zodiac sign (`Vedic.ascendant.degree`) |
| **Lagna Nakshatra** | `string` | Calculated (from Birth Parameters) | Nakshatra containing the ascendant degree (`Vedic.ascendant.nakshatra`) |
| **Lagna Nakshatra Pada**| `int` | Calculated (from Birth Parameters) | Nakshatra quarter of the ascendant (`Vedic.ascendant.pada`) |
| **Lagna Nakshatra Lord**| `string` | Calculated (from Birth Parameters) | Planetary ruler of the ascendant nakshatra (`Vedic.ascendant.nakshatra_lord`) |

#### Table JH2: Natal Planets Longitudes & Rasi Placements
This table indexes the coordinates, nakshatras, padas, star-lords, and sign positions of all primary natal planets.
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Graha Name** | `string` | JHora Raw API | Name of the primary celestial body (`Vedic.planets.[Planet].name`) |
| **Zodiac Sign** | `string` | JHora Raw API | Rasi sign containing the planet (`Vedic.planets.[Planet].sign`) |
| **Longitude (In Sign)** | `string` | JHora Raw API | Coordinate degree, minute, and second within the sign (`Vedic.planets.[Planet].longitude_formatted`) |
| **360° Longitude** | `float` | JHora Raw API | Celestial longitude in 360-degree coordinates (`Vedic.planets.[Planet].longitude`) |
| **House Placement** | `int` | JHora Raw API | House position in the rasi chart (`Vedic.planets.[Planet].house`) |
| **Nakshatra** | `string` | JHora Raw API | Asterism division (1 to 27) of the planet (`Vedic.planets.[Planet].nakshatra`) |
| **Nakshatra Pada** | `int` | JHora Raw API | Asterism quarter (1 to 4) of the planet (`Vedic.planets.[Planet].pada`) |
| **Nakshatra Lord** | `string` | Nakshatra Ruler Map | Planetary ruler of the nakshatra (`Vedic.planets.[Planet].nakshatra_lord`) |
| **Retrograde (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is in retrograde motion (`Vedic.planets.[Planet].is_retrograde`) |
| **Combust (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is combust with the Sun (`Vedic.planets.[Planet].is_combust`) |
| **Dignity** | `string` | Dignities Engine | Planetary dignity (Exalted, Own, Moolatrikona, Friendly, Enemy, Debilitated) |
| **Avasthas** | `string` | Baladi/Jagrat/Deepta Avasthas | Calculated planetary age, alertness, and mood states |

#### Table JH3: Shadbala Planet Strength Matrix
This table indexes calculated planetary strengths in Shadbala rupas across the six distinct sources of power.
* **Primary Information Source / Info Origin:** Shadbala Calculation Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Shadbala Rupas** | `float` | Shadbala Engine | Positional, temporal, directional, motional, and aspectual planetary strengths (`Vedic.strengths.shadbala`) |

#### Table JH4: Bhava Balas (House Strengths)
This table indexes calculated strength quotients in Shashtiamsas and strength rankings of the 12 houses.
* **Primary Information Source / Info Origin:** Bhava Bala Calculation Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Bhava Strength** | `object` | Bhava Bala Engine | Total house strength coefficients and relative ranks (`Vedic.strengths.bhava_bala`) |

#### Table JH5: Samudhaya Ashtakavarga Points
This table indexes the calculated Ashtakavarga Bindus (both individual planetary BAV and Sarvashtakavarga SAV sums).
* **Primary Information Source / Info Origin:** Ashtakavarga Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **SAV Bindus** | `array` | Ashtakavarga Engine | 12 rasis' samudhaya bindus (`Vedic.strengths.ashtakavarga.sav`) |
| **BAV Bindus** | `object` | Ashtakavarga Engine | Planetary bindu distributions across zodiac signs (`Vedic.strengths.ashtakavarga.bav`) |

#### Table JH6: Divisional Vargas D1 to D60
This table indexes 16 divisional charts (Varga structures D1 through D60) compiled relative to the rising Lagna.
* **Primary Information Source / Info Origin:** Divisional Chart Calculation Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Divisional Charts** | `object` | Divisional Chart Calculation Engine | Longitude-based divisional sub-grids (`Vedic.divisional_charts`) |

#### Table JH7: Vimshottari Mahadasha Timelines
This table indexes the calculated Vimshottari dasha progression timelines down to Prana level (Maha -> Antar -> Pratyantar -> Sookshma -> Prana).
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`) & Dasha Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Mahadasha (Level 1)**| `string` | JHora / Derived | 1st-level Vimshottari dasha ruler and bounds (`Vedic.dashas.vimshottari.[Maha].lord`) |
| **Antardasha (Level 2)** | `string` | JHora / Derived | 2nd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].lord`) |
| **Pratyantar (Level 3)** | `string` | Derived | 3rd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].lord`) |
| **Sookshma (Level 4)** | `string` | Derived | 4th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].lord`) |
| **Prana (Level 5)** | `string` | Derived | 5th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].[Prana].lord`) |

#### Table JH8: Placidus House Cusp Coordinates
This table indexes the Krishnamurti Paddhati Placidus house cusps.
* **Primary Information Source / Info Origin:** KP Stellar Division Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **House Cusps 1-12** | `array` | KP Placidus Engine | Placidus house division coordinates calculated from birth sidereal time and latitude |

#### Table JH9: KP Planetary Sub-Lords
This table indexes the Krishnamurti Paddhati stellar, sub, and sub-sub significators of natal planetary placements.
* **Primary Information Source / Info Origin:** KP Stellar Division Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Planet Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of natal planetary placements (`KP.planets.[Planet].sub_lord`) |
| **Planet Sub-Sub-Lord**| `string` | KP Stellar Division Engine | Sub-sub-lord of natal planetary placements (`KP.planets.[Planet].sub_sub_lord`) |

#### Table JH10: KP Planet-Level Significators
This table indexes planetary significator levels mapped back to the 12 bhavas/houses.
* **Primary Information Source / Info Origin:** KP Significator Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Significators** | `array` | KP Significator Engine | Houses signified by planets under KP rules (`KP.planet_significators`) |

#### Table JH11: KP House-Level Significators
This table indexes the planetary significators for each of the 12 Placidus house cusps.
* **Primary Information Source / Info Origin:** KP Significator Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **House Significators**| `object` | KP Significator Engine | Planets signifying houses under KP Level A-D significator equations |

#### Table JH12: Jaimini Chara Karakas
This table indexes Jaimini Chara Karakas according to the 7/8-karaka classic systems.
* **Primary Information Source / Info Origin:** JHora / Jaimini Sphuta Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Chara Karakas** | `object` | Jaimini Karakas Engine | Planetary designations from Atmakaraka down to Darakaraka based on longitude sorting |

#### Table JH13: Jaimini Arudhas & Padas (Chara Dashas)
This table indexes calculated Jaimini Arudhas of all 12 houses and the Chara Dasha intervals.
* **Primary Information Source / Info Origin:** Pada Projection Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Arudhas** | `object` | Pada Projection Engine | Arudha houses AL, UL, etc., calculated relative to house lords |
| **Chara Dashas** | `array` | Chara Dasha Engine | Sign-based Jaimini Chara Dasha periods and sub-periods |

#### Table JH14: Tropical Planetary Placements
This table indexes Tropical Western astrology planets and house cusps.
* **Primary Information Source / Info Origin:** Ptolemaic Western Projection.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Tropical Positions**| `object` | Western Projection | Planets/cusps projected onto the Tropical zodiac (`Western.planets` / `cusps`) |

#### Table JH15: Tropical Planetary Aspects Matrix
This table indexes Tropical Western astrological aspect alignments.
* **Primary Information Source / Info Origin:** Aspect Angle Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Aspects & Orbs** | `array` | Aspect Angle Engine | Calculated aspects (Conjunction, Sextile, Square, Trine, Opposition) with exact orb angles |

#### Table JH16: Tajik Varshaphal Planetary Coordinates / Sahams
This table indexes yearly Varshaphal chart coordinates and sensitive Arabic Sahams.
* **Primary Information Source / Info Origin:** Tajik Yearly Soli-Lunar Return Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Varshaphal Longitudes**| `object` | Varshaphal Engine | Yearly chart planetary coordinates and Muntha placement |
| **Sahams** | `object` | Sahams Engine | Arabic sensitive points (Punya Saham, Vidya Saham, etc.) calculated for return chart |

#### Table JH17: Tajik Harsha Balas (4-Fold Strength)
This table indexes Varshaphal planetary strengths across 4 distinct Harsha Bala criteria.
* **Primary Information Source / Info Origin:** Tajik Harsha Bala Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Harsha Balas** | `object` | Harsha Bala Engine | 4-fold strength indicators yielding weak, medium, strong planetary states |

#### Table JH18: Lal Kitab Planetary Houses & Placements
This table indexes Lal Kitab house conversions and alignments.
* **Primary Information Source / Info Origin:** Lal Kitab House Translation Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Lal Kitab Houses** | `object` | Lal Kitab Translator | Planet placements translated to Aries-Ascendant house mapping |

#### Table JH19: Lal Kitab Teva & Sleeping Planet Status
This table indexes Lal Kitab Teva categories and sleeping status coordinates.
* **Primary Information Source / Info Origin:** Lal Kitab Traditional Rules Engine.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Teva Status** | `string` | Lal Kitab Engine | Teva type categorization (e.g., Dharmi Teva, Blind Teva, Half-Blind Teva) |
| **Sleeping Planets** | `array` | Lal Kitab Engine | List of sleeping planets and sleeping houses requiring traditional remedies |

---

## II. MASTER ASTROLOGICAL RULE ENGINE SPECIFICATION v1.0

```text
###########################################################
# JHORA AI PROFESSIONAL - ASTROLOGICAL RULE ENGINE
# CANONICAL BUSINESS PIPELINE SPECIFICATION (V2.0)
###########################################################

===========================================================
1. CANONICAL PIPELINE WORKFLOW
===========================================================

The platform utilizes a strictly linear, deterministic workflow separating
static birth potential (natal) from dynamic time windows (activation) and 
rule-based decision logic.

USER PROFILE
      │
      ▼
Astronomical Calculator
      │
      ▼
KP Calculation Engine
      │
      ▼
KP Knowledge Book
      │
      ▼
Prediction Request
      ↓
KP Rulebook
      ↓
Rule Engine
      ↓
Evidence Engine
      ↓
Decision Engine
      ↓
Timeline Engine
      ↓
Event Book
      ↓
Report Engine

===========================================================
2. MODULE RESPONSIBILITIES & SYSTEM BOUNDS
===========================================================

[01] Astronomical Calculator
-----------------------------------------------------------
- Responsibility:
  Stateless calculation of planetary longitudes, Placidus house cusps, 
  and transit coordinates from ephemeris data.
- Input:
  Birth Date, Time, Latitude, Longitude, and Ayanamsa Standard (e.g. Lahiri).
- Output:
  Exact 3D spatial celestial coordinates.
- Constraints:
  Absolutely NO astrological interpretations, significations, or strengths occur.

[02] KP Calculation Engine
-----------------------------------------------------------
- Responsibility:
  Converts astronomical coordinates into deterministic KP astrological structures.
- Generates:
  Planets, Houses, Placidus Cusps, Star Lords, Sub Lords, Significators 
  (Levels A-D), Planet Strengths, House Strengths, and Natal Event Promise.
- Output:
  Populates the static, immutable KP Knowledge Book.
- Constraints:
  Only triggered during profile initialization, birth detail changes, or
  ayanamsa changes. Never during predictions.

[03] KP Knowledge Book
-----------------------------------------------------------
- Responsibility:
  Permanent deterministic repository containing ONLY static natal KP information.
- Structure:
  - Planets & Cusps coordinate map
  - KP Star Lords, Sub Lords, and Sub-Sub Lords (SSL)
  - House Significators
  - Planet & House Strengths
  - Natal Event Promise (Renamed from "Event Profiles")
  - KP Knowledge Book Version
- Principles:
  Stored once inside the User Profile. NEVER regenerated during dynamic predictions.

[04] KP Rulebook
-----------------------------------------------------------
- Responsibility:
  Permanent repository of classical KP rules. Grouped strictly by 15 domains.
- Contains:
  ONLY conditional logic rules. No execution, calculation, or prediction logic.
- Grouped Domains:
  1. Marriage        6. Vehicle         11. Health
  2. Career          7. Education       12. Litigation
  3. Finance         8. Children        13. Spiritual
  4. Business        9. Travel          14. Longevity
  5. Property        10. Foreign        15. General

[05] Rule Engine
-----------------------------------------------------------
- Responsibility:
  Executes rules from the KP Rulebook against the KP Knowledge Book + Dynamic Context.
- Output:
  Produces stateless Rule Results mapping conditions to true/false outcomes.
- Constraints:
  Must NOT generate evidence, create event records, calculate confidence, or
  store results.
- Subcomponents:
  - Rule Validation Step: Internal syntax checks.
  - Rule Compiler/Cache/Registry: Private internal execution helpers.

[06] Evidence Engine
-----------------------------------------------------------
- Responsibility:
  Aggregates and organizes evidence from Rule Results.
- Collects:
  Supporting Rules, Blocking Rules, Matched Rules, Failed Rules, 
  House Evidence, Planet Evidence, Transit Evidence, Dasha Evidence, and Rule Lineage.
- Output:
  Produces a stateless, structured Evidence Object.
- Constraints:
  Must NOT execute rules or write to the database.

[07] Decision Engine
-----------------------------------------------------------
- Responsibility:
  Dynamic mathematical evaluation of eventual feasibility.
- Equation:
  Natal Promise + Active DBA + Transit + Collected Evidence -> Final Decision
- Verdicts:
  STRONG | MODERATE | WEAK | NOT PROMISED
- Constraints:
  Stateless execution. No persistence or Event Book writes.
- Subcomponents:
  - Confidence Engine: Internal subcomponent calculating numerical weights.

[08] Timeline Engine
-----------------------------------------------------------
- Responsibility:
  Schedules and determines precise chronologies for manifestation.
- Computes:
  - Activation Window (Start/End dates)
  - Timing Range
  - Activation Strength
  - Priority Window
- Constraints:
  Must NOT create events. Terms like 'Delay' and 'Acceleration' are 
  interpretations and must never be described as engine outputs.

[09] Event Book
-----------------------------------------------------------
- Responsibility:
  The SINGLE SOURCE OF TRUTH persistent database repository.
- Workflow:
  Decision Engine -> Event Candidate -> Event Book -> Persist
- Stored Fields:
  - Event ID
  - Decision / Verdict
  - Evidence Package
  - Timeline Windows
  - Confidence Base & Final Scores
  - Rule Lineage
  - History & Audit Trail
- Constraints:
  Does NOT decide events, execute rules, or evaluate astrology. Purely a storage vault.

[10] Report Engine
-----------------------------------------------------------
- Responsibility:
  Compiles verified event records into interactive or printable formats.
- Outputs:
  Dashboard Views, Interactive UI Cards, PDF Exports, API Responses.
- Constraints:
  Reads ONLY from the Event Book. Absolutely NO astrology calculations or 
  rule evaluations occur in this module.
- Subcomponents:
  - Explanation Engine: Translates technical evidence packages into human-readable text.

===========================================================
3. DATA DIVISION & RECONCILIATION
===========================================================

-----------------------------------------------------------
A. Static Natal Data (KP Knowledge Book)
-----------------------------------------------------------
• Planets
• Houses
• Cusps
• Star Lords
• Sub Lords
• Significators
• Planet Strengths
• House Strengths
• Natal Event Promise
• KP Knowledge Book Version

-----------------------------------------------------------
B. Dynamic Context Data (Prediction Query)
-----------------------------------------------------------
• Current DBA (Dasha-Bhukti-Antara)
• Current Transit Snapshot
• Current Date
• Current Time
• User Event History (optional)
• User Notes (optional)

===========================================================
4. ZERO DUPLICATION LAWS
===========================================================
- Rule Engine does NOT generate evidence.
- Evidence Engine does NOT execute rules.
- Decision Engine does NOT store events.
- Timeline Engine does NOT create events.
- Event Book does NOT evaluate astrology.
- Report Engine does NOT calculate astrology.
- All auxiliary components (Rule Validation, Confidence, Explanation, 
  Compiler, Matcher) are implemented strictly as internal subcomponents 
  or helper classes of their parent engines.

###########################################################
# END OF SPECIFICATION
###########################################################
```

------------------------------------------------------------

ARCHITECTURAL PRINCIPLES

1. Every business module has exactly one responsibility.

2. Static natal knowledge is calculated exactly once.

3. Dynamic timing is calculated on demand.

4. KP Knowledge Book is the permanent deterministic repository.

5. KP Rulebook stores rules only.

6. Rule Engine executes rules only.

7. Evidence Engine aggregates evidence only.

8. Decision Engine determines the verdict only.

9. Timeline Engine determines timing only.

10. Event Book stores results only.

11. Report Engine renders results only.

12. Internal helper classes are implementation details and must never appear as business architecture.

13. No module may perform another module's responsibility.

14. All processing must remain deterministic, immutable where appropriate, traceable, auditable, and maintainable.

------------------------------------------------------------

