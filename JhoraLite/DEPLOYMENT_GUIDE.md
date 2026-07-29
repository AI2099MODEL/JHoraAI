# JHora Lite Production Deployment & Architecture Guide

Welcome to the **JHora Lite** (`JhoraLite`) decoupled production bundle. This handbook outlines the complete visual identity, system architecture, development regulations, and dual-agent synchronization engine configurations for launching or maintaining the lightweight Vedic Jyotish platform.

---

## 1. Visual Identity & Brand System

JHora Lite has a distinctive Light-Theme branding system designed for high readability, visual clarity, and high-contrast typography. All components and themes must adhere strictly to these color specifications:

| Asset / UI Segment | Target Palette & Branding Rules | Color Hex |
|---|---|---|
| **Main Background** | Plain Pure White (high screen luminosity) | `#FFFFFF` |
| **Primary Accent** | Vibrant Pink (buttons, highlights, status tab indicators) | `#E91E63` |
| **Secondary Accent** | Soft Rose Pink (borders, small accents, active card contours) | `#F06292` |
| **Light Container** | Lavender Blush (soft bubble background, secondary cards) | `#FFF0F5` |
| **Primary Text Color** | Crisp Black (high-contrast readability, absolute dark glyphs) | `#000000` |
| **Secondary Text Color**| Dark Charcoal Grey (meta labels, help hints, timestamp details) | `#555555` |
| **User Chat Bubble** | Soft Pastel Bubble Pink (distinguishes outbound queries) | `#FCE4EC` |
| **AI Response Bubble** | Soft Warm Off-White (distinguishes inbound celestial insights)| `#F5F5F5` |

### Key Styling Directives
1. **No Hardcoded Dark Modes**: All elements must support clear, legible colors under strong light. Any conditional dark-theme switches should default to white backgrounds and plain black typography.
2. **Touch Safety Targets**: All buttons, chips, and interactive layout elements must satisfy the **48dp x 48dp** Material Design 3 accessibility standard.
3. **Typography**: Use standard display headings with ample line-height spacing (`lineHeight = 16.sp` for body and `18.sp` for cards) to prevent overlap or visual clutter.

---

## 2. Core Architectural Design

The app's engineering leverages modern Android architectures to stay decoupled, reactive, and offline-first.

```
       ┌────────────────────────────────────────────────────────┐
       │                 Jetpack Compose UI (M3)                │
       └───────────────────────────▲────────────────────────────┘
                                   │ (StateFlow Collect)
       ┌───────────────────────────┴────────────────────────────┐
       │                AstrologyViewModel (State)               │
       └───────────────────────────▲────────────────────────────┘
                                   │
       ┌───────────────────────────┴────────────────────────────┐
       │         AstrologyRepository (Room DB Cache)            │
       └───────────────────────────▲────────────────────────────┘
                                   │
       ┌───────────────────────────┴────────────────────────────┐
       │        WebFetcher & Dual Sync Agents (GitHub/API)       │
       └────────────────────────────────────────────────────────┘
```

### Components
- **Jetpack Compose (UI)**: Full Material 3 screen structures built with `Scaffold`, `LazyColumn`, `Box`, and `Row`. Custom sliders, forms, and cards are styled with `LightGlass` pink backings.
- **AstrologyViewModel**: Retains active session indexes, collects states as Flow, and hosts the autonomous synchronization agent states.
- **Room Database**: Ensures immediate local persistence of horoscope profiles, chat sessions, and messages. This allows users to retain full history offline, bypassing any transient network drops.

---

## 3. Dual Sync Agents (Lag Elimination Framework)

To guarantee there is **absolutely zero lag** between the website portal and the native mobile application, JHora Lite implements a **Dual-Agent Autonomous Synchronization Engine**:

### 1. Outbound GitHub Push Agent
- **Responsibility**: Tracks local state updates (such as saving new profile details, editing birth data, or clearing horoscopes).
- **Trigger**: Actuated instantly whenever the user hits "Save Profile" or re-casts their charts.
- **Action**: Issues an asynchronous POST proxy call to `/api/user-profile/act` to update the GitHub remote profile cache and the Cloudflare Worker server.
- **Status Telemetry**: Transitions from `Listening / Idle` to `Executing Sync...` and registers a detailed telemetry entry in the console upon completion.

### 2. Inbound GitHub Pull & Poll Agent
- **Responsibility**: Continuously watches the remote GitHub repositories and Cloudflare Worker endpoints for any external edits.
- **Trigger**: Operates autonomously in the background via a persistent Coroutine loop.
- **Action**: Polls the server every **10 seconds**. It fetches the remote profile (`/api/user-profile/get`) and compares it with the local Room database.
- **Dynamic Updates**: If a mismatch is identified (e.g., the user edited their profile details on their desktop browser), this agent automatically re-casts charts, pulls transit weather coords, saves details to the local DB, and re-computes the horoscope layout.
- **Result**: The user watches their charts shift and re-draw instantly on their screen with ZERO lag and zero manual refresh clicks.

---

## 4. Complete Engineering Regulations & Compliance Rules

Every developer, build container, or CI/CD pipeline building JHora Lite **must** comply with the following production constraints:

### A. Environment & Secrets Management
- **No Hardcoded Keys**: API keys (such as the server-side Gemini API credentials) must be managed using the **Secrets Panel in Google AI Studio** and accessed at runtime through `BuildConfig`.
- **Properties Forbidden**: Do not write, create, or modify `local.properties` in local directories.

### B. Dependency Guidelines
- **Kebab to Dot Notation**: When importing dependencies defined in the Version Catalog (`gradle/libs.versions.toml`) inside `build.gradle.kts`, convert kebab-case labels to dot notation (e.g., `androidx-core-ktx` becomes `libs.androidx.core.ktx`).
- **No Product Flavors**: Keep build outputs simple. Do not add product flavors or alter output APK directories.

### C. UI & UX Refinement
- **Interactive Component State**: All Material 3 buttons must offer responsive Material Ripples. Include description attributes (`contentDescription`) for every icon to support screen readers (TalkBack).
- **Adaptive Sizing**: Prevent stretch on wide screens or foldable displays by enforcing `widthIn(max = 600.dp)` with centered alignment.
- **Custom Adaptive Launcher Icons**: Never package standard Android green-head assets. Follow the adaptive icon specifications (foreground/background vectors configured under `res/mipmap-anydpi-v26`).

### D. Verification & Testing Practices
- **Standard Verification**: Run `compile_applet` to execute full Gradle Kotlin DSL validations.
- **Robolectric & Roborazzi Testing**: Use Robolectric for JVM-based critical user journey validation and Roborazzi for visual regression/screenshot checking. Do not run emulator-based Espresso instrumented tests which fail in server-side containers.

---

## 5. Deployment Checklist

Before building the release APK, check off the following parameters:

- [ ] **Package ID Alignment**: Verify `applicationId` in `app/build.gradle.kts` is set to `com.aistudio.jhoralite.kxmpzq`.
- [ ] **App Name Matching**: Verify `app_name` in `strings.xml` and `rootProject.name` in `settings.gradle.kts` are both set to `"JHora Lite"`.
- [ ] **Metadata Synchronization**: Check that `"name": "JhoraLite"` is set in the root `metadata.json` to keep sidebar names fully aligned.
- [ ] **Polishing Images**: Run `generate_image` to supply beautiful pastel rose/lavender background assets for the introductory slides or dashboard empty views.
- [ ] **Testing Coverage**: Execute local JVM test suites to guarantee database read/write queries and astrological calculations perform flawlessly.
