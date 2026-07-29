/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KpPlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  starLord: string;
  subLord: string;
  subSubLord: string;
  isRetrograde: boolean;
}

export interface KpChart {
  profileName?: string;
  birthDate: string;
  birthTime: string;
  location: string;
  planets: KpPlanetPosition[];
  ascendantDegree: number;
  ascendantSign: string;
}

export interface KpCuspDetail {
  houseNumber: number;
  longitude: number;
  degree: number;
  sign: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

export interface KpCuspData {
  cusps: KpCuspDetail[];
}

export interface KpStarLords {
  planetStarLords: { [planet: string]: string };
  cuspStarLords: { [cusp: number]: string };
}

export interface KpSubLords {
  planetSubLords: { [planet: string]: string };
  cuspSubLords: { [cusp: number]: string };
}

export interface KpSubSubLords {
  planetSubSubLords: { [planet: string]: string };
  cuspSubSubLords: { [cusp: number]: string };
}

export interface KpPlanetSignificators {
  significators: {
    [planet: string]: {
      level1: number[]; // Planet in star of occupant
      level2: number[]; // Planet in occupant
      level3: number[]; // Planet in star of owner
      level4: number[]; // Planet owner
      level5: number[]; // Planet in star of sub-lord of cusp
      level6: number[]; // Planet as cusp sub-lord
    };
  };
}

export interface KpHouseSignificators {
  significators: {
    [house: number]: {
      level1: string[]; // Planets in star of occupants of house
      level2: string[]; // Planets occupying house
      level3: string[]; // Planets in star of owner of house
      level4: string[]; // Planets owning house
      level5: string[]; // Planets in star of sub-lord of cusp
      level6: string[]; // Planets as cusp sub-lord
    };
  };
}

export interface KpRulingPlanetsData {
  dayLord: string;
  moonSignLord: string;
  moonStarLord: string;
  ascendantSignLord: string;
  ascendantStarLord: string;
  calculationTime: string;
}

export interface KpDashaInterval {
  planet: string;
  startTime: string;
  endTime: string;
  level: number; // 1 = Mahadasha, 2 = Antardasha, etc.
  nested?: KpDashaInterval[];
}

export interface KpDashaData {
  dashas: KpDashaInterval[];
}

export interface KpTransitPlanet {
  planet: string;
  sign: string;
  degree: number;
  starLord: string;
  subLord: string;
}

export interface KpTransitDetails {
  transitDate: string;
  planets: KpTransitPlanet[];
}

export interface KpHoraryDetails {
  number: number;
  question: string;
  cusps: KpCuspDetail[];
  planets: KpPlanetPosition[];
  rulingPlanets: KpRulingPlanetsData;
  summary: string;
}
