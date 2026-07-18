export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  pipeline?: {
    intent: {
      primary: string;
      confidence: number;
      secondary?: string;
      keywordsDetected: string[];
    };
    context: {
      intent: string;
      currentModule: string;
      selectedChart: string;
      birthProfile: any;
      currentTransit: any;
      activeSystems: string[];
      requestedDomain: string;
      conversationHistory: { role: "user" | "assistant"; content: string }[];
    };
    knowledge: {
      id: string;
      title: string;
      description: string;
      category: string;
    }[];
    evidence: {
      primaryFactors: { factor: string; description: string; source: string }[];
      secondaryFactors: { factor: string; description: string; source: string }[];
      supportingFactors: { factor: string; description: string; source: string }[];
      conflictingFactors: { factor: string; description: string; source: string }[];
      missingFactors: { factor: string; details: string }[];
    };
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  provider: 'openai' | 'gemini' | 'claude';
}
