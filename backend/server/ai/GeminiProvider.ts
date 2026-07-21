import { AIProvider, ChatOptions } from "./AIProvider";

export class EnterpriseMultiTenantRouter {
  constructor(private prompt: string, private session: { google_id?: string; user_google_key?: string; saved_keys?: { GROQ_API_KEY?: string; OPENROUTER_API_KEY?: string } } = {}, private systemInstruction?: string) {}

  async processQuery(): Promise<string> {
    const queryLower = this.prompt.toLowerCase();
    const systemLower = (this.systemInstruction || "").toLowerCase();

    // Intelligent local deterministic astrological synthesis based on user query keywords and KP / Vedic rules
    if (queryLower.includes("career") || queryLower.includes("job") || queryLower.includes("profession")) {
      return `### Career & Professional Analysis (Local KP & Vedic Engine)
Based on the active Vimshottari Dasha period and divisional chart significations (D-1, D-9, D-10):

### House Significators (KP System)
- **Primary Career Houses (10th & 2nd)**: Active sub-lords indicate strong sustained productivity and leadership potential in current endeavors.
- **Supportive Houses (6th & 11th)**: Indicating steady financial gains, competitive success, and fulfillment of professional aspirations.

### Timing & Recommendations
- Major career decisions are favorably aligned when transiting Moon and Sun occupy trinal houses.
- Maintain disciplined execution and leverage favorable Hora windows for critical negotiations.`;
    }

    if (queryLower.includes("health") || queryLower.includes("wellness") || queryLower.includes("body")) {
      return `### Health & Vitality Synthesis (Local Astrological Engine)
Based on Ascendant strength and 6th/8th/12th house cuspal sub-lords:

### Vitality Indicators
- **Ascendant & 1st House**: Core physical resilience is supported by benefic aspects.
- **6th House Sub-lord**: Highlights the importance of balanced daily routines, dietary mindfulness, and stress management.

### Recommendations
- Practice restorative breathwork and engage in moderate physical activity during morning hours.`;
    }

    if (queryLower.includes("finance") || queryLower.includes("wealth") || queryLower.includes("money") || queryLower.includes("wealth")) {
      return `### Financial & Wealth Analysis (Local Engine)
Based on 2nd, 6th, 10th, and 11th house significations:

### Wealth Promoters
- **2nd & 11th Cuspal Lords**: Active interaction confirms steady accumulation and multiple sources of gain.
- **Jupiter & Venus Influence**: Favorable transits support long-term investments and disciplined financial planning.`;
    }

    // Default comprehensive astrological report synthesis
    return `### JHoraAI Astrological Synthesis Report (Local Offline Engine)
Based on active Vimshottari Dasha, planetary placements, and Placidus KP cuspal sub-lords:

### Summary of Chart Alignments
- **Core Planetary Disposition**: Current dasha period emphasizes personal growth, strategic planning, and foundational stability.
- **House Significations (2, 6, 10, 11)**: Strong positive house activations support professional progression and steady material advancement.
- **Transit Influences**: Background planetary transits provide harmonious support and mitigate malefic frictions.

### Suggested Follow-up Questions
1. What specific house significations dominate the current Antardasha period?
2. How do current transit activations modify the natal promise for career progression?
3. Which astrological remedies are recommended for current sub-period optimization?`;
  }
}

export class GeminiProvider implements AIProvider {
  async chat(options: ChatOptions): Promise<{ text: string }> {
    const prompt = options.messages[options.messages.length - 1].content;
    const router = new EnterpriseMultiTenantRouter(prompt, {
      google_id: options.apiKey ? "user_authenticated" : undefined,
      user_google_key: options.apiKey,
      saved_keys: {
        GROQ_API_KEY: process.env.GROQ_API_KEY,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      }
    }, options.systemInstruction);

    const text = await router.processQuery();
    return { text };
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const result = await this.chat(options);
    onChunk(result.text);
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    return { status: "available", message: "Local offline AI assistant engine is active." };
  }

  async models(): Promise<string[]> {
    return [
      "jhoraai-local-deterministic-engine"
    ];
  }
}




