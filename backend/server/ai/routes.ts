import { Router } from "express";
import { ProviderFactory } from "./ProviderFactory";
import { QueryRouter } from "../../../src/features/ask/intent/QueryRouter";
import { RuleRouter } from "../../../src/features/ask/intent/RuleRouter";
import fs from "fs";
import path from "path";

const router = Router();

// POST /api/ai/consultation
router.post("/consultation", async (req, res) => {
  const { 
    userText, 
    profile, 
    horoscopeData, 
    precedingMessages, 
    provider, 
    model, 
    apiKey 
  } = req.body;

  if (!provider) {
    return res.status(400).json({ error: "Provider is required." });
  }

  try {
    // 1. Read userprofile.json from disk for absolute authoritative and complete page calculations
    const filePath = path.join(process.cwd(), "Users", "userprofile.json");
    let userProfile: any = null;
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        userProfile = JSON.parse(content);
      } catch (err) {
        console.error("Failed to parse userprofile.json in consultation:", err);
      }
    }

    // Merge incoming horoscopeData withloaded userProfile to ensure absolute completeness
    const mergedHoroscope = {
      ...(userProfile || {}),
      ...(horoscopeData || {})
    };

    // 2. Determine domain
    const decision = QueryRouter.route(userText);
    const { domain, requiredSystems, requiredDataPoints } = decision;

    // 3. Extract facts from mergedHoroscope if available
    const primaryFactors: any[] = [];
    const missingFactors: any[] = [];

    const horoscope = mergedHoroscope.horoscope || mergedHoroscope.Raw?.JHora?.horoscope?.horoscope || mergedHoroscope || {};
    const panchanga = horoscope.panchanga || horoscope.calendar_info || {};
    const rasi = horoscope.divisional_charts?.["D-1_rasi"] || horoscope.divisional_charts?.D1_rasi || {};
    const dasha = horoscope.dasha?.current_dasha || horoscope.dasha || {};

    if (rasi && Object.keys(rasi).length > 0) {
      Object.entries(rasi).forEach(([planet, details]: [string, any]) => {
        if (planet === "Ascendant") {
          primaryFactors.push({
            factor: `Ascendant in ${details.sign}`,
            description: `Lagna is placed at ${details.longitude?.toFixed(2)}° in the sign of ${details.sign}.`,
            source: "JHora Engine"
          });
        } else {
          primaryFactors.push({
            factor: `${planet} in ${details.sign}`,
            description: `${planet} is at ${details.longitude?.toFixed(2)}° in ${details.sign}, residing in Nakshatra ${details.nakshatra || "unknown"}.`,
            source: "JHora Engine"
          });
        }
      });
    }

    if (dasha && dasha.dasha_period) {
      primaryFactors.push({
        factor: `Active Period: ${dasha.dasha_period}`,
        description: `Current active Vimshottari period is ${dasha.dasha_period}, ending on ${dasha.ends || "unknown"}.`,
        source: "Dasha Engine"
      });
    }

    if (panchanga && panchanga.tithi) {
      primaryFactors.push({
        factor: `Birth Tithi: ${panchanga.tithi}`,
        description: `Born under Tithi ${panchanga.tithi}, Nakshatra ${panchanga.nakshatra || "unknown"}, Yoga ${panchanga.yoga || "unknown"}.`,
        source: "Panchanga Engine"
      });
    }

    // Filter facts to ONLY include those matching our requiredDataPoints list for the domain
    const filteredPrimaryFactors = primaryFactors.filter(fact => {
      const nameLower = fact.factor.toLowerCase();
      
      if (domain === "Career") {
        return nameLower.includes("ascendant") || nameLower.includes("10th") || nameLower.includes("sun") || nameLower.includes("jupiter") || nameLower.includes("saturn") || nameLower.includes("period") || nameLower.includes("d10");
      }
      if (domain === "Marriage" || domain === "Compatibility") {
        return nameLower.includes("7th") || nameLower.includes("venus") || nameLower.includes("jupiter") || nameLower.includes("moon") || nameLower.includes("period") || nameLower.includes("d9") || nameLower.includes("match");
      }
      if (domain === "Soul Evolution") {
        return nameLower.includes("atmakaraka") || nameLower.includes("rahu") || nameLower.includes("ketu") || nameLower.includes("9th") || nameLower.includes("12th") || nameLower.includes("period");
      }
      if (domain === "Finance" || domain === "Business") {
        return nameLower.includes("2nd") || nameLower.includes("11th") || nameLower.includes("7th") || nameLower.includes("jupiter") || nameLower.includes("mercury") || nameLower.includes("period");
      }
      if (domain === "Health") {
        return nameLower.includes("ascendant") || nameLower.includes("6th") || nameLower.includes("8th") || nameLower.includes("12th") || nameLower.includes("sun") || nameLower.includes("moon") || nameLower.includes("period");
      }
      if (domain === "Travel" || domain === "Foreign Settlement") {
        return nameLower.includes("3rd") || nameLower.includes("9th") || nameLower.includes("12th") || nameLower.includes("rahu") || nameLower.includes("moon") || nameLower.includes("period");
      }
      return true;
    });

    if (domain === "Soul Evolution" && rasi && Object.keys(rasi).length > 0) {
      let maxLong = -1;
      let akPlanet = "Sun";
      Object.entries(rasi).forEach(([planet, details]: [string, any]) => {
        if (["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(planet)) {
          if (details.longitude > maxLong) {
            maxLong = details.longitude;
            akPlanet = planet;
          }
        }
      });
      filteredPrimaryFactors.unshift({
        factor: `Atmakaraka (AK): ${akPlanet}`,
        description: `${akPlanet} has the highest longitude (${maxLong.toFixed(2)}°) in the D1 Rasi chart, representing the Soul's path.`,
        source: "Jaimini Engine"
      });
    }

    if (profile && !horoscopeData) {
      missingFactors.push({
        factor: "Engine Calculations",
        details: "Calculations defaulted due to API connectivity issue."
      });
    }

    // 4. Get relevant rules from RuleRouter
    const activeRules = RuleRouter.getRulesForDomain(domain);

    // 5. Construct ReasoningContext
    const reasoningContext = {
      intent: domain,
      domain: domain,
      birthProfile: profile ? {
        name: profile.name,
        date: profile.date,
        time: profile.time,
        place: profile.place,
        gender: profile.gender
      } : (mergedHoroscope.BirthDetails || mergedHoroscope.Birth || null),
      requiredSystems: requiredSystems,
      chartFacts: filteredPrimaryFactors,
      currentSky: panchanga,
      activePeriods: dasha,
      ruleGroups: activeRules.map(r => `${r.groupName} - ${r.ruleTitle}: ${r.description}`),
      completeAstrologyData: mergedHoroscope, // Dynamic loading of all page calculations
      lifeContext: userText,
      conversationHistory: precedingMessages ? precedingMessages.slice(-5).map((m: any) => `${m.role}: ${m.content}`) : []
    };

    const promptText = `You are JHoraAI, the world's most advanced professional astrology system. You have received the following ReasoningContext containing complete, rich calculations across all dashboard pages and subsystems (Vedic/JHora, KP stellar, Jaimini, Lal Kitab, Tajika, and Western).

ReasoningContext:
${JSON.stringify(reasoningContext, null, 2)}

Your responsibility is to analyze the user's inquiry based strictly on the provided ReasoningContext, including the extremely rich completeAstrologyData which contains the full live calculations state of all screens and pages in the application.

You are fully trained to read, interpret, and synthesize ALL of the user's page data:
- Vedic Natal Coordinates & Divisional Charts (D-1 Rasi, D-9 Navamsa, D-10 Dasamsa, etc.)
- Active Vimshottari/Ashtottari/Yogini dasha tables and planetary periods
- KP Stellar Dashboard (Placidus cusps, cuspal sub-lords, planet sub-lords, and significations)
- Jaimini Chara Karakas, Arudha Padas, and special Lagnas
- Lal Kitab Tevas & Pucca Ghars
- Tajik Varshaphal and Year Lord strengths
- Western Astrology placements and aspect orbs

Answer any questions the user asks with extreme specificity, referencing appropriate tables (JH1-JH19), house and sign lords, degrees, and rule books, regardless of which page or sub-system the query comes from.

Every response MUST be highly professional and structured exactly with these headers (using markdown '### ' headers):
### Summary
Provide a concise, extremely professional summary of the astrological analysis.

### Chart Facts Used
List the exact planets, houses, and degrees that were analyzed from the context.

### Primary Factors
Explain the most critical planetary placements, rules, and configurations that apply.

### Secondary Factors
Detail secondary indicators, support factors, or transit configurations.

### Timing Context
Examine the active periods (Dasha) and transits to specify timing.

### Cross-System Observations
Compare Vedic/JHora, KP, Jaimini, or Western observations from the context.

### Suggested Follow-up Questions
List 2-3 specific, professional follow-up questions the user might ask next.

Guidelines:
- Never replace astrology calculations. Every calculation has already been done by the engine and is provided to you.
- Speak with objective, calm authority. Do not sound like ChatGPT. Never use emojis in the main text.
- Do not display confidence percentages. Do not fabricate evidence.
- If required data is missing from the context and prevents an accurate reading, state clearly: "Additional chart information is required."`;

    // 5. Build pipeline payload to stream
    const pipelineMetadata = {
      intent: {
        primary: domain,
        confidence: 0.95,
        keywordsDetected: []
      },
      context: {
        intent: domain,
        currentModule: "Horoscope",
        selectedChart: profile ? "D1 Natal Chart" : "Transit Sky",
        birthProfile: profile,
        currentTransit: panchanga,
        activeSystems: requiredSystems,
        requestedDomain: domain,
        conversationHistory: []
      },
      knowledge: activeRules.map(r => ({
        id: r.id,
        title: r.ruleTitle,
        description: r.description,
        category: r.groupName
      })),
      evidence: {
        primaryFactors: filteredPrimaryFactors,
        secondaryFactors: [],
        supportingFactors: [],
        conflictingFactors: [],
        missingFactors: missingFactors
      }
    };

    const aiProvider = ProviderFactory.getProvider(provider);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // First send the pipeline metadata event
    res.write(`data: ${JSON.stringify({ pipeline: pipelineMetadata })}\n\n`);

    // Stream LLM chunks
    await aiProvider.stream(
      {
        messages: [
          {
            role: "user",
            content: promptText
          }
        ],
        model,
        apiKey,
        systemInstruction: "You are the JHoraAI Professional astrology engine. You respond strictly using the provided ReasoningContext facts and rules. You never fabricate evidence or display confidence percentages."
      },
      (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
    );

    res.write("data: [DONE]\n\n");
    return res.end();

  } catch (error: any) {
    console.error("AI consultation route error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || "An error occurred during consultation generation." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "An error occurred during consultation generation." })}\n\n`);
      return res.end();
    }
  }
});

// POST /api/ai/chat
router.post("/chat", async (req, res) => {
  const { provider, model, messages, apiKey, systemInstruction, stream } = req.body;

  if (!provider) {
    return res.status(400).json({ error: "Provider is required." });
  }
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const aiProvider = ProviderFactory.getProvider(provider);

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      
      // Attempt to support compression bypass if present
      res.flushHeaders();

      await aiProvider.stream(
        { messages, model, apiKey, systemInstruction },
        (chunk) => {
          res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
      );

      res.write("data: [DONE]\n\n");
      return res.end();
    } else {
      const result = await aiProvider.chat({ messages, model, apiKey, systemInstruction });
      return res.json({ text: result.text });
    }
  } catch (error: any) {
    console.error("AI chat route error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message || "An error occurred during generation." });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || "An error occurred during generation." })}\n\n`);
      return res.end();
    }
  }
});

// POST /api/ai/models
router.post("/models", async (req, res) => {
  const { provider, apiKey } = req.body;
  if (!provider) {
    return res.status(400).json({ error: "Provider is required." });
  }

  try {
    const aiProvider = ProviderFactory.getProvider(provider);
    const models = await aiProvider.models(apiKey);
    return res.json({ models });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/ai/health
router.get("/health", async (req, res) => {
  const { provider, apiKey } = req.query;
  const providerName = (provider as string) || "gemini";
  
  try {
    const aiProvider = ProviderFactory.getProvider(providerName);
    const status = await aiProvider.health(apiKey as string);
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ status: "unavailable", message: error.message });
  }
});

export default router;
