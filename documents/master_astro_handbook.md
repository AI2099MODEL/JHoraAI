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

#### Table 3: Astronomical Alignment Parameters (Data Schema & Index Logic)
This table indexes the calculated astronomical parameters from the ephemeris.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Julian Day** | `string` | Astronomical Calculation Engine | Derived dynamically from UTC birth moment timestamp (`Astronomical.julian_day_number`) |
| **Sidereal Time** | `string` | Local Sidereal Meridian | Derived dynamically from longitude and UTC birth time (`Astronomical.sidereal_time`) |
| **Obliquity** | `string` | Ecliptic inclination | Obliquity of the ecliptic derived for Julian epoch (`Astronomical.obliquity`) |
| **Sunrise / Sunset** | `string` | Solar Horizon calculation | Calculated solar rise and set times for coordinates (`Astronomical.sunrise` / `sunset`) |
| **Moon Phase** | `string` | Tithi calculation | Angular distance of Moon from Sun at birth (`Astronomical.moon_phase`) |

#### Table 4: Planetary Placements & Dignities (Vedic Engine)
This table indexes the calculated planetary longitudinal values, zodiac signs, and houses.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Planet Longitude** | `float` | JHora Raw API / Swiss Ephemeris | Celestial longitude in 360-degree coordinates (`Vedic.planets.[Planet].longitude`) |
| **House Placement** | `int` | Divisional Chart Engine | Bhava division placement (`Vedic.planets.[Planet].house`) |
| **Sign Placement** | `string` | Zodiac Sign Map | Zodiacal sign containing the planet coordinate (`Vedic.planets.[Planet].sign`) |
| **Nakshatra** | `string` | Nakshatra Engine | 27-Nakshatra division mapping (`Vedic.planets.[Planet].nakshatra`) |

#### Table 5: KP System Cusps & Planets (KP Engine)
This table indexes the Krishnamurti Paddhati stellar, sub, and sub-sub significators.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Cuspal Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of Placidus house cusps 1 to 12 (`KP.cusps.[House].sub_lord`) |
| **Planet Sub-Lord** | `string` | KP Stellar Division Engine | Sub-lord of natal planetary placements (`KP.planets.[Planet].sub_lord`) |
| **Significators** | `array` | KP Significator Engine | Houses signified by planets under KP rules (`KP.planet_significators`) |

#### Table 6: Jaimini Parameters & Dashas (Jaimini Engine)
This table indexes the Jaimini karakas, arudhas, and Chara Dashas.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Chara Karakas** | `object` | Jaimini Rank Engine | Planetary rankings by degree (Atmakaraka to Darakaraka) (`Jaimini.karakas`) |
| **Arudha Padas** | `object` | Pada Projection Engine | Arudha houses calculated relative to house lords (`Jaimini.arudha`) |
| **Chara Dashas** | `array` | Jaimini Dasha Engine | Sign-based dasha progression sequence and durations (`Jaimini.chara_dasha`) |

#### Table 7: Lal Kitab Placements & Remedies (Lal Kitab Engine)
This table indexes Lal Kitab house translations and astrological remedies.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Pucca Ghar** | `string` | Lal Kitab Translation | Planet placements translated to Aries-Ascendant house mapping (`Lal_Kitab.houses`) |
| **Remedies** | `object` | Lal Kitab Traditional Book | Specific planetary remedies for natal positions (`Lal_Kitab.remedies`) |

#### Table 8: Tajik Varshaphal Aspects & Muntha (Tajik Engine)
This table indexes annual solar return Muntha and Tajik aspects.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Muntha House** | `int` | Tajik Progression Engine | progressed annual lagna house (`Tajik.varshaphal_2026.muntha_house`) |
| **Tajik Aspects** | `array` | Harsha/Ithasala Engine | Tajik yoga aspects (e.g. Ithasala, Eesapha) (`Tajik.varshaphal_2026.aspects`) |

#### Table 9: Chinese BaZi Four Pillars (Bazi Engine)
This table indexes Chinese Sexagenary cycle parameters (Year, Month, Day, and Hour Pillars).

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Pillars** | `object` | Chinese BaZi Calendar Engine | Stems and branches mapped to birth date-time (`Chinese.pillars`) |
| **Elements Balance**| `object` | Element Quantification | Wood, Fire, Earth, Metal, and Water counts (`Chinese.elements`) |

#### Table 10: Tropical Western Chart & Aspects (Western Engine)
This table indexes Tropical Western astrology planets, cusps, and aspects.

| Parameter | Data Type | Primary Source / Info Origin | Logic & Provenance Source |
| :--- | :--- | :--- | :--- |
| **Tropical Positions**| `object` | Ptolemaic Western Projection | Planets/cusps projected onto Tropical zodiac (`Western.planets` / `cusps`) |
| **Aspects & Orbs** | `array` | Aspect Angle Engine | Calculated aspects with exact orb angles (`Western.aspects`) |

---

## II. ASTROLOGICAL RULES & LOGIC GATES

The JHora AI Astrological Engine evaluates these logic gates against Table 1 and our natal planetary coordinate matrices.

### 200. Core Relationship Promise Rules
* **Vedic Rules:**
  * Condition: Venus is in Friendly Sign -> Output Status: Supportive Relationship Spark
  * Condition: Jupiter aspects 7th House -> Output Status: Relationship Protection & Divine Accord
  * Condition: 7th Lord in Dusthana House (6th/8th/12th) -> Output Status: Karmic Relationship Delays

* **KP Stellar Rules:**
  * Condition: 7th Cuspal Sub-Lord signifies 2nd, 7th, 11th houses -> Output Status: Positive Marriage Promise (KP_DEC_PROMISE_01)
  * Condition: 7th Cuspal Sub-Lord signifies 1st, 6th, 10th houses -> Output Status: Career Focus Over Relationship
  * Condition: 7th Cuspal Sub-Lord signifies 4th, 10th, 12th houses -> Output Status: Obstacles and Detachment

### 300. Dasha & Transit Activation Rules
* **Timeline Rules:**
  * Condition: Active Vimshottari Mahadasha Lord is friend of 7th Lord -> Output Status: Auspicious Relationship Window Open
  * Condition: Saturn transit aspects Natal 7th Cusp -> Output Status: Reality-Check and Constructive Relationship Duty
  * Condition: Jupiter transit aspects Natal 7th Lord -> Output Status: Auspicious Celestial Alignment (Go-Ahead)
