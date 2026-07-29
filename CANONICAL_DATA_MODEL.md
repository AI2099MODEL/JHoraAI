# Canonical Data Model: JHoraAI Data Integrity Architecture
**Date:** July 15, 2026
**Version:** 1.0.0
**Status:** Canonical Reference

---

## 1. Architectural Principles
This document defines the canonical representation of astrological data within the JHoraAI platform. To prevent data corruption, duplication, or astronomical coordinate drift, every variable utilized across the client-side screens, PDF rendering pipelines, and AI prompt interfaces must bind to this single, immutable model.

1. **No Parallel Calculations**: No celestial positions, dasha dates, or divisional chart coordinate alignments may be recalculated or estimated locally if they are already returned in any section of the official remote JHora API.
2. **Derived Pure Functions**: Any client-side or server-side transformations (e.g. mapping coordinates to houses, structuring flat lists into parent-child trees, or calculating Sade Sati phases) must exist as pure functions that accept *only* the official API domain model as input. No external astronomical constants or approximate Keplerian formulae are permitted in derived stages.
3. **No Overwrites**: Official API outputs (SOURCE_A) are authoritative and must never be overridden or smoothed by derived functions.
4. **Failure to Graceful Degradation**: If any parameter or division is missing from the remote API, the application must display `Unavailable` or render an appropriate fallback banner rather than falling back to approximate local math models.

---

## 2. Canonical TypeScript Interface Design
To enforce this architecture, the front-end and back-end are bound by the following structured types (defined in `/src/types.ts`):

```typescript
export interface CelestialCoordinate {
  name: string;
  sign: string;
  signIndex: number;
  degree: number;
  minute: number;
  second: number;
  longitude360: number; // Derived strictly as signIndex * 30 + (degree + min/60 + sec/3600)
  nakshatra: string;
  pada: number;
  nakshatraLord: string;
  house: number;        // Derived strictly as (signIndex - ascendantSignIndex + 12) % 12 + 1
}

export interface DivisionalChartPlacements {
  chartName: string;   // "D-1_rasi", "D-9_navamsa", etc.
  ascendant: {
    sign: string;
    longitude: number;
    housePlacements: { [house: number]: string[] }; // Grouped planet names
  };
}

export interface AstrologicalYoga {
  name: string;
  description: string;
  presence: boolean;
}

export interface AstrologicalDosha {
  name: string;
  isActive: boolean;
  score: number;       // Standardized UI metric 0-100
  explanation: string;
}

export interface DashaPeriod {
  lord: string;
  startDate: string;
  endDate: string;
  children?: DashaPeriod[]; // Nested Antardasha & Pratyantardasha periods
}

export interface AstrologyData {
  metadata: {
    birthDetails: {
      date: string;
      time: string;
      latitude: number;
      longitude: number;
      timezone: number;
      place: string;
    };
    lastUpdated: string;
    apiConfidence: string; // "Authoritative" | "Derived"
  };
  ascendant: CelestialCoordinate;
  planets: CelestialCoordinate[];
  divisionalCharts: { [chartId: string]: DivisionalChartPlacements };
  panchanga: {
    tithi: string;
    yoga: string;
    karana: string;
    varna: string;      // Derived
    vashya: string;     // Derived
    yoni: string;       // Derived
    gana: string;       // Derived
    nadi: string;       // Derived
  };
  shadbala: {
    [planet: string]: {
      sthanaBala: number;
      digBala: number;
      kalaBala: number;
      cheshtaBala: number;
      naisargikaBala: number;
      drigBala: number;
      totalScore: number;
      strengthRatio: number;
      strengthPercentage: number; // Derived
    };
  };
  bhavaBala: {
    [house: number]: {
      strengthShashtiamsas: number;
      rank: number; // Derived relative rank
    };
  };
  ashtakavarga: {
    sav: number[]; // 12 elements for houses 1-12
    bav: { [planet: string]: number[] };
  };
  dashas: {
    vimshottari: DashaPeriod[];
    yogini: DashaPeriod[];
    ashtottari: DashaPeriod[];
  };
  yogas: AstrologicalYoga[];
  doshas: {
    manglik: AstrologicalDosha;
    kaalSarp: AstrologicalDosha;
    sadeSati: AstrologicalDosha;
  };
}
```

---

## 3. Data Integrity & Mapping Rules

| UI Display Area | Raw JHora REST Endpoint | Verification Guard | Fallback Policy |
|---|---|---|---|
| **Lagna & Planets** | `POST /horoscope` | `if (!data.divisional_charts || !data.divisional_charts["D-1_rasi"])` | Display Error Banner & Freeze UI |
| **Dasha Timelines** | `POST /horoscope` | `if (!data.graha_dashas)` | Render "Dasha Timeline Unavailable" |
| **Compatibility Match** | `POST /marriage-match` | `if (!data.score || !data.kootas)` | Render "Matching Engine Unreachable" |
| **Gochara Transits** | `POST /horoscope` (for target date) | `if (!data.divisional_charts)` | Render "Transit Coordinates Offline" |
