# KP Domain Models Specification (Phase 13)

This document describes the core TypeScript interfaces that define the normalized domain data model for the Krishnamurti Paddhati (KP) system in our application.

## Key Principles
- **Type Safety**: Fully typed inputs (`KPParams`) and outputs (e.g. `KpChart`, `KpCuspData`).
- **Data Integrity**: Excludes low-fidelity fallback fields or simulated strings; all positions are absolute floats.
- **Provider Agnosticism**: No third-party response keys (e.g., `house_number_v2`, `zodiac_idx`) appear in domain types.

---

## Model Reference

### 1. KpPlanetPosition
Represents the placement, coordinates, and stellar status of a celestial body.
```typescript
export interface KpPlanetPosition {
  name: string;        // Planet Name (e.g. "Sun", "Jupiter")
  sign: string;        // Zodiac Sign Name (e.g. "Aries", "Taurus")
  degree: number;      // Degree within the sign (0 to 30)
  house: number;       // House occupied by planet (1 to 12)
  starLord: string;    // Nakshatra Lord
  subLord: string;     // Sub Lord
  subSubLord: string;  // Sub-Sub Lord
  isRetrograde: boolean;
}
```

### 2. KpCuspDetail
Defines the boundary longitude and sub-division lords for a house cusp.
```typescript
export interface KpCuspDetail {
  houseNumber: number; // House index (1 to 12)
  longitude: number;   // Absolute 360-degree longitude
  degree: number;      // Degree within zodiac sign (0 to 30)
  sign: string;        // Zodiac Sign name
  starLord: string;    // Star Lord
  subLord: string;     // Sub Lord
  subSubLord: string;  // Sub-Sub Lord
}
```

### 3. KpPlanetSignificators
Determines the planetary strength levels across 4 core significance categories.
```typescript
export interface KpPlanetSignificators {
  significators: {
    [planet: string]: {
      level1: number[]; // Planets in star of occupant
      level2: number[]; // Planets in occupant
      level3: number[]; // Planets in star of owner
      level4: number[]; // Planets owning house
    };
  };
}
```

### 4. KpRulingPlanetsData
Extracts strong celestial ruling bodies at the moment of calculation/birth.
```typescript
export interface KpRulingPlanetsData {
  dayLord: string;
  moonSignLord: string;
  moonStarLord: string;
  ascendantSignLord: string;
  ascendantStarLord: string;
  calculationTime: string;
}
```
