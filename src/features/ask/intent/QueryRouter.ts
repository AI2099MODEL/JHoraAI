export type AstrologicalDomain =
  | "Career"
  | "Marriage"
  | "Finance"
  | "Business"
  | "Property"
  | "Children"
  | "Health"
  | "Education"
  | "Travel"
  | "Foreign Settlement"
  | "Litigation"
  | "Politics"
  | "Spiritual Growth"
  | "Soul Evolution"
  | "Past Karma"
  | "Current Dasha"
  | "Transit"
  | "Compatibility"
  | "Remedies"
  | "Research"
  | "Daily Horoscope"
  | "Life Purpose"
  | "General Horoscope";

export interface RoutingDecision {
  domain: AstrologicalDomain;
  requiredSystems: string[];
  requiredDataPoints: string[];
}

export class QueryRouter {
  private static rules: Record<AstrologicalDomain, RegExp[]> = {
    "Career": [
      /\b(job|career|work|profession|boss|office|employ|promotion|salary|interview|hire|resign|fired|colleague|10th house|d10|dashamsha|vocation|business partner|unemployed)\b/i,
      /\b(change.*job|new.*job|career.*change|career.*path|salary.*raise|promotion)\b/i,
    ],
    "Marriage": [
      /\b(marry|marriage|spouse|wedding|wife|husband|partner|relationship|divorce|7th house|single|matchmaking|navamsa|d9|upapada|darakaraka)\b/i,
      /\b(when.*marry|will.*get.*married|marital|spouse.*profile)\b/i,
    ],
    "Finance": [
      /\b(money|finance|wealth|rich|poor|bank|income|saving|debt|loan|2nd house|11th house|dhana|financial|inheritance|bankrupt)\b/i,
    ],
    "Business": [
      /\b(business|partnership|startup|venture|trade|profit|loss|client|customer|commerce|7th house|entrepreneur|shop|company)\b/i,
    ],
    "Property": [
      /\b(property|house|land|apartment|real estate|flat|home|vehicle|car|4th house|buy.*home|sell.*house|conveyance)\b/i,
    ],
    "Travel": [
      /\b(travel|trip|journey|vacation|tour|holiday|visit|short trip|3rd house|9th house|pilgrimage|abroad.*trip)\b/i,
    ],
    "Children": [
      /\b(child|children|son|daughter|pregnancy|pregnant|conceive|baby|offspring|5th house|saptamsha|d7|procreation|fertility)\b/i,
    ],
    "Health": [
      /\b(health|illness|disease|doctor|hospital|pain|recovery|sick|body|well-being|6th house|8th house|12th house|surgery|physical|mental.*health|longevity)\b/i,
    ],
    "Education": [
      /\b(study|education|school|college|university|degree|exam|test|learn|student|5th house|4th house|chaturvimshamsha|d24|academic|phd|scholarship)\b/i,
    ],
    "Foreign Settlement": [
      /\b(foreign|abroad|settle.*abroad|visa|passport|immigration|settlement|other country|12th house|9th house|greencard|pr.*abroad)\b/i,
    ],
    "Litigation": [
      /\b(court|law|case|lawsuit|judge|legal|litigation|dispute|sue|6th house|8th house|trial|adversary|police)\b/i,
    ],
    "Politics": [
      /\b(politics|election|political|vote|campaign|leader|minister|mp|mla|parliament|governance|power|victory|public.*life)\b/i,
    ],
    "Spiritual Growth": [
      /\b(spiritual|meditation|yoga|guru|ashram|temple|god|religion|moksha|enlighten|9th house|12th house|sadhana|mantra|divine)\b/i,
    ],
    "Soul Evolution": [
      /\b(atmakaraka|amatyakaraka|karakamsa|swamsa|soul|spiritual.*path|soul.*purpose|karmic.*lesson|past.*life.*talent|spiritual.*evolution|rahu.*ketu.*axis)\b/i,
    ],
    "Past Karma": [
      /\b(past.*karma|karma|sanchita|prarabdha|past.*life|incarnation|shastyamsa|d60|karmic.*debt|ancestor|pitra)\b/i,
    ],
    "Current Dasha": [
      /\b(dasha|mahadasha|bhukti|pratyantar|period|planetary.*period|current.*period|ruling.*planet|ruling.*period)\b/i,
    ],
    "Transit": [
      /\b(transit|gochara|current position|sky coordinate|planet.*movement|saturn transit|jupiter transit|rahu transit|transit.*impact)\b/i,
    ],
    "Compatibility": [
      /\b(compatibility|gunamilan|koota|synastry|love match|relationship score|matching|compare charts|kundli.*matching|ashtakoota)\b/i,
    ],
    "Remedies": [
      /\b(remedy|remedies|stone|gemstone|puja|donation|charity|pooja|yantra|root|remedial|fasting|vrat|ward.*off)\b/i,
    ],
    "Research": [
      /\b(research|phd|thesis|discovery|occult|astrology|mysticism|secret|hidden|8th house|metaphysics|siddhis|esoteric)\b/i,
    ],
    "Daily Horoscope": [
      /\b(daily|mood|feel|feeling|today|current feeling|mind|moon transit|today's prediction|tomorrow|horoscope today|daily prediction)\b/i,
    ],
    "Life Purpose": [
      /\b(life purpose|why was i born|destiny|mission|vocation|calling|life.*goal|why am i here|dharma|life.*path)\b/i,
    ],
    "General Horoscope": [
      /\b(horoscope|chart|kundli|birth|general|overview|life|future|placement|planetary strength|natal|birth.*chart)\b/i,
    ],
  };

  /**
   * Classifies a user query text into an AstrologicalDomain and determines required systems and data points.
   */
  public static route(query: string): RoutingDecision {
    const trimmed = query.trim();
    let detectedDomain: AstrologicalDomain = "General Horoscope";

    if (trimmed) {
      // Find matching domain using regular expressions
      for (const [domain, regexes] of Object.entries(this.rules)) {
        for (const regex of regexes) {
          if (regex.test(trimmed)) {
            detectedDomain = domain as AstrologicalDomain;
            break;
          }
        }
        if (detectedDomain !== "General Horoscope") {
          break;
        }
      }
    }

    // Determine required systems
    let requiredSystems: string[] = ["JHora"]; // JHora is always included as base

    switch (detectedDomain) {
      case "Career":
        requiredSystems = ["JHora", "KP", "Western"];
        break;
      case "Marriage":
        requiredSystems = ["JHora", "KP"]; // Incorporating Navamsa under JHora
        break;
      case "Compatibility":
        requiredSystems = ["JHora", "KP", "Western"]; // Western Synastry
        break;
      case "Soul Evolution":
        requiredSystems = ["JHora", "Jaimini"]; // Jaimini and Vedic (for Rahu/Ketu, Dasha)
        break;
      case "Finance":
      case "Business":
      case "Investments" as any:
        requiredSystems = ["JHora", "KP", "Western"];
        break;
      case "Travel":
      case "Foreign Settlement":
        requiredSystems = ["JHora", "KP"];
        break;
      case "Health":
        requiredSystems = ["JHora", "KP"];
        break;
      case "Research":
      case "Past Karma":
      case "Spiritual Growth":
      case "Life Purpose":
        requiredSystems = ["JHora", "Jaimini"];
        break;
      case "Transit":
        requiredSystems = ["JHora", "KP", "Western"];
        break;
      default:
        requiredSystems = ["JHora", "KP", "Western", "Jaimini"];
    }

    // Determine required data points to retrieve
    let requiredDataPoints: string[] = [];

    switch (detectedDomain) {
      case "Soul Evolution":
        requiredDataPoints = [
          "Atmakaraka",
          "Amatyakaraka",
          "Karakamsa (D9 placement of AK)",
          "Swamsa",
          "Rahu & Ketu Placements",
          "9th & 12th Houses",
          "Current Mahadasha Lord",
          "Current Jupiter/Saturn Transit",
          "Planet Strengths (Shadbala)"
        ];
        break;
      case "Career":
        requiredDataPoints = [
          "10th House planets & Lord",
          "D10 Divisional Chart (Dashamsha)",
          "KP Significators (2nd, 6th, 10th, 11th)",
          "Sun & Jupiter Strengths",
          "Current Mahadasha Lord",
          "Transit Saturn and Jupiter"
        ];
        break;
      case "Business":
        requiredDataPoints = [
          "7th House planets & Lord",
          "2nd, 10th & 11th Houses",
          "Mercury placement & strength",
          "KP 7th Cuspal Sub-lord",
          "Current Mahadasha Lord"
        ];
        break;
      case "Marriage":
        requiredDataPoints = [
          "7th House planets & Lord",
          "D9 Navamsa Lagna & 7th Lord",
          "Upapada Lagna (UL) and UL Lord",
          "Venus/Jupiter (Karakas)",
          "KP 7th Cuspal Sub-lord",
          "Current Mahadasha Lord"
        ];
        break;
      case "Compatibility":
        requiredDataPoints = [
          "Moon sign and Nakshatra for both",
          "7th House & Venus comparison",
          "Mars-Venus aspects (Synastry)",
          "Koota Matching Score (Guna Milan)",
          "Rahu-Ketu comparison"
        ];
        break;
      case "Finance":
        requiredDataPoints = [
          "2nd House (Accumulated wealth) & Lord",
          "11th House (Gains) & Lord",
          "5th & 8th Houses (Speculation/Inheritance)",
          "Jupiter (Karaka of wealth)",
          "Current Mahadasha Lord"
        ];
        break;
      case "Health":
        requiredDataPoints = [
          "1st House (Lagna) & Lagna Lord",
          "6th House (Disease) & Lord",
          "8th House (Longevity) and 12th House (Hospitals)",
          "Sun (Karaka for vitality) & Moon (Karaka for mind)",
          "Current Mahadasha Lord"
        ];
        break;
      case "Travel":
      case "Foreign Settlement":
        requiredDataPoints = [
          "3rd, 9th, and 12th Houses & Lords",
          "Rahu placement",
          "Moon (Karaka for travel)",
          "Current Mahadasha Lord",
          "Transit of Rahu/Saturn"
        ];
        break;
      case "Past Karma":
        requiredDataPoints = [
          "D60 Divisional Chart (Shastyamsa) Lagna",
          "Saturn & Rahu/Ketu placement",
          "8th & 12th Houses & Lords",
          "Retrograde planets"
        ];
        break;
      case "Remedies":
        requiredDataPoints = [
          "Afflicted planets",
          "6th, 8th, and 12th House lords",
          "Dasha Lord strengths",
          "Benefic Jupiter aspects"
        ];
        break;
      case "Daily Horoscope":
      case "Transit":
        requiredDataPoints = [
          "Current Moon Sign & Nakshatra",
          "Panchanga details",
          "Lagna Lord current transit position",
          "Transit of Saturn and Jupiter"
        ];
        break;
      default:
        requiredDataPoints = [
          "Lagna & Lagna Lord",
          "Sun, Moon, and Ascendant Signs",
          "Planetary placements in D1 Rasi",
          "Current Mahadasha Lord",
          "Panchanga of birth date"
        ];
    }

    return {
      domain: detectedDomain,
      requiredSystems,
      requiredDataPoints,
    };
  }
}
