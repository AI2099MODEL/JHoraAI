/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IWesternProvider } from "./IWesternProvider";
import { VedicAstroWesternProvider } from "./VedicAstroWesternProvider";
import { WesternCache } from "./WesternCache";
import { WesternRepository } from "./WesternRepository";

export class WesternService {
  private static instance: WesternService | null = null;
  private repository: WesternRepository;
  private cache: WesternCache;
  private activeProvider: IWesternProvider;
  private providersRegistry = new Map<string, IWesternProvider>();

  private constructor() {
    this.cache = new WesternCache();
    
    // Register default Western provider
    const defaultProv = new VedicAstroWesternProvider();
    this.registerProvider(defaultProv);

    // Read active provider from configuration
    const configuredProviderName = (process.env.WESTERN_PROVIDER || "vedicastro_western").toLowerCase();
    const active = this.providersRegistry.get(configuredProviderName) || defaultProv;
    this.activeProvider = active;

    this.repository = new WesternRepository(this.activeProvider, this.cache);
  }

  public static getInstance(): WesternService {
    if (!WesternService.instance) {
      WesternService.instance = new WesternService();
    }
    return WesternService.instance;
  }

  public registerProvider(provider: IWesternProvider): void {
    this.providersRegistry.set(provider.name.toLowerCase(), provider);
  }

  public getActiveProviderName(): string {
    return this.activeProvider.name;
  }

  public switchProvider(name: string): boolean {
    const provider = this.providersRegistry.get(name.toLowerCase());
    if (provider) {
      this.activeProvider = provider;
      this.repository.setProvider(provider);
      this.cache.clear();
      return true;
    }
    return false;
  }

  public getRepository(): WesternRepository {
    return this.repository;
  }
}
