# JHoraAI Astrological Platform & Synchronization Guide

This document provides a comprehensive technical overview of the JHoraAI platform's architecture, automatic synchronization pipeline, core engine functions, and astrological rules mapping guidelines.

---

## 1. Automatic GitHub Synchronization Pipeline

The JHoraAI platform features a real-time server-side synchronization engine that keeps user profiles and raw astrological payloads perfectly in sync with the GitHub repository (`https://github.com/AI2099MODEL/JHoraAI`).

### How Synchronization Works
Whenever a user profile is added, modified, or deleted through the website/application UI, the backend server triggers an automated Git workflow in real-time, completely dynamically and without requiring any server restarts:

1. **File Generation/Modification**:
   - For **additions/updates**, the server writes the raw payload to `/Users/userprofile.json` and a dedicated file `/Users/[profile_name][metadata].json` based on the robust name-mapping scheme.
   - For **deletions/deactivations**, the server identifies the active profile, dynamically scans the files in the `/Users` folder matching either the nested `User.profile_name` or `BirthDetails.name` fields, and deletes both the individual file and `/Users/userprofile.json`.

2. **Automated Commit Workflow**:
   - The server stages the modified or deleted files using standard Git operations (`git add` or `git rm`).
   - A descriptive conventional commit message is created automatically (e.g., `feat: activate user profile Nitin` or `feat: deactivate user profile Nitin`).

3. **Secure Instant Push**:
   - The server pushes the commits directly to the `main` branch of the remote repository (`origin`) using the authenticated secure remote URL containing the Personal Access Token (PAT):
     `https://<PAT>@github.com/AI2099MODEL/JHoraAI.git`
   - All synchronization occurs in a separate, non-blocking asynchronous child process. This means the server stays fully online and operational, and **no development server or application container restarts are required** to apply or synchronize profile updates.

### Configured Git Environment
- **Git User Name**: `AI Astrologer`
- **Git User Email**: `nitinjain2099@gmail.com`
- **Authentication**: Authenticated via Personal Access Token (PAT) configured securely on the `origin` remote.

---

## 2. Platform Architecture & Core Functions

JHoraAI uses a hybrid architecture combining raw API fetches with highly accurate, client-side astronomical algorithms.

### Key Components

```
┌────────────────────────────────────────────────────────┐
│                      User Interface                    │
│     (Horoscope Dashboard, Astro Chat, Report Views)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                JHora / VedicAstro API                  │
│          (Fetches Raw Astronomical Payloads)           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               Local Calculation Engines                │
│    (KP Stellar, Ashtakavarga SAV/BAV, Tajik, etc.)     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Durable Git-Synced Storage                 │
│         (/Users/userprofile.json, /Users/*.json)       │
└────────────────────────────────────────────────────────┘
```

### Core Calculations & Mapping Functions

#### A. KP Stellar Division Engine (`src/lib/kp/`)
The Krishnamurti Paddhati (KP) engine derives precise Nakshatra, Star, Sub, and Sub-Sub lords based on the absolute 360-degree longitude of planets and house cusps.
- **Star Lord**: Derived from the 13°20' Nakshatra divisions.
- **Sub Lord**: Derived by subdividing each Nakshatra proportionally based on Vimshottari Dasha years (120-year cycle).
- **Sub-Sub Lord**: Further proportional subdivisions of Sub-Lord ranges.

#### B. Ashtakavarga Matrix Engine (`src/lib/astrology.ts`)
- **Bhinnashtakavarga (BAV)**: Calculates individual planet contribution points (0 to 8 scale) across all 12 zodiac signs.
- **Sarvashtakavarga (SAV)**: Aggregates the points contributed by the 7 primary planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn) for each sign. A total of exactly 337 points is maintained as a validation check across the zodiac, where any sign scoring 28+ points is classified as highly auspicious.

#### C. Tajik System Engine (`src/lib/astrology.ts` & adapters)
- Translates annual solar return parameters to determine Varshaphal chart layouts.
- Computes Muntha positions and evaluates Harsha Bala, Dwadasavargiya Bala, and Tajik yogas (such as Ithasala, Esharapha) to provide accurate age-targeted forecasts.

---

## 3. Astrological Rules Execution Handbook

Every interpretation, chart analysis, and AI consultation is backed by strict adherence to the *Astrological Rules Handbook* and *KP Eventbook*, mapping planet placements to primary, supporting, and obstructing house significations.

### Rule Execution Priority
1. **Krishnamurti Paddhati (KP) Rules**:
   - Cusps and planets are evaluated based on Stellar and Sub-lord ownerships.
   - Event significations are determined by combining the house occupied by the planet, the houses owned by the planet, the house occupied by its Star Lord, and the houses owned by its Star Lord.
2. **Parashari (Vedic) Rules**:
   - Evaluates planetary strengths via Shadbala, Bhava Bala, and Ishtaphala/Kashtaphala.
   - Analyzes classic planetary combinations (Yogas) and negative configurations (Doshas) dynamically based on actual rashi chart coordinates.
3. **Jaimini Rules**:
   - Maps Chara Karakas (Atmakaraka to Dara Karaka) and Arudha Padas for social and financial status projections.
   - Calculates Chara Dasha sign-based timelines.

---

## 4. User Profile Data Models

The platform manages two categories of JSON data to balance raw archival storage with client-side visual stability:

### A. Dynamic Profile Payloads (`/Users/[profile_name].json`)
- Fully populated hybrid structures containing raw JHora API outputs along with client-side derived metadata.
- Includes pre-calculated `"KP"` blocks with planets, cusps, house significators, and planet significators computed directly from exact coordinate inputs.

### B. Raw Profile Ledger (`/Users/userprofile.json`)
- Acts as a persistent, locked-down, read-only baseline archive of raw REST gateway responses.
- Keeps raw data intact without on-the-fly client or server calculations, transits, or dynamic overlays. This ensures a 100% stable presentation matching the stored JSON payloads exactly.
- **KP API Data Notice**: If the external `VedicAstro` API service returns HTTP 404 (or other HTML error responses) for `kp_chart` or `kp_cusps` during fetch, the error is securely written to the ledger as `{"error": "Invalid JSON response..."}`. This preserves raw data provenance exactly as it was received, with no synthetic data generated during capture.

---

## 5. Astrological Engine & Data Persistence Rules

### Rule 1: Strict UserProfile Data Strategy
Under no circumstances should the system perform client-side or server-side pre-computations, calculations, or generate any transit forecasts or overlays during data fetch. The UserProfile must remain a strictly persistent archive of raw API responses only (from the JHora/VedicAstro endpoints), preserving the raw response exactly as-is. Mappings and interpretations must only be done at render/run-time or in separate transient application logic, never embedded within the stored profile.

### Rule 2: Dynamic Filename Mapping and Raw Payload Preservation
When a user clicks on "Cast and Generate Horoscope" or "Refresh Horoscope", all raw data must be pulled into respective user profiles with the user profile named precisely as:
`nativename_dateofbirth_timeofbirth_place.json`
*(Format: [lowercase native name]_[DDMMYYYY date of birth]_[hhmmam/pm time of birth]_[lowercase place name].json, e.g. `nitin_06011976_0640pm_dehradun.json`)*.
There must be absolutely **NO CALCULATIONS AND NO TRANSIT DATA** in this JSON file. It must only contain the pristine raw data pulled from the external APIs for downstream rendering and run-time interpretation.
