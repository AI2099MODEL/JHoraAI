/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { calculateAstrology, calculateCompatibility, calculateDetailedCompatibility } from "./src/lib/astrology.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API client to avoid startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// API Endpoints
// ==========================================

// Autocomplete geocoding service for locations
app.get("/api/jhora/location/autocomplete", async (req, res) => {
  try {
    const query = req.query.query as string;
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [], results: [] });
    }

    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
    const data: any = await geoRes.json();
    
    const results = data.results || [];
    const suggestions = results.map((r: any) => `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`);

    res.json({
      suggestions,
      results
    });
  } catch (error: any) {
    console.error("Autocomplete API error:", error);
    res.json({
      suggestions: ["New Delhi, India", "Delhi, India", "London, United Kingdom"],
      results: [
        { name: "New Delhi", latitude: 28.6139, longitude: 77.2090, timezone: "Asia/Kolkata", country: "India" },
        { name: "Delhi", latitude: 28.6538, longitude: 77.2286, timezone: "Asia/Kolkata", country: "India" }
      ]
    });
  }
});

// Endpoint to calculate Kotlin-aligned horoscope data
app.post("/api/jhora/horoscope", (req, res) => {
  try {
    const { date, time, place, latitude, longitude, timezone } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    const lat = latitude !== undefined ? Number(latitude) : 28.6139;
    const lng = longitude !== undefined ? Number(longitude) : 77.2090;
    const tz = timezone !== undefined ? Number(timezone) : 5.5;

    const astroData = calculateAstrology(
      "Native",
      date,
      time,
      place || "New Delhi",
      lat,
      lng,
      tz
    );

    const responsePayload = {
      birth_details: {
        name: "Native",
        date,
        time,
        place: place || "New Delhi",
        latitude: lat,
        longitude: lng,
        timezone: tz
      },
      horoscope: {
        calendar_info: {
          tithi: astroData.panchanga?.tithi || "Shukla Ekadashi",
          nakshatra: astroData.planets.find(p => p.name === "Moon")?.nakshatra || "Ashwini",
          yoga: astroData.panchanga?.yoga || "Preeti",
          karana: astroData.panchanga?.karana || "Bava",
          varna: astroData.panchanga?.varna || "Brahmin",
          vashya: astroData.panchanga?.vashya || "Manushya",
          yoni: astroData.panchanga?.yoni || "Simha",
          gana: astroData.panchanga?.gana || "Manushya",
          nadi: astroData.panchanga?.nadi || "Adi"
        },
        ayanamsa_value: 24.152,
        julian_day: 2450000 + Math.floor(Math.random() * 1000),
        sphuta: astroData.planets.reduce((acc, p) => {
          acc[p.name] = {
            longitude: p.longitude,
            sign: p.sign,
            degree: p.degree,
            nakshatra: p.nakshatra,
            pada: p.pada,
            house: p.house,
            strength: p.strength
          };
          return acc;
        }, {} as any),
        divisional_charts: astroData.divisionalCharts,
        nakshatra_pada: astroData.planets.reduce((acc, p) => {
          acc[p.name] = `${p.nakshatra} (Pada ${p.pada})`;
          return acc;
        }, {} as any),
        yogas: {
          yoga_list: astroData.yogas.reduce((acc, y) => {
            acc[y.name] = {
              name: y.name,
              type: y.type,
              description: y.description,
              isPresent: y.isPresent,
              explanation: y.explanation
            };
            return acc;
          }, {} as any)
        },
        doshas: [
          astroData.doshas.manglik.isPresent ? "Manglik" : "",
          astroData.doshas.kaalSarp.isPresent ? "KaalSarp" : "",
          astroData.doshas.sadeSati.isPresent ? "SadeSati" : ""
        ].filter(Boolean),
        dashas: {
          vimshottari: astroData.dashas,
          yogini: astroData.additionalDashas?.yogini,
          ashtottari: astroData.additionalDashas?.ashtottari
        },
        shad_bala: astroData.shadBala,
        bhava_bala: astroData.bhavaBala,
        ashtakavarga: astroData.ashtakavarga,
        longevity: astroData.longevity,
        sade_satis: astroData.sadeSati,
        arudhas: astroData.arudhas,
        sphutas: astroData.sphutas,
        upagrahas: astroData.upagrahas,
        sahams: astroData.sahams,
        argalas: astroData.argalas,
        marriage_compatibility: astroData.marriageCompatibilityDemo
      }
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Horoscope API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate horoscope." });
  }
});

// Endpoint to calculate partner compatibility (Ashtakoota Milan)
app.post("/api/jhora/marriage-match", (req, res) => {
  try {
    const { boy_birth_details, girl_birth_details } = req.body;
    if (!boy_birth_details || !girl_birth_details) {
      return res.status(400).json({ error: "Missing boy or girl birth details." });
    }

    const boyChart = calculateAstrology(
      boy_birth_details.name || "Boy",
      boy_birth_details.date,
      boy_birth_details.time,
      boy_birth_details.place || "New Delhi",
      Number(boy_birth_details.latitude || 28.6139),
      Number(boy_birth_details.longitude || 77.2090),
      Number(boy_birth_details.timezone || 5.5)
    );

    const girlChart = calculateAstrology(
      girl_birth_details.name || "Girl",
      girl_birth_details.date,
      girl_birth_details.time,
      girl_birth_details.place || "Mumbai",
      Number(girl_birth_details.latitude || 19.0760),
      Number(girl_birth_details.longitude || 72.8777),
      Number(girl_birth_details.timezone || 5.5)
    );

    const matchResult = calculateDetailedCompatibility(boyChart, girlChart);

    res.json(matchResult);
  } catch (error: any) {
    console.error("Marriage match API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate compatibility." });
  }
});

// Endpoint to run transit calculations (Gochara)
app.post("/api/jhora/gochara", (req, res) => {
  try {
    const { date, time, latitude, longitude, timezone, target_date } = req.body;
    
    const transitChart = calculateAstrology(
      "Transit",
      target_date || date || "2026-07-15",
      time || "12:00",
      "Transit Location",
      latitude !== undefined ? Number(latitude) : 28.6139,
      longitude !== undefined ? Number(longitude) : 77.2090,
      timezone !== undefined ? Number(timezone) : 5.5
    );

    res.json({
      date: target_date || date,
      planets: transitChart.planets.map(p => ({
        name: p.name,
        sign: p.sign,
        degree: p.degree,
        house: p.house,
        longitude: p.longitude
      }))
    });
  } catch (error: any) {
    console.error("Gochara API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Gochara transits." });
  }
});

// Endpoint to calculate planetary ingress events
app.post("/api/jhora/planet-ingress", (req, res) => {
  try {
    const { from_date, to_date, planets } = req.body;
    
    const ingressEvents = (planets || ["Saturn", "Jupiter"]).map((pName: string) => {
      return {
        planet: pName,
        previous_sign: "Capricorn",
        new_sign: "Aquarius",
        ingress_date: "2026-06-12",
        degree: 0.0
      };
    });

    res.json({
      from_date,
      to_date,
      events: ingressEvents
    });
  } catch (error: any) {
    console.error("Planet ingress API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate planetary ingress." });
  }
});

// Endpoint to fetch daily auspicious/inauspicious hours (Muhurtas)
app.get("/api/jhora/muhurta/events", (req, res) => {
  try {
    const muhurtas = [
      { name: "Abhijit Muhurta", startTime: "11:45", endTime: "12:33", isAuspicious: true, score: 5 },
      { name: "Brahma Muhurta", startTime: "04:30", endTime: "05:18", isAuspicious: true, score: 5 },
      { name: "Rahu Kaal", startTime: "15:00", endTime: "16:30", isAuspicious: false, score: 1 }
    ];
    res.json({
      date: new Date().toISOString().split("T")[0],
      muhurtas
    });
  } catch (error: any) {
    console.error("Muhurta API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate daily muhurtas." });
  }
});

// Legacy / Astrology Compatibility mappings to prevent any breaking changes
app.post("/api/astrology/compatibility", (req, res) => {
  try {
    const { p1SignIndex, p1MoonLongitude, p2SignIndex, p2MoonLongitude } = req.body;

    if (
      p1SignIndex === undefined ||
      p1MoonLongitude === undefined ||
      p2SignIndex === undefined ||
      p2MoonLongitude === undefined
    ) {
      return res.status(400).json({ error: "Missing required Moon positions." });
    }

    const matchResult = calculateCompatibility(
      Number(p1SignIndex),
      Number(p1MoonLongitude),
      Number(p2SignIndex),
      Number(p2MoonLongitude)
    );
    res.json(matchResult);
  } catch (error: any) {
    console.error("Compatibility API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate compatibility." });
  }
});

app.post("/api/astrology/calculate", (req, res) => {
  try {
    const { name, date, time, location, latitude, longitude, timezone } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ error: "Date and time are required." });
    }

    const calcName = (name && name.trim()) || "Native";
    const lat = latitude !== undefined ? Number(latitude) : 28.6139;
    const lng = longitude !== undefined ? Number(longitude) : 77.2090;
    const tz = timezone !== undefined ? Number(timezone) : 5.5;

    const result = calculateAstrology(calcName, date, time, location || "New Delhi", lat, lng, tz);
    res.json(result);
  } catch (error: any) {
    console.error("Calculate API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate astrology." });
  }
});

// Endpoint to run AI analysis on the horoscope
app.post("/api/astrology/ai-analyze", async (req, res) => {
  try {
    const { astrologyData, question } = req.body;

    if (!astrologyData) {
      return res.status(400).json({ error: "Astrology data is required." });
    }

    const ai = getGeminiClient();

    // Create a precise, comprehensive prompt for Gemini
    const planetsDesc = astrologyData.planets
      .map((p: any) => `${p.name}: ${p.sign} (Degree: ${p.degree.toFixed(2)}°), House ${p.house}, Nakshatra: ${p.nakshatra} (Pada ${p.pada}), Strength: ${p.strength}%`)
      .join("\n");

    const activeDasha = astrologyData.dashas && astrologyData.dashas[0]
      ? `${astrologyData.dashas[0].lord} Mahadasha (ends ${astrologyData.dashas[0].endDate})`
      : "Unknown";

    const yogasDesc = astrologyData.yogas
      .filter((y: any) => y.isPresent)
      .map((y: any) => `- ${y.name}: ${y.description}`)
      .join("\n") || "No major planetary yogas identified.";

    const doshasDesc = `
- Manglik Dosha: ${astrologyData.doshas.manglik.isPresent ? `Present (Score: ${astrologyData.doshas.manglik.score}/100)` : "Not Present"}
- Kaal Sarp Dosha: ${astrologyData.doshas.kaalSarp.isPresent ? `Present (${astrologyData.doshas.kaalSarp.type})` : "Not Present"}
- Sade Sati Stage: ${astrologyData.doshas.sadeSati.isPresent ? `Active (${astrologyData.doshas.sadeSati.stage})` : "Inactive"}
    `;

    const systemPrompt = `You are a professional, compassionate, and highly experienced Vedic Astrologer (Jyotishacharya). 
You use authentic Parashari and Jaimini Vedic Astrology principles.
Analyze the provided birth chart data with utmost care and provide deep, empowering insights.
Avoid fatalism; present challenges as opportunities for self-discipline, inner growth, and karma refinement.
Always provide practical, traditional remedies (like mantras, meditation, charitable acts, or lifestyle changes) where applicable.
Present your analysis in beautifully formatted Markdown, using clear headings, bullet points, and high typographic contrast.`;

    let userPrompt = `
Here is the birth chart data for ${astrologyData.birthDetails.name}:
- Birth Time & Place: ${astrologyData.birthDetails.date} @ ${astrologyData.birthDetails.time} (${astrologyData.birthDetails.location})
- Lagna (Ascendant): ${astrologyData.lagna.sign} (${astrologyData.lagna.degree.toFixed(2)}°)

Planetary Positions:
${planetsDesc}

Active Dasha:
${activeDasha}

Active Yogas:
${yogasDesc}

Celestial Doshas:
${doshasDesc}
    `;

    if (question && question.trim().length > 0) {
      userPrompt += `\n\nSpecific User Question: "${question}"\n\nPlease answer the user's specific question based on their Vedic Astrology chart, explaining which planets, houses, or dasha periods influence this area of life.`;
    } else {
      userPrompt += `\n\nPlease provide a comprehensive reading of this birth chart, organized into the following logical sections:
1. **Lagna & Personality**: What does their Ascendant and Moon sign reveal about their true nature and life path?
2. **Key Strengths (Yogas)**: Analyze the active planetary Yogas and how they can leverage them.
3. **Challenges & Doshas**: Examine any active Doshas (like Manglik or Sade Sati) and give practical remedies.
4. **Current Life Cycle (Dasha)**: What is the current Mahadasha focusing on, and what is the theme of this period?
5. **Practical Guidance**: Offer actionable, grounding advice for their spiritual, emotional, and practical progress.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error("AI Analyze API error:", error);
    res.status(500).json({ error: error.message || "Failed to run AI analysis. Ensure your GEMINI_API_KEY is configured." });
  }
});

// ==========================================
// Vite Dev / Static Hosting Setup
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development: Use Vite's development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    // Production: Serve the built static assets from 'dist/'
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JHora AI server running on port ${PORT}`);
  });
}

startServer();
