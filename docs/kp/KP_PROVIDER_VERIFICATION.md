# KP Provider Verification Report (Phase 16)

This document verifies the support matrix for the **VedicAstro** Krishnamurti Paddhati (KP) Stellar engine integration, adhering strictly to the Zero Synthetic Data Policy.

## Supported Core KP Features

The VedicAstro FastAPI microservice has been audited and fully supports the following features required by our specifications:

| Feature | Supported | Verification Method | Code Component |
| :--- | :---: | :--- | :--- |
| **KP Cusps** | ✓ Yes | Verified via `/kp/cusps` endpoint | `toKpCuspData` |
| **Star Lords** | ✓ Yes | Verified via `/kp/starlords` | `toKpStarLords` |
| **Sub Lords** | ✓ Yes | Verified via `/kp/sublords` | `toKpSubLords` |
| **Sub-Sub Lords** | ✓ Yes | Verified via `/kp/subsublords` | `toKpSubSubLords` |
| **Planet Significators** | ✓ Yes | Verified via `/kp/planet_significators` | `toKpPlanetSignificators` |
| **House Significators** | ✓ Yes | Verified via `/kp/house_significators` | `toKpHouseSignificators` |
| **Ruling Planets** | ✓ Yes | Verified via `/kp/ruling_planets` | `toKpRulingPlanetsData` |
| **KP Transit** | ✓ Yes | Verified via `/kp/transit` | `toKpTransitDetails` |
| **KP Horary** | ✓ Yes | Verified via `/kp/horary` | `toKpHoraryDetails` |
| **KP Dashas** | ✓ Yes | Verified via `/kp/dasha` | `toKpDashaData` |

## Verification Details

1. **Calculations Discipline**: Zero client-side mathematical approximations are performed. The microservice acts as the single source of truth.
2. **Sub Lord Integrity**: Sub Lords and Sub-Sub Lords are loaded directly from the verified FastAPI provider responses, conforming to Lahiri / Chitra Paksha standards. No local derivations are applied.
3. **Graceful Fallbacks**: If the provider connection is interrupted, the UI displays a clear `"KP provider unavailable"` warning and stops rendering.
