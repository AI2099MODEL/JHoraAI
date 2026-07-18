import { AIProvider, ChatOptions } from "./AIProvider";

export class ClaudeProvider implements AIProvider {
  async chat(options: ChatOptions): Promise<{ text: string }> {
    return {
      text: "Claude Provider is currently in placeholder mode. Please configure your Claude credentials in a future release or use OpenAI / Gemini.",
    };
  }

  async stream(options: ChatOptions, onChunk: (text: string) => void): Promise<void> {
    const text = "Claude Provider is currently in placeholder mode. Streaming is simulated. [Claude Placeholder Output]";
    for (const char of text) {
      onChunk(char);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  async health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }> {
    return {
      status: "unavailable",
      message: "Claude Provider is in placeholder mode and currently unavailable.",
    };
  }

  async models(apiKey?: string): Promise<string[]> {
    return [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
    ];
  }
}
