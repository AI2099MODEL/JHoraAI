/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKpProvider, KPParams } from "./IKpProvider";
import { KpCache } from "./KpCache";
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

export class KpRepository {
  private provider: IKpProvider;
  private cache: KpCache;

  constructor(provider: IKpProvider, cache: KpCache) {
    this.provider = provider;
    this.cache = cache;
  }

  setProvider(provider: IKpProvider): void {
    this.provider = provider;
  }

  async getChart(params: KPParams): Promise<KpChart> {
    const cached = this.cache.get<KpChart>("chart", params);
    if (cached) return cached;

    const data = await this.provider.getChart(params);
    this.cache.set("chart", params, data);
    return data;
  }

  async getCusps(params: KPParams): Promise<KpCuspData> {
    const cached = this.cache.get<KpCuspData>("cusps", params);
    if (cached) return cached;

    const data = await this.provider.getCusps(params);
    this.cache.set("cusps", params, data);
    return data;
  }

  async getStarLords(params: KPParams): Promise<KpStarLords> {
    const cached = this.cache.get<KpStarLords>("starlords", params);
    if (cached) return cached;

    const data = await this.provider.getStarLords(params);
    this.cache.set("starlords", params, data);
    return data;
  }

  async getSubLords(params: KPParams): Promise<KpSubLords> {
    const cached = this.cache.get<KpSubLords>("sublords", params);
    if (cached) return cached;

    const data = await this.provider.getSubLords(params);
    this.cache.set("sublords", params, data);
    return data;
  }

  async getSubSubLords(params: KPParams): Promise<KpSubSubLords> {
    const cached = this.cache.get<KpSubSubLords>("subsublords", params);
    if (cached) return cached;

    const data = await this.provider.getSubSubLords(params);
    this.cache.set("subsublords", params, data);
    return data;
  }

  async getPlanetSignificators(params: KPParams): Promise<KpPlanetSignificators> {
    const cached = this.cache.get<KpPlanetSignificators>("planet_significators", params);
    if (cached) return cached;

    const data = await this.provider.getPlanetSignificators(params);
    this.cache.set("planet_significators", params, data);
    return data;
  }

  async getHouseSignificators(params: KPParams): Promise<KpHouseSignificators> {
    const cached = this.cache.get<KpHouseSignificators>("house_significators", params);
    if (cached) return cached;

    const data = await this.provider.getHouseSignificators(params);
    this.cache.set("house_significators", params, data);
    return data;
  }

  async getRulingPlanets(params: KPParams): Promise<KpRulingPlanetsData> {
    const cached = this.cache.get<KpRulingPlanetsData>("ruling_planets", params);
    if (cached) return cached;

    const data = await this.provider.getRulingPlanets(params);
    this.cache.set("ruling_planets", params, data);
    return data;
  }

  async getDashas(params: KPParams): Promise<KpDashaData> {
    const cached = this.cache.get<KpDashaData>("dasha", params);
    if (cached) return cached;

    const data = await this.provider.getDashas(params);
    this.cache.set("dasha", params, data);
    return data;
  }

  async getTransit(params: KPParams): Promise<KpTransitDetails> {
    const cached = this.cache.get<KpTransitDetails>("transit", params);
    if (cached) return cached;

    const data = await this.provider.getTransit(params);
    this.cache.set("transit", params, data);
    return data;
  }

  async getHorary(params: KPParams): Promise<KpHoraryDetails> {
    const cached = this.cache.get<KpHoraryDetails>("horary", params);
    if (cached) return cached;

    const data = await this.provider.getHorary(params);
    this.cache.set("horary", params, data);
    return data;
  }

  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }
}
