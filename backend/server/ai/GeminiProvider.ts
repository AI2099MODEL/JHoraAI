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

    const requestedModel = options.model || "gemini-3-flash";

    try {
      const response = await ai.models.generateContent({
        model: requestedModel,
        contents: contents,
        config: {
          systemInstruction: options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astrological calculations but never perform them yourself. Always respond clearly.",
        },
      });

      return { text: response.text || "" };
    } catch (e: any) {
      const errMsg = (e.message || "").toLowerCase();
      const isQuotaError = e.status === 429 || errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exceeded") || errMsg.includes("429") || errMsg.includes("resource");
      
      if (isQuotaError && requestedModel !== "gemini-2.5-flash-lite") {
        console.warn(`Gemini quota exceeded for model ${requestedModel}. Falling back to gemini-2.5-flash-lite...`);
        try {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: contents,
            config: {
              systemInstruction: options.systemInstruction || "You are JHoraAI, a premium AI workspace assistant for professional astrologers. You reason over astrological calculations but never perform them yourself. Always respond clearly.",
            },
          });
          return { text: response.text || "" };
        } catch (fallbackErr: any) {
          console.warn("Gemini fallback to gemini-2.5-flash-lite failed:", fallbackErr.message || fallbackErr);
          throw fallbackErr;
        }
      }
      throw e;
    }
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const ai = this.getClient(options.apiKey);
    const contents = options.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const requestedModel = options.model || "gemini-3-flash";

    try {
      const responseStream = await ai.models.generateContentStream({
        model: requestedModel,
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
    } catch (e: any) {
      const errMsg = (e.message || "").toLowerCase();
      const isQuotaError = e.status === 429 || errMsg.includes("quota") || errMsg.includes("limit") || errMsg.includes("exceeded") || errMsg.includes("429") || errMsg.includes("resource");
      
      if (isQuotaError && requestedModel !== "gemini-2.5-flash-lite") {
        console.warn(`Gemini quota exceeded for stream with ${requestedModel}. Falling back to gemini-2.5-flash-lite stream...`);
        try {
          const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-lite",
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
          return;
        } catch (fallbackErr: any) {
          console.warn("Gemini stream fallback to gemini-2.5-flash-lite failed:", fallbackErr.message || fallbackErr);
          throw fallbackErr;
        }
      }
      throw e;
    }
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    try {
      const ai = this.getClient(apiKey);
      const res = await ai.models.generateContent({
        model: "gemini-3-flash",
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
      try {
        const ai = this.getClient(apiKey);
        const res = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite",
          contents: "ping",
          config: {
            maxOutputTokens: 5,
          },
        });
        if (res.text) {
          return { status: "available", message: "Gemini connection is active (via Lite fallback)." };
        }
      } catch (innerE) {
        // Ignored
      }
      return { status: "unavailable", message: e.message || "Failed to connect to Gemini." };
    }
  }

  async models(apiKey?: string): Promise<string[]> {
    return [
      "gemini-3-flash",
      "gemini-2.5-flash-lite"
    ];
  }
}
