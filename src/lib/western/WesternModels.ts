/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WesternPlanetPosition {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  element: string;
  modality: string;
}

export interface WesternCuspPosition {
  number: number;
  sign: string;
  degree: number;
}

export interface WesternAspectDetails {
  planet1: string;
  planet2: string;
  type: string;
  angle: number;
  orb: number;
}

export interface WesternChartDetails {
  planets: WesternPlanetPosition[];
  cusps: WesternCuspPosition[];
  aspects: WesternAspectDetails[];
  metadata: {
    birthDate: string;
    birthTime: string;
    location: string;
  };
}

export interface WesternCompatibility {
  compatibilityScore: number;
  aspects: WesternAspectDetails[];
  summary: string;
}
