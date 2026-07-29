# Navigation Graph: JHoraAI Platform Routing Architecture
**Date:** July 15, 2026
**Version:** 1.0.0
**Status:** Architecture Blueprint

---

## 1. Unified Routing Graph
The JHoraAI routing graph is designed to handle multi-level nested navigation. The platform implements a modern, single-page application router (React State + Motion layout animations) representing a professional native layout.

```
+---------------------------------------------------------------------------------+
|                                 App shell                                       |
|  (Responsive Navigation Rail / Bottom Nav / Expandable Navigation Drawer)       |
+---------------------------------------------------------------------------------+
                                       |
     +---------------------------------+---------------------------------+
     |                                                                   |
[Main Navigation Nodes]                                       [Reserved / Plugin Modules]
     |                                                                   |
     +---> Dashboard                                                     +---> KP Stellar (Plugin)
     +---> Profiles (Saved Horoscopes)                                   +---> Jaimini (Plugin)
     +---> Horoscope (Nested Sub-menu)                                   +---> Parashari (Plugin)
     +---> Charts (Nested Sub-menu)                                      +---> Western (Plugin)
     +---> Dashas (Nested Sub-menu)                                      +---> Mood Engine (Plugin)
     +---> Strengths (Nested Sub-menu)                                   +---> Event Engine (Plugin)
     +---> Predictions (Nested Sub-menu)                                 +---> Workflow (Plugin)
     +---> Marriage (Nested Sub-menu)                                    +---> Research (Plugin)
     +---> Transit (Nested Sub-menu)
     +---> Muhurta (Nested Sub-menu)
     +---> Reports (Nested Sub-menu)
     +---> AI Assistant (Nested Sub-menu)
     +---> Settings (Nested Sub-menu)
     +---> Developer (Nested Sub-menu)
```

---

## 2. Detailed Navigation Paths & Submenus

### 1. Horoscope (`/horoscope`)
*   `Overview` (Dashboard Summary Card, Panchanga Highlights, Active Dasha)
*   `Birth Details` (Coordinate viewer, Local Sidereal Time, Timezone specs)
*   `Planetary Positions` (Degrees, Signs, Retrograde indicators, Nakshatras, Houses)
*   `Panchanga` (Tithi, Vara, Nakshatra, Yoga, Karana, Gana, Nadi, Yoni, Varna)
*   `Planet Strength` (Shadbala detailed table and percentage charts)
*   `Bhava Strength` (Bhava Bala strength rankings and Recharts visualizer)
*   `Ashtakavarga` (Sarvashtakavarga summary points)
*   `Yogas` (Auspicious yoga listings and mathematical indicators)
*   `Doshas` (Manglik, Kaal Sarp, and Sade Sati live calculation checkers)
*   `Longevity` (Traditional life-expectancy indicators and explanations)
*   `Sade Sati` (Detailed Shani Sade Sati transit active stage checks)

### 2. Charts (`/charts`)
*   `D1 Rasi` (The main Rasi chart wheel)
*   `D2 Hora` (Wealth / Resources)
*   `D3 Drekkana` (Siblings / Talents)
*   `D4 Chaturthamsa` (Property / Assets)
*   `D7 Saptamsa` (Children / Progeny)
*   `D9 Navamsa` (Dharma, marriage, sub-potentials)
*   `D10 Dasamsa` (Profession / Career)
*   `D12 Dwadasamsa` (Parents / Ancestry)
*   `D16 Shodasamsa` (Vehicles / Pleasures)
*   `D20 Vimsamsa` (Spiritual path / Practice)
*   `D24 Chaturvimsamsa` (Learning / Education)
*   `D27 Saptavimsamsa` (Strengths / Weaknesses)
*   `D30 Trimsamsa` (Evils / Misfortunes)
*   `D40 Khavedamsa` (Auspicious achievements)
*   `D45 Akshavedamsa` (General well-being)
*   `D60 Shastiamsa` (Detailed karma analysis)

### 3. Dashas (`/dashas`)
*   `Vimshottari` (Hierarchical 120-year Nakshatra dasha tree)
*   `Yogini` (Luni-solar 36-year planetary cycle dasha)
*   `Ashtottari` (Alternate 108-year dasha system)

### 4. Strengths (`/strengths`)
*   `Shadbala` (Six-fold planetary strength index)
*   `Bhava Bala` (House-strength index)
*   `Ashtakavarga` (Point-distribution table)

### 5. Predictions (`/predictions`)
*   `Yogas` (Natal combinations)
*   `Doshas` (Afflictions)
*   `Arudhas` (Perceptions/Reflections)
*   `Sphutas` (Mathematical sensitive points)
*   `Upagrahas` (Shadow planets/sub-nodes)
*   `Sahams` (Arabic/Tajik sensitive points)
*   `Special Lagnas` (Hora Lagna, Ghati Lagna, Bhava Lagna)

### 6. Marriage (`/marriage`)
*   `Ashtakoota` (8-fold grid matchmaking)
*   `Porutham` (Traditional Tamil matching)
*   `Compatibility` (Overall planetary synergy score)

### 7. Transit (`/transit`)
*   `Current Gochara` (Live planetary positions mapped against birth Ascendant)
*   `Planet Ingress` (Upcoming planetary sign-change event schedules)
*   `Transit Summary` (Transit interpretations)

### 8. Muhurta (`/muhurta`)
*   `Daily Muhurta` (Abhijit, Brahma, Rahu Kaal, Gulika Kaal)
*   `Event Muhurta` (Saved planetary wedding or business Muhurta windows)

### 9. Reports (`/reports`)
*   `Generate PDF` (Professional horoscope report compiler)
*   `Saved Reports` (Local archive)
*   `Share Report` (Social share / QR generation)

### 10. AI Assistant (`/ai-assistant`)
*   `Chat` (Conversational analysis using gemini-3.5-flash)
*   `Explain Horoscope` (Automated personalized text analysis)
*   `Explain Yogas` (Detailed explanation of active yogas)
*   `Explain Dashas` (Dasha period guide)
*   `Future Prediction` (Transit-based predictive synthesis)

### 11. Settings (`/settings`)
*   `Theme` (Light, Dark, Slate, Cosmic, Amber themes)
*   `Language` (English, Hindi, Sanskrit, Tamil, Telugu)
*   `Ayanamsa` (Lahiri, Raman, Krishnamurti, Fagan-Bradley, Yukteshwar)
*   `Chart Style` (North Indian Diamond, South Indian Outer-Square)
*   `Notification` (Ingress push alerts)
*   `GitHub Updates` (Version history feed)

### 12. Developer (`/developer`)
*   `Raw JSON` (Official JHora payload syntax highlighter)
*   `API Inspector` (API latency, response headers, error codes)
*   `Request Log` (Historical network payloads)
*   `Response Log` (Response bodies)
*   `DTO Viewer` (Data transfer object schemas)
*   `Room Database Viewer` (Local IndexedDB cache rows)
*   `Plugin Manager` (Dynamic plugin activations)
*   `Performance` (Rendering FPS, payload size metrics)
*   `Cache Manager` (Evict caches, check index limits)
