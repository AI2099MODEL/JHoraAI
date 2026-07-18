export type AstrologicalIntent =
  | "Career"
  | "Marriage"
  | "Finance"
  | "Business"
  | "Property"
  | "Travel"
  | "Children"
  | "Health"
  | "Education"
  | "Foreign Settlement"
  | "Litigation"
  | "Government"
  | "Research"
  | "Politics"
  | "Family"
  | "Communication"
  | "Investments"
  | "Spiritual"
  | "Daily Mood"
  | "Today's Prediction"
  | "Transit"
  | "Compatibility"
  | "General Horoscope";

export class IntentClassifier {
  private static rules: Record<AstrologicalIntent, RegExp[]> = {
    "Career": [
      /\b(job|career|work|profession|boss|office|employ|promotion|salary|interview|hire|resign|fired|colleague|10th house)\b/i,
      /\b(change.*job|new.*job|career.*change)\b/i,
    ],
    "Marriage": [
      /\b(marry|marriage|spouse|wedding|wife|husband|partner|relationship|divorce|7th house|single|matchmaking)\b/i,
      /\b(when.*marry|will.*get.*married)\b/i,
    ],
    "Finance": [
      /\b(money|finance|wealth|rich|poor|bank|income|saving|debt|loan|2nd house|11th house)\b/i,
    ],
    "Business": [
      /\b(business|partnership|startup|venture|trade|profit|loss|client|customer|commerce|7th house)\b/i,
    ],
    "Property": [
      /\b(property|house|land|apartment|real estate|flat|home|vehicle|car|4th house)\b/i,
    ],
    "Travel": [
      /\b(travel|trip|journey|vacation|tour|holiday|visit|short trip|3rd house|9th house)\b/i,
    ],
    "Children": [
      /\b(child|children|son|daughter|pregnancy|pregnant|conceive|baby|offspring|5th house)\b/i,
    ],
    "Health": [
      /\b(health|illness|disease|doctor|hospital|pain|recovery|sick|body|well-being|6th house|8th house|12th house)\b/i,
    ],
    "Education": [
      /\b(study|education|school|college|university|degree|exam|test|learn|student|5th house|4th house)\b/i,
    ],
    "Foreign Settlement": [
      /\b(foreign|abroad|settle.*abroad|visa|passport|immigration|settlement|other country|12th house|9th house)\b/i,
    ],
    "Litigation": [
      /\b(court|law|case|lawsuit|judge|legal|litigation|dispute|sue|6th house|8th house)\b/i,
    ],
    "Government": [
      /\b(government|gov|ias|ips|civil service|state|politics|ruler|king|authority|10th house)\b/i,
    ],
    "Research": [
      /\b(research|phd|thesis|discovery|occult|astrology|mysticism|secret|hidden|8th house)\b/i,
    ],
    "Politics": [
      /\b(politics|election|political|vote|campaign|leader|minister|mp|mla|parliament)\b/i,
    ],
    "Family": [
      /\b(family|parent|mother|father|brother|sister|sibling|relative|ancestor|2nd house|4th house)\b/i,
    ],
    "Communication": [
      /\b(phone|call|email|message|write|speak|contract|agreement|document|media|social|3rd house)\b/i,
    ],
    "Investments": [
      /\b(investment|invest|stock|share|crypto|mutual fund|trading|speculate|lottery|gambling|5th house|8th house)\b/i,
    ],
    "Spiritual": [
      /\b(spiritual|meditation|yoga|guru|ashram|temple|god|religion|moksha|enlighten|9th house|12th house)\b/i,
    ],
    "Daily Mood": [
      /\b(daily|mood|feel|feeling|today|current feeling|mind|moon transit)\b/i,
    ],
    "Today's Prediction": [
      /\b(today|day|tomorrow|horoscope today|daily prediction|what will happen today)\b/i,
    ],
    "Transit": [
      /\b(transit|gochara|current position|sky coordinate|planet.*movement|saturn transit|jupiter transit)\b/i,
    ],
    "Compatibility": [
      /\b(compatibility|gunamilan|koota|synastry|love match|relationship score|matching|compare charts)\b/i,
    ],
    "General Horoscope": [
      /\b(horoscope|chart|kundli|birth|general|overview|life|future|placement|dasha|planetary strength)\b/i,
    ],
  };

  /**
   * Classifies a user query text into an AstrologicalIntent.
   * Defaults to "General Horoscope" if no rule matches.
   */
  public static classify(query: string): AstrologicalIntent {
    const trimmed = query.trim();
    if (!trimmed) {
      return "General Horoscope";
    }

    // Direct check for common trigger patterns
    for (const [intent, regexes] of Object.entries(this.rules)) {
      for (const regex of regexes) {
        if (regex.test(trimmed)) {
          return intent as AstrologicalIntent;
        }
      }
    }

    return "General Horoscope";
  }
}
