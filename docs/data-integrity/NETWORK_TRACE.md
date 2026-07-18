# Network Trace Report
**Date:** July 15, 2026
**Subject:** Complete network path trace of the JHora client-server layers.

This report documents how network requests travel through the layers of the application, mapping the transition from native client patterns to our active Web/Express/TypeScript architecture.

---

## 1. Network Path Diagram

```
+--------------------------------------------------------------+
|                    MOBILE CLIENT / WEB UI                    |
|  - Android App / Retrofit (Conceptual mapping)               |
|  - React Frontend (src/App.tsx)                              |
+------------------------------+-------------------------------+
                               |
                      HTTP POST|   Base URL: /api/*
                               v
+--------------------------------------------------------------+
|                     LOCAL ROUTING LAYER                      |
|  - Express Server Gateway (server.ts)                        |
+------------------------------+-------------------------------+
                               |
               In-Memory Call  |   calculateAstrology(...)
                               v
+--------------------------------------------------------------+
|                     LOCAL ASTROLOGY MATH                     |
|  - Astro engine (src/lib/astrology.ts)                       |
+--------------------------------------------------------------+
```

---

## 2. Path Layer Details

### Layer 1: Client Application & Trigger
* **Component:** React UI Controller (`src/App.tsx`)
* **Trigger Event:** User submits the horoscope parameters form.
* **Function:** `handleCalculate(isInitial)`

### Layer 2: Client Repository / Network Layer
* **Module:** Asynchronous `fetch` client.
* **Target Endpoint:** `/api/astrology/calculate`
* **Network Protocol:** HTTP/1.1 POST with JSON serialization.
* **Client Model Representation:** `AstrologyData` TypeScript Interface (replaces original Kotlin network DTOs).

### Layer 3: Backend Gateway (Server Router)
* **Server Module:** Express Routing Engine (`server.ts`)
* **Endpoint Handler:** `app.post("/api/astrology/calculate")`
* **Role:** Parses incoming JSON request streams, validates required parameters, and performs explicit type safety conversions (e.g. converting string parameters to floating-point values for mathematical processing).

### Layer 4: Mathematical Processing Engine
* **Code Module:** `src/lib/astrology.ts`
* **Invoked Function:** `calculateAstrology(...)`
* **Processing:** Evaluates planetary longitude, orbital coordinates, divisional charts, dasha timelines, and active yogas/doshas purely in-memory using deterministic Parashari equations.

### Layer 5: Storage Cache Synchronizer
* **Caching Engine:** `src/lib/indexedDb.ts`
* **Target Stores:** `horoscopes` (Maps SQLite `user_horoscopes` table) and `compatibility` (Maps SQLite `compatibility_cache` table)
* **Action:** Upon receiving the HTTP response payload, the client updates the browser's persistent IndexedDB local cache.
