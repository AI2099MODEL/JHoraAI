# Updated Folder Structure: JHoraAI Platform
**Date:** July 15, 2026
**Version:** 1.0.0
**Status:** Audit Approved

---

## 1. Directory Tree
Below is the clean, modularized folder structure designed to scale for high-fidelity astrology modules and dynamic plugin integrations.

```
/
├── .env.example                       # Shared environment examples
├── CANONICAL_DATA_MODEL.md            # Canonical state reference
├── FIELD_METADATA.md                  # Metadata audit checklist
├── SOURCE_INTEGRITY_REPORT.md         # Source tracking verification
├── NAVIGATION_GRAPH.md                # Path mapping reference
├── COMPOSE_NAVIGATION.md              # Android-matching mapping design
├── MODULE_DEPENDENCY_DIAGRAM.md       # Dependency hierarchy diagram
├── UPDATED_FOLDER_STRUCTURE.md        # Current file layout structure
├── package.json                       # Dependencies & scripts
├── server.ts                          # Express Gateway Server (Proxy endpoints, Gemini SDK)
├── vite.config.ts                     # Bundling configuration
├── index.html                         # Entry point index
└── src/
    ├── main.tsx                       # React Bootstrap Entry
    ├── App.tsx                        # Global state container & Navigation Graph shell
    ├── index.css                      # Tailwind import & Font families
    ├── types.ts                       # Shared interfaces and enums
    ├── lib/
    │   ├── jhoraMapper.ts             # SOURCE_B derived calculations & parser
    │   └── indexedDb.ts               # Local offline cache layer (SQLite/Room equivalent)
    └── components/
        ├── AndroidDesignSystem.tsx    # Material 3 UI design constants (colors, margins)
        ├── AstroChart.tsx             # North & South Indian SVG renderers (D1, D9)
        ├── AstroChat.tsx              # Gemini AI Chat client
        ├── CompatibilityTab.tsx       # Ashtakoota matchmaking module
        ├── HoroscopeDashboard.tsx     # Full suite of Horoscope views (Panchanga, Strength tables)
        ├── ApiAcceptanceDashboard.tsx # Developer diagnostics & Request logs
        └── WhatComesBackExplorer.tsx  # Diagnostics UI interface
```

---

## 2. Structural Guidelines
*   **Decoupled Views**: All main content pages (e.g. AstroChart, AstroChat, Compatibility) are isolated components, accepting purely stateless configuration options or baseline data models from `App.tsx`.
*   **Immutable Libraries**: `src/lib/` files do not reference any visual styling or frame layout rules. This separation allows them to be compiled or run in server-side node environments directly without UI thread side-effects.
*   **Typing Exclusivity**: `/src/types.ts` is the single source of type declarations. Components are prohibited from creating duplicate internal types.
