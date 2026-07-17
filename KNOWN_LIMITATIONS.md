# JHoraAI Version 1.0 Release Candidate - Known Limitations

This document lists the recognized architectural, computational, and environmental limitations of the **JHoraAI Version 1.0** release.

---

## 1. Krishnamurti Paddhati (KP) Stellar Module
* **Status**: **Temporarily Disabled / Locked**
* **Details**: Under Phase 12 Integrity Policy, the KP Stellar module has been frozen in an **"Awaiting verified KP data provider"** display.
* **Impact**: Cusps (Placidus unequal house divisions), planet star-lords, sub-lords, sub-sub-lords, house and planet significators, and ruling planets are not computed or displayed. 
* **Mitigation**: Once an authenticated third-party API or a verified local mathematical engine (using Swiss Ephemeris) is officially validated, the module can be safely configured and unlocked in Settings.

## 2. API Dependency (Calculations)
* **Status**: **Internet/API Connection Required**
* **Details**: Active, real-time calculations of new horoscopes require access to the JHora API Gateway running on Cloud Run.
* **Impact**: In a complete offline state (no network), users cannot cast *new* horoscopes for previously uncalculated birth coordinates.
* **Mitigation**: The system is integrated with IndexedDB (**JHoraAICacheDB**). Any horoscope that has been cast once is fully persisted locally. Users can reload, view, and navigate these cached records without an internet connection.

## 3. Offline Cache Boundaries
* **Status**: **Storage and Scope Constraints**
* **Details**: The offline cache relies entirely on browser IndexedDB APIs.
* **Impact**:
  1. If the user clears their browser cache, history, or site data, all cached horoscopes will be removed.
  2. If the user browses in Private/Incognito modes, the browser may enforce strict storage quotas and wipe the IndexedDB store immediately upon closing the tab.
* **Mitigation**: Users are advised to use professional, stable browsers and back up important profile data.

## 4. Computational and Astro Boundaries
* **Status**: **Fixed Precision**
* **Details**: Divisional chart alignments (D1 to D60) and Shadbala strengths are computed on the server-side JHora engine.
* **Impact**: Coordinates are calculated based on Lahiri Ayanamsa by default. Users can toggle other systems in settings, but complex customized tropical-sidereal offsets are constrained by the server API's supported modes.
* **Mitigation**: The settings menu allows selecting common ayanamsas (Lahiri, Raman, Krishnamurti, Fagan-Bradley, Tropical).

## 5. Gemini AI Assistant Key
* **Status**: **User Key Required**
* **Details**: To keep the system free and independent, JHoraAI does not bundle a public commercial Gemini API Key.
* **Impact**: The AI Assistant tab is offline unless the user configures their own `GEMINI_API_KEY` in the Secrets/Settings configuration.
* **Mitigation**: A secure, server-side gateway route proxies Gemini calls. This ensures that the user's secret key is never sent to or visible in the client browser.
