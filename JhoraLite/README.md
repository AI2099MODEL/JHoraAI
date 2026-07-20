# JHora Lite Configuration Bundle

This directory stores the decoupled configurations, themes, and metadata for **JHora Lite** (JhoraLite).

## App Configurations

- **App Name:** JHora Lite (`JhoraLite`)
- **Theme Palette:** Light Pink & White with crisp black typography
- **Application ID:** `com.aistudio.jhoralite.kxmpzq`
- **Minimum SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)

## Theme & Branding Specifics

| Property | Value | hex |
|---|---|---|
| Main Background | Plain White | `#FFFFFF` |
| Primary Accent | Vibrant Pink | `#E91E63` |
| Secondary Accent | Soft Rose Pink | `#F06292` |
| Light Container | Lavender Blush | `#FFF0F5` |
| Text Color | Black | `#000000` |
| User Bubble | Pastel Soft Pink | `#FCE4EC` |
| AI Bubble | Warm Off-White | `#F5F5F5` |

## Code References Included

The main codebase leverages:
1. `MyApplicationTheme` in `Theme.kt` redefined for a persistent pink and white LightColorScheme.
2. Hardcoded dark theme colors (such as `SpaceBlack`, `CosmosPurple`) redefined to White, Light Pink, and Black in `AstrologyMainScreen.kt` for flawless light theme compatibility.
3. System status bars & edge-to-edge configurations supporting older and newer Android releases alike.

---

## 🛠️ Deployments & Synchronization Agents

For complete production release steps, coding compliance rules, and details on our **Dual Sync Agents** (Outbound GitHub Push Agent & Inbound Pull & Poll Agent), please read our comprehensive [JHora Lite Deployment Guide](DEPLOYMENT_GUIDE.md).

