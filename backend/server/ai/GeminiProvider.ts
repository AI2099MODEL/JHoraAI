import { GoogleGenAI } from "@google/genai";
import { AIProvider, ChatOptions } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private getClient(apiKey?: string): GoogleGenAI {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY or provide one in Settings.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  async chat(options: ChatOptions): Promise<{ text: string }> {
    const ai = this.getClient(options.apiKey);
    const contents = options.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: options.model || "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astrological calculations but never perform them yourself. Always respond clearly.",
      },
    });

    return { text: response.text || "" };
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const ai = this.getClient(options.apiKey);
    const contents = options.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const responseStream = await ai.models.generateContentStream({
      model: options.model || "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astrological calculations but never perform them yourself. Always respond clearly.",
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      const ai = this.getClient(apiKey);
      // Simple ping call
      const res = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "ping",
        config: {
          maxOutputTokens: 5,
        },
      });
      if (res.text) {
        return { status: "available", message: "Gemini connection is active." };
      }
      return { status: "unavailable", message: "Empty response from Gemini." };
    } catch (e: any) {
      return { status: "unavailable", message: e.message || "Failed to connect to Gemini." };
    }
  }

  async models(apiKey?: string): Promise<string[]> {
    return [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite"
    ];
  }
}
