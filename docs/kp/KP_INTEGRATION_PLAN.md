# KP Integration & Deployment Plan (Phase 13)

This document provides a detailed roadmap for deploying, configuring, testing, and enabling the Krishnamurti Paddhati (KP) astrology system.

---

## 1. Environment Configuration

To configure the live KP provider, declare the following environment variables in your server's `.env` configuration (e.g. via AI Studio Secrets menu or server variables):

```env
# Pluggable KP Provider Selection
KP_PROVIDER=vedicastro

# Target REST Endpoint Base URL
KP_BASE_URL=https://api.vedicastroapi.com/v1
```

If these environment variables are left blank, the application uses the default `VedicAstroProvider` pointing to the public `https://api.vedicastroapi.com/v1` API with default fallback queries.

---

## 2. Handshake & Health Check Workflow

To maintain absolute data integrity, the client and server coordinate via a health-check system:

1. **Service Startup**: `KpService` initializes and registers `VedicAstroProvider`.
2. **Health Check Dispatch**: When the client navigates to the KP Stellar menu, a GET request is fired to `/api/kp/health`.
3. **Provider Handshake**:
   - The Express backend handles the request and delegates it to `VedicAstroProvider.healthCheck()`.
   - `healthCheck()` sends a light-weight test packet (using custom timeout bounds) to the external `KP_BASE_URL`.
4. **State Transition**:
   - **Success (HTTP 200)**: The server responds `{ "status": "available", "provider": "vedicastro" }`. The UI dashboard moves to the verified state, signifying it is ready for rendering live data.
   - **Failure/Timeout**: The server responds `{ "status": "unavailable" }`. The UI displays a strict `"KP provider unavailable"` screen without attempting to simulate synthetic mathematical results.

---

## 3. Turning on the full KP UI (Awaiting Approval)

Once the provider integration is validated, you can enable the fully stylized visual widgets (Cusp tables, Star-lord panels, and Planet Significator bento grids) by executing these steps:

1. Request approval to toggle the KP UI.
2. In `src/components/KpStellarDashboard.tsx`, replace the `available` state rendering with your active live data layout (e.g., rendering `cusps` or `significators` received from `/api/kp/*`).
3. Deploy the updated `firestore.rules` or compile the applet using `npm run build`.
