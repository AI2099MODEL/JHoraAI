# KP Stellar Module Provider Architecture Documentation

This document describes the decoupled, provider-independent architecture designed for the Krishnamurti Paddhati (KP) Stellar Module (Version 1.0) in JHoraAI.

---

## 1. Design Philosophy & Core Constraints
In alignment with the development philosophy of JHoraAI:
1. **JHora API is the Single Source of Truth**: Birth chart calculations, planetary positions, and native coordinates are resolved *only* through JHora. No separate birth forms or coordinate forms are permitted in the KP Module.
2. **Decoupled Architecture**: KP is designed as an independent analysis module that consumes the normalized birth chart and planetary coordinates as a Data Transfer Object (DTO).
3. **Disabled Local Engine Constraint**: In Phase 11, the local calculation engine (`local-kp-engine`) must remain disabled. All mathematical calculation functions must reside on the server-side or be retrieved via secure remote provider API integrations. The frontend operates on purely declarative, mapped interfaces.

---

## 2. Structural Flow & Class Diagram

The architecture is implemented using the **Provider Pattern** and managed by a central manager orchestrator.

```
+-----------------------------------+
|            App.tsx                |
+-----------------------------------+
                  | (Consumes)
                  v
+-----------------------------------+
|      KpProviderManager            | <---- [ ProviderCache ]
+-----------------------------------+
                  | (Routes / Orchestrates)
                  +--------------------------------+
                  |                                |
                  v                                v
    +---------------------------+    +---------------------------+
    |  OfficialKpApiProvider    |    |  CommercialKpApiProvider  |
    +---------------------------+    +---------------------------+
                  |                                |
                  +----------------+---------------+
                                   | (Outputs Normalized DTO)
                                   v
                    +-----------------------------+
                    |      NormalizedKPModel      |
                    +-----------------------------+
```

### Core Interfaces:
- `KpProviderManager`: Orchestrates configuration, cache lookup, provider priority lists, and fallback routing.
- `KpProvider`: Abstract interface that every individual connector (e.g., `OfficialKpApi`, `CommercialKp`, `SelfHosted`) must implement.
- `ProviderCache`: Fast-lookup memory-cache utilizing native JS maps to prevent duplicate downstream network requests when toggling menus.
- `NormalizedKPModel`: The final provider-independent data model consumed by the React UI components.

---

## 3. Data Mapping & Adapter Strategy

To bridge the gap between JHora's traditional Vedic data (`AstrologyData`) and KP's stellar-focused requirements, we implement a **Deterministic Adapter Mapping Function** inside `/src/lib/kpManager.ts`:

```typescript
export function deriveKPDataFromAstrology(astrologyData: AstrologyData): NormalizedKPModel;
```

This mapping translates:
- Traditional degrees $\rightarrow$ decimal format.
- Nakshatra rulers $\rightarrow$ Star Lords.
- Proportional Vimshottari dasha periods $\rightarrow$ Sub-Lords.
- Traditional Vimshottari lists $\rightarrow$ Nested KP Vimshottari dasha matrices.

### Fallback Priority List:
If an active provider fails to connect or responds with high latency, the `KpProviderManager` falls back in sequence according to configured priority scores:
1. `official-kp-api` (Priority 1)
2. `self-hosted-kp` (Priority 2)
3. `commercial-kp-api` (Priority 3)
4. `local-kp-engine` (Priority 5, Disabled)

---

## 4. Developer Tools & Verification Audit
The Research and Settings views in the KP Stellar Module allow direct inspectability:
- **Calculation Audit Logs**: Direct logging of provider health, handshake responses, and cache hits.
- **Normalized Schema (DTO)**: Live JSON stringification of the active `NormalizedKPModel` payload.
- **Provider Settings Panel**: Interactive dropdown to swap between providers and manually flush cache partitions.
