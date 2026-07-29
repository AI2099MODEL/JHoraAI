/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WesternParams {
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  timezone: number;
  place?: string;
  partnerDate?: string;
  partnerTime?: string;
  partnerLatitude?: number;
  partnerLongitude?: number;
  partnerTimezone?: number;
  partnerPlace?: string;
  targetDate?: string;
}

export interface WesternPlanet {
  name: string;
  sign: string;
  degree: number;
  house: number;
  isRetrograde: boolean;
  element: string;
  modality: string;
}

export interface WesternCusp {
  number: number;
  sign: string;
  degree: number;
}

export interface WesternAspect {
  planet1: string;
  planet2: string;
  type: string; // Conjunction, Sextile, Square, Trine, Opposition
  angle: number;
  orb: number;
}

export interface WesternChartData {
  planets: WesternPlanet[];
  cusps: WesternCusp[];
  aspects: WesternAspect[];
  metadata: {
    birthDate: string;
    birthTime: string;
    location: string;
  };
}

export interface WesternSynastryData {
  compatibilityScore: number;
  aspects: WesternAspect[];
  summary: string;
}

export interface IWesternProvider {
  name: string;
  getChart(params: WesternParams): Promise<WesternChartData>;
  getSynastry(params: WesternParams): Promise<WesternSynastryData>;
  getSolarReturn(params: WesternParams): Promise<WesternChartData>;
  getTransits(params: WesternParams): Promise<WesternChartData>;
  healthCheck(): Promise<boolean>;
}
