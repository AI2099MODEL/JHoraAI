import React from "react";
import { MessageSquare, Plus, Trash2, Calendar } from "lucide-react";
import { Conversation } from "../models/Conversation";

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
}) => {
  return (
    <div className="font-sans">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Investigations
        </span>
        <button
          onClick={onNew}
          className="p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
          title="New Investigation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-6 px-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-sans">No previous sessions</p>
          <button
            onClick={onNew}
            className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Start one now
          </button>
        </div>
      ) : (
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {conversations.map((conv) => {
            const isActive = conv.id === activeId;
            const dateStr = new Date(conv.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });

            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between p-2 rounded-xl transition-all border cursor-pointer text-left ${
                  isActive
                    ? "bg-blue-50/70 border-blue-100 text-blue-800"
                    : "bg-white border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
                onClick={() => onSelect(conv)}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-500" : "text-slate-400"}`} />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">{conv.title}</p>
                    <span className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {dateStr}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                  title="Delete Conversation"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
