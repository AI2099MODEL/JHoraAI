# JHora AI Field Source Matrix

This matrix maps **every** field displayed within the JHora AI application to its corresponding provenance category, alongside its exact JSON path (for API-official data), local derivation function (for client-calculated data), AI prompt references, or placeholder statuses.

---

## Provenance Matrix Table

| Tab / View | Field Display Name | Provenance Source | API JSON Path (SOURCE_A) | Local Derivation Class + Function (SOURCE_B) | AI / Placeholder Notes (SOURCE_C & D) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Birth Details** | Name | **SOURCE_A** | `birth_details.name` | - | Form-populated / falling back to `Native` |
| **Birth Details** | Birth Date | **SOURCE_A** | `birth_details.date` | - | Form-populated / falling back to `1976-01-06` |
| **Birth Details** | Birth Time | **SOURCE_A** | `birth_details.time` | - | Form-populated / falling back to `18:40:00` |
| **Birth Details** | Location (Place) | **SOURCE_A** | `birth_details.place` | - | Form-populated / falling back to `Dehradun` |
| **Birth Details** | Latitude | **SOURCE_A** | `birth_details.latitude` | - | Form-populated / falling back to `30.3244` |
| **Birth Details** | Longitude | **SOURCE_A** | `birth_details.longitude` | - | Form-populated / falling back to `78.0339` |
| **Birth Details** | Timezone | **SOURCE_A** | `birth_details.timezone` | - | Form-populated / falling back to `5.5` |
| **Lagna (Asc)** | Sign Name | **SOURCE_A** | `horoscope.divisional_charts["D-1_rasi"]["Ascendant"].sign` | - | - |
| **Lagna (Asc)** | Sign Index | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Sign index derived via local string lookup in `ZODIAC_SIGNS` array |
| **Lagna (Asc)** | Total Longitude | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Calculated: `signIndex * 30 + ascendant_degree` |
| **Lagna (Asc)** | Degree (Minutes/Sec) | **SOURCE_A** | `horoscope.divisional_charts["D-1_rasi"]["Ascendant"].longitude` | - | - |
| **Lagna (Asc)** | Nakshatra | **SOURCE_A** | `horoscope.nakshatra_pada["Ascendant"].nakshatra` | - | - |
| **Lagna (Asc)** | Nakshatra Pada | **SOURCE_A** | `horoscope.nakshatra_pada["Ascendant"].pada` | - | - |
| **Panchanga** | Tithi | **SOURCE_A** | `horoscope.calendar_info.Tithi` | - | Name of Lunar Day extracted from payload |
| **Panchanga** | Nakshatra | **SOURCE_A** | `horoscope.nakshatra_pada["Moon"].nakshatra` | - | Taken directly from Moon Nakshatra coordinate |
| **Panchanga** | Yoga | **SOURCE_A** | `horoscope.calendar_info.Yoga` | - | Name of Soli-Lunar Yoga extracted from payload |
| **Panchanga** | Karana | **SOURCE_A** | `horoscope.calendar_info.Karana` | - | Name of Half-Lunar Day extracted from payload |
| **Panchanga** | Varna (Caste/Duty) | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Formula: `Moon_Sign_Index % 4` mapped to Varna array |
| **Panchanga** | Vashya (Temperament) | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Formula: `Moon_Sign_Index % 5` mapped to Vashya array |
| **Panchanga** | Yoni (Genetic Affinity) | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Formula: `Moon_Sign_Index % 14` mapped to Yoni array |
| **Panchanga** | Gana (Temperament Type)| **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Formula: `Moon_Nakshatra_Index % 3` mapped to Gana array |
| **Panchanga** | Nadi (Physiological Constitution) | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Formula: `Moon_Nakshatra_Index % 3` mapped to Nadi array |
| **Grahas (Planets)**| Planet Name | **SOURCE_A** | Object keys in `horoscope.divisional_charts["D-1_rasi"]` | - | Standard list: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu |
| **Grahas (Planets)**| Planet Sign | **SOURCE_A** | `horoscope.divisional_charts["D-1_rasi"][planet].sign` | - | - |
| **Grahas (Planets)**| Planet Degree | **SOURCE_A** | `horoscope.divisional_charts["D-1_rasi"][planet].longitude` | - | - |
| **Grahas (Planets)**| Planet Nakshatra | **SOURCE_A** | `horoscope.nakshatra_pada[planet].nakshatra` | - | - |
| **Grahas (Planets)**| Planet Pada | **SOURCE_A** | `horoscope.nakshatra_pada[planet].pada` | - | - |
| **Grahas (Planets)**| Planet Nakshatra Lord | **SOURCE_A** | `horoscope.nakshatra_pada[planet].nakshatra_lord` | - | - |
| **Grahas (Planets)**| House Placement (Relative) | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Calculated: `(planetSignIndex - ascendantSignIndex + 12) % 12 + 1` |
| **Grahas (Planets)**| Planet Shadbala Strength % | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Calculated: `Math.round(strengthRatio * 100)` using ratio from `horoscope.shad_bala` |
| **Vargas (Divisions)**| Vargas D1 - D60 Charts | **SOURCE_A** | `horoscope.divisional_charts[vargaName]` | - | Includes D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D16, D20, D24, D27, D30, D40, D45, D60 |
| **Vargas (Divisions)**| Vargas House Assignment | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Calculated: `(planetSignIndexInDivision - vargaLagnaSignIndex + 12) % 12 + 1` |
| **Vargas (Divisions)**| Varga Lagna Sign Index | **SOURCE_A** | `horoscope.divisional_charts[vargaName]["Ascendant"].sign` index | - | Index mapped locally from standard array |
| **Shadbala Table** | Sthana / Dig / Kala / Cheshta / Naisargika / Drig Bala | **SOURCE_A** | `horoscope.shad_bala[row_index]` | - | Detailed values parsed from raw arrays corresponding to rows 0 to 5 |
| **Shadbala Table** | Total Shadbala Strength | **SOURCE_A** | `horoscope.shad_bala[6]` | - | Row 6 contains total shadbala strength value in Shashtiamsas |
| **Shadbala Table** | Strength Ratio | **SOURCE_A** | `horoscope.shad_bala[8]` | - | Row 8 contains required ratio to check if planet is strong |
| **Bhava Bala** | House Strength | **SOURCE_A** | `horoscope.bhava_bala[houseIndex]` | - | Parsed from strength string (e.g. `450.3 Shashtiamsas`) |
| **Bhava Bala** | House Rank | **SOURCE_A** | `horoscope.bhava_bala[houseIndex]` | - | Extracted rank index from raw string output |
| **Ashtakavarga** | Sarvashtakavarga Scores | **SOURCE_A** | `horoscope.ashtakavarga.samudhaya_ashtaka_varga` | - | Array of 12 scores representing sum total of benefic points per house |
| **Ashtakavarga** | Bhinna Ashtakavarga Scores | **SOURCE_A** | `horoscope.ashtakavarga.binna_ashtaka_varga` | - | Matrix of 8 rows (7 planets + Ascendant) by 12 house columns |
| **Dashas** | Vimshottari Timeline | **SOURCE_A** | `horoscope.graha_dashas.vimsottari` | `jhoraMapper.ts` -> `parseJHoraDasha()` | Hierarchical tree parsed from flat list containing Mahadasha, Antardasha, Pratyantardasha |
| **Dashas** | Yogini Timeline | **SOURCE_A** | `horoscope.graha_dashas.yogini` | `jhoraMapper.ts` -> `parseJHoraDasha()` | Hierarchical tree parsed from flat list containing Mahadasha, Antardasha |
| **Dashas** | Ashtottari Timeline | **SOURCE_A** | `horoscope.graha_dashas.ashtottari` | `jhoraMapper.ts` -> `parseJHoraDasha()` | Hierarchical tree parsed from flat list containing Mahadasha, Antardasha |
| **Special Points** | Arudha Padhas (A1-A11, UL) | **SOURCE_A** | `horoscope.arudha_padhas` or `horoscope.arudhas` | - | Coordinates representing reflective points of houses |
| **Special Points** | Sphutas (Special Degrees) | **SOURCE_A** | `horoscope.sphutas` or `horoscope.sphuta` | - | Special longitudes representing yoga nodes (Prana, Deha, etc.) |
| **Special Points** | Upagrahas (Secondary nodes) | **SOURCE_A** | `horoscope.upagrahas` | - | Non-luminous secondary planets (Mandhi, Gulika, etc.) |
| **Special Points** | Sahams (Auspicious points) | **SOURCE_A** | `horoscope.sahams` | - | Highly specific Arabic-derived calculation points |
| **Argalas** | Argala & Virodhargala | **SOURCE_B** | - | `jhoraMapper.ts` -> `calculateArgalas()` | Formula: Loops 1-12 houses, checks configurations: Primary (2nd vs 12th, 4th vs 10th, 11th vs 3rd) & Secondary (5th vs 9th) |
| **Doshas** | Manglik Dosha | **SOURCE_A** | `horoscope.doshas["Manglik Dosha"]` | - | - |
| **Doshas** | Kaal Sarp Dosha | **SOURCE_A** | `horoscope.doshas["Kala Sarpa Dosha"]` | - | - |
| **Doshas** | Pitru Dosha | **SOURCE_A** | `horoscope.doshas["Pitru Dosha"]` | - | - |
| **Doshas** | Shani Sade Sati | **SOURCE_B** | - | `jhoraMapper.ts` -> `mapJHoraResponseToAstrologyData()` | Calculated: Difference index between Saturn and Moon. Rising: 11, Peak: 0, Setting: 1. Else inactive. |
| **Yogas** | Solar / Lunar Yogas List | **SOURCE_A** | `horoscope.yogas` or `horoscope.yogas.yoga_list` | - | Dynamically parsed into array objects containing name, description, explanation |
| **Transits (Gochara)**| Gochara Planet Sign & Deg | **SOURCE_A** | `horoscope.divisional_charts["D-1_rasi"]` for target date | - | Fetched by calling horoscope route for target date and mapping placements |
| **Transits (Gochara)**| Gochara House (Relative) | **SOURCE_B** | - | `server.ts` -> `/api/jhora/gochara` endpoint | Calculated: `(transitPlanetSignIdx - birthAscendantSignIdx + 12) % 12 + 1` |
| **Planet Ingress** | Ingress Events (Re-entry) | **SOURCE_D** | - | - | **Hardcoded Placeholder**: Returns mock static Saturn/Jupiter transition dates and signs (`server.ts` line 180) |
| **Daily Muhurtas** | Auspicious Hours | **SOURCE_D** | - | - | **Hardcoded Placeholder**: Returns mock static Abhijit, Brahma, and Rahu Kaal hours (`server.ts` line 206) |
| **Marriage Match** | Compatibility Points | **SOURCE_B** | - | `src/lib/astrology.ts` -> `calculateCompatibility()` | **Locally derived Ashtakoota Milan (36 Points)** using Groom and Bride Moon placements |
| **AI Chat / Report**| Comprehensive Analysis | **SOURCE_C** | - | - | **AI Generated**: Prompt submitted to Gemini API with full mapped astrological profile context (`server.ts` line 375) |
| **PDF Compiler** | Export PDF Page count | **SOURCE_D** | - | - | **Hardcoded / Simulated UI parameter**: Renders static (6 Pages • 1.2MB) meta indicators upon compiling. |
| **AstroChart** | D1 to D60 Chart Nodes | **SOURCE_A** | `horoscope.divisional_charts` | - | Visually drawn on HTML canvas/SVG using mapped coordinates. |
