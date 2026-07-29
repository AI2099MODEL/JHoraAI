# KP Provider Architecture Specification (Phase 13)

This document details the architectural boundaries, dependency patterns, and routing flow for the pluggable Krishnamurti Paddhati (KP) astrology system implemented in Phase 13.

## Architectural Goals
1. **Decoupled Business Logic**: Separation of raw third-party payloads from core application state.
2. **Pluggable Provider Pattern**: Simple configuration switches without any client-side code modifications.
3. **Optimized Network Performance**: Layered caching at repository and server boundaries.
4. **Resiliency and Fallback Discipline**: Clear failure handling avoiding low-integrity synthetic calculations.

---

## Class diagram & Component Flow

```
┌─────────────────────────────────────────────────────────┐
│                       Express Server                    │
│                        (server.ts)                      │
└────────────────────────────┬────────────────────────────┘
                             │ (Routing)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                       KpService                         │
│                  (Singleton Manager)                    │
└────────────────────────────┬────────────────────────────┘
                             │ (Orchestrator)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      KpRepository                       │
│             (Handles Caching & Delegation)              │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
        (Cache Miss)                  (Reads/Writes)
               ▼                           ▼
┌───────────────────────────┐       ┌─────────────────────┐
│       IKpProvider         │       │       KpCache       │
│       (Interface)         │       │  (In-Memory TTL)    │
└──────────────┬────────────┘       └─────────────────────┘
               │
      (Polymorphism)
               ▼
┌───────────────────────────┐
│    VedicAstroProvider     │
│   (Concrete REST Client)  │
└───────────────────────────┘
```

---

## Component Responsibilities

### 1. `IKpProvider`
An abstract interface defining core KP endpoints, ensuring any future provider conforms to the same function signatures (`getChart`, `getCusps`, `getStarLords`, `getSubLords`, `getSubSubLords`, `getPlanetSignificators`, `getHouseSignificators`, `getRulingPlanets`, `getDashas`, `getTransit`, `getHorary`).

### 2. `VedicAstroProvider`
A concrete implementation of `IKpProvider` that parses configurations (like `KP_BASE_URL`), runs POST requests to external providers, and maps JSON objects utilizing the `KpMapper`.

### 3. `KpRepository`
Acts as the single point of truth for accessing KP data. Implements transparent lookup logic: first searching the `KpCache` for a valid cached instance, falling back to a provider request on a cache miss, and writing the returned domain model back to cache.

### 4. `KpService`
A singleton orchestrator managing registry, active configuration, and on-demand provider switching via the `KP_PROVIDER` environment variable.

### 5. `KpCache`
An isolated high-performance cache store utilizing precise hashing based on query parameters, supporting short-lived TTLs (Time-to-Live) to avoid memory leaks.

### 6. `KpMapper`
Handles normalization of dirty raw JSON structures from providers to strict, structured domain models.
