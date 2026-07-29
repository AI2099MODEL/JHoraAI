/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  KpChart, 
  KpCuspData, 
  KpStarLords, 
  KpSubLords, 
  KpSubSubLords, 
  KpPlanetSignificators, 
  KpHouseSignificators, 
  KpRulingPlanetsData, 
  KpDashaData, 
  KpTransitDetails, 
  KpHoraryDetails 
} from "./KpModels";

export interface KPParams {
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM:SS
  latitude: number;
  longitude: number;
  timezone: number;
  place?: string;
  horaryNumber?: number; // 1 to 249 (optional for horary)
  question?: string;     // optional for horary
  targetDate?: string;   // optional for transit
}

export interface IKpProvider {
  name: string;
  getChart(params: KPParams): Promise<KpChart>;
  getCusps(params: KPParams): Promise<KpCuspData>;
  getStarLords(params: KPParams): Promise<KpStarLords>;
  getSubLords(params: KPParams): Promise<KpSubLords>;
  getSubSubLords(params: KPParams): Promise<KpSubSubLords>;
  getPlanetSignificators(params: KPParams): Promise<KpPlanetSignificators>;
  getHouseSignificators(params: KPParams): Promise<KpHouseSignificators>;
  getRulingPlanets(params: KPParams): Promise<KpRulingPlanetsData>;
  getDashas(params: KPParams): Promise<KpDashaData>;
  getTransit(params: KPParams): Promise<KpTransitDetails>;
  getHorary(params: KPParams): Promise<KpHoraryDetails>;
  healthCheck(): Promise<boolean>;
}
