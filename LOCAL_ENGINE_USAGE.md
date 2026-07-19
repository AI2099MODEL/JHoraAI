# Local Engine Usage Report
**Date:** July 15, 2026
**Subject:** Precise verification of active and residual local calculation layers.

---

## 1. Local Engine Verification: `src/lib/astrology.ts`
The file `src/lib/astrology.ts` acts as our central mathematical engine. We audited the client and server codebases to determine if any calculations are still performed locally.

### A. Is `src/lib/astrology.ts` still being called?
* **YES.**

### B. Where is it being called?
1. **Express Server Backend (`server.ts`):**
   * Imported at the top:
     ```typescript
     import { calculateAstrology, calculateCompatibility } from "./src/lib/astrology.js";
     ```
   * Invoked in `/api/jhora/horoscope` to compute planetary positions, divisional charts, calendar info, and yogas.
   * Invoked in `/api/jhora/marriage-match` to compute compatibility matches.
   * Invoked in `/api/jhora/gochara` to compute planetary transits.
   * Invoked in `/api/astrology/compatibility` to compute match points.
   * Invoked in `/api/astrology/calculate` to cast standard horoscope charts.

2. **React Client Frontend (`src/App.tsx` and `src/components/CompatibilityTab.tsx`):**
   * **CLOSED/REMOVED.** We successfully removed the local calculation fallbacks from both `src/App.tsx` and `src/components/CompatibilityTab.tsx`. The frontend is now 100% dependent on the API endpoints of the JHora server. If the server is offline, calculations gracefully stop rather than falling back to approximate local math.

---

## 2. Usage Matrix by Component

| File Path | Call Status | Component/ViewModel | Role / Function |
|---|---|---|---|
| `src/App.tsx` | **Cleaned** | `handleCalculate` | Now fetches solely from `/api/astrology/calculate` with NO fallback to local `calculateAstrology()`. |
| `src/components/CompatibilityTab.tsx` | **Cleaned** | `handleCalculate` | Now fetches solely from `/api/astrology/compatibility` with NO fallback to local `calculateCompatibility()`. |
| `src/components/AstroChat.tsx` | **Cleaned** | `AstroChat` | Only consumes the synced `astrologyData` model populated by the server API. |
| `src/lib/indexedDb.ts` | **Cleaned** | Cache Helpers | Only stores and retrieves pre-calculated records received directly from the server API. |
| `server.ts` | **Active** | API Routes | Calls `calculateAstrology` and `calculateCompatibility` server-side to fulfill API requests. |
