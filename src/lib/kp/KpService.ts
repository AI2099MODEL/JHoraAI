/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IKpProvider } from "./IKpProvider";
import { VedicAstroProvider } from "./VedicAstroProvider";
import { KpCache } from "./KpCache";
import { KpRepository } from "./KpRepository";

export class KpService {
  private static instance: KpService | null = null;
  private repository: KpRepository;
  private cache: KpCache;
  private activeProvider: IKpProvider;
  private providersRegistry = new Map<string, IKpProvider>();

  private constructor() {
    this.cache = new KpCache();
    
    // Register default providers
    const vedicAstro = new VedicAstroProvider();
    this.registerProvider(vedicAstro);

    // Get default configured provider
    const configuredProviderName = (process.env.KP_PROVIDER || "vedicastro").toLowerCase();
    const active = this.providersRegistry.get(configuredProviderName) || vedicAstro;
    this.activeProvider = active;

    this.repository = new KpRepository(this.activeProvider, this.cache);
  }

  public static getInstance(): KpService {
    if (!KpService.instance) {
      KpService.instance = new KpService();
    }
    return KpService.instance;
  }

  public registerProvider(provider: IKpProvider): void {
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
      this.cache.clear(); // Clear cache upon provider switch to prevent stale reads
      return true;
    }
    return false;
  }

  public getRepository(): KpRepository {
    return this.repository;
  }
}
