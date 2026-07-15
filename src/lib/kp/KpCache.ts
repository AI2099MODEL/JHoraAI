/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class KpCache {
  private cacheStore = new Map<string, { data: any; expiry: number }>();
  private defaultTtlMs = 15 * 60 * 1000; // 15 minutes cache default

  private generateKey(endpoint: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join("|");
    return `${endpoint}#${sortedParams}`;
  }

  get<T>(endpoint: string, params: any): T | null {
    const key = this.generateKey(endpoint, params);
    const cached = this.cacheStore.get(key);
    if (!cached) {
      return null;
    }
    if (Date.now() > cached.expiry) {
      this.cacheStore.delete(key);
      return null;
    }
    return cached.data as T;
  }

  set<T>(endpoint: string, params: any, data: T, ttlMs?: number): void {
    const key = this.generateKey(endpoint, params);
    const expiry = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.cacheStore.set(key, { data, expiry });
  }

  invalidate(endpoint: string, params?: any): void {
    if (!params) {
      // Clear all keys for this endpoint
      for (const key of this.cacheStore.keys()) {
        if (key.startsWith(`${endpoint}#`)) {
          this.cacheStore.delete(key);
        }
      }
    } else {
      const key = this.generateKey(endpoint, params);
      this.cacheStore.delete(key);
    }
  }

  clear(): void {
    this.cacheStore.clear();
  }
}
