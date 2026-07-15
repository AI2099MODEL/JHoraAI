/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKpProvider, KPParams } from "./IKpProvider";
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
import { KpMapper } from "./KpMapper";

export class VedicAstroProvider implements IKpProvider {
  public readonly name = "vedicastro";
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Trim trailing slash from base URL
    this.baseUrl = (baseUrl || process.env.KP_BASE_URL || "https://api.vedicastroapi.com/v1").replace(/\/$/, "");
  }

  private async fetchFromProvider(endpoint: string, params: KPParams): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Construct request body/headers according to standard VedicAstro API spec
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: params.date,
        time: params.time,
        lat: params.latitude,
        lon: params.longitude,
        tz: params.timezone,
        place: params.place || "Query Location",
        horary_number: params.horaryNumber,
        question: params.question,
        target_date: params.targetDate
      })
    });

    if (!response.ok) {
      throw new Error(`KP provider [${this.name}] request failed for ${endpoint}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getChart(params: KPParams): Promise<KpChart> {
    const raw = await this.fetchFromProvider("/kp/chart", params);
    return KpMapper.toKpChart(raw, params.date, params.time, params.place || "Query Location");
  }

  async getCusps(params: KPParams): Promise<KpCuspData> {
    const raw = await this.fetchFromProvider("/kp/cusps", params);
    return KpMapper.toKpCuspData(raw);
  }

  async getStarLords(params: KPParams): Promise<KpStarLords> {
    const raw = await this.fetchFromProvider("/kp/starlords", params);
    return KpMapper.toKpStarLords(raw);
  }

  async getSubLords(params: KPParams): Promise<KpSubLords> {
    const raw = await this.fetchFromProvider("/kp/sublords", params);
    return KpMapper.toKpSubLords(raw);
  }

  async getSubSubLords(params: KPParams): Promise<KpSubSubLords> {
    const raw = await this.fetchFromProvider("/kp/subsublords", params);
    return KpMapper.toKpSubSubLords(raw);
  }

  async getPlanetSignificators(params: KPParams): Promise<KpPlanetSignificators> {
    const raw = await this.fetchFromProvider("/kp/planet_significators", params);
    return KpMapper.toKpPlanetSignificators(raw);
  }

  async getHouseSignificators(params: KPParams): Promise<KpHouseSignificators> {
    const raw = await this.fetchFromProvider("/kp/house_significators", params);
    return KpMapper.toKpHouseSignificators(raw);
  }

  async getRulingPlanets(params: KPParams): Promise<KpRulingPlanetsData> {
    const raw = await this.fetchFromProvider("/kp/ruling_planets", params);
    return KpMapper.toKpRulingPlanetsData(raw);
  }

  async getDashas(params: KPParams): Promise<KpDashaData> {
    const raw = await this.fetchFromProvider("/kp/dasha", params);
    return KpMapper.toKpDashaData(raw);
  }

  async getTransit(params: KPParams): Promise<KpTransitDetails> {
    const raw = await this.fetchFromProvider("/kp/transit", params);
    return KpMapper.toKpTransitDetails(raw, params.targetDate || params.date);
  }

  async getHorary(params: KPParams): Promise<KpHoraryDetails> {
    const raw = await this.fetchFromProvider("/kp/horary", params);
    return KpMapper.toKpHoraryDetails(raw);
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Perform a minimal, safe probe request to the configured provider API
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000); // 4s timeout limit
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
        signal: controller.signal
      }).catch(() => {
        // Fallback probe using a small POST request if no /health endpoint exists
        return fetch(`${this.baseUrl}/kp/cusps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: "2026-07-15",
            time: "12:00:00",
            lat: 28.61,
            lon: 77.20,
            tz: 5.5
          }),
          signal: controller.signal
        });
      });

      clearTimeout(id);
      return response.status >= 200 && response.status < 400;
    } catch {
      return false;
    }
  }
}
