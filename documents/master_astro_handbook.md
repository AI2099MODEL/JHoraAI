# JHora AI Master Evaluation & Astrology Rules Handbook

Welcome to the **Master Evaluation Handbook**, the authoritative index, registry, and rulebook for JHora AI's unified astrological engines. This document serves as the ground truth of data structures, provenances, and evaluation gates.

---

## I. ASTROLOGICAL DATA INDEX & REGISTRY

This index catalogs the primary data tables, variables, and calculation systems dynamically populated by the JHora calculation engines.

### 100. Evaluation Data Index & Birth Registry
* **Registry Source File:** `/Users/userprofile.json` (Primary active profile payload)
* **Status:** Synchronized with active user credentials and dynamic calculations.

#### Table 1: Birth Details (Active Profile - Nitin)
This table acts as the absolute astronomical foundation for all subsequent divisional chart, dasha timeline, and transit calculations.

| Parameter | Value | Source / Ephemeris / Provenance |
| :--- | :--- | :--- |
| **Profile Name** | Nitin | Client Local Profile Selection / `Users/userprofile.json` |
| **User Email** | guest@jhora.ai | Mapped from user authentication session |
| **Birth Date** | 1976-01-06 | Primary Birth Input (Standard ISO: YYYY-MM-DD) |
| **Birth Time** | 18:40:00 | Primary Birth Input (Standard 24-hour HH:MM:SS) |
| **Latitude** | 30.3165 | Mapped from Geographical GPS coordinate lookup |
| **Longitude** | 78.0322 | Mapped from Geographical GPS coordinate lookup |
| **Timezone** | 5.5 (UTC +05:30) | Verified local timezone offset for North India |
| **Place** | Dehradun, Uttarakhand, India | Resolved location name from coordinates database |
| **Ayanamsa** | Lahiri | Mapped via Lahiri projection algorithms |
| **Julian Day Number** | 2442784.277778 | Mapped from UTC date-time representation |
| **Sidereal Time** | 06:54:02 | Derived local sidereal coordinate representation |
| **Obliquity** | 23° 26' 33" | Celestial obliquity derived from Julian Century epoch |
| **Ephemeris Used** | Swiss Ephemeris / JHora Calculation Engine | Swiss Ephemeris Standard Library / JHora Engine |
| **House System** | Placidus / KP Cusps | Placidus Division Engine with local cusp parameters |

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
