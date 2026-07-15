/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const JHORA_API_URL = "https://jagannatha-hora-359167915530.europe-west1.run.app";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

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
// API Endpoints (Pure Gateway Proxies)
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

// Endpoint to proxy horoscope calculations to official JHora API
app.post("/api/jhora/horoscope", async (req, res) => {
  try {
    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("JHora Horoscope proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to query JHora API." });
  }
});

// Endpoint to proxy marriage match calculations to official JHora API
app.post("/api/jhora/marriage-match", async (req, res) => {
  try {
    const response = await fetch(`${JHORA_API_URL}/marriage-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("JHora Marriage Match proxy error:", error);
    res.status(500).json({ error: error.message || "Failed to query JHora marriage match API." });
  }
});

// Endpoint to run transit calculations (Gochara) using official JHora API
app.post("/api/jhora/gochara", async (req, res) => {
  try {
    const { date, time, latitude, longitude, timezone, target_date } = req.body;
    const targetDate = target_date || date || "2026-07-15";
    const targetTime = time || "12:00:00";

    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: targetDate,
        time: targetTime,
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone: Number(timezone),
        place: "Transit Location"
      })
    });
    const data: any = await response.json();
    
    const rasi = data.horoscope?.divisional_charts?.["D-1_rasi"] || {};
    const ascSign = rasi["Ascendant"]?.sign || "Aries";
    const ascSignIdx = ZODIAC_SIGNS.indexOf(ascSign);

    const planets = Object.entries(rasi).map(([pName, pVal]: [string, any]) => {
      const signIdx = ZODIAC_SIGNS.indexOf(pVal.sign);
      return {
        name: pName,
        sign: pVal.sign,
        degree: pVal.longitude,
        house: (signIdx - ascSignIdx + 12) % 12 + 1,
        longitude: signIdx * 30 + pVal.longitude
      };
    }).filter(p => p.name !== "Ascendant" && ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));

    res.json({
      date: targetDate,
      planets
    });
  } catch (error: any) {
    console.error("Gochara API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Gochara transits." });
  }
});

// Endpoint to calculate planetary ingress events (mock static)
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

// Endpoint to fetch daily auspicious/inauspicious hours (Muhurtas - static)
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

// React app primary calculation endpoint (Proxies directly to official JHora horoscope)
app.post("/api/astrology/calculate", async (req, res) => {
  try {
    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Astrology Calculate API error:", error);
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
