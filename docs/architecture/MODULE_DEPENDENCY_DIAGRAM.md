# Module Dependency Diagram: JHoraAI Architecture
**Date:** July 15, 2026
**Version:** 1.0.0
**Status:** Canonical Reference

---

## 1. High-Level Dependency Graph

The JHoraAI platform is structured with a strict unidirectional data flow. This separates design layouts, navigational controllers, data transformations (mappers), secure api controllers, and data storage.

```
       +--------------------------------------------------------+
       |                  React Entry Point                     |
       |                   (src/main.tsx)                       |
       +---------------------------+----------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |                     App Shell                          |
       |                    (src/App.tsx)                       |
       +---------------------------+----------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |             Navigation Rail & Drawer                   |
       |              (src/components/Navigation)               |
       +-------+-------------------+--------------------+-------+
               |                   |                    |
               v                   v                    v
       +---------------+   +---------------+   +----------------+
       |   Dashboard   |   |  Sub-Screens  |   | Plugin Manager |
       |  (Overview)   |   | (Horoscope,   |   |   (Developer)  |
       |               |   |  Charts, etc.)|   |                |
       +-------+-------+   +-------+-------+   +--------+-------+
               |                   |                    |
               +---------+---------+                    v
                         |                     [Dynamic Plugins]
                         v                     * KP Stellar
       +-----------------------------------+   * Jaimini
       |       Domain Astrology Types      |   * Western
       |           (src/types.ts)          |   * Mood Engine
       +-----------------+-----------------+
                         |
                         v
       +-----------------------------------+
       |        Astrology Data Mapper      |
       |       (src/lib/jhoraMapper.ts)    |
       +-----------------+-----------------+
                         |
                         v
       +-----------------------------------+
       |    Offline DB Caching Manager     |
       |       (src/lib/indexedDb.ts)      |
       +-----------------------------------+
```

---

## 2. Core Modules Descriptions

### 1. App Shell Layout (`App.tsx`)
*   **Role**: Coordinates global system theme state (Light, Dark, Slate, Cosmic, Amber), orchestrates active birth detail states, holds Navigation States, and handles the responsive grid system (Navigation Rail vs Bottom Tab bar).
*   **Dependencies**: `types.ts`, `indexedDb.ts`, `jhoraMapper.ts`.

### 2. Astronomy Mapper Engine (`jhoraMapper.ts`)
*   **Role**: Converts raw API JSON data (SOURCE_A) into typed domain objects. Executes derived calculations (SOURCE_B) cleanly without external math drift.
*   **Dependencies**: `types.ts`.

### 3. Caching & Database Module (`indexedDb.ts`)
*   **Role**: Provides simple browser-level persistence for saved profiles and calculation history using IndexedDB wrappers (SQLite equivalent).
*   **Dependencies**: `types.ts`.

### 4. Dynamic Plugin Loader (`PluginManager.tsx`)
*   **Role**: Enables reserved plugins (KP Stellar, Jaimini, Western, Mood Engine) to register themselves and render dynamic placeholder screens without requiring main code modifications.
*   **Dependencies**: None (Fully decoupled).
