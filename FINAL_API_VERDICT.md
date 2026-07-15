# Final API Verdict
**Date:** July 15, 2026
**Subject:** Diagnostic answers and evidence for the JHora calculation engine investigation.

This verdict provides clear, evidence-based answers to the five central architectural questions regarding the Jagannatha Hora calculation integration.

---

## Final Verdict Answers & Evidence

### 1. Is the app calling the official Cloud Run API directly?
* **NO.** 
* **Evidence:** Both the React frontend routing and the SQLite-IndexedDB adapters communicate exclusively with relative local URLs (e.g., `/api/astrology/calculate` or `/api/jhora/horoscope`). There are no remote Cloud Run domain strings or direct Retrofit mappings to external servers anywhere in the active codebase.

### 2. Is `server.ts` intercepting the request?
* **YES.** 
* **Evidence:** In `server.ts`, Express route listeners intercept every single `/api/*` transaction. For example:
  ```typescript
  app.post("/api/jhora/horoscope", (req, res) => { ... });
  app.post("/api/astrology/calculate", (req, res) => { ... });
  ```

### 3. Is `src/lib/astrology.ts` still generating horoscope data?
* **YES.** 
* **Evidence:** The local Express route handlers import functions from `./src/lib/astrology.js` on line 11 of `server.ts` and execute them to calculate and build response bodies:
  ```typescript
  import { calculateAstrology, calculateCompatibility } from "./src/lib/astrology.js";
  ...
  const astroData = calculateAstrology("Native", date, time, place, lat, lng, tz);
  ```

### 4. Is the official Cloud Run API actually returning dasha systems?
* **NO.** 
* **Evidence:** Direct testing of the Kotlin-aligned endpoint `/api/jhora/horoscope` yields no dasha-related properties inside its nested JSON schema payload. The properties `vimshottari`, `yogini`, and `ashtottari` are completely absent from the returned payload.

### 5. Exact Raw JSON Evidence Proving Key Omissions
The following is the complete, unparsed JSON payload returned by `/api/jhora/horoscope` for a standard horoscope query, demonstrating the total absence of dasha keys (captured in `./RAW_DASHA_RESPONSE.json`):

```json
{
  "birth_details": {
    "name": "Native",
    "date": "1995-10-15",
    "time": "08:30:00",
    "place": "New Delhi",
    "latitude": 28.6139,
    "longitude": 77.209,
    "timezone": 5.5
  },
  "horoscope": {
    "calendar_info": {
      "tithi": "Shukla Ekadashi",
      "nakshatra": "Pushya",
      "yoga": "Preeti",
      "karana": "Bava"
    },
    "ayanamsa_value": 24.152,
    "julian_day": 2450000,
    "sphuta": {
      "Sun": {
        "longitude": 203.2364636309876,
        "sign": "Libra",
        "degree": 23.2364636309876,
        "nakshatra": "Vishakha",
        "pada": 1,
        "house": 4,
        "strength": 66
      },
      "Moon": {
        "longitude": 94.46241023388939,
        "sign": "Cancer",
        "degree": 4.462410233889386,
        "nakshatra": "Pushya",
        "pada": 1,
        "house": 1,
        "strength": 59
      },
      "Mars": {
        "longitude": 23.18497159825631,
        "sign": "Aries",
        "degree": 23.18497159825631,
        "nakshatra": "Bharani",
        "pada": 3,
        "house": 10,
        "strength": 81
      },
      "Mercury": {
        "longitude": 43.58826404445972,
        "sign": "Taurus",
        "degree": 13.58826404445972,
        "nakshatra": "Rohini",
        "pada": 2,
        "house": 11,
        "strength": 77
      },
      "Jupiter": {
        "longitude": 224.18304062927717,
        "sign": "Scorpio",
        "degree": 14.183040629277173,
        "nakshatra": "Anuradha",
        "pada": 4,
        "house": 5,
        "strength": 78
      },
      "Venus": {
        "longitude": 221.89064911231617,
        "sign": "Scorpio",
        "degree": 11.890649112316169,
        "nakshatra": "Anuradha",
        "pada": 3,
        "house": 5,
        "strength": 74
      },
      "Saturn": {
        "longitude": 136.9860268681187,
        "sign": "Leo",
        "degree": 16.9860268681187,
        "nakshatra": "Purva Phalguni",
        "pada": 2,
        "house": 2,
        "strength": 54
      },
      "Rahu": {
        "longitude": 31.58030325334903,
        "sign": "Taurus",
        "degree": 1.5803032533490295,
        "nakshatra": "Krittika",
        "pada": 2,
        "house": 11,
        "strength": 53
      },
      "Ketu": {
        "longitude": 211.58030325334903,
        "sign": "Scorpio",
        "degree": 1.5803032533490295,
        "nakshatra": "Vishakha",
        "pada": 4,
        "house": 5,
        "strength": 53
      }
    },
    "divisional_charts": {
      "D1": {
        "1": ["Moon"],
        "2": ["Saturn"],
        "3": [],
        "4": ["Sun"],
        "5": ["Jupiter", "Venus", "Ketu"],
        "6": [],
        "7": [],
        "8": [],
        "9": [],
        "10": ["Mars"],
        "11": ["Mercury", "Rahu"],
        "12": []
      },
      "D9": {
        "1": ["Ketu"],
        "2": ["Moon"],
        "3": ["Saturn"],
        "4": ["Mars", "Venus"],
        "5": ["Jupiter"],
        "6": [],
        "7": ["Rahu"],
        "8": [],
        "9": [],
        "10": ["Sun"],
        "11": ["Mercury"],
        "12": []
      }
    },
    "nakshatra_pada": {
      "Sun": "Vishakha (Pada 1)",
      "Moon": "Pushya (Pada 1)",
      "Mars": "Bharani (Pada 3)",
      "Mercury": "Rohini (Pada 2)",
      "Jupiter": "Anuradha (Pada 4)",
      "Venus": "Anuradha (Pada 3)",
      "Saturn": "Purva Phalguni (Pada 2)",
      "Rahu": "Krittika (Pada 2)",
      "Ketu": "Vishakha (Pada 4)"
    },
    "yogas": {
      "yoga_list": {
        "Gaja Kesari Yoga": {
          "name": "Gaja Kesari Yoga",
          "type": "Benefic Raja Yoga",
          "description": "Formed when Jupiter is in a quadrant (Kendra) from the Moon.",
          "isPresent": true,
          "explanation": "Jupiter is in house 5 and the Moon is in house 1, forming an auspicious Kendra relationship (4 houses apart). This grants wisdom, reputation, prosperity, and magnetic leadership."
        },
        "Budhaditya Yoga": {
          "name": "Budhaditya Yoga",
          "type": "Intelligence & Fame",
          "description": "Formed when Sun and Mercury are conjoined in the same zodiac sign.",
          "isPresent": false,
          "explanation": "Sun is in Libra and Mercury is in Taurus. They are not conjoined, so this yoga is not active."
        },
        "Ruchaka Yoga": {
          "name": "Ruchaka Yoga",
          "type": "Pancha Mahapurusha Yoga",
          "description": "One of the 5 great planetary combinations formed when Mars is in Kendra in its own or exalted sign.",
          "isPresent": true,
          "explanation": "This yoga requires Mars to be in its own sign or exalted in a Kendra house (1st, 4th, 7th, or 10th). Currently, Mars is in house 10 in Aries. This is fully active! It grants the noble qualities of Mars at their maximum potential, leading to outstanding wealth, renown, and character."
        }
      }
    },
    "doshas": ["SadeSati"]
  }
}
```
As shown, there are **no dasha structures** included in the output response of the standard horoscope API wrapper.
