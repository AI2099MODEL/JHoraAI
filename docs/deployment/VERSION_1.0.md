# JHoraAI - Version 1.0.0-RC (Release Candidate)

Welcome to the **Version 1.0 Release Candidate** of JHoraAI—the premier, full-stack, AI-enhanced Vedic Astrology (Jyotish) research portal.

---

## 1. System Overview
JHoraAI delivers comprehensive, high-precision astronomical calculations mapped directly from the JHora engine on Cloud Run. It integrates traditional Vedic principles with responsive design systems, secure offline-first persistence, and advanced AI-powered chart synthesis.

---

## 2. Core Functional Modules

### A. JHora Horoscope & Calculation Engine
* **Planetary Coordinate Positions**: Highly accurate degrees, signs, nakshatras, nakshatra lords, and house placements for Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, and Ketu.
* **Divisional Charts (Vargas)**: Instant computational support for 20 essential divisional charts:
  * **D1 (Rasi)** to **D60 (Shastiamsa)** including specialized divisions like D9 (Navamsa) and D10 (Dasamsa).
* **Vimshottari Dasha Tree**: Complete 120-year cycle mapping down to three levels (Mahadasha, Antardasha, and Pratyantardasha).
* **Additional Dashas**: Full support for Yogini (36-year) and Ashtottari (108-year) cycles.
* **Astrological Strengths**: Detailed **Shadbala** (sthana, dig, kala, cheshta, naisargika, drig balas) and **Bhava Bala** house strengths.
* **Samudhaya Ashtakavarga**: Combined grids and individual planet point maps.
* **Longevity & Special Indicators**: Jaimini longevity calculations, Arudha Padas, sensitive coordinates (Sphutas, Upagrahas, Sahams), and obstruction (Argala) details.

### B. Marriage Matching (Ashtakoota & Porutham)
* **Ashtakoota Grid**: 8-fold compatibility metric scoring Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoota, and Nadi out of 36 points.
* **Porutham Details**: Traditional South-Indian 10-fold matching analysis.
* **Synergy Verdict**: Balanced summary of planetary and coordinate compatibilities.

### C. Gochara Transits & Muhurta
* **Current Gochara**: Real-time planet coordinates superimposed relative to the native's birth chart.
* **Planetary Ingress**: Track upcoming sign entries.
* **Muhurta Events**: Dynamic indicators for Abhijit and Brahma Muhurtas, and Rahu Kaal.

### D. AI Astrology Assistant
* **Jyotishacharya AI**: Highly customized Gemini-powered conversational agent.
* **Automated Analysis**: Casts deep, practical chart analysis, planetary yogas, and dosha mitigations.
* **Secure API Proxies**: All keys remain server-side—completely protected from client-side browser exposures.

### E. Robust Offline Cache (Room Database Model)
* **Local Persistence**: Integrated with browser IndexedDB (**JHoraAICacheDB**).
* **Automatic Offline Restore**: Reload previously calculated charts instantly, with zero external dependency.

---

## 3. Design & Architecture
* **Theme & UI**: Tailwind CSS. Designed to represent a high-contrast slate-colored layout with spacious padding and meticulous visual hierarchy.
* **Responsive Layout**: Designed for seamless scaling across mobile (touch-targets $\ge 44\text{px}$), tablets, and widescreen desktop bento grids.
* **Zero Fake Data**: Strictly compliant with **Phase 12 Integrity Policies**—guaranteeing that all displayed coordinates are authentic and mathematically correct.
