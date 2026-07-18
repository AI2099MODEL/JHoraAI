import { useState, useEffect, useRef } from "react";
import { Conversation, Message } from "../models/Conversation";
import { BirthProfile } from "../models/BirthProfile";
import { ConversationService, Preferences } from "../services/ConversationService";

export function useConversation() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [preferences, setPreferences] = useState<Preferences>(ConversationService.getPreferences());
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Partial<BirthProfile> | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const list = ConversationService.getConversations();
    setConversations(list);
    if (list.length > 0) {
      setActiveConversation(list[0]);
    }
  }, []);

  const updatePreferences = (newPrefs: Preferences) => {
    ConversationService.savePreferences(newPrefs);
    setPreferences(newPrefs);
  };

  const detectProfileIntent = (text: string) => {
    const lower = text.toLowerCase();
    const triggers = ["born", "dob", "birth", "was born", "birthdate", "birthday"];
    const hasTrigger = triggers.some((t) => lower.includes(t));
    if (!hasTrigger) return null;

    // 1. Date extraction
    let date = "";
    const dateMatch = text.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/) || text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dateMatch) {
      if (dateMatch[1].length === 4) {
        date = `${dateMatch[1]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[3].padStart(2, "0")}`;
      } else {
        date = `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`;
      }
    } else {
      const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      for (let i = 0; i < months.length; i++) {
        const idx = lower.indexOf(months[i]);
        if (idx !== -1) {
          const yearMatch = text.slice(idx).match(/\b(19\d{2}|20[0-2]\d)\b/);
          const dayMatch = text.slice(idx).match(/\b([1-9]|[12]\d|3[01])\b/);
          if (yearMatch && dayMatch) {
            date = `${yearMatch[1]}-${String(i + 1).padStart(2, "0")}-${dayMatch[1].padStart(2, "0")}`;
            break;
          }
        }
      }
    }

    // 2. Time extraction
    let time = "";
    const timeMatch = text.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?\b/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3];
      if (ampm) {
        if (ampm.toLowerCase() === "pm" && hours < 12) hours += 12;
        if (ampm.toLowerCase() === "am" && hours === 12) hours = 0;
      }
      time = `${String(hours).padStart(2, "0")}:${minutes}`;
    }

    // 3. Gender extraction
    let gender: "male" | "female" | "other" | "" = "";
    if (lower.includes("female") || lower.includes("woman") || lower.includes("girl") || lower.includes("spouse") || lower.includes("wife")) {
      gender = "female";
    } else if (lower.includes("male") || lower.includes("man") || lower.includes("boy") || lower.includes("husband")) {
      gender = "male";
    }

    // 4. Place extraction
    let place = "";
    const placeMatch = text.match(/born in\s+([A-Za-z\s,]+)/i) || text.match(/born at\s+([A-Za-z\s,]+)/i) || text.match(/place:\s*([A-Za-z\s,]+)/i);
    if (placeMatch) {
      place = placeMatch[1].trim();
    }

    return {
      name: "",
      date,
      time,
      place,
      gender,
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "Asia/Kolkata",
      type: "personal" as const,
    };
  };

  const selectConversation = (conv: Conversation | null) => {
    setActiveConversation(conv);
    setPendingProfile(null);
  };

  const startNewConversation = () => {
    const conv = ConversationService.createConversation(preferences.preferredProvider);
    setConversations(ConversationService.getConversations());
    setActiveConversation(conv);
    setPendingProfile(null);
    return conv;
  };

  const deleteConversation = (id: string) => {
    ConversationService.deleteConversation(id);
    const list = ConversationService.getConversations();
    setConversations(list);
    if (activeConversation?.id === id) {
      if (list.length > 0) {
        setActiveConversation(list[0]);
      } else {
        setActiveConversation(null);
      }
    }
  };

  const abortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const runStellarPipeline = async (
    userText: string,
    profileToUse: BirthProfile | null,
    assistantMsgId: string,
    currentConversation: Conversation,
    precedingMessages: Message[]
  ) => {
    let finalMessages = [...precedingMessages, {
      id: assistantMsgId,
      role: "assistant",
      content: "Initializing Consultation...",
      timestamp: new Date().toISOString()
    } as Message];

    setActiveConversation({
      ...currentConversation,
      messages: finalMessages,
    });

    let horoscopeData: any = null;
    const savedChartStr = localStorage.getItem("jhora_astrology_data");
    if (savedChartStr) {
      try {
        horoscopeData = JSON.parse(savedChartStr);
      } catch (e) {
        console.error("Failed to parse local JHora astrology data", e);
      }
    }

    const provider = preferences.preferredProvider;
    const model = preferences.preferredModels[provider];
    const apiKey = provider === "gemini" ? preferences.geminiApiKey : (provider === "openai" ? preferences.openaiApiKey : preferences.claudeApiKey);

    try {
      const response = await fetch("/api/ai/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText,
          profile: profileToUse,
          horoscopeData,
          precedingMessages,
          provider,
          model,
          apiKey
        }),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed to generate response." }));
        throw new Error(err.error || "Failed to generate consultation response.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No readable stream in response.");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";
      let pipelineData: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (!cleanedLine) continue;
          if (cleanedLine === "data: [DONE]") continue;

          if (cleanedLine.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(cleanedLine.slice(6));
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.pipeline) {
                pipelineData = parsed.pipeline;
              }
              if (parsed.text !== undefined) {
                accumulatedText += parsed.text;
              }

              // Update state on each chunk!
              finalMessages = finalMessages.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: accumulatedText || "Generating...",
                      pipeline: pipelineData || m.pipeline
                    }
                  : m
              );

              setActiveConversation({
                ...currentConversation,
                messages: finalMessages,
              });
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      setIsGenerating(false);
      ConversationService.updateConversationMessages(currentConversation.id, finalMessages);
      setConversations(ConversationService.getConversations());
      abortControllerRef.current = null;

    } catch (err: any) {
      if (abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false);
        return;
      }
      
      console.error("LLM Consultation Streaming Error:", err);
      let errorText = "The consultation engine encountered an issue while streaming. Please check your API key in Settings or try again.";
      if (err.message && (err.message.includes("API_KEY") || err.message.includes("apiKey") || err.message.includes("key"))) {
        errorText = "Invalid or missing API Key. Please click on the Settings gear icon in the top left of the consultation pane to configure JHoraAI Pro.";
      }

      finalMessages = finalMessages.map((m) =>
        m.id === assistantMsgId
          ? {
              ...m,
              content: errorText,
            }
          : m
      );

      setActiveConversation({
        ...currentConversation,
        messages: finalMessages,
      });

      setIsGenerating(false);
      ConversationService.updateConversationMessages(currentConversation.id, finalMessages);
      setConversations(ConversationService.getConversations());
      abortControllerRef.current = null;
    }
  };

  const sendMessage = async (userText: string, activeProfile?: BirthProfile | null) => {
    if (!userText.trim()) return;

    let conv = activeConversation;
    if (!conv) {
      conv = startNewConversation();
    }

    const userMessage: Message = {
      id: "msg_" + Math.random().toString(36).substring(2, 11),
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...conv.messages, userMessage];
    const updatedConv = ConversationService.updateConversationMessages(conv.id, updatedMessages);
    if (updatedConv) {
      setActiveConversation(updatedConv);
      setConversations(ConversationService.getConversations());
    }

    // Scan for Birth Profile intention
    const detected = detectProfileIntent(userText);
    if (detected) {
      setPendingProfile(detected);
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = "msg_" + Math.random().toString(36).substring(2, 11);

    await runStellarPipeline(userText, activeProfile || null, assistantMsgId, updatedConv || conv, updatedMessages);
  };

  const retryLastMessage = async () => {
    if (!activeConversation || activeConversation.messages.length === 0 || isGenerating) return;

    // Find the last user message
    const messages = [...activeConversation.messages];
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;

    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];

    // Truncate everything after the last user message
    const truncatedMessages = messages.slice(0, actualIdx + 1);
    
    // Update active conversation locally first
    setActiveConversation({
      ...activeConversation,
      messages: truncatedMessages,
    });

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const assistantMsgId = "msg_" + Math.random().toString(36).substring(2, 11);

    // Get activeProfile from first birth profile
    const loadedProfiles = ConversationService.getBirthProfiles();
    const activeProfile = loadedProfiles.length > 0 ? loadedProfiles[0] : null;

    await runStellarPipeline(lastUserMsg.content, activeProfile, assistantMsgId, activeConversation, truncatedMessages);
  };

  const confirmPendingProfile = (profile: BirthProfile) => {
    ConversationService.addBirthProfile(profile);
    setPendingProfile(null);
  };

  const cancelPendingProfile = () => {
    setPendingProfile(null);
  };

  return {
    conversations,
    activeConversation,
    preferences,
    isGenerating,
    pendingProfile,
    updatePreferences,
    selectConversation,
    startNewConversation,
    deleteConversation,
    sendMessage,
    retryLastMessage,
    abortGeneration,
    confirmPendingProfile,
    cancelPendingProfile,
    setPendingProfile,
  };
}
