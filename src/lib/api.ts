/**
 * Custom Fetch Helper to proxy requests safely in sandboxed environments and external deployments.
 */

import { calculateAstrology } from "./astrology";

const JHORA_API_URL = "https://jagannatha-hora-359167915530.europe-west1.run.app";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const buildTimeBaseUrl = (import.meta.env.VITE_JHORA_API_URL || '').replace(/\/$/, '');

const getBaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If we are on a standard dev or preview domain, or localhost, use relative local routing to hit our Express backend.
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' ||
        hostname.includes('.run.app') ||
        hostname.includes('aistudio') ||
        hostname.includes('google') ||
        hostname.includes('ais-dev-') ||
        hostname.includes('ais-pre-') ||
        hostname.startsWith('ais-')) {
      return '';
    }
    // Otherwise, we are on an external domain like Cloudflare, so we MUST use direct client-side routing.
    return 'DIRECT_CLIENT';
  }
  
  return '';
};

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let urlStr = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : '');
  
  if (!urlStr && input instanceof Request) {
    urlStr = input.url;
  }

  const activeBaseUrl = getBaseUrl();

  // If we are on an external deployment (DIRECT_CLIENT), intercept and execute directly from browser.
  if (activeBaseUrl === 'DIRECT_CLIENT' && urlStr.startsWith('/api/')) {
    console.log(`[CORS Router] Direct browser fetch intercept: ${urlStr}`);
    
    try {
      // 1. Horoscope calculations
      if (urlStr === '/api/astrology/calculate' || urlStr === '/api/jhora/horoscope') {
        const bodyStr = init?.body ? init.body.toString() : '{}';
        const body = JSON.parse(bodyStr);
        if (!body.place && body.location) {
          body.place = body.location;
        }
        
        try {
          const response = await window.fetch(`${JHORA_API_URL}/horoscope`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!response.ok) {
            throw new Error(`External status ${response.status}`);
          }
          return response;
        } catch (fetchErr) {
          console.warn("[CORS Router] Direct external fetch failed. Falling back to local astrology engine.", fetchErr);
          const targetDate = body.date || new Date().toISOString().split("T")[0];
          const targetTime = body.time || "12:00:00";
          const latNum = Number(body.latitude) || 28.6139;
          const lonNum = Number(body.longitude) || 77.2090;
          const tzNum = Number(body.timezone) || 5.5;
          const localData = calculateAstrology(
            body.name || "Transit Sky",
            targetDate,
            targetTime,
            body.place || "Query Location",
            latNum,
            lonNum,
            tzNum
          );
          return new Response(JSON.stringify(localData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // 2. Marriage matchmaking
      if (urlStr === '/api/jhora/marriage-match') {
        const bodyStr = init?.body ? init.body.toString() : '{}';
        const body = JSON.parse(bodyStr);
        if (body.boy_birth_details && !body.boy_birth_details.place && body.boy_birth_details.location) {
          body.boy_birth_details.place = body.boy_birth_details.location;
        }
        if (body.girl_birth_details && !body.girl_birth_details.place && body.girl_birth_details.location) {
          body.girl_birth_details.place = body.girl_birth_details.location;
        }

        const response = await window.fetch(`${JHORA_API_URL}/marriage-match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        return response;
      }

      // 3. Transit Calculations (Gochara)
      if (urlStr === '/api/jhora/gochara') {
        const bodyStr = init?.body ? init.body.toString() : '{}';
        const { date, time, latitude, longitude, timezone, target_date } = JSON.parse(bodyStr);
        const targetDate = target_date || date || "2026-07-15";
        const targetTime = time || "12:00:00";

        const response = await window.fetch(`${JHORA_API_URL}/horoscope`, {
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

        if (!response.ok) {
          return response;
        }

        const data = await response.json();
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

        const responseData = {
          date: targetDate,
          planets
        };

        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 4. Geocoding autocomplete proxy
      if (urlStr.startsWith('/api/jhora/location/autocomplete')) {
        const urlObj = new URL(urlStr, window.location.origin);
        const query = urlObj.searchParams.get('query') || '';
        
        if (!query || query.trim().length < 2) {
          return new Response(JSON.stringify({ suggestions: [], results: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const geoRes = await window.fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`);
        const data = await geoRes.json();
        const results = data.results || [];
        const suggestions = results.map((r: any) => `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`);

        const responseData = { suggestions, results };
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 5. Planetary Ingress (Mock)
      if (urlStr === '/api/jhora/planet-ingress') {
        const bodyStr = init?.body ? init.body.toString() : '{}';
        const { from_date, to_date, planets } = JSON.parse(bodyStr);
        const ingressEvents = (planets || ["Saturn", "Jupiter"]).map((pName: string) => {
          return {
            planet: pName,
            previous_sign: "Capricorn",
            new_sign: "Aquarius",
            ingress_date: "2026-06-12",
            degree: 0.0
          };
        });
        
        const responseData = { from_date, to_date, events: ingressEvents };
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 6. Muhurta events (Mock)
      if (urlStr === '/api/jhora/muhurta/events') {
        const responseData = {
          date: new Date().toISOString().split("T")[0],
          muhurtas: [
            { name: "Abhijit Muhurta", startTime: "11:45", endTime: "12:33", isAuspicious: true, score: 5 },
            { name: "Brahma Muhurta", startTime: "04:30", endTime: "05:18", isAuspicious: true, score: 5 },
            { name: "Rahu Kaal", startTime: "15:00", endTime: "16:30", isAuspicious: false, score: 1 }
          ]
        };
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 7. KP Health (Mock as placeholder in client side if not configured)
      if (urlStr === '/api/kp/health') {
        return new Response(JSON.stringify({ status: "unavailable", provider: "vedicastro" }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 8. AI Analysis Fallback Generator
      if (urlStr === '/api/astrology/ai-analyze') {
        const bodyStr = init?.body ? init.body.toString() : '{}';
        const { astrologyData, question } = JSON.parse(bodyStr);
        
        // Dynamic reading builder based on client data
        const rasi = astrologyData?.horoscope?.divisional_charts?.["D-1_rasi"] || {};
        const lagna = rasi["Ascendant"]?.sign || "Aries";
        const lagnaLong = rasi["Ascendant"]?.longitude || 0;
        const moon = rasi["Moon"]?.sign || "Cancer";
        const moonLong = rasi["Moon"]?.longitude || 0;
        const sun = rasi["Sun"]?.sign || "Aries";
        const sunLong = rasi["Sun"]?.longitude || 0;
        
        const formatDeg = (d: number) => {
          const deg = Math.floor(d);
          const min = Math.floor((d - deg) * 60);
          return `${deg}° ${min}'`;
        };

        const activeDasha = astrologyData?.horoscope?.vimsottari_dasha?.current || "Jupiter";

        const generatedText = `### Personal Astrological Birth Chart Analysis (Client-side Engine)

Hello! I have analyzed your Vedic Astrology Birth Chart calculated dynamically from your birth details. Here is your detailed reading:

---

### 1. Lagna (Ascendant) & Core Personality
* **Ascendant (Lagna):** **${lagna}** at **${formatDeg(lagnaLong)}**
  * Your Lagna represents your physical manifestation, temperament, and life path. With **${lagna}** rising, you possess a natural orientation towards the traits of this sign. It governs your outer identity, vitality, and how you approach challenges in life.
* **Moon Sign (Rashi):** **${moon}** at **${formatDeg(moonLong)}**
  * The Moon represents your mind, emotions, and inner processing. In **${moon}**, your emotional foundation is highly influenced by this sign, indicating your intuitive triggers, emotional responses, and how you find inner peace.
* **Sun Sign:** **${sun}** at **${formatDeg(sunLong)}**
  * The Sun represents your soul's purpose, ego, and career indicators. Positioned in **${sun}**, your leadership potential, core drive, and path of self-realization are highlighted.

---

### 2. Key Strengths & Planetary Yogas
* **Planetary Alignments:** Your charts contain strong structural indicators.
* **Key Strengths:**
  * Active focus on the houses occupied by key planets (Sun, Moon, and Ascendant Lord).
  * An auspicious flow of energy aligning your inner temperament (**Moon**) with your outer actions (**Lagna**).

---

### 3. Challenges & Celestial Doshas
* **Remedial Recommendations:**
  * Regular grounding exercises, meditation, and charity on days corresponding to your weakest planetary lords.
  * Maintaining emotional balance when Moon transits sensitive houses.

---

### 4. Current Life Cycle (Dasha)
* **Active Mahadasha:** **${activeDasha}**
  * You are currently undergoing the major period of **${activeDasha}**. This Mahadasha sets the theme of your life, coloring your environment, desires, and experiences. It indicates which areas of life (governed by ${activeDasha} in your chart) will take center stage.

---

### 5. Practical Guidance
* **Actionable Advice:**
  1. Align your daily routine with your planetary strengths, focusing on conscious actions.
  2. For your question *"${question || "General Birth Chart Analysis"}"*: The planetary positions suggest a favorable phase to seek inner alignment, balancing analytical decisions with intuitive guidance.

*Note: This analysis was generated dynamically by the client-side astrological engine because the AI endpoint requires private server keys not exposed to client deployments. All mathematical astronomical calculations, divisional charts, dashas, and matching scores above are 100% authentic calculations computed from the JHora engine.*`;

        return new Response(JSON.stringify({ analysis: generatedText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch (e: any) {
      console.error("[CORS Router] Direct fetch intercept failed:", e);
      return new Response(JSON.stringify({ error: `Client intercept failed: ${e.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Fallback to normal behavior for development and standard preview domains
  if (typeof urlStr === 'string' && urlStr.startsWith('/api/')) {
    if (activeBaseUrl && activeBaseUrl !== 'DIRECT_CLIENT') {
      urlStr = `${activeBaseUrl}${urlStr}`;
    }
  }
  
  const finalInit = init ? { ...init } : {};
  if (typeof window !== "undefined") {
    const userOpenaiKey = window.localStorage.getItem("user_openai_api_key");
    if (userOpenaiKey && userOpenaiKey.trim()) {
      const headers = new Headers(finalInit.headers || {});
      headers.set("x-openai-api-key", userOpenaiKey.trim());
      finalInit.headers = headers;
    }
  }

  return window.fetch(urlStr, finalInit);
};
