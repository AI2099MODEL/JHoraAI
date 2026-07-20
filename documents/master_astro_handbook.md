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

#### Table 1: Birth Details & Lagna (Ascendant Coordinates)
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
| **Julian Day Number**| `string` | Calculated (from Table 1 Date/Time) | Derived mathematically from UTC birth moment timestamp (`Birth.julian_day_number`) |
| **Sidereal Time** | `string` | Calculated (from Table 1 Lat/Lon/Time) | Calculated Local Sidereal Time for birth coordinates (`Birth.local_sidereal_time`) |
| **Obliquity** | `string` | Calculated (from Ephemeris) | Obliquity of the ecliptic derived for Julian epoch (`Birth.obliquity`) |
| **Ephemeris Used** | `string` | Background Library | Calculation engine background source (`Birth.ephemeris_used`) |
| **House System** | `string` | **Dashboard Page** Settings | Structural house division rules applied (e.g., Placidus / KP Cusps) |
| **Zodiac Sign (Lagna)** | `string` | Calculated (from Birth Parameters) | Sign rising on eastern horizon (`Vedic.ascendant.sign`) |
| **Lagna Longitude (In Sign)** | `string` | Calculated (from Birth Parameters) | Ascendant degree within zodiac sign (`Vedic.ascendant.degree`, `minute`, `second`) |
| **Lagna 360° Longitude** | `float` | Calculated (from Birth Parameters) | Exact 360-degree celestial longitude of ascendant (`Vedic.ascendant.longitude_360`) |
| **Lagna Nakshatra** | `string` | Calculated (from Birth Parameters) | Nakshatra containing the ascendant degree (`Vedic.ascendant.nakshatra`) |
| **Lagna Nakshatra Pada** | `int` | Calculated (from Birth Parameters) | Nakshatra quarter of the ascendant (`Vedic.ascendant.pada`) |
| **Lagna Nakshatra Lord** | `string` | Calculated (from Birth Parameters) | Planetary ruler of the ascendant nakshatra (`Vedic.ascendant.nakshatra_lord`) |

#### Table 2: KP Graha, Nakshatra and Pada (Planetary Coordinates)
This table indexes the coordinates, nakshatras, padas, star-lords, sub-lords, and sub-sub-lords of all primary natal planets.
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`) & KP Stellar Division Engine.
* **Logic & Provenance Source:** Raw planet coordinates are retrieved directly from the JHora engine, while sub-lords and sub-sub-lords are derived using KP Placidus stellar division equations against the exact coordinates.

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
| **Sub Lord** | `string` | KP Stellar Division Engine | Krishnamurti Paddhati sub-lord ruler (`KP.planets.[Planet].sub_lord`) |
| **Sub-Sub Lord** | `string` | KP Stellar Division Engine | Krishnamurti Paddhati sub-sub-lord ruler (`KP.planets.[Planet].sub_sub_lord`) |
| **Retrograde (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is in retrograde motion (`Vedic.planets.[Planet].is_retrograde`) |
| **Combust (Y/N)** | `boolean` | JHora Raw API | Indicates if the planet is combust with the Sun (`Vedic.planets.[Planet].is_combust`) |
| **Dignity** | `string` | Dignities Engine | Planetary dignity (Exalted, Own, Moolatrikona, Friendly, Enemy, Debilitated) (`Vedic.planets.[Planet].dignity`) |
| **Avasthas** | `string` | Baladi/Jagrat/Deepta Avasthas | Calculated planetary age, alertness, and mood states (`Vedic.planets.[Planet].state`) |
#### Table 3: Astronomical Alignment Parameters
This table indexes the calculated astronomical parameters from the ephemeris.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Julian Day** | `string` | Astronomical Calculation Engine | Derived dynamically from UTC birth moment timestamp (`Astronomical.julian_day_number`) |
| **Sidereal Time** | `string` | Local Sidereal Meridian | Derived dynamically from longitude and UTC birth time (`Astronomical.sidereal_time`) |
| **Obliquity** | `string` | Ecliptic inclination | Obliquity of the ecliptic derived for Julian epoch (`Astronomical.obliquity`) |
| **Sunrise / Sunset** | `string` | Solar Horizon calculation | Calculated solar rise and set times for coordinates (`Astronomical.sunrise` / `sunset`) |
| **Moon Phase** | `string` | Tithi calculation | Angular distance of Moon from Sun at birth (`Astronomical.moon_phase`) |

#### Table 4: Vimshottari Dasha Timeline (To Prana)
This table indexes the calculated multi-tiered dasha progression timelines down to Prana level (Maha -> Antar -> Pratyantar -> Sookshma -> Prana).
* **Primary Information Source / Info Origin:** JHora REST API Server endpoint (`/api/jhora/horoscope`) & Dasha Engine.
* **Logic & Provenance Source:** Nested dasha intervals based on stellar division ratios from birth Moon coordinate.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Mahadasha (Level 1)**| `string` | JHora / Derived | 1st-level Vimshottari dasha ruler and bounds (`Vedic.dashas.vimshottari.[Maha].lord`) |
| **Antardasha (Level 2)** | `string` | JHora / Derived | 2nd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].lord`) |
| **Pratyantar (Level 3)** | `string` | Derived | 3rd-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].lord`) |
| **Sookshma (Level 4)** | `string` | Derived | 4th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].lord`) |
| **Prana (Level 5)** | `string` | Derived | 5th-level sub-period ruler and bounds (`Vedic.dashas.vimshottari.[Maha].[Antar].[Pratyantar].[Sookshma].[Prana].lord`) |

#### Table 5: Ashtottari Dasha Timeline
This table indexes the calculated Ashtottari dasha timeline.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Ashtottari Dasha** | `array` | Ashtottari Dasha Engine | Cyclic Ashtottari periods calculated relative to Nakshatra placements |

#### Table 6: Yogini Dasha Timeline
This table indexes the calculated cyclic Yogini dasha timeline.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Yogini Dasha** | `array` | Yogini Dasha Engine | Cyclic Yogini periods calculated relative to birth Moon Nakshatra |

#### Table 7: KP System Cusps & Planets (KP Engine)
This table indexes the Krishnamurti Paddhati stellar, sub, and sub-sub significators.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Cuspal Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of Placidus house cusps 1 to 12 (`KP.cusps.[House].sub_lord`) |
| **Planet Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of natal planetary placements (`KP.planets.[Planet].sub_lord`) |

#### Table 8: Planet to House Significator Mappings (KP Reverse Lookup)
This table indexes planetary significator levels mapped back to the 12 bhavas/houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Significators** | `array` | KP Significator Engine | Houses signified by planets under KP rules (`KP.planet_significators`) |

#### Table 9: Tropical Western Chart & Aspects (Western Engine)
This table indexes Tropical Western astrology planets, cusps, and aspects.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Tropical Positions**| `object` | Ptolemaic Western Projection | Planets/cusps projected onto Tropical zodiac (`Western.planets` / `cusps`) |
| **Aspects & Orbs** | `array` | Aspect Angle Engine | Calculated aspects with exact orb angles (`Western.aspects`) |

#### Table 10: Esoteric & Alternative Mystical Systems (BaZi & Lal Kitab)
This table indexes Chinese Sexagenary cycle parameters and Lal Kitab house translations / remedies.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Pillars** | `object` | Chinese BaZi Calendar Engine | Stems and branches mapped to birth date-time (`Chinese.pillars`) |
| **Pucca Ghar** | `string` | Lal Kitab Translation | Planet placements translated to Aries-Ascendant house mapping (`Lal_Kitab.houses`) |
| **Remedies** | `object` | Lal Kitab Traditional Book | Specific planetary remedies for natal positions (`Lal_Kitab.remedies`) |

#### Table 11: Planetary Argalas & Obstructions (Interveners)
This table indexes planetary interventions (argala) and their corresponding obstructions (virodhargala) mapped across the 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Argalas** | `object` | Jaimini Planetary Interveners Engine | Structural Jaimini interventions across houses (`Vedic.argalas`) |

#### Table 12: Vedic Raja/Dhana Yogas & Celestial Doshas
This table indexes active auspicious combinations and major cosmic doshas present.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Active Yogas** | `array` | Yogas Evaluation Engine | Auspicious planetary formations |
| **Active Doshas** | `array` | Doshas Evaluation Engine | Inauspicious planetary afflictions |

#### Table 13: Traditional Life Predictions & Daily Muhurta
This table indexes predictive destiny analysis and the current transit-based daily muhurta.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Destiny Pathways** | `object` | Predictive Synthesis Engine | Life forecasts across key domains (Career, Wealth, Health, Marriage) |
| **Transit Muhurta** | `object` | Transit Engine | Daily auspicious and inauspicious hours based on lunar transits |

#### Table 14: Vedic Divisional Charts (Shodashavargas) Matrix
This table indexes 16 divisional charts (Varga structures D1 through D60) compiled relative to the rising Lagna.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Divisional Charts** | `object` | Divisional Chart Calculation Engine | Longitude-based divisional sub-grids (`Vedic.divisional_charts`) |

#### Table 15: Jaimini Arudha Padas (Manifested Projections of Houses)
This table indexes calculated Jaimini Arudhas of all 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Arudhas** | `object` | Pada Projection Engine | Arudha houses calculated relative to house lords (`Jaimini.arudha`) |

#### Table 16: Jaimini Sphutas & Special Lagnas (Hora, Ghati, Bhava & Pranapada)
This table indexes the sensitive Jaimini coordinates and alternative ascendants.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Special Lagnas** | `object` | Jaimini Sphuta Engine | Calculated Hora, Ghati, Bhava, and Pranapada lagnas (`Jaimini.sphutas`) |

#### Table 17: Jaimini Sahams (Arabic Sensitive Points)
This table indexes the exact sensitive degree-moments (sahams) calculated across the celestial zodiac.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Sahams** | `object` | Jaimini Sahams Calculation Engine | Points including Punya, Vidya, etc. (`Vedic.sahams`) |

#### Table 18: Vedic Upgrahas (Secondary Shadow Planets)
This table indexes coordinates, sign placements, and house coordinates of solar secondary shadow planets (Gulika, Mandi, Kaala, etc.).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Upgrahas** | `object` | Vedic Upgrahas Calculation Engine | Solar shadows calculated relative to sunrise-sunset (`Vedic.upagrahas`) |

#### Table 19: Shadbala Strengths (Rupas & Strength Ratio)
This table indexes calculated planetary strengths in Shadbala rupas across the six distinct sources of power.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Shadbala Rupas** | `float` | Shadbala Engine | Positional, temporal, directional, motional, and aspectual planetary strengths (`Vedic.strengths.shadbala`) |

#### Table 20: Ashtakavarga Bindus (Sarvashtakavarga SAV & BAV)
This table indexes the calculated Ashtakavarga Bindus (both individual planetary BAV and Sarvashtakavarga SAV sums).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **SAV Bindus** | `array` | Ashtakavarga Engine | 12 rasis' samudhaya bindus (`Vedic.strengths.ashtakavarga.sav`) |
| **BAV Bindus** | `object` | Ashtakavarga Engine | Planetary bindu distributions across zodiac signs (`Vedic.strengths.ashtakavarga.bav`) |

#### Table 21: Bhava Bala (House Strength & Relative Ranks)
This table indexes calculated strength quotients in Shashtiamsas and strength rankings of the 12 houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Bhava Strength** | `object` | Bhava Bala Engine | Total house strength coefficients and relative ranks (`Vedic.strengths.bhava_bala`) |

#### Table 22: Ishtaphala & Kashtaphala (Auspiciousness Index)
This table indexes the mathematical auspiciousness (Ishta) versus difficulty (Kashta) indices derived for each planet.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Ishta Phala** | `object` | Ishtaphala Engine | Auspicious planetary power coefficient out of 60 (`Vedic.strengths.ishta_phala`) |
| **Kashta Phala** | `object` | Ishtaphala Engine | Difficult planetary coefficient out of 60 (`Vedic.strengths.kashta_phala`) | |

---

## II. ASTROLOGICAL RULES & LOGIC GATES

All core astrological rules and logical trigger gates have been successfully compiled, indexed, and migrated from this handbook into the live **Event Book Engine** inside `/src/components/EventBookView.tsx`. This ensures single-source-of-truth integrity and live evaluation within our dynamic user-profile forecast structures.

### Compiled & Transferred System Rules Index:

1. **REL101 (Vedic Rules)**:
   * `Condition:` Venus is in Friendly Sign ➔ **Output Status:** `Supportive Relationship Spark`
2. **REL102 (Vedic Rules)**:
   * `Condition:` Jupiter aspects 7th House ➔ **Output Status:** `Relationship Protection & Divine Accord`
3. **REL103 (Vedic Rules)**:
   * `Condition:` 7th Lord in Dusthana House (6th/8th/12th) ➔ **Output Status:** `Karmic Relationship Delays`
4. **REL104 (KP Stellar Rules)**:
   * `Condition:` 7th Cuspal Sub-Lord signifies 2nd, 7th, 11th houses ➔ **Output Status:** `Positive Marriage Promise (KP_DEC_PROMISE_01)`
5. **REL105 (KP Stellar Rules)**:
   * `Condition:` 7th Cuspal Sub-Lord signifies 1st, 6th, 10th houses ➔ **Output Status:** `Career Focus Over Relationship`
6. **REL106 (KP Stellar Rules)**:
   * `Condition:` 7th Cuspal Sub-Lord signifies 4th, 10th, 12th houses ➔ **Output Status:** `Obstacles and Detachment`
7. **REL107 (Timeline Rules)**:
   * `Condition:` Active Vimshottari Mahadasha Lord is friend of 7th Lord ➔ **Output Status:** `Auspicious Relationship Window Open`
8. **REL108 (Timeline Rules)**:
   * `Condition:` Saturn transit aspects Natal 7th Cusp ➔ **Output Status:** `Reality-Check and Constructive Relationship Duty`
9. **REL109 (Timeline Rules)**:
   * `Condition:` Jupiter transit aspects Natal 7th Lord ➔ **Output Status:** `Auspicious Celestial Alignment (Go-Ahead)`

---

## III. DAILY HOROSCOPE ENGINE (KP ONLY)

This section outlines the blueprint, data parameters, and structural execution pipeline for the **Daily Horoscope Engine**, designed strictly under the Krishnamurti Paddhati (KP) astrological framework.

### 1. Global Input (Run Once)

The engine receives and parses the live sky transit coordinates at the start of each daily run:

* **Current Sky**:
  * For each Transit Planet: Longitude, Sign, House, Nakshatra, Star Lord, Sub Lord.
  * **Moon**: Longitude, Sign, House, Nakshatra, Star Lord, Sub Lord.
* **Panchanga**: Tithi, Vara, Yoga, Karana, Hora.

### 2. User Input Cache

Raw birth particulars and natal metrics are queried dynamically from the persistent user profile cache:

* **Birth Data**: Latitude, Longitude, Timezone, Place.
* **Current Vimshottari Dasha**:
  * Mahadasha (MD), Antardasha (AD), Pratyantardasha (PD), Sookshmadasha (SD), Pranadasha (Prana).
* **Natal Planet Coordinates & Indicators** (For every Natal Planet):
  * Longitude, Sign, House Occupied, House Ownership, Nakshatra, Star Lord, Sub Lord, Sub-Sub Lord (SSL), 6-Fold Significators (L1 to L6), Natural Karaka.
* **Cuspal Sublords**: Placidus house sublords for houses 1 to 12.
* **Natal Promise Cache**: Lifetime promises compiled for various life sectors.

### 3. Core Engine Pipeline

The prediction workflow progresses sequentially through four specialized processing engines:

```
┌────────────────────────────────────────────────────────┐
│                     1. DBA Engine                      │
│        Applies relative time-weights to active         │
│          MD, AD, PD, SD, and Prana period lords        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               2. Transit Trigger Engine                │
│       Traces transit-to-natal planet trigger links     │
│        (Transit Planet -> Transit Star/Sub Lords ->    │
│        Natal Planet -> Natal Star/Sub/SSL -> Score)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 3. Convergence Engine                  │
│       Merges DBA weights and transit trigger scores    │
│      producing highly specialized Active Planet Objects│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    4. House Engine                     │
│         Aggregates active planet significators         │
│       to classify Primary, Secondary, and Background   │
│                 operational houses                     │
└────────────────────────────────────────────────────────┘
```

1. **DBA Engine**: Calculates period weights for Vimshottari lords down to Prana level.
2. **Transit Trigger Engine**: Traces the dynamic transit trigger chain:
   $$\text{Transit Planet} \rightarrow \text{Transit Nakshatra} \rightarrow \text{Transit Star Lord} \rightarrow \text{Transit Sub Lord} \rightarrow \text{Natal Planet} \rightarrow \text{Natal Star Lord} \rightarrow \text{Natal Sub Lord} \rightarrow \text{Natal SSL} \rightarrow \text{Trigger Score}$$
3. **Convergence Engine**: Blends active DBA periods with Transit Triggers. It yields a structured array of **Active Planet Objects**, each encapsulating:
   * Planet
   * DBA Weight
   * Transit Nakshatra, Star, Sub
   * Natal Nakshatra, Star, Sub, SSL
   * House Occupation & Ownership
   * 6-Fold Significators
4. **House Engine**: Merges active planetary house occupation, ownership, and 6-fold significators to determine:
   * **House Frequency**: Cumulative strength counts for houses 1 to 12.
   * **Primary Houses**: Houses activated with highest frequencies.
   * **Secondary Houses**: Supporting house combinations.
   * **Background Houses**: Passive or dormant houses.

---

### 4. Output Blocks & Clusters

The engine distributes converged results across three user-facing blocks based on specific house clusters:

#### Output Block 1: Mood & Psychological State
* **Inputs**: Transiting Moon position, Moon Star Lord, Moon Sub Lord, Active Planet Objects, House activations of **Houses 1, 3, 4, 5, 6, and 12**.
* **Outputs**: Mood, Stress, Focus, Emotion, Creativity, and Mental Energy metrics.

#### Output Block 2: Behavioral Tendencies
* **Inputs**: Active Planet Objects, House activations of **Houses 2, 3, 6, 7, 10, and 11**.
* **Outputs**: Communication style, Discipline, Aggression, Patience, Leadership, Networking, Negotiation, and Learning capacities.

#### Output Block 3: Daily Theme Probability
* **Inputs**: Classified Primary Houses, Secondary Houses, Active Planet Objects.
* **Outputs**: Probability trends across Career, Money, Home, Travel, Study, Communication, Health Routine, Social Activity, Rest, Planning, and Documentation.

---

### 5. Domain Exclusions & Handlers

To maintain high focus and analytical integrity, major life events are strictly excluded from the Daily Horoscope Engine calculations:

* **Excluded Domains**:
  * Marriage
  * Promotion
  * Childbirth
  * Court Litigation
  * Property Purchase
  * Foreign Settlement
* **Handling Rule**: These long-term lifetime events are evaluated exclusively by the **NJEvent Engine** (lifetime events/promise analyzers) and are completely filtered out of daily mood/theme cycles.

