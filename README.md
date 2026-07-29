# JHora AI Professional

JHora AI Professional is an advanced, production-ready full-stack Vedic Astrology (Jyotish) computational platform. It provides deterministic astronomical calculations alongside intuitive conversational guidance driven by Gemini.

This repository hosts the complete, modern, full-stack React and Node.js implementation which replaces the legacy Android scaffold.

## Core Features

-   **Horoscope Dashboard**: Calculates precise planetary coordinates, degrees, and placements. Features comprehensive Graha (planetary) analysis including Nakshatras, Padas, Nakshatra Lords, and computed Shadbala strengths based on sidereal Lahiri Ayanamsa.
-   **Interactive Astrological Charts**: Generates beautiful, responsive chart layouts in both:
    -   **North Indian Style**: Fixed-house diamond configuration where zodiac signs rotate.
    -   **South Indian Style**: Fixed-sign 4x4 grid layout where houses rotate clockwise from the Ascendant (Lagna).
-   **Vimshottari Dasha Timeline**: Computes the traditional 120-year planetary cycle, offering a nested, expandable timeline of active Mahadashas and Antardashas to identify major life cycles.
-   **Yogas & Celestial Doshas**: 
    -   *Yogas*: Identifies auspicious planetary combinations (such as Budhaditya or Gaja Kesari Yogas) and details their developmental influence.
    -   *Doshas*: Computes Kuja (Manglik) Dosha, Kaal Sarp configurations, and Saturn's active Sade Sati stages.
-   **Ashtakoota Milan (Marriage Match)**: A complete 36-Guna compatibility calculator based on natal Moon placements, analyzing the 8 traditional dimensions (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi).
-   **Daily Muhurta**: Pinpoints auspicious and inauspicious daily hours (Choghadiya) including Abhijit and Brahma Muhurtas based on solar times.
-   **JHora AI Chat**: An immersive, state-aware conversational consultant. Combines calculated Parashari metrics with Gemini to answer specific questions regarding career, health, relationships, and traditional remedies.

## Technology Stack

-   **Frontend**: React 18, Vite, Tailwind CSS, Motion (Framer Motion) for fluid UI transitions, Lucide React icons.
-   **Backend**: Node.js, Express, TypeScript, tsx.
-   **AI Engine**: `@google/genai` TypeScript SDK (utilizing `gemini-3.5-flash`).

## Folder Structure

```text
temp_repo/
  src/
    components/      # UI components (Charts, Dashas, Compatibility, Chat)
    lib/             # Jyotish calculation logic and algorithms (astrology.ts)
    App.tsx          # Main application wrapper and state manager
    main.tsx         # Frontend entry point
    index.css        # Global CSS with Tailwind v4 imports
  server.ts          # Express full-stack server and Gemini proxy endpoints
  index.html         # SPA index HTML template
  vite.config.ts     # Vite compilation rules
  tsconfig.json      # TypeScript specifications
  package.json       # Dependencies & launch scripts
  .env.example       # Schema for environment secrets
  .gitignore         # Version control ignore definitions
```

## Running the Application Locally

### Prerequisites
-   Node.js (v18+)
-   npm

### Installation
1.  Navigate to the repository:
    ```bash
    cd JHoraAI
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment secrets:
    Create a `.env` file in the root directory and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### Running in Development Mode
To start both the backend server and the frontend with hot-reload:
```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

### Building for Production
To build the frontend SPA assets and bundle the backend TypeScript server into optimized production files:
```bash
npm run build
```
The compiled output is saved under the `dist/` folder.

### Starting the Production Server
```bash
npm start
```

## License
License TBD.
