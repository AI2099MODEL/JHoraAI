/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IWesternProvider, WesternParams } from "./IWesternProvider";
import { WesternCache } from "./WesternCache";
import { WesternChartData, WesternSynastryData } from "./IWesternProvider";

export class WesternRepository {
  private provider: IWesternProvider;
  private cache: WesternCache;

  constructor(provider: IWesternProvider, cache: WesternCache) {
    this.provider = provider;
    this.cache = cache;
  }

  setProvider(provider: IWesternProvider): void {
    this.provider = provider;
  }

  async getChart(params: WesternParams): Promise<WesternChartData> {
    const cached = this.cache.get<WesternChartData>("chart", params);
    if (cached) return cached;

    const data = await this.provider.getChart(params);
    this.cache.set("chart", params, data);
    return data;
  }

  async getSynastry(params: WesternParams): Promise<WesternSynastryData> {
    const cached = this.cache.get<WesternSynastryData>("synastry", params);
    if (cached) return cached;

    const data = await this.provider.getSynastry(params);
    this.cache.set("synastry", params, data);
    return data;
  }

  async getSolarReturn(params: WesternParams): Promise<WesternChartData> {
    const cached = this.cache.get<WesternChartData>("solar_return", params);
    if (cached) return cached;

    const data = await this.provider.getSolarReturn(params);
    this.cache.set("solar_return", params, data);
    return data;
  }

  async getTransits(params: WesternParams): Promise<WesternChartData> {
    const cached = this.cache.get<WesternChartData>("transits", params);
    if (cached) return cached;

    const data = await this.provider.getTransits(params);
    this.cache.set("transits", params, data);
    return data;
  }

  async healthCheck(): Promise<boolean> {
    return this.provider.healthCheck();
  }
}
