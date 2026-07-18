import { AIProvider } from "./AIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { ClaudeProvider } from "./ClaudeProvider";

export class ProviderFactory {
  static getProvider(providerName: string): AIProvider {
    const name = providerName.toLowerCase();
    switch (name) {
      case "gemini":
        return new GeminiProvider();
      case "openai":
        return new OpenAIProvider();
      case "claude":
        return new ClaudeProvider();
      default:
        throw new Error(`Unsupported AI Provider: ${providerName}`);
    }
  }
}
