import { BirthProfile } from "./BirthProfile";

export interface ContextPackage {
  intent: string;
  currentModule: string; // e.g. "Horoscope", "Dasha", "KP", "Western", "Compatibility"
  selectedChart: string; // e.g. "D1 Natal Chart", "D9 Navamsha", "Transit Chart"
  birthProfile: BirthProfile | null;
  currentTransit: {
    timestamp: string;
    coordinates: Record<string, { sign: string; degree: number; house: number }>;
  } | null;
  activeSystems: string[]; // e.g. ["JHora", "KP", "Western", "Jaimini"]
  requestedDomain: string; // e.g. "Career", "Marriage", "Finance", etc.
  conversationHistory: { role: "user" | "assistant"; content: string }[];
}
