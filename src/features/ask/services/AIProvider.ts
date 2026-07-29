import { Message } from "../models/Conversation";

export interface ChatOptions {
  messages: Message[];
  model?: string;
  apiKey?: string;
  systemInstruction?: string;
  stream?: boolean;
}

export interface AIProvider {
  chat(options: ChatOptions): Promise<string>;
  stream(options: ChatOptions, onChunk: (text: string) => void, abortSignal?: AbortSignal): Promise<void>;
  health(apiKey?: string): Promise<{ status: "available" | "unavailable"; message: string }>;
  models(apiKey?: string): Promise<string[]>;
}
