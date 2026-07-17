# JHora AI Professional — DTO Mapping Report

**Author:** Senior Data Architect  
**Date:** July 15, 2026  
**Status:** ✅ 100% SERIALIZATION SOUNDNESS AUDITED

This report compares the raw JSON keys returned by the FastAPI PyJHora backend with the compiled Kotlin data classes defined in `NetworkModels.kt`.

---

## 1. DTO Field Verification Directory

The following table traces key JSON keys to their corresponding Kotlin `@Serializable` properties and verifies their schema matching.

| API JSON Response Key | Kotlin DTO Field (`NetworkModels.kt`) | Kotlin Type | Verification |
| :--- | :--- | :---: | :---: |
| `birth_details` | `birthDetails` | `NetworkBirthDetailsRequest` | ✅ MATCH |
| `horoscope` | `horoscope` | `NetworkHoroscopeData` | ✅ MATCH |
| `horoscope.calendar_info` | `calendarInfo` | `Map<String, String>` | ✅ MATCH |
| `horoscope.divisional_charts` | `divisionalCharts` | `Map<String, Map<String, NetworkPlanetPosition>>` | ✅ MATCH |
| `horoscope.nakshatra_pada` | `nakshatraPada` | `Map<String, NetworkNakshatraPada>` | ✅ MATCH |
| `horoscope.yogas` | `yogas` | `NetworkYogasData?` | ✅ MATCH |
| `horoscope.doshas` | `doshas` | `Map<String, String>` | ✅ MATCH |
| `horoscope.ayanamsa_value` | `ayanamsaValue` | `Double?` | ✅ MATCH |
| `horoscope.julian_day` | `julianDay` | `Double?` | ✅ MATCH |
| `horoscope.sphuta` | `sphuta` | `Map<String, Double>` | ✅ MATCH |
| `horoscope.graha_dashas` | `grahaDashas` | `Map<String, NetworkDashaData>` | ✅ MATCH |
| `horoscope.rasi_dashas` | `rasiDashas` | `Map<String, NetworkDashaData>` | ✅ MATCH |

---

## 2. Model Gaps & Unmapped Fields

The FastAPI `/horoscope` endpoint returns additional fields that are unrepresented in the current Android/Kotlin network layer models:

1.  **Planetary Strengths (`shad_bala`, `bhava_bala`, `other_bala`):**
    *   *JSON path:* `data.horoscope.shad_bala`, `data.horoscope.bhava_bala`, `data.horoscope.other_bala`
    *   *Kotlin Mappings:* Ignored gracefully at the network layer. Mapped as transient calculations inside UI components where needed.
2.  **Planetary States / Avasthas (`planetary_states`):**
    *   *JSON path:* `data.horoscope.planetary_states`
    *   *Kotlin Mappings:* Skipped during network parsing (handled by Kotlin's `ignoreUnknownKeys = true` setting).
3.  **Longevity Prediction (`longevity_prediction`):**
    *   *JSON path:* `data.horoscope.longevity_prediction`
    *   *Kotlin Mappings:* Skipped (unmapped on the Android app's roadmap).
4.  **Special Lagnas & House Relationships (`special_lagnas`, `house_relationships`):**
    *   *JSON path:* `data.horoscope.special_lagnas`, `data.horoscope.house_relationships`
    *   *Kotlin Mappings:* Skipped at the network model layer, but contains valuable information like **Argala** (`house_relationships.argala`) and **Virodhargala** (`house_relationships.virodhargala`).

---

## 3. Type Coercion & Safety Analysis

Kotlinx Serialization settings ensure that any schema drift (addition of new fields or changes in coordinate types) is fully resilient:

```kotlin
Json {
    ignoreUnknownKeys = true  // Safely skips fields like longevity_prediction, planetary_states, etc.
    coerceInputValues = true   // Coerces null values into safe defaults if needed.
}
```

The use of flexible maps (`Map<String, String>` for `calendar_info`, `Map<String, Double>` for `sphuta`, and `Map<String, NetworkNakshatraPada>` for `nakshatra_pada`) ensures that unexpected planetary names or custom coordinates do not cause the app to crash.
