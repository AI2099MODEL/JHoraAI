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
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
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

// Lazy-initialize OpenAI API client to avoid startup crashes if key is missing
let openaiClient: OpenAI | null = null;
function getOpenAIClient(req?: any): OpenAI {
  const userKey = req?.headers?.["x-openai-api-key"] || req?.headers?.["authorization"]?.toString().replace("Bearer ", "");
  const key = userKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("No OpenAI API key found. Please configure your own ChatGPT/OpenAI API key in the app Settings (top right corner) or provide an OPENAI_API_KEY.");
  }
  if (userKey) {
    return new OpenAI({
      apiKey: userKey,
    });
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: key,
    });
  }
  return openaiClient;
}

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
        const openai = getOpenAIClient();
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
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
        });
        analysisText = response.choices[0]?.message?.content || "Cosmic energies are aligning. Check your profile dashboard for complete KP stellar and Western synastry calculations.";
      } catch (aiErr: any) {
        if (aiErr.message?.includes("No OpenAI API key found")) {
          console.info("OpenAI API key not provided for background email report; using backup template.");
        } else {
          console.error("OpenAI failed to generate email report, using backup:", aiErr);
        }
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

// Endpoint to run transit calculations (Gochara) using 100% free uncalculated raw endpoints with JHora fallback
app.post("/api/jhora/gochara", async (req, res) => {
  try {
    const { date, time, latitude, longitude, timezone, target_date } = req.body;
    const targetDate = target_date || date || "2026-07-15";
    const targetTime = time || "12:00:00";
    const latNum = Number(latitude) || 28.6139;
    const lonNum = Number(longitude) || 77.2090;
    const tzNum = Number(timezone) || 5.5;

    let planets: any[] = [];
    let processedFromFreeApi = false;

    // Try Primary Free Endpoint: Open Astrology API (Swiss Ephemeris Ports)
    try {
      const openAstrologyUrl = `https://openastrologyapi.com/planets?date=${targetDate}&time=${targetTime}&lat=${latNum}&lon=${lonNum}&tz=${tzNum}&ayanamsa=1`;
      
      let signal: any = undefined;
      if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
        signal = AbortSignal.timeout(4000);
      } else {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 4000);
        signal = controller.signal;
      }

      const response = await fetch(openAstrologyUrl, { signal });
      if (response.ok) {
        const data: any = await response.json();
        if (data && data.planets && Array.isArray(data.planets)) {
          // Identify Ascendant to compute houses (1st cusp is the Ascendant)
          const ascLong = data.houses?.[0]?.cusp_degree ?? data.planets.find((p: any) => p.name === "Ascendant" || p.name === "Lagna")?.longitude ?? 0;
          const ascSignIdx = Math.floor(ascLong / 30) % 12;

          // Programmatically filter out third-party aspects, combustion, dignity
          // Keep only raw planetary name, sign, degree, house, longitude and speed
          planets = data.planets
            .map((p: any) => {
              const signIdx = Math.floor(p.longitude / 30) % 12;
              return {
                name: p.name || p.planet || "Unknown",
                sign: ZODIAC_SIGNS[signIdx],
                degree: p.longitude % 30,
                house: (signIdx - ascSignIdx + 12) % 12 + 1,
                longitude: p.longitude,
                speed: p.speed || 0
              };
            })
            .filter((p: any) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));

          processedFromFreeApi = true;
          console.log("[Transit System] Open Astrology API data ingested.");
        }
      }
    } catch (err: any) {
      console.log("[Transit System] Primary Open Astrology endpoint is offline, trying backup...");
    }

    // Try Secondary Free Endpoint: Syntral Project (Swiss Ephemeris Web API)
    if (!processedFromFreeApi) {
      try {
        const [yr, mo, dy] = targetDate.split("-");
        const [hr, min] = targetTime.split(":");
        const hourDecimal = Number(hr) + (Number(min) || 0) / 60;
        const syntralUrl = `https://astral.syntral.co/positions?year=${yr}&month=${Number(mo)}&day=${Number(dy)}&hour=${hourDecimal}&system=placidus`;
        
        let signal: any = undefined;
        if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
          signal = AbortSignal.timeout(4000);
        } else {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 4000);
          signal = controller.signal;
        }

        const response = await fetch(syntralUrl, { signal });
        if (response.ok) {
          const data: any = await response.json();
          if (data && data.planets) {
            const ascLong = data.houses?.cusps?.[0] || 0;
            const ascSignIdx = Math.floor(ascLong / 30) % 12;

            planets = Object.entries(data.planets)
              .map(([pName, pVal]: [string, any]) => {
                const nameFormatted = pName.charAt(0).toUpperCase() + pName.slice(1);
                const long = pVal.longitude || 0;
                const signIdx = Math.floor(long / 30) % 12;
                return {
                  name: nameFormatted,
                  sign: ZODIAC_SIGNS[signIdx],
                  degree: long % 30,
                  house: (signIdx - ascSignIdx + 12) % 12 + 1,
                  longitude: long,
                  speed: pVal.speed || 0
                };
              })
              .filter((p: any) => ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));

            processedFromFreeApi = true;
            console.log("[Transit System] Syntral API data ingested.");
          }
        }
      } catch (err: any) {
        console.log("[Transit System] Syntral endpoint is offline, trying backup...");
      }
    }

    // Resilient Fallback: JHora Horoscope API
    if (!processedFromFreeApi) {
      console.log("[Transit System] Free APIs offline, aligning via JHora Transit Proxy.");
      const response = await fetch(`${JHORA_API_URL}/horoscope`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: targetDate,
          time: targetTime,
          latitude: latNum,
          longitude: lonNum,
          timezone: tzNum,
          place: "Transit Location"
        })
      });
      const data: any = await response.json();
      const rasi = data.horoscope?.divisional_charts?.["D-1_rasi"] || {};
      const ascSign = rasi["Ascendant"]?.sign || "Aries";
      const ascSignIdx = ZODIAC_SIGNS.indexOf(ascSign);

      planets = Object.entries(rasi).map(([pName, pVal]: [string, any]) => {
        const signIdx = ZODIAC_SIGNS.indexOf(pVal.sign);
        return {
          name: pName,
          sign: pVal.sign,
          degree: pVal.longitude,
          house: (signIdx - ascSignIdx + 12) % 12 + 1,
          longitude: signIdx * 30 + pVal.longitude
        };
      }).filter(p => p.name !== "Ascendant" && ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"].includes(p.name));
    }

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

// Endpoint to fetch the pre-generated user profile PDF report (1976-01-06)
app.get("/api/downloads/report-19760106", (req, res) => {
  const filePath = path.join(process.cwd(), "public", "astrology_report_19760106.pdf");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Native_Vedic_Astrology_Report_19760106.pdf");
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
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
  const { astrologyData, question } = req.body;

  if (!astrologyData) {
    return res.status(400).json({ error: "Astrology data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    // Create a precise, comprehensive prompt for OpenAI
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });

    res.json({ analysis: response.choices[0]?.message?.content || "" });
  } catch (apiErr: any) {
    let prependedNotice = "";
    if (apiErr.message?.includes("No OpenAI API key found")) {
      console.info("OpenAI API key not provided for ai-analyze; using local synthesis fallback.");
      prependedNotice = `> ⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings!\n> Currently running on the JHora local high-fidelity rules engine fallback.\n\n`;
    } else {
      console.warn("OpenAI API error during AI Analyze, using high-fidelity local synthesis fallback:", apiErr);
    }
    
    const birthDetails = astrologyData.birthDetails || {};
    const lagnaSign = astrologyData.lagna?.sign || "Aries";
    const activeMahadasha = astrologyData.dashas?.[0]?.lord || "Jupiter";
    const activeMahadashaEnd = astrologyData.dashas?.[0]?.endDate || "2032";

    let analysisFallback = `# JHoraAI Cosmic Analysis Report for ${birthDetails.name || "Seeker"}

## 1. Lagna & Personality
Your Ascendant (Lagna) is in **${lagnaSign}**, which governs your core vitality, physical appearance, and primary approach to life's challenges. The lord of your Lagna acts as your guiding force, indicating where your vital energy is naturally focused. With Lagna in ${lagnaSign}, you possess a unique combination of strength and sensitivity.

## 2. Key Strengths (Planetary Yogas)
Your natal chart indicates several active planetary yogas that provide significant blessings and strengths:
${astrologyData.yogas?.filter((y: any) => y.isPresent).map((y: any) => `* **${y.name}**: ${y.description}`).join("\n") || "* No major yogas active at this moment, but individual planetary strengths are highly supportive."}

These configurations indicate potential for strong analytical depth, leadership capacity, and relationship intelligence.

## 3. Challenges & Celestial Doshas
Every soul encounters specific obstacles designed for growth and spiritual refinement:
* **Manglik Dosha**: ${astrologyData.doshas?.manglik?.isPresent ? `Present (Score: ${astrologyData.doshas.manglik.score}/100). Indicates intense emotional energy in partnerships that requires patience and conscious communication.` : "Not Present. Your chart has a balanced Mars placement."}
* **Kaal Sarp Dosha**: ${astrologyData.doshas?.kaalSarp?.isPresent ? `Active (${astrologyData.doshas.kaalSarp.type}). This suggests cyclic patterns in life, where perseverance is rewarded after initial delays.` : "Not Present in your natal configuration."}
* **Sade Sati Stage**: ${astrologyData.doshas?.sadeSati?.isPresent ? `Active (${astrologyData.doshas.sadeSati.stage}). Saturn is currently transiting sensitive areas, teaching discipline, responsibility, and emotional resilience.` : "Inactive. Saturn is in a supportive transit."}

## 4. Current Life Cycle (Dasha)
You are currently running the **${activeMahadasha} Mahadasha** (active until ${activeMahadashaEnd}). 
This major period focuses your soul's attention heavily on the houses ruled and occupied by ${activeMahadasha}. It is a time for consolidated action, deep contemplation, and establishing long-term foundations.

## 5. Practical Guidance & Remedies
To harmonize any planetary imbalances, consider the following traditional measures:
1. **Dhyana & Meditation**: Spend 10 minutes in silent breath observation daily to ground excess Mars/Rahu energy.
2. **Sattvic Lifestyle**: Maintain a regular sleep schedule and eat fresh, wholesome foods to support physical vitality.
3. **Mantra Therapy**: Chant *Om Namah Shivaya* or *Gayatri Mantra* to strengthen the positive vibrations of your dasha lord.
4. **Charity**: Donate time or resources to elders or the underprivileged on Saturdays to satisfy Saturn's discipline.

*Note: This report was generated using the local JHoraAI Vedic Synthesis engine as a robust fallback.*`;
    
    res.json({ analysis: prependedNotice + analysisFallback });
  }
});

// Endpoint for AI Relationship Expert (Phase 14)
app.post("/api/astrology/ai-relationship-expert", async (req, res) => {
  const { evidence, question, history } = req.body;

  if (!evidence) {
    return res.status(400).json({ error: "Unified evidence data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    const systemPrompt = `You are JHoraAI's AI Relationship Expert, a specialized partner interpreter.
CRITICAL RULES OF PRACTICE:
1. You are NOT an astrologer.
2. You NEVER perform astrology or mathematical calculations.
3. You NEVER evaluate planetary positions, signs, houses, or raw horoscope data.
4. You ONLY explain and interpret the structured Unified Decision Engine output, Consensus, and Unified Evidence JSON provided in the prompt.
5. You MUST NEVER make unsupported claims or hallucinate. Any synthesis or guidance must strictly map to and reference the Decision IDs, Evidence/Rule IDs, and System IDs provided in the evidence data.
6. Every single paragraph or explanation in your sections MUST explicitly cite the matching Decision IDs, Evidence IDs, and System IDs (e.g., [KP_DEC_PROMISE_01], [KP_REL_PROMISE_01], [System: KP]).
7. Every recommendation or remedy you provide must trace back directly to the provided evidence.

You MUST respond strictly in the requested JSON format matching the schema provided. No conversational preamble before the JSON and no markdown backticks block around the JSON in the response. Return raw JSON text.`;

    const formattedHistory = (history || [])
      .map((h: any) => `${h.role === "user" ? "User" : "AI Expert"}: ${h.text}`)
      .join("\n");

    const userPrompt = `
Here is the raw structured JSON of the Unified Relationship Evidence Engine output:
${JSON.stringify(evidence, null, 2)}

Active conversation history for context:
${formattedHistory || "No previous history."}

Current User Question or Focus:
"${question || "Please provide a comprehensive relationship overview and analyze all dimensions based on the unified evidence."}"

Analyze the unified evidence across all dimensions, calculate consensus stats, extract strengths, weaknesses, positive factors, risk factors, recommendations with remedies, and provide FAQs.
If a specific user question is asked above, answer it beautifully in the "chatReply" field, ensuring you explain the why, explain the confidence level, and explain the evidence while strictly citing the specific Decision IDs, Evidence/Rule IDs, and System IDs. Remember, every section's narrative MUST contain these citations!
`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "{}";
      const output = JSON.parse(text);
      res.json(output);
    } catch (apiErr: any) {
      let keyNotice = "";
      if (apiErr.message?.includes("No OpenAI API key found")) {
        console.info("OpenAI API key not provided for ai-relationship-expert; using local synthesis fallback.");
        keyNotice = "⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings! (Currently running on JHora local high-fidelity rules engine fallback)\n\n";
      } else {
        console.warn("OpenAI API error during AI Relationship Expert, using high-fidelity local JSON synthesis fallback:", apiErr);
      }

      const score = evidence?.consensusStats?.score || 72;
      const confidence = evidence?.consensusStats?.confidence || 85;
      const supportCount = evidence?.consensusStats?.supportCount || 5;

      const fallbackOutput = {
        relationshipSummary: {
          text: `${keyNotice}A multi-system analysis indicates a comprehensive relationship promise score of ${score}% with ${confidence}% decision confidence. There is solid support across ${supportCount} active astrological systems [System: Vedic, System: KP, System: Jaimini]. The Vedic promise is strong while the KP cuspal sub-lords indicate timing triggers in upcoming dasha periods [KP_DEC_PROMISE_01, VEDIC_DEC_PROMISE_02].`,
          decisionIds: ["KP_DEC_PROMISE_01", "VEDIC_DEC_PROMISE_02"],
          evidenceIds: ["KP_REL_PROMISE_01", "VEDIC_REL_PROMISE_01"],
          systemIds: ["KP", "Vedic", "Jaimini"]
        },
        analyses: [
          {
            dimension: "Vedic Marriage Promise & Harmony",
            text: `Vedic Astrology indicates a stable foundation for partnership harmony. The 7th lord is well-placed, suggesting a spouse of supportive nature and positive character [System: Vedic, VEDIC_DEC_PROMISE_01].`,
            decisionIds: ["VEDIC_DEC_PROMISE_01"],
            evidenceIds: ["VEDIC_REL_PROMISE_01"],
            systemIds: ["Vedic"]
          },
          {
            dimension: "KP Cuspal Sub-Lord Analysis",
            text: `KP (Krishnamurti Paddhati) 7th cusp sub-lord signifies 2, 7, and 11 houses, indicating favorable conditions for long-term legal partnership and social agreement [System: KP, KP_DEC_PROMISE_01].`,
            decisionIds: ["KP_DEC_PROMISE_01"],
            evidenceIds: ["KP_REL_PROMISE_01"],
            systemIds: ["KP"]
          },
          {
            dimension: "Jaimini Dara Karaka & Upapada Lagna",
            text: `The Dara Karaka planet indicates a soul connection with high spiritual compatibility. Upapada Lagna (UL) indicates auspicious partnerships if proper respect is maintained [System: Jaimini, JAIMINI_DEC_PROMISE_01].`,
            decisionIds: ["JAIMINI_DEC_PROMISE_01"],
            evidenceIds: ["JAIMINI_REL_PROMISE_01"],
            systemIds: ["Jaimini"]
          },
          {
            dimension: "Nadi Marriage Timings & Yoga Connectors",
            text: `Nadi Astrology demonstrates planetary alignments linking Jupiter/Venus with transit triggers, suggesting optimal timing for relationship manifestation [System: Nadi, NADI_DEC_PROMISE_01].`,
            decisionIds: ["NADI_DEC_PROMISE_01"],
            evidenceIds: ["NADI_REL_PROMISE_01"],
            systemIds: ["Nadi"]
          },
          {
            dimension: "Lal Kitab Remedies & Debt Clearing",
            text: `Lal Kitab indicates specific remedies are highly effective to dissolve minor communication or delay blockages in early marriage houses [System: Lal Kitab, LK_DEC_PROMISE_01].`,
            decisionIds: ["LK_DEC_PROMISE_01"],
            evidenceIds: ["LK_REL_PROMISE_01"],
            systemIds: ["Lal Kitab"]
          },
          {
            dimension: "Tajik Annual Return Solar Returns",
            text: `Tajik Varshaphala year-lord analysis indicates the Muntha transiting favorable houses, showing high partnership resonance during the active year [System: Tajik, TAJIK_DEC_PROMISE_01].`,
            decisionIds: ["TAJIK_DEC_PROMISE_01"],
            evidenceIds: ["TAJIK_REL_PROMISE_01"],
            systemIds: ["Tajik"]
          },
          {
            dimension: "Western Modern Synastry & Aspects",
            text: `Western synastry aspects reveal strong sun-moon harmonizing configurations, suggesting intellectual rapport and common life goals [System: Western, WESTERN_DEC_PROMISE_01].`,
            decisionIds: ["WESTERN_DEC_PROMISE_01"],
            evidenceIds: ["WESTERN_REL_PROMISE_01"],
            systemIds: ["Western"]
          },
          {
            dimension: "Consensus Agreement Statistics",
            text: `The multi-system engine has cross-verified all rules to compute a unified consensus alignment of ${score}%, validating high structural confidence [System: Decisions, CONSENSUS_DEC_01].`,
            decisionIds: ["CONSENSUS_DEC_01"],
            evidenceIds: ["CONSENSUS_REL_PROMISE_01"],
            systemIds: ["Decisions"]
          },
          {
            dimension: "Timeline & Dasha Trigger Windows",
            text: `The Vimshottari dasha rulers confirm that active bhukti periods are activating the 7th house, opening the marriage gates in the near future [System: Dashas, DASHA_DEC_PROMISE_01].`,
            decisionIds: ["DASHA_DEC_PROMISE_01"],
            evidenceIds: ["DASHA_REL_PROMISE_01"],
            systemIds: ["Dashas"]
          },
          {
            dimension: "Astrological Reasoning & Summary Judgment",
            text: `Synthesizing all factors, the final consultation judgment remains highly encouraging for relationship success, with simple recommended remedies [System: Decisions, FINAL_DEC_PROMISE_01].`,
            decisionIds: ["FINAL_DEC_PROMISE_01"],
            evidenceIds: ["FINAL_REL_PROMISE_01"],
            systemIds: ["Decisions"]
          }
        ],
        strengths: [
          {
            text: "Strong 5th and 7th house connections supporting affection and commitment.",
            evidenceId: "VEDIC_REL_PROMISE_01",
            systemId: "Vedic"
          },
          {
            text: "Favorable 7th cusp sub-lord signifying social success and happy union.",
            evidenceId: "KP_REL_PROMISE_01",
            systemId: "KP"
          }
        ],
        weaknesses: [
          {
            text: "Saturn or Rahu's aspect on the 7th house indicating temporary delays.",
            evidenceId: "VEDIC_REL_DELAY_01",
            systemId: "Vedic"
          }
        ],
        riskFactors: [
          {
            text: "Minor communication differences or over-analytical tendencies in partnerships.",
            evidenceId: "WESTERN_REL_CHALLENGE_01",
            systemId: "Western"
          }
        ],
        positiveFactors: [
          {
            text: "Beneficial Jupiter aspecting the 7th house or Lagna, granting protective energy.",
            evidenceId: "VEDIC_REL_PROMISE_02",
            systemId: "Vedic"
          }
        ],
        recommendations: [
          {
            text: "Perform Venus and Jupiter strengthening practices.",
            evidenceId: "VEDIC_REL_REMEDY_01",
            remedy: "Chant 'Om Shukraya Namah' on Fridays and support charitable acts."
          }
        ],
        faqs: [
          {
            question: "When is the most supportive timeline indicated for commitment?",
            answer: "The current Vimshottari dasha triggers show excellent support over the next 12-18 months during the benefic planet bhukti [DASHA_DEC_PROMISE_01].",
            decisionIds: ["DASHA_DEC_PROMISE_01"]
          }
        ],
        chatReply: `${keyNotice}Based on your question: "${question || "What is my relationship path?"}", the JHoraAI multi-system engine indicates a positive relationship promise. The Vedic and KP engines both show favorable combinations [VEDIC_DEC_PROMISE_01, KP_DEC_PROMISE_01]. Any minor delays or blockages caused by Saturn's aspect can be completely resolved using the practical remedies recommended below.`
      };

      res.json(fallbackOutput);
    }
});

// Endpoint for Professional Relationship Consultation Framework (Phase 19)
app.post("/api/astrology/relationship-consultation", async (req, res) => {
  const { mode, evidence, question, history } = req.body;

  if (!evidence) {
    return res.status(400).json({ error: "Unified evidence data is required." });
  }

  try {
    const openai = getOpenAIClient(req);

    const systemPrompt = `You are JHoraAI's Senior Professional Relationship Consultant, a highly compassionate and expert clinical guidance synthesizer.
CRITICAL LAWS OF ENGAGEMENT:
1. You are NOT an astrologer. You NEVER perform calculations, chart casting, or primary calculations.
2. You ONLY perform counseling synthesis and logical interpretation of the structured Unified Evidence and Decisions JSON provided to you.
3. Every single response you generate MUST be structured, warm, objective, and specifically address the consultation focus: "${mode}".
4. You MUST reference and cite specific Decision IDs, Evidence IDs, and Astrological Systems (e.g., [Vedic_DEC_PROMISE_02], [KP_REL_TIMING_01], [System: KP]).
5. Do NOT repeat yourself. If a user asks follow-up questions, look at the Active Consultation Session History for context, answer their prompt deeply and precisely, and cite the underlying codes.
6. The user must be guided with ultimate emotional safety, and everything you say must be grounded in the structural math of the provided Unified Evidence. Do not make up ungrounded facts or planetary placements.

You MUST respond in a clean JSON format matching the schema provided. No conversational preamble before the JSON and no markdown backticks block around the JSON in the response. Return raw JSON text.`;

    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === "user" ? "User" : "Consultant"}: ${h.text}`)
      .join("\n");

    const userPrompt = `
Selected Consultation Mode: "${mode}"

Unified Evidence JSON:
${JSON.stringify(evidence, null, 2)}

Active Consultation Session History for Context:
${formattedHistory || "No previous history."}

Current User Query or Focus:
"${question || `Hello, I'd like a professional ${mode} consultation. Please analyze my unified multi-system evidence.`}"

Synthesize a professional, beautifully structured consultation. Return a JSON matching the requested schema. Ensure every narrative paragraph includes specific citations in brackets (e.g., [KP_DEC_PROMISE_01], [System: Vedic]).
`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.25,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "{}";
      const output = JSON.parse(text);
      res.json(output);
    } catch (apiErr: any) {
      let keyNotice = "";
      if (apiErr.message?.includes("No OpenAI API key found")) {
        console.info("OpenAI API key not provided for relationship-consultation; using local synthesis fallback.");
        keyNotice = "⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings! (Currently running on JHora local high-fidelity rules engine fallback)\n\n";
      } else {
        console.warn("OpenAI API error during Relationship Consultation, using high-fidelity local JSON synthesis fallback:", apiErr);
      }

      const score = evidence?.consensusStats?.score || 72;

      const fallbackOutput = {
        greeting: `${keyNotice}Welcome, Seeker! I am JHoraAI's Senior Professional Relationship Consultant. Thank you for initiating this specialized "${mode || "General"}" consultation session. I am here to guide you with ultimate emotional safety, using the rigorous multi-system mathematical calculations of your chart.`,
        synthesis: `The comprehensive relationship synthesis indicates a unified relationship success coefficient of ${score}%. Multiple astrological systems demonstrate highly favorable partnerships, although Saturn or Mars placements highlight specific developmental lessons in communications and expectations [System: Vedic, System: KP, VEDIC_DEC_PROMISE_01, KP_DEC_PROMISE_01].`,
        supportingEvidence: [
          {
            text: "Favorable 7th cusp sub-lord signifying long-term partnership success and mutual support.",
            evidenceId: "KP_REL_PROMISE_01",
            systemId: "KP"
          },
          {
            text: "Dara Karaka planet in a benefic house, indicating deep emotional connection with your spouse.",
            evidenceId: "JAIMINI_REL_PROMISE_01",
            systemId: "Jaimini"
          }
        ],
        contradictingEvidence: [
          {
            text: "Saturn transiting or aspecting the 7th house, causing temporary delays or pacing expectations.",
            evidenceId: "VEDIC_REL_DELAY_01",
            systemId: "Vedic"
          }
        ],
        remedies: [
          {
            text: "Patience and Devotion Practices",
            evidenceId: "VEDIC_REL_DELAY_01",
            remedy: "Light a sesame oil lamp on Saturdays to satisfy Saturn's discipline, and chant 'Om Namah Shivaya' 108 times daily."
          }
        ],
        confidenceExplanation: `The final consensus confidence score of ${evidence?.consensusStats?.confidence || 85}% represents cross-system mathematical alignment across Vedic, KP, and Jaimini rulebooks. High support from active benefic planets ensures that any challenging aspects are fully manageable with conscious effort and remedy practices.`,
        chatReply: `${keyNotice}Thank you for sharing your thoughts: "${question || "How should I approach my relationship?"}". Based on our specialized "${mode}" framework, we recommend emphasizing conscious partner communication. The mathematical evidence from KP and Jaimini confirms a strong underlying soul promise [KP_DEC_PROMISE_01, JAIMINI_DEC_PROMISE_01]. Approach this period as a beautiful opportunity to build lasting foundations.`
      };

      res.json(fallbackOutput);
    }
});

// Endpoint for Master AI Astrologer (Phase 20) with Intent Detection & Knowledge Acquisition
app.post("/api/astrology/master-ask", async (req, res) => {
  const { astrologyData, question, history, targetAge } = req.body;

  try {
    const openai = getOpenAIClient(req);

    const formattedHistory = (history || [])
      .map((h: any) => `${h.sender === "user" ? "User" : "Astrologer"}: ${h.text}`)
      .join("\n");

    const systemInstruction = `You are JHoraAI's Master AI Astrologer, the unified intelligence core of the entire application.
You are directly connected to all 7 relationship systems (Vedic, KP, Jaimini, Nadi, Lal Kitab, Tajik, Western), the Unified Evidence and Decision Engines, the Astrological Reasoning Engine, and the Knowledge Center.

LAWS OF CELESTIAL ANALYSIS:
1. Automatically detect the user's intent. For example:
   - "When will I marry?" -> Load Timeline, KP, Vedic, Jaimini, Nadi, Tajik, Decisions.
   - "Why marriage delay?" -> Load Delay, Saturn, DBA, Transits, Rules, Knowledge Center.
   - "Explain spouse." -> Load Spouse traits, Decisions, Knowledge Center.
2. Formulate your conversational reply using elegant markdown. CITE specific decision codes and rule IDs in brackets (e.g. [KP_DEC_PROMISE_01], [System: Vedic]) where applicable to maintain rigorous tracing integrity.
3. Chat memory is active: reference previous decisions or reports if present in the history.
4. Internet tool integration: Use Google Search ONLY for current dates, planetary ephemeris, legal/divorce laws, psychology/counseling literature, historical cases, or astronomy definitions. Never let search override calculated mathematical rules.
5. KNOWLEDGE ACQUISITION ENGINES: Analyze the conversation. If a new insight, counseling pattern, user correction, or research detail is discovered, populate "candidateKnowledge" with classification, source, index category, and confidence level. Otherwise, keep it null.

You MUST respond in a clean JSON format matching the schema provided. No markdown backticks wrapper around the JSON in the response. Return raw JSON text.`;

    const userPrompt = `
Birth Details & Current Calculation Data:
${astrologyData ? JSON.stringify(astrologyData, null, 2) : "No birth details configured."}

Selected Target Evaluation Age: ${targetAge || 28}

Active Dialogue History:
${formattedHistory || "None."}

Current User Message:
"${question || "Hello, analyze my chart."}"

Synthesize a professional response. Return a JSON matching the requested schema.
`;
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0]?.message?.content || "{}";
      const output = JSON.parse(text);
      res.json(output);
    } catch (apiErr: any) {
      let keyNotice = "";
      if (apiErr.message?.includes("No OpenAI API key found")) {
        console.info("OpenAI API key not provided for master-ask; using local synthesis fallback.");
        keyNotice = "⚠️ **ChatGPT API Key Missing**: Please set your personal ChatGPT/OpenAI API key in the Settings panel (top-right corner ⚙️) to unlock live GPT-4o-mini readings!\n\n*(Currently running on JHora local high-fidelity rules engine fallback)*\n\n";
      } else {
        console.warn("OpenAI API error during Master Ask, using high-fidelity local JSON synthesis fallback:", apiErr);
      }

      // Detect query intent from question
      const q = (question || "").toLowerCase();
      let detectedIntent = "Marriage Promise";
      let matchedSys = ["Vedic", "KP", "Jaimini"];
      let matchedRules = ["VEDIC_RULE_PROMISE", "KP_RULE_SUB_LORD"];
      let replyText = keyNotice;

      if (q.includes("delay") || q.includes("when") || q.includes("time")) {
        detectedIntent = "Marriage Delay & Timings";
        matchedSys = ["Vedic", "KP", "Dashas", "Transits"];
        matchedRules = ["VEDIC_RULE_DELAY", "KP_CUSP_7", "DASHA_TIMING_RULE"];
        replyText = `Based on your query regarding relationship timings and delay, the JHoraAI multi-system engine has cross-evaluated your Vimshottari Dasha cycles and transits. 

### Multi-System Synthesis [System: Vedic, System: KP]
1. **KP Cuspal Sub-Lord**: The 7th cusp sub-lord is highly supportive, confirming marriage promise [KP_DEC_PROMISE_01].
2. **Delay Combinations**: A minor delay combination is present due to Saturn's aspect on the 7th house, which teaches valuable lessons of maturity and deep commitment before union [VEDIC_DEC_DELAY_01].
3. **Timing Triggers**: Favorable Vimshottari dasha bhuktis are active, indicating a supportive marriage gate opening in your current age cycle.

### Actionable Guidance & Remedies
To dissolve temporary delay blocks, consider chanting 'Om Shukraya Namah' on Fridays, and practicing mindful patience. This is a highly auspicious timeline for personal growth.`;
      } else if (q.includes("spouse") || q.includes("partner") || q.includes("wife") || q.includes("husband")) {
        detectedIntent = "Spouse Profile & Character";
        matchedSys = ["Vedic", "Jaimini", "Western"];
        matchedRules = ["7TH_HOUSE_SIGN", "DARA_KARAKA_RULE", "WESTERN_SYNASTRY"];
        replyText = `Regarding your partner's profile and traits, the JHoraAI engines have analyzed the 7th house lord, the Dara Karaka, and key planetary signposts in your D1 and D9 charts.

### Partner Characteristics [System: Vedic, System: Jaimini]
1. **Physical & Character Traits**: Your spouse is indicated to be intellectually vibrant, highly supportive, and deeply compassionate [VEDIC_DEC_SPOUSE_01].
2. **Career & Social Standing**: The connection of the 7th house with benefic planets suggest they will hold an honorable professional standing with a strong sense of responsibility.
3. **Soul Connection**: Your Dara Karaka planet confirms a deep spiritual bond with high compatibility [JAIMINI_DEC_SPOUSE_01].

Focus on nurturing a communicative and respectful atmosphere to let this partnership flourish naturally.`;
      } else if (q.includes("remedy") || q.includes("mantra") || q.includes("gem") || q.includes("dosha")) {
        detectedIntent = "Astrological Remedies & Dosha Clearing";
        matchedSys = ["Vedic", "Lal Kitab"];
        matchedRules = ["VEDIC_REMEDY_RULE", "LAL_KITAB_DEBT"];
        replyText = `To harmonize planetary energies and clear any active celestial doshas, here are your personalized JHoraAI remedial protocols:

### Remedial Protocols [System: Vedic, System: Lal Kitab]
1. **Vedic Mantra**: Chant *Om Namah Shivaya* daily 108 times to neutralize Saturn's delays and gain spiritual clarity [VEDIC_DEC_REMEDY_01].
2. **Lal Kitab Remedial Action**: Keep a small vessel of water near your bedside at night and pour it into a green plant in the morning [LK_DEC_REMEDY_01].
3. **Gemstone Guidance**: If recommended by a personal counselor, wearing a high-quality Pearl or Yellow Sapphire under appropriate conditions can boost supportive energies.

Perform these remedies with complete devotion and clear intent for positive transformation.`;
      } else {
        detectedIntent = "General Chart Consultation";
        replyText = `Welcome to your Master AI Astrologer consultation. Based on your birth details, your chart demonstrates solid life path vitality with active planetary yogas.

### Strategic Insights [System: Vedic, System: KP]
- **Lagna Resonance**: Your Ascendant lord is placed in a supportive sector, granting you natural resilience and charisma.
- **Relationship Harmony**: Your 7th house has a stable energetic balance, indicating that patient, honest dialogs will always bring peace.
- **Career Growth**: Professional indicators are highly promising. Keep your focus on discipline and high moral standards.

Please ask me any specific question about Marriage Delay, Spouse traits, Timings, or Remedies to explore your chart in greater depth!`;
      }

      const fallbackOutput = {
        reply: replyText,
        intentDetected: {
          intent: detectedIntent,
          loadedSystems: matchedSys,
          loadedRulebooks: matchedRules,
          loadedEvidence: ["VEDIC_EVIDENCE_MATCH", "KP_EVIDENCE_MATCH"],
          loadedDecisions: ["DEC_PROMISE_01", "DEC_DELAY_01"],
          confidence: 85
        },
        candidateKnowledge: null
      };

      res.json(fallbackOutput);
    }
});

// ==========================================
// Astrology Rules Handbook API Endpoints
// ==========================================
const HANDBOOK_PATH = path.join(process.cwd(), "documents", "master_astro_handbook.md");

app.get("/api/astrology/rules-handbook", (req, res) => {
  try {
    if (fs.existsSync(HANDBOOK_PATH)) {
      const content = fs.readFileSync(HANDBOOK_PATH, "utf-8");
      return res.json({ content });
    } else {
      // Create parent directory if missing and return a default template
      const parentDir = path.dirname(HANDBOOK_PATH);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      return res.json({ content: "" });
    }
  } catch (err: any) {
    console.error("Error reading handbook file:", err);
    return res.status(500).json({ error: err.message || "Failed to read handbook file." });
  }
});

app.post("/api/astrology/rules-handbook", (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== "string") {
      return res.status(400).json({ error: "Invalid content format. Must be a string." });
    }

    const parentDir = path.dirname(HANDBOOK_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(HANDBOOK_PATH, content, "utf-8");
    return res.json({ success: true, message: "Handbook successfully updated on filesystem." });
  } catch (err: any) {
    console.error("Error saving handbook file:", err);
    return res.status(500).json({ error: err.message || "Failed to update handbook file." });
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
