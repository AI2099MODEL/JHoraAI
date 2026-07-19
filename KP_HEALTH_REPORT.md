# KP Health Handshake & Fault-Tolerance Report (Phase 16)

This report details the implementation of the secure, fail-safe health verification and degradation mechanism designed for the Krishnamurti Paddhati (KP) module.

## Handshake Architecture

The handshake operates using a synchronous, time-limited probe that safeguards the application from hangs or slow response times due to offline providers.

```
┌─────────────────┐             ┌─────────────────┐             ┌───────────────────┐
│  React App UI   │             │   Express API   │             │  VedicAstro REST  │
│  (KpDashboard)  │             │   (server.ts)   │             │  (FastAPI Server) │
└────────┬────────┘             └────────┬────────┘             └────────┬──────────┘
         │                               │                               │
         │  1. Check status              │                               │
         ├──────────────────────────────>│                               │
         │  (GET /api/kp/health)         │  2. Probe endpoint (GET/POST) │
         │                               ├──────────────────────────────>│
         │                               │                               │
         │                               │  3. Handshake response (200)  │
         │                               │<──────────────────────────────┤
         │                               │                               │
         │  4. Available Status (200 OK) │                               │
         │<──────────────────────────────┤                               │
         ▼                               ▼                               ▼
```

## Fault-Tolerance & Safe Degradation

1. **Strict Zero-Hypothetical Directive**: No fallback code is authorized to run local geometric or astrological approximations on the client or server. If the health probe fails, we **never** output placeholder or simulated values.
2. **Offline Warning Screens**: The React application intercepts any non-200 state or network timeout and gracefully renders the custom `ShieldAlert` diagnostic board in `KpStellarDashboard.tsx`.
3. **Traceability Logging**: Standard diagnostic logs include the target provider name (`KP_PROVIDER`), active URL, and a trace of the handshake result.
