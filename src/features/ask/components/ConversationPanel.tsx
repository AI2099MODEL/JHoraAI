import React, { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Copy, RefreshCw, Square, ArrowUp, AlertCircle, HelpCircle, Download } from "lucide-react";
import { Conversation, Message } from "../models/Conversation";
import { BirthProfile } from "../models/BirthProfile";
import { GreetingCard } from "./GreetingCard";
import { QuickQuestions } from "./QuickQuestions";
import { BirthProfileCard } from "./BirthProfileCard";
import { ReasoningPipeline } from "./ReasoningPipeline";

interface ConversationPanelProps {
  conversation: Conversation | null;
  isGenerating: boolean;
  pendingProfile: Partial<BirthProfile> | null;
  developerMode: boolean;
  exportConversation: () => void;
  onSendMessage: (text: string) => void;
  onRetry: () => void;
  onStop: () => void;
  onConfirmProfile: (profile: BirthProfile) => void;
  onCancelProfile: () => void;
}

// Custom parser to render Markdown, tables, lists, and code blocks elegantly
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return <span className="animate-pulse">Thinking...</span>;

  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let inCodeBlock = false;
  let codeContent = "";

  const renderTable = (rows: string[][], index: number) => {
    if (rows.length === 0) return null;
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(r => r.some(cell => cell.trim().startsWith("---") === false));

    return (
      <div key={`table-${index}`} className="my-4 overflow-x-auto border border-slate-200/80 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-xs font-sans">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              {headers.map((cell, cIdx) => (
                <th key={cIdx} className="px-4 py-2.5">
                  {cell.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/50">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2">
                    {cell.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code Block toggle
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        const capturedCode = codeContent;
        renderedElements.push(
          <div key={`code-${i}`} className="my-3 font-mono text-xs bg-slate-50 border border-slate-200 p-3.5 rounded-xl relative group overflow-x-auto text-slate-800">
            <button
              onClick={() => navigator.clipboard.writeText(capturedCode)}
              className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-500 transition-all cursor-pointer"
              title="Copy snippet"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <pre>{capturedCode}</pre>
          </div>
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // 2. Table handling
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const cells = line
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      if (inTable) {
        renderedElements.push(renderTable(tableRows, i));
        tableRows = [];
        inTable = false;
      }
    }

    // 3. Headers
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h4 key={i} className="text-sm font-bold text-slate-800 mt-4 mb-2 font-sans">
          {line.slice(4)}
        </h4>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      renderedElements.push(
        <h3 key={i} className="text-base font-bold text-slate-900 mt-5 mb-2.5 font-sans border-b border-slate-100 pb-1">
          {line.slice(3)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      renderedElements.push(
        <h2 key={i} className="text-lg font-extrabold text-slate-900 mt-6 mb-3 font-sans">
          {line.slice(2)}
        </h2>
      );
      continue;
    }

    // 4. Lists
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      renderedElements.push(
        <li key={i} className="ml-4 list-disc text-slate-600 text-xs py-0.5 leading-relaxed font-sans">
          {line.trim().slice(2)}
        </li>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        renderedElements.push(
          <li key={i} className="ml-4 list-decimal text-slate-600 text-xs py-0.5 leading-relaxed font-sans">
            {match[2]}
          </li>
        );
        continue;
      }
    }

    // 5. Standard line
    if (line.trim()) {
      renderedElements.push(
        <p key={i} className="text-xs text-slate-600 leading-relaxed py-1.5 font-sans">
          {line}
        </p>
      );
    }
  }

  // Handle trailing table if text ends in a table
  if (inTable && tableRows.length > 0) {
    renderedElements.push(renderTable(tableRows, lines.length));
  }

  return <div className="space-y-1">{renderedElements}</div>;
};

export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  conversation,
  isGenerating,
  pendingProfile,
  developerMode,
  exportConversation,
  onSendMessage,
  onRetry,
  onStop,
  onConfirmProfile,
  onCancelProfile,
}) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom during stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, isGenerating, pendingProfile]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const messages = conversation?.messages || [];
  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative font-sans overflow-hidden">
      {/* Scrollable messages container */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto py-8">
            <GreetingCard userName="Professional Astrologer" />
            <QuickQuestions
              onSelectQuestion={(q) => onSendMessage(q)}
              disabled={isGenerating}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-24">
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id || index}
                  className={`flex gap-3 md:gap-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Left Avatar for Assistant */}
                  {!isUser && (
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble content */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 border text-left ${
                      isUser
                        ? "bg-slate-50 border-slate-200 text-slate-800"
                        : "bg-white border-transparent text-slate-700"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{msg.content}</p>
                    ) : (
                      <div className="w-full">
                        {developerMode && msg.pipeline && (
                          <ReasoningPipeline
                            intent={msg.pipeline.intent}
                            context={msg.pipeline.context}
                            knowledge={msg.pipeline.knowledge}
                            evidence={msg.pipeline.evidence}
                            query={messages[index - 1]?.content || ""}
                          />
                        )}
                        <FormattedMessage content={msg.content} />

                        {/* Action triggers bottom bar */}
                        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100/60 text-[10px] text-slate-400">
                          <button
                            onClick={() => handleCopyMessage(msg.content)}
                            className="flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                          {index === messages.length - 1 && (
                            <button
                              onClick={onRetry}
                              className="flex items-center gap-1 hover:text-slate-600 transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Avatar for User */}
                  {isUser && (
                    <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      Me
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render inline BirthProfileCard when detected */}
            {pendingProfile && (
              <div className="flex justify-start pl-12">
                <BirthProfileCard
                  initialData={pendingProfile}
                  onConfirm={onConfirmProfile}
                  onCancel={onCancelProfile}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed bottom controls and entry */}
      <div className="border-t border-slate-100 px-4 md:px-8 py-4 bg-white/95 backdrop-blur-md relative">
        <div className="max-w-3xl mx-auto relative">
          {/* Stop generating floating button */}
          {isGenerating && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30">
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-full text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Generation</span>
              </button>
            </div>
          )}

          {/* Prompt Form entry container */}
          <form onSubmit={handleSend} className="relative bg-slate-50 border border-slate-200 rounded-2xl p-1.5 pr-2 focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all flex items-end">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Query placements or type 'My DOB is 1995-10-15 08:30 in Delhi'..."
              className="flex-1 px-3.5 py-2.5 resize-none h-[42px] max-h-36 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-xs font-medium leading-relaxed font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`p-2 rounded-xl text-white transition-all cursor-pointer ${
                !inputText.trim() || isGenerating
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm"
              }`}
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Model info label footer */}
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-slate-400" />
              AI JHoraAI reasons over calculation engine data.
            </span>
            <span className="font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {conversation?.provider || "Gemini"} Workspace
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
