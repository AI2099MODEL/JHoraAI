import { ContextPackage } from "../models/ContextPackage";
import { BirthProfile } from "../models/BirthProfile";
import { Message } from "../models/Conversation";
import { IntentEngine } from "../intent/IntentEngine";

export interface ContextBuilderOptions {
  query: string;
  birthProfile: BirthProfile | null;
  currentModule?: string;
  selectedChart?: string;
  currentTransit?: ContextPackage["currentTransit"];
  activeSystems?: string[];
  conversationHistory?: Message[];
}

export class ContextBuilder {
  /**
   * Constructs the full, standardized ContextPackage from various runtime subsystems
   */
  public static build(options: ContextBuilderOptions): ContextPackage {
    const {
      query,
      birthProfile,
      currentModule = "Horoscope",
      selectedChart = "D1 Natal Chart",
      currentTransit = null,
      activeSystems = ["JHora", "KP", "Western", "Jaimini"],
      conversationHistory = []
    } = options;

    const analysis = IntentEngine.analyze(query);

    return {
      intent: analysis.primary,
      currentModule,
      selectedChart,
      birthProfile,
      currentTransit,
      activeSystems,
      requestedDomain: analysis.primary,
      conversationHistory: conversationHistory.map(m => ({
        role: m.role,
        content: m.content
      }))
    };
  }
}
