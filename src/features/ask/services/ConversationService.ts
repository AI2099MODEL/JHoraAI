import { Conversation, Message } from "../models/Conversation";
import { BirthProfile } from "../models/BirthProfile";

export interface Preferences {
  preferredProvider: "openai" | "gemini" | "claude";
  openaiApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  preferredModels: {
    openai?: string;
    gemini?: string;
    claude?: string;
  };
  language: string;
  lastOpenChartId?: string;
}

const DEFAULT_PREFERENCES: Preferences = {
  preferredProvider: "gemini",
  preferredModels: {
    gemini: "gemini-3.6-flash",
    openai: "gpt-4o-mini",
    claude: "claude-3-5-sonnet-latest"
  },
  language: "en"
};

export class ConversationService {
  // --- Conversations ---
  static getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem("jhora_ai_conversations");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to load conversations from local storage:", e);
      return [];
    }
  }

  static saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem("jhora_ai_conversations", JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to local storage:", e);
    }
  }

  static getConversationById(id: string): Conversation | undefined {
    return this.getConversations().find((c) => c.id === id);
  }

  static createConversation(provider: "openai" | "gemini" | "claude", title?: string): Conversation {
    const conversations = this.getConversations();
    const newConv: Conversation = {
      id: "conv_" + Math.random().toString(36).substring(2, 11),
      title: title || "New Investigation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider,
    };
    conversations.unshift(newConv);
    this.saveConversations(conversations);
    return newConv;
  }

  static updateConversationMessages(id: string, messages: Message[]): Conversation | undefined {
    const conversations = this.getConversations();
    const index = conversations.findIndex((c) => c.id === id);
    if (index !== -1) {
      conversations[index].messages = messages;
      conversations[index].updatedAt = new Date().toISOString();
      
      // Auto-generate title if it was default
      if (conversations[index].title === "New Investigation" && messages.length > 0) {
        const firstUserMsg = messages.find((m) => m.role === "user");
        if (firstUserMsg) {
          const content = firstUserMsg.content;
          conversations[index].title = content.length > 30 ? content.slice(0, 30) + "..." : content;
        }
      }

      this.saveConversations(conversations);
      return conversations[index];
    }
    return undefined;
  }

  static deleteConversation(id: string): void {
    const conversations = this.getConversations().filter((c) => c.id !== id);
    this.saveConversations(conversations);
  }

  // --- Birth Profiles ---
  static getBirthProfiles(): BirthProfile[] {
    try {
      const data = localStorage.getItem("jhora_ai_birth_profiles");
      if (data) {
        return JSON.parse(data);
      }
      // Return a set of default placeholder profiles for an elegant starting experience
      const defaults: BirthProfile[] = [
        {
          id: "prof_1",
          name: "Amit Sharma (Self)",
          date: "1990-05-15",
          time: "08:45",
          place: "New Delhi, India",
          latitude: 28.6139,
          longitude: 77.209,
          timezone: "Asia/Kolkata",
          gender: "male",
          type: "personal",
        },
        {
          id: "prof_2",
          name: "Sanya Sharma (Spouse)",
          date: "1992-09-21",
          time: "14:30",
          place: "Mumbai, India",
          latitude: 19.076,
          longitude: 72.8777,
          timezone: "Asia/Kolkata",
          gender: "female",
          type: "family",
        },
      ];
      this.saveBirthProfiles(defaults);
      return defaults;
    } catch (e) {
      console.error("Failed to load birth profiles:", e);
      return [];
    }
  }

  static saveBirthProfiles(profiles: BirthProfile[]): void {
    try {
      localStorage.setItem("jhora_ai_birth_profiles", JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save birth profiles:", e);
    }
  }

  static addBirthProfile(profile: Omit<BirthProfile, "id">): BirthProfile {
    const profiles = this.getBirthProfiles();
    const newProfile: BirthProfile = {
      ...profile,
      id: "prof_" + Math.random().toString(36).substring(2, 11),
    };
    profiles.push(newProfile);
    this.saveBirthProfiles(profiles);
    return newProfile;
  }

  static updateBirthProfile(id: string, updated: Partial<BirthProfile>): BirthProfile | undefined {
    const profiles = this.getBirthProfiles();
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...updated };
      this.saveBirthProfiles(profiles);
      return profiles[idx];
    }
    return undefined;
  }

  static deleteBirthProfile(id: string): void {
    const profiles = this.getBirthProfiles().filter((p) => p.id !== id);
    this.saveBirthProfiles(profiles);
  }

  // --- Preferences ---
  static getPreferences(): Preferences {
    try {
      const data = localStorage.getItem("jhora_ai_preferences");
      if (data) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
      }
      return DEFAULT_PREFERENCES;
    } catch (e) {
      console.error("Failed to load preferences:", e);
      return DEFAULT_PREFERENCES;
    }
  }

  static savePreferences(preferences: Preferences): void {
    try {
      localStorage.setItem("jhora_ai_preferences", JSON.stringify(preferences));
    } catch (e) {
      console.error("Failed to save preferences:", e);
    }
  }
}
