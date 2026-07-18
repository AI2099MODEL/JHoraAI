# JHora AI Master Evaluation & Astrology Rules Handbook

Welcome to the **Master Evaluation Handbook**, the authoritative index, registry, and rulebook for JHora AI's unified astrological engines. This document serves as the ground truth of data structures, provenances, and evaluation gates.

> **Execution Directive:** This handbook stores only the indices, data schema, structural logic, and rule conditions. Individual user data is stored dynamically within separate files in the `Users/` directory (e.g., `userprofile.json` representing the active profile). The client dashboard dynamically reads and populates these values based on the active session profile.

---

## I. ASTROLOGICAL DATA INDEX & REGISTRY

This index catalogs the primary data tables, variables, and calculation schemas dynamically populated by the JHora calculation engines.

### 100. Evaluation Data Index & Birth Registry
* **Registry Source File:** `/Users/userprofile.json` (Active profile payload)
* **Status:** Dynamically populated based on active selected profile session.

#### Table 1: Birth Details (Data Schema & Index Logic)
This table represents the layout schema of the primary birth particulars. The engine maps these parameters as the absolute mathematical foundation for divisional chart calculations, dasha timelines, and planetary transits.

| Parameter | Data Type | Logic & Provenance Source |
| :--- | :--- | :--- |
| **Profile Name** | `string` | Loaded dynamically from selected profile (`User.profile_name`) |
| **User Email** | `string` | Loaded dynamically from selected profile session (`User.email`) |
| **Birth Date** | `string (YYYY-MM-DD)` | Loaded dynamically from birth parameters (`Birth.date`) |
| **Birth Time** | `string (HH:MM:SS)` | Loaded dynamically from birth parameters (`Birth.time`) |
| **Latitude** | `float` | Geographical coordinates mapped via city database lookup (`Birth.latitude`) |
| **Longitude** | `float` | Geographical coordinates mapped via city database lookup (`Birth.longitude`) |
| **Timezone** | `float` | Local UTC timezone offset derived during calculation (`Birth.timezone`) |
| **Place** | `string` | Resolved location name from geographical coordinates database (`Birth.place`) |
| **Ayanamsa** | `string` | Calculation mode standard selected by user (e.g., Lahiri) (`Birth.ayanamsa`) |
| **Julian Day Number**| `string` | Derived mathematically from UTC birth moment timestamp (`Birth.julian_day_number`) |
| **Sidereal Time** | `string` | Calculated Local Sidereal Time for birth coordinates (`Birth.local_sidereal_time`) |
| **Obliquity** | `string` | Obliquity of the ecliptic derived for Julian epoch (`Birth.obliquity`) |
| **Ephemeris Used** | `string` | Calculation engine background source (`Birth.ephemeris_used`) |
| **House System** | `string` | Structural house division rules applied (e.g., Placidus / KP Cusps) |

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
