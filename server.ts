/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { KpService } from "./src/lib/kp/KpService";
import { WesternService } from "./src/lib/western/WesternService";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
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

// Helper to send real-time personalized astrology report via Email using Nodemailer
async function triggerAstrologyEmail(profile: any) {
  const email = profile.email;
  if (!email) {
    console.log("No email in profile, skipping email trigger.");
    return;
  }

  console.log(`Scheduling astrology report generation for user: ${profile.name} (${email})`);

  // Run asynchronously after 5 seconds to avoid blocking response
  setTimeout(async () => {
    try {
      let analysisText = "";
      try {
        const ai = getGeminiClient();
        const prompt = `
          You are a master Vedic and KP Astrologer. Generate a highly detailed, personalized, and visually beautiful Vedic Astrology Analysis and Reading Report for:
          Name: ${profile.name}
          Email: ${profile.email}
          Phone: ${profile.phoneNumber || "Not provided"}
          Theme: Premium JHoraAI Vedic and KP Astrology Engine

          Include:
          1. A warm, mystical greeting.
          2. An analysis of their general personality based on their cosmic alignment.
          3. Practical predictions for their Career, Relationships, and Spiritual Growth.
          4. Remedial measures (Upayas) such as mantras or gemstone suggestions.
          5. A welcoming invitation to return to JHoraAI for deeper Kundli calculations.

          Format the output as clean, professional, and readable HTML inside a gorgeous modern email template. Keep it elegant, using professional typography spacing.
        `;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        analysisText = response.text || "Cosmic energies are aligning. Check your profile dashboard for complete KP stellar and Western synastry calculations.";
      } catch (aiErr) {
        console.error("Gemini failed to generate email report, using backup:", aiErr);
        analysisText = `
          <h2>Your JHoraAI Astro Reading</h2>
          <p>Welcome to JHoraAI, ${profile.name}!</p>
          <p>Our cosmic analysis engines have synced your profile data securely across Local Machine, Google Drive, and our secure backend database.</p>
          <p>Your current profile email: ${profile.email}</p>
          <p>Your captured phone: ${profile.phoneNumber || "Not provided"}</p>
          <p>We are currently analyzing your planetary positions, stellar nakshatras, house significators, and transits. Stay tuned for real-time astro updates on JHoraAI!</p>
        `;
      }

      // Check if SMTP is configured
      const smtpHost = process.env.SMTP_HOST || "";
      const smtpPort = Number(process.env.SMTP_PORT || "587");
      const smtpUser = process.env.SMTP_USER || "";
      const smtpPass = process.env.SMTP_PASS || "";

      if (smtpHost && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"JHoraAI Cosmic Engine" <${smtpUser}>`,
          to: email,
          subject: `✨ Your Personalized JHoraAI Cosmic Astrology Analysis for ${profile.name}`,
          html: `
            <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px; max-width: 600px; margin: auto; border-radius: 16px; border: 1px solid #312e81;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f59e0b; font-size: 28px; margin: 0; font-family: 'Georgia', serif;">JHoraAI Cosmic Report</h1>
                <p style="color: #94a3b8; font-size: 12px; font-family: monospace;">VEDIC & KP STELLAR PRECISION ENGINE</p>
              </div>
              <div style="line-height: 1.6; font-size: 14px; color: #cbd5e1;">
                ${analysisText}
              </div>
              <div style="text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 11px; color: #64748b;">
                <p>This report was securely generated and transmitted using Google Cloud Platform & AI Studio integrations.</p>
                <p>&copy; 2026 JHoraAI Astro Platform. All cosmic alignments reserved.</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Astrology report email successfully sent to ${email}`);
      } else {
        console.warn("SMTP environment variables are not configured in settings. Email report logged below instead:");
        console.log("------------------ REPORT EMAIL START ------------------");
        console.log(`To: ${email}`);
        console.log(`Subject: ✨ Your Personalized JHoraAI Cosmic Astrology Analysis`);
        console.log(`Body: ${analysisText}`);
        console.log("------------------- REPORT EMAIL END -------------------");
      }
    } catch (err) {
      console.error("Error in scheduled triggerAstrologyEmail execution:", err);
    }
  }, 5000);
}

// Save user profile and trigger reporting endpoint
app.post("/api/user-profile/save", async (req, res) => {
  try {
    const profile = req.body;
    if (!profile || !profile.uid) {
      return res.status(400).json({ error: "Invalid profile data" });
    }

    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const filePath = path.join(dataDir, "user_profiles.json");
    let profiles: Record<string, any> = {};

    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        profiles = JSON.parse(fileContent);
      } catch (err) {
        console.error("Failed to read user_profiles.json, resetting:", err);
      }
    }

    profiles[profile.uid] = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2));
    console.log(`Successfully saved profile ${profile.uid} to backend database.`);

    res.json({ success: true, message: "Profile successfully saved and synced on backend." });
  } catch (error: any) {
    console.error("Backend User Profile Save Error:", error);
    res.status(500).json({ error: error.message || "Failed to save profile on backend." });
  }
});

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
    const body = { ...req.body };
    if (!body.place && body.location) {
      body.place = body.location;
    }
    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
    const body = { ...req.body };
    if (body.boy_birth_details) {
      body.boy_birth_details = { ...body.boy_birth_details };
      if (!body.boy_birth_details.place && body.boy_birth_details.location) {
        body.boy_birth_details.place = body.boy_birth_details.location;
      }
    }
    if (body.girl_birth_details) {
      body.girl_birth_details = { ...body.girl_birth_details };
      if (!body.girl_birth_details.place && body.girl_birth_details.location) {
        body.girl_birth_details.place = body.girl_birth_details.location;
      }
    }
    const response = await fetch(`${JHORA_API_URL}/marriage-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
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
    const body = { ...req.body };
    if (!body.place && body.location) {
      body.place = body.location;
    }
    const response = await fetch(`${JHORA_API_URL}/horoscope`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error: any) {
    console.error("Astrology Calculate API error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate astrology." });
  }
});

// Helper to parse standard query or body parameters
const parseKpParams = (req: any) => {
  const { date, time, latitude, longitude, timezone, place, horaryNumber, question, targetDate } = req.body;
  return {
    date: date || new Date().toISOString().split("T")[0],
    time: time || "12:00:00",
    latitude: Number(latitude ?? 28.6139),
    longitude: Number(longitude ?? 77.2090),
    timezone: Number(timezone ?? 5.5),
    place: place || "Query Location",
    horaryNumber: horaryNumber ? Number(horaryNumber) : undefined,
    question: question || undefined,
    targetDate: targetDate || undefined
  };
};

// KP Health Check Route
app.get("/api/kp/health", async (req, res) => {
  try {
    const kpService = KpService.getInstance();
    const isHealthy = await kpService.getRepository().healthCheck();
    res.json({
      status: isHealthy ? "available" : "unavailable",
      provider: kpService.getActiveProviderName()
    });
  } catch (error: any) {
    res.json({ status: "unavailable", error: error.message });
  }
});

// Proxy routes to configured KP provider
app.post("/api/kp/chart", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getChart(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Chart error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP chart." });
  }
});

app.post("/api/kp/cusps", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getCusps(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Cusps error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP cusps." });
  }
});

app.post("/api/kp/starlords", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getStarLords(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Starlords error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP starlords." });
  }
});

app.post("/api/kp/sublords", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getSubLords(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Sublords error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP sublords." });
  }
});

app.post("/api/kp/significators", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const pSig = await kpService.getRepository().getPlanetSignificators(params);
    const hSig = await kpService.getRepository().getHouseSignificators(params);
    res.json({
      planetSignificators: pSig.significators,
      houseSignificators: hSig.significators
    });
  } catch (error: any) {
    console.error("KP Significators error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP significators." });
  }
});

app.post("/api/kp/dasha", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getDashas(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Dasha error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP dasha." });
  }
});

app.post("/api/kp/transit", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getTransit(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Transit error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP transit." });
  }
});

app.post("/api/kp/horary", async (req, res) => {
  try {
    const params = parseKpParams(req);
    const kpService = KpService.getInstance();
    const result = await kpService.getRepository().getHorary(params);
    res.json(result);
  } catch (error: any) {
    console.error("KP Horary error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate KP horary." });
  }
});

// Helper to parse standard Western Astrology parameters
const parseWesternParams = (req: any) => {
  const { date, time, latitude, longitude, timezone, place, partnerDate, partnerTime, partnerLatitude, partnerLongitude, partnerTimezone, partnerPlace, targetDate } = req.body;
  return {
    date: date || new Date().toISOString().split("T")[0],
    time: time || "12:00:00",
    latitude: Number(latitude ?? 28.6139),
    longitude: Number(longitude ?? 77.2090),
    timezone: Number(timezone ?? 5.5),
    place: place || "Query Location",
    partnerDate: partnerDate || undefined,
    partnerTime: partnerTime || undefined,
    partnerLatitude: partnerLatitude ? Number(partnerLatitude) : undefined,
    partnerLongitude: partnerLongitude ? Number(partnerLongitude) : undefined,
    partnerTimezone: partnerTimezone ? Number(partnerTimezone) : undefined,
    partnerPlace: partnerPlace || undefined,
    targetDate: targetDate || undefined
  };
};

// Western Astrology Health Check
app.get("/api/western/health", async (req, res) => {
  try {
    const westernService = WesternService.getInstance();
    const isHealthy = await westernService.getRepository().healthCheck();
    res.json({
      status: isHealthy ? "available" : "unavailable",
      provider: westernService.getActiveProviderName()
    });
  } catch (error: any) {
    res.json({ status: "unavailable", error: error.message });
  }
});

// Western Astrology endpoints proxying to registered provider
app.post("/api/western/chart", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getChart(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Chart error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western chart." });
  }
});

app.post("/api/western/synastry", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getSynastry(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Synastry error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western synastry." });
  }
});

app.post("/api/western/solar-return", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getSolarReturn(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Solar Return error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western Solar Return." });
  }
});

app.post("/api/western/transits", async (req, res) => {
  try {
    const params = parseWesternParams(req);
    const service = WesternService.getInstance();
    const result = await service.getRepository().getTransits(params);
    res.json(result);
  } catch (error: any) {
    console.error("Western Transits error:", error);
    res.status(500).json({ error: error.message || "Failed to calculate Western transits." });
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
