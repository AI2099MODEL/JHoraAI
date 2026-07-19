# Astrological Raw Data Presentation Schema (Calculation-Free)

This schema establishes a strict, formal blueprint for displaying the raw astrological datasets stored inside `userprofile.json` (within the `Raw` nested structures from JHora and VedicAstro REST gateways). 

Consistent with our **Strict UserProfile Data Strategy**, these tables perform **absolutely zero calculations, forecasting, or transits** at runtime. They serve purely as a high-fidelity tabular view of the stored raw payloads across different astrological systems.

---

## I. CLASSICAL VEDIC SYSTEM (PARASHARI / JHORA RAW)

### Table 1: Birth Details & Astronomical Metrics
* **Source Path**: `$.BirthDetails` and `$.Raw.VedicAstro.western_chart.astrological_details` (or JHora raw equivalents)
* **Description**: Primary demographic birth inputs and raw astronomical characteristics recorded at the moment of birth.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Native Name** | `$.BirthDetails.name` | `string` | `"Nitin"` |
| **Birth Date** | `$.BirthDetails.date` | `string` | `"1976-01-06"` |
| **Birth Time** | `$.BirthDetails.time` | `string` | `"12:14:15"` |
| **Location Place** | `$.BirthDetails.location` | `string` | `"Dehradun, India"` |
| **Latitude** | `$.BirthDetails.latitude` | `double` | `30.3165` |
| **Longitude** | `$.BirthDetails.longitude` | `double` | `78.0322` |
| **Timezone** | `$.BirthDetails.timezone` | `double` | `5.5` |
| **Ayanamsa Standard** | `$.BirthDetails.ayanamsa` | `string` | `"Lahiri"` |
| **Sunrise Time** | `$.Raw.JHora.horoscope.astronomical_details.sunrise` | `string` | `"07:13:42"` |
| **Sunset Time** | `$.Raw.JHora.horoscope.astronomical_details.sunset` | `string` | `"17:28:11"` |
| **Lunar Phase (Tithi)** | `$.Raw.JHora.horoscope.panchanga.tithi` | `string` | `"Sukla Panchami"` |

### Table 2: Natal Planets Longitudes & Rasi Placements
* **Source Path**: `$.Raw.JHora.horoscope.planets` (or `$.Raw.VedicAstro.kp_chart.planets`)
* **Description**: Raw sidereal coordinates of all major planets, luminaries, nodes, and Lagna.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet Name** | `$.[*].name` | `string` | `"Sun"` |
| **Zodiac Sign** | `$.[*].sign` | `string` | `"Sagittarius"` |
| **Exact Longitude (360°)** | `$.[*].longitude` | `double` | `261.425` |
| **Nakshatra** | `$.[*].nakshatra` | `string` | `"Poorvashadha"` |
| **Nakshatra Pada** | `$.[*].pada` | `integer` | `3` |
| **Is Retrograde?** | `$.[*].is_retrograde` | `boolean` | `false` |
| **Is Combust?** | `$.[*].is_combust` | `boolean` | `false` |

### Table 3: Shadbala Planet Strength Matrix
* **Source Path**: `$.Raw.JHora.horoscope.shadbala`
* **Description**: Raw quantitative planetary strength metrics computed by Jagannatha Hora.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].name` | `string` | `"Jupiter"` |
| **Positional Strength (Sthana Bala)** | `$.[*].sthana_bala` | `double` | `165.2` |
| **Directional Strength (Dig Bala)** | `$.[*].dig_bala` | `double` | `55.0` |
| **Temporal Strength (Kala Bala)** | `$.[*].kala_bala` | `double` | `120.4` |
| **Motional Strength (Cheshta Bala)** | `$.[*].cheshta_bala` | `double` | `48.1` |
| **Natural Strength (Naisargika Bala)**| `$.[*].naisargika_bala` | `double` | `60.0` |
| **Aspect Strength (Drik Bala)** | `$.[*].drik_bala` | `double` | `-12.5` |
| **Total Shadbala (in Shashtiamsas)** | `$.[*].total_shadbala` | `double` | `436.2` |
| **Required Minimum Strength** | `$.[*].minimum_required` | `double` | `390.0` |

### Table 4: Bhava Balas (House Strengths)
* **Source Path**: `$.Raw.JHora.horoscope.bhava_balas`
* **Description**: Raw positional and aspect strengths for the 12 houses.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **House Number** | `$.[*].house_number` | `integer` | `1` |
| **House Lord Strength (Adhipati Bala)**| `$.[*].adhipati_bala` | `double` | `422.3` |
| **House Occupant Strength** | `$.[*].occupant_bala` | `double` | `60.0` |
| **House Aspect Strength (Bhava Dristi)**| `$.[*].aspect_bala` | `double` | `14.2` |
| **Total Bhava Bala** | `$.[*].total_bhava_bala`| `double` | `496.5` |

### Table 5: Samudhaya Ashtakavarga Points
* **Source Path**: `$.Raw.JHora.horoscope.ashtakavarga`
* **Description**: Distribution of Binnashtakavarga (BAV) points and Samudhaya Ashtakavarga (SAV) totals for each of the 12 houses.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **House Number** | `$.[*].house_number` | `integer` | `4` |
| **Zodiac Sign** | `$.[*].sign` | `string` | `"Cancer"` |
| **SAV Total Points** | `$.[*].sav_points` | `integer` | `28` |
| **BAV Sun Points** | `$.[*].bav.Sun` | `integer` | `4` |
| **BAV Moon Points** | `$.[*].bav.Moon` | `integer` | `5` |
| **BAV Mars Points** | `$.[*].bav.Mars` | `integer` | `3` |

### Table 6: Divisional Vargas (D1 to D60) Planetary House Distributions
* **Source Path**: `$.Raw.JHora.horoscope.divisional_charts`
* **Description**: Structural distribution arrays of planets within each of the 16 standard Parashari divisional (Varga) charts.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Varga ID** | `$.[*].varga_id` | `string` | `"D-9_navamsa"` |
| **House Number** | `$.[*].house_number` | `integer` | `10` |
| **Occupant Planets** | `$.[*].occupants` | `array of strings` | `["Sun", "Mercury"]` |

### Table 7: Vimshottari Mahadasha Timelines
* **Source Path**: `$.Raw.VedicAstro.kp_dasha` (or JHora dasha payloads)
* **Description**: Chronological Maha and Antardasha cycles mapped directly from the raw timeline array.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Mahadasha Lord** | `$.[*].mahadasha_lord` | `string` | `"Jupiter"` |
| **Start Date** | `$.[*].start_date` | `string` | `"2016-01-06"` |
| **End Date** | `$.[*].end_date` | `string` | `"2032-01-06"` |
| **Antardasha Lord** | `$.[*].antardashas.[*].lord`| `string` | `"Saturn"` |
| **Antardasha Start** | `$.[*].antardashas.[*].start`| `string` | `"2018-05-24"` |

---

## II. KP STELLAR SYSTEM (KRISHNAMURTI PADDHATI)

### Table 8: Placidus House Cusp Coordinates & Lords
* **Source Path**: `$.Raw.VedicAstro.kp_cusps`
* **Description**: Raw Placidus house boundaries and planetary rulers for all 12 cusps.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Cusp Number** | `$.[*].cusp_number` | `integer` | `1` |
| **Zodiac Sign** | `$.[*].sign` | `string` | `"Aries"` |
| **Longitude (Cusp Degree)** | `$.[*].degree` | `string` | `"14° 25' 12\""` |
| **Sign Lord (Rasi Lord)** | `$.[*].sign_lord` | `string` | `"Mars"` |
| **Star Lord (Nakshatra Lord)** | `$.[*].star_lord` | `string` | `"Venus"` |
| **Sub Lord** | `$.[*].sub_lord` | `string` | `"Jupiter"` |
| **Sub-Sub Lord** | `$.[*].sub_sub_lord` | `string` | `"Saturn"` |

### Table 9: KP Planetary Sub-Lords & Coordinates
* **Source Path**: `$.Raw.VedicAstro.kp_starlords` (or `$.Raw.VedicAstro.kp_chart.planets`)
* **Description**: Krishnamurti Paddhati's specific planetary sub-rulers mapped byte-for-byte.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].planet_name` | `string` | `"Moon"` |
| **Zodiac Sign** | `$.[*].sign` | `string` | `"Aquarius"` |
| **Sign Lord** | `$.[*].sign_lord` | `string` | `"Saturn"` |
| **Star Lord** | `$.[*].star_lord` | `string` | `"Rahu"` |
| **Sub Lord** | `$.[*].sub_lord` | `string` | `"Jupiter"` |
| **Sub-Sub Lord** | `$.[*].sub_sub_lord` | `string` | `"Venus"` |

### Table 10: KP Planet-Level Significators
* **Source Path**: `$.Raw.VedicAstro.kp_planet_significators`
* **Description**: Exact raw houses signified by each planet (A: Star-Lord's houses, B: Planet's house, C: Star-Lord's ownership, D: Planet's ownership).

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].planet_name` | `string` | `"Mars"` |
| **Level A Houses** | `$.[*].level_A` | `array of integers`| `[2, 9]` |
| **Level B Houses** | `$.[*].level_B` | `array of integers`| `[1]` |
| **Level C Houses** | `$.[*].level_C` | `array of integers`| `[8]` |
| **Level D Houses** | `$.[*].level_D` | `array of integers`| `[1, 8]` |

### Table 11: KP House-Level Significators
* **Source Path**: `$.Raw.VedicAstro.kp_house_significators`
* **Description**: Roster of planets functioning as significators for each of the 12 cusps.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **House Number** | `$.[*].house_number` | `integer` | `7` |
| **Significator Planets (Strongest first)**| `$.[*].significators`| `array of strings` | `["Venus", "Jupiter", "Sun"]` |

---

## III. JAIMINI SYSTEM

### Table 12: Jaimini Chara Karakas
* **Source Path**: `$.Raw.JHora.horoscope.jaimini.karakas`
* **Description**: Raw Jaimini significators mapped by sorting planetary degrees in descending order.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Karaka Role** | `$.[*].karaka_role` | `string` | `"Atmakaraka (AK)"` |
| **Associated Planet** | `$.[*].planet_name` | `string` | `"Saturn"` |
| **Planet Sidereal Longitude**| `$.[*].longitude` | `double` | `29.452` |

### Table 13: Jaimini Arudhas & Padas
* **Source Path**: `$.Raw.JHora.horoscope.jaimini.arudhas`
* **Description**: Positional house designations for all 12 Arudha Padas.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Arudha Name** | `$.[*].arudha_name` | `string` | `"Arudha Lagna (AL)"` |
| **House Placement** | `$.[*].house_number` | `integer` | `4` |
| **Zodiac Sign** | `$.[*].sign` | `string` | `"Cancer"` |

---

## IV. WESTERN ASTROLOGY SYSTEM

### Table 14: Tropical Planetary Placements
* **Source Path**: `$.Raw.VedicAstro.western_chart.planets`
* **Description**: Raw coordinates calculated using the Tropical zodiac system.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].name` | `string` | `"Uranus"` |
| **Tropical Longitude** | `$.[*].longitude` | `double` | `42.512` |
| **Formatted Position** | `$.[*].formatted_degree` | `string` | `"12° Taurus 30'"` |
| **House Placement** | `$.[*].house_number` | `integer` | `2` |

### Table 15: Tropical Planetary Aspects Matrix
* **Source Path**: `$.Raw.VedicAstro.western_chart.aspects`
* **Description**: Raw angular relationships, aspects, and exact orb differences between natal planets.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet 1** | `$.[*].planet_1` | `string` | `"Sun"` |
| **Planet 2** | `$.[*].planet_2` | `string` | `"Saturn"` |
| **Aspect Type** | `$.[*].aspect` | `string` | `"Trine"` |
| **Exact Angle** | `$.[*].angle` | `double` | `119.25` |
| **Orb Deviation** | `$.[*].orb` | `double` | `0.75` |

---

## V. TAJIKA SYSTEM

### Table 16: Tajik Varshaphal Planetary Coordinates
* **Source Path**: `$.Raw.JHora.horoscope.tajika.planets`
* **Description**: Planetary placements inside the Solar Return (Varshaphal) chart for the active year.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].name` | `string` | `"Mars"` |
| **Varshaphal Longitude** | `$.[*].longitude` | `double` | `112.51` |
| **Varshaphal House** | `$.[*].house` | `integer` | `5` |

### Table 17: Tajik Harsha Balas (4-Fold Strength)
* **Source Path**: `$.Raw.JHora.horoscope.tajika.harsha_bala`
* **Description**: Raw strength checkmarks (First, Second, Third, and Fourth strengths) giving the cumulative strength in points.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].name` | `string` | `"Jupiter"` |
| **First Strength (Sthana)** | `$.[*].first_bala` | `integer` | `5` |
| **Second Strength (Vara)** | `$.[*].second_bala` | `integer` | `0` |
| **Third Strength (Udaya)** | `$.[*].third_bala` | `integer` | `5` |
| **Fourth Strength (Kala)** | `$.[*].fourth_bala` | `integer` | `5` |
| **Total Harsha Bala Score** | `$.[*].total_score` | `integer` | `15` |

---

## VI. LAL KITAB SYSTEM

### Table 18: Lal Kitab Planetary Houses & Placements
* **Source Path**: `$.Raw.JHora.horoscope.lalkitab.planets`
* **Description**: Planetary coordinates mapped to Lal Kitab's standard 1-to-12 houses (where the 1st House is permanently Aries, 2nd is Taurus, etc.).

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Planet** | `$.[*].name` | `string` | `"Mercury"` |
| **Natal House (Rasi House)** | `$.[*].natal_house` | `integer` | `9` |
| **Lal Kitab House (LKB House)**| `$.[*].lalkitab_house` | `integer` | `9` |
| **LKB Rasi Sign Equivalent** | `$.[*].lkb_sign` | `string` | `"Sagittarius"` |

### Table 19: Lal Kitab Teva & Sleeping Planet Status
* **Source Path**: `$.Raw.JHora.horoscope.lalkitab.teva`
* **Description**: Raw status indicators identifying if the horoscope represents a Dharmi Teva, Blind Teva, or if specific planets are sleeping.

| Field | JSON Path | Data Type | Sample Raw Value |
| :--- | :--- | :--- | :--- |
| **Teva Classification Type** | `$.teva_type` | `string` | `"Dharmi Teva (Auspicious)"`|
| **Blind Planet Status** | `$.blind_planets_active` | `boolean` | `false` |
| **Sleeping Planets Roster** | `$.sleeping_planets` | `array of strings` | `["Venus", "Saturn"]` |
