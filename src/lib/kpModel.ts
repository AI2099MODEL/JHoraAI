/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AstrologyData } from "../lib/astrology";

// =====================================================================
// NORMALIZED KP DATA MODEL
// =====================================================================

export interface KpCusp {
  number: number; // 1 to 12
  longitude: number; // 0 to 360
  degree: number; // 0 to 30 within the sign
  sign: string; // Zodiac Sign Name
  starLord: string; // Nakshatra Lord of Cusp
  subLord: string; // Sub Lord of Cusp
  subSubLord: string; // Sub-Sub Lord of Cusp
  houseStrength: number; // House strength value
}

export interface KpPlanet {
  name: string;
  longitude: number;
  degree: number;
  sign: string;
  house: number;
  starLord: string;
  subLord: string;
  subSubLord: string;
  isRetrograde: boolean;
  isCombust: boolean;
}

export interface KpSignificators {
  planetSignificators: {
    [planet: string]: {
      primary: number[];   // Level 1: Planet in Star of Occupant
      secondary: number[]; // Level 2: Planet itself as occupant/owner
      tertiary: number[];  // Level 3: Planet in Star of Owner
      quaternary: number[]; // Level 4: Planet aspects or owners
    };
  };
  houseSignificators: {
    [house: number]: {
      primary: string[];   // Level 1: Planets in Star of Occupants of House
      secondary: string[]; // Level 2: Planets occupying or owning House
      tertiary: string[];  // Level 3: Planets in Star of Owner of House
      quaternary: string[]; // Level 4: Planets aspecting or owning House
    };
  };
}

export interface KpRulingPlanets {
  dayLord: string;
  moonSignLord: string;
  moonStarLord: string;
  ascendantLord: string;
  ascendantStarLord: string;
  timeOfCalculation: string;
}

export interface KpDashaPeriod {
  planet: string;
  startTime: string;
  endTime: string;
  subDashas?: KpDashaPeriod[];
}

export interface KpTransitData {
  transitDate: string;
  significators: { [planet: string]: number[] };
  events: Array<{
    time: string;
    description: string;
    type: "ingress" | "conjunction" | "aspect" | "general";
  }>;
  transitTable: Array<{
    planet: string;
    currentSign: string;
    currentDegree: string;
    starLord: string;
    subLord: string;
  }>;
}

export interface KpHoraryData {
  number: number; // 1 to 249
  question: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: number;
  cusps: KpCusp[];
  planets: KpPlanet[];
  rulingPlanets: KpRulingPlanets;
  resultSummary: string;
}

export interface NormalizedKPModel {
  profileName: string;
  birthDate: string;
  birthTime: string;
  location: string;
  lastUpdated: string;
  providerName: string;
  providerStatus: "online" | "offline" | "error" | "degraded";
  dataStatus: "fully_calculated" | "partially_calculated" | "stale" | "placeholder";
  apiSource: string;
  
  cusps: KpCusp[];
  planets: KpPlanet[];
  significators: KpSignificators;
  rulingPlanets: KpRulingPlanets;
  dashas: KpDashaPeriod[];
  transit: KpTransitData;
  horary?: KpHoraryData;
}

// =====================================================================
// KP PROVIDER ARCHITECTURE INTERFACES
// =====================================================================

export interface ProviderMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: "MIT" | "Apache-2.0" | "Commercial" | "Proprietary" | "Other";
  priority: number; // 1 to 5 (1 is highest)
  isConfigured: boolean;
  endpointUrl?: string;
  requiresApiKey: boolean;
  supportedFeatures: {
    cusps: boolean;
    subLords: boolean;
    significators: boolean;
    rulingPlanets: boolean;
    horary: boolean;
    transit: boolean;
  };
}

export interface ProviderHealthMonitor {
  providerId: string;
  status: "online" | "offline" | "error" | "degraded";
  latencyMs: number;
  lastChecked: string;
  errorCount: number;
  uptimePercentage: number;
}

export interface ProviderCache {
  get(profileId: string): NormalizedKPModel | null;
  set(profileId: string, data: NormalizedKPModel): void;
  clear(): void;
  size(): number;
}

export interface KpProvider {
  getMetadata(): ProviderMetadata;
  getHealth(): ProviderHealthMonitor;
  calculateKP(birthData: AstrologyData): Promise<NormalizedKPModel>;
  calculateHorary(number: number, question: string, context: AstrologyData): Promise<KpHoraryData>;
}

// =====================================================================
// MANAGER, REGISTRY, LOADER INTERFACES
// =====================================================================

export interface ProviderRegistry {
  registerProvider(provider: KpProvider): void;
  unregisterProvider(id: string): void;
  getProvider(id: string): KpProvider | null;
  getAllProviders(): KpProvider[];
}

export interface ProviderLoader {
  loadFromConfig(): Promise<KpProvider[]>;
}

export interface KpProviderManager {
  registry: ProviderRegistry;
  loader: ProviderLoader;
  cache: ProviderCache;
  activeProviderId: string;
  
  getActiveProvider(): KpProvider | null;
  setActiveProvider(id: string): void;
  getProviderPriorityList(): ProviderMetadata[];
  setProviderPriority(id: string, priority: number): void;
  
  calculateKP(birthData: AstrologyData): Promise<NormalizedKPModel>;
  calculateHorary(number: number, question: string, context: AstrologyData): Promise<KpHoraryData>;
  refreshActiveProvider(): Promise<boolean>;
}
