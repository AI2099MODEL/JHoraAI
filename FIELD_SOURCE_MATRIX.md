# Field Source Matrix: Provenance Audit Table
**Date:** July 15, 2026
**Subject:** Precise field-level source mapping of all displayed parameters in the JHoraAI dashboard.

---

## 1. Overview
The following table documents every single field displayed within the JHoraAI application interface, identifying its authoritative source and classifying it into exactly one of our four provenance categories (**SOURCE_A**, **SOURCE_B**, **SOURCE_C**, or **SOURCE_D**). No categories are mixed.

---

## 2. Provenance Audit Matrix

| Field Name | Source | API JSON Path (if SOURCE_A) | Calculation Class + Function (if SOURCE_B) | AI Prompt (if SOURCE_C) |
|---|---|---|---|---|
| **Lagna (Ascendant) Sign** | SOURCE_A | `horoscope.divisional_charts["D-1_rasi"]["Ascendant"].sign` | N/A | N/A |
| **Lagna (Ascendant) Degree** | SOURCE_A | `horoscope.divisional_charts["D-1_rasi"]["Ascendant"].longitude` | N/A | N/A |
| **Lagna (Ascendant) Longitude (0-360°)** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: signIndex * 30 + degree* | N/A |
| **Lagna Nakshatra** | SOURCE_A | `horoscope.nakshatra_pada["Ascendant"].nakshatra` | N/A | N/A |
| **Lagna Pada** | SOURCE_A | `horoscope.nakshatra_pada["Ascendant"].pada` | N/A | N/A |
| **Planet Sign** *(Sun, Moon, Mars, etc.)* | SOURCE_A | `horoscope.divisional_charts["D-1_rasi"][planetName].sign` | N/A | N/A |
| **Planet Degree** *(Sun, Moon, Mars, etc.)* | SOURCE_A | `horoscope.divisional_charts["D-1_rasi"][planetName].longitude` | N/A | N/A |
| **Planet Nakshatra** *(Sun, Moon, Mars, etc.)* | SOURCE_A | `horoscope.nakshatra_pada[planetName].nakshatra` | N/A | N/A |
| **Planet Pada** *(Sun, Moon, Mars, etc.)* | SOURCE_A | `horoscope.nakshatra_pada[planetName].pada` | N/A | N/A |
| **Planet Nakshatra Lord** *(Sun, Moon, Mars, etc.)* | SOURCE_A | `horoscope.nakshatra_pada[planetName].nakshatra_lord` | N/A | N/A |
| **Planet House** *(Sun, Moon, Mars, etc.)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: (pSignIdx - ascSignIndex + 12) % 12 + 1* | N/A |
| **Planet Longitude (0-360°)** *(Sun, Moon, Mars, etc.)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: signIndex * 30 + degree* | N/A |
| **Shadbala Strength Percentage** *(Sun, Moon, etc.)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: Math.round(strengthRatio * 100)* | N/A |
| **Shadbala - Sthana Bala** | SOURCE_A | `horoscope.shad_bala[0][colIdx]` | N/A | N/A |
| **Shadbala - Dig Bala** | SOURCE_A | `horoscope.shad_bala[1][colIdx]` | N/A | N/A |
| **Shadbala - Kala Bala** | SOURCE_A | `horoscope.shad_bala[2][colIdx]` | N/A | N/A |
| **Shadbala - Cheshta Bala** | SOURCE_A | `horoscope.shad_bala[3][colIdx]` | N/A | N/A |
| **Shadbala - Naisargika Bala** | SOURCE_A | `horoscope.shad_bala[4][colIdx]` | N/A | N/A |
| **Shadbala - Drig Bala** | SOURCE_A | `horoscope.shad_bala[5][colIdx]` | N/A | N/A |
| **Shadbala - Total Score** | SOURCE_A | `horoscope.shad_bala[6][colIdx]` | N/A | N/A |
| **Shadbala - Strength Ratio** | SOURCE_A | `horoscope.shad_bala[8][colIdx]` | N/A | N/A |
| **Bhava Bala House Strength** *(Raw text)* | SOURCE_A | `horoscope.bhava_bala[houseIdx]` | N/A | N/A |
| **Bhava Bala House Strength** *(Parsed)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: bStr.match(/[\d.]+/g)* | N/A |
| **Bhava Bala House Rank** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: assigns house ranking based on parsed strength* | N/A |
| **SAV Points** *(Sarvashtakavarga)* | SOURCE_A | `horoscope.ashtakavarga.samudhaya_ashtaka_varga` | N/A | N/A |
| **BAV Points** *(Bhinnashtakavarga planets)* | SOURCE_A | `horoscope.ashtakavarga.binna_ashtaka_varga` | N/A | N/A |
| **D1 Rasi Chart Placements** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: groups planet names into natal house index arrays* | N/A |
| **D9 Navamsa Chart Placements** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: calculates relative houses relative to D9 Ascendant* | N/A |
| **Vimshottari Dasha Major Period Lord** | SOURCE_A | `horoscope.graha_dashas.vimsottari` | N/A | N/A |
| **Vimshottari Dasha Major Start/End Dates** | SOURCE_A | `horoscope.graha_dashas.vimsottari` | N/A | N/A |
| **Vimshottari Dasha Minor Period Lord** | SOURCE_B | N/A | `parseJHoraDasha` in `src/lib/jhoraMapper.ts` <br/> *Formula: splits path string like "Sun-Sun-Sun"* | N/A |
| **Vimshottari Dasha Minor Start/End Dates** | SOURCE_B | N/A | `parseJHoraDasha` in `src/lib/jhoraMapper.ts` <br/> *Formula: groups nested timeline periods chronologically* | N/A |
| **Yogini Dasha Lord & Dates** | SOURCE_A | `horoscope.graha_dashas.yogini` | N/A | N/A |
| **Ashtottari Dasha Lord & Dates** | SOURCE_A | `horoscope.graha_dashas.ashtottari` | N/A | N/A |
| **Panchanga - Tithi** | SOURCE_A | `horoscope.calendar_info.Tithi` | N/A | N/A |
| **Panchanga - Nakshatra** | SOURCE_A | `horoscope.nakshatra_pada["Moon"].nakshatra` | N/A | N/A |
| **Panchanga - Yoga** | SOURCE_A | `horoscope.calendar_info.Yoga` | N/A | N/A |
| **Panchanga - Karana** | SOURCE_A | `horoscope.calendar_info.Karana` | N/A | N/A |
| **Panchanga - Varna** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: varnas[moon_p.signIndex % 4]* | N/A |
| **Panchanga - Vashya** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: vashyas[moon_p.signIndex % 5]* | N/A |
| **Panchanga - Yoni** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: yonis[moon_p.signIndex % 14]* | N/A |
| **Panchanga - Gana** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: ganas[moonNakIdx % 3]* | N/A |
| **Panchanga - Nadi** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: nadis[moonNakIdx % 3]* | N/A |
| **Auspicious Astrological Yogas** *(Presence)* | SOURCE_A | `horoscope.yogas.yoga_list` | N/A | N/A |
| **Auspicious Astrological Yogas** *(Parsing)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: extracts list elements, formats to structured types* | N/A |
| **Manglik Dosha** *(Presence & Explanation text)* | SOURCE_A | `horoscope.doshas["Manglik Dosha"]` | N/A | N/A |
| **Manglik Dosha** *(Sanitization & Scoring)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: checks "no Manglik" and assigns score of 70/0* | N/A |
| **Kaal Sarp Dosha** *(Presence & Explanation)* | SOURCE_A | `horoscope.doshas["Kala Sarpa Dosha"]` | N/A | N/A |
| **Kaal Sarp Dosha** *(Sanitization)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: strips HTML tags via replace(/<[^>]*>/g, "")* | N/A |
| **Sade Sati Dosha Presence** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: [11, 0, 1].includes(satMoonDiff)* | N/A |
| **Sade Sati Dosha Stage** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: satMoonDiff === 11 ? "Rising" : satMoonDiff === 0 ? "Peak" : "Setting"* | N/A |
| **Sade Sati Dosha Explanation** | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: maps custom text explaining Moon sign to Saturn sign* | N/A |
| **Muhurtas** *(Abhijit, Brahma, Rahu Kaal)* | SOURCE_D | N/A | N/A | N/A |
| **Varga Divisional Charts** *(D2 to D60)* | SOURCE_A | `horoscope.divisional_charts` | N/A | N/A |
| **Varga Lagnas** | SOURCE_A | `horoscope.divisional_charts[vKey].Ascendant.sign` | N/A | N/A |
| **Longevity Category, Years, & Details** | SOURCE_A | `horoscope.longevity_prediction` | N/A | N/A |
| **Arudha Padhas** *(Sign & house mapping)* | SOURCE_A | `horoscope.arudha_padhas` or `horoscope.arudhas` | N/A | N/A |
| **Arudha Padhas** *(Structuring)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: splits raw text like "Aries 4" into signs/houses* | N/A |
| **Sphutas** *(Special Points)* | SOURCE_A | `horoscope.sphutas` or `horoscope.sphuta` | N/A | N/A |
| **Sphutas** *(Absolute Longitude)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: signIndex * 30 + degree* | N/A |
| **Upagrahas** | SOURCE_A | `horoscope.upagrahas` | N/A | N/A |
| **Upagrahas** *(Absolute Longitude)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: signIndex * 30 + degree* | N/A |
| **Sahams** | SOURCE_A | `horoscope.sahams` | N/A | N/A |
| **Sahams** *(Absolute Longitude)* | SOURCE_B | N/A | `mapJHoraResponseToAstrologyData` in `src/lib/jhoraMapper.ts` <br/> *Formula: parses degrees, minutes, and seconds to float* | N/A |
| **Argalas** *(Primary, Secondary, Obstruction)* | SOURCE_B | N/A | `calculateArgalas` in `src/lib/jhoraMapper.ts` <br/> *Formula: checks 2nd, 4th, 5th, 11th houses against blockers* | N/A |
| **JHora AI Chat Response Text** | SOURCE_C | N/A | N/A | Prompts `gemini-3.5-flash` with the system instruction `Jyotishacharya` and the user's specific birth details, planet coordinates, and active dasha. |
| **Marriage Matching Guna Points** | SOURCE_A | `/api/jhora/marriage-match` response `score` | N/A | N/A |
| **Marriage Matching Ashtakoota Milan Matrix** | SOURCE_A | `/api/jhora/marriage-match` response `kootas` | N/A | N/A |
| **Planetary Transits (Gochara Locations)** | SOURCE_A | `/api/jhora/gochara` calls horoscope API for the target date, extracting transit positions. | N/A | N/A |
| **Planetary Transits (Gochara Houses)** | SOURCE_B | N/A | `/api/jhora/gochara` endpoint in `server.ts` <br/> *Formula: (signIdx - ascSignIdx + 12) % 12 + 1* | N/A |
| **Planetary Ingress Events** | SOURCE_D | N/A | N/A | N/A |
| **Autocomplete City Recommendations** | SOURCE_A | `/api/jhora/location/autocomplete` | N/A | N/A |

---

## 3. Classifications Summary
* **SOURCE_A**: 26 core planetary, divisional, strength, dasha, and match fields returned by the official JHora server.
* **SOURCE_B**: 24 derived formatting, mathematical 360-degree mapping, relative housing, and secondary interpretive rules (such as Argalas and Sade Sati stages).
* **SOURCE_C**: 1 interactive analysis field synthesized dynamically from chart details by Google Gemini AI.
* **SOURCE_D**: 3 static schedules/lists (Muhurtas, Ingress events).
