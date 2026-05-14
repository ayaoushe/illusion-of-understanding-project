import { useCallback, useState } from "react";
import { MessageCircle, PanelRightClose, PanelRightOpen } from "lucide-react";
import { postChat } from "../api/client";
import { useSession } from "../context/SessionContext";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

let mid = 0;
function nextId() {
  mid += 1;
  return `m-${mid}`;
}

interface ChatPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function ChatPanel({ collapsed, onToggleCollapse }: ChatPanelProps) {
  const { patient, prediction, chatMessages, appendChatMessage } = useSession();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!prediction) return;
    setInput("");
    appendChatMessage({ id: nextId(), role: "user", content: text });
    setLoading(true);
    try {
      const { reply } = await postChat(text, patient);
      appendChatMessage({ id: nextId(), role: "assistant", content: reply });
    } catch {
      appendChatMessage({
        id: nextId(),
        role: "assistant",
        content:
          "Could not reach the assistant API. Ensure the backend is running (see README).",
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, prediction, patient, appendChatMessage]);

  const onChip = useCallback((t: string) => setInput(t), []);

  if (!prediction) {
    return (
      <aside className="hidden h-12 w-full shrink-0 flex-row items-center justify-center border-t border-slate-200/80 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-950/90 md:flex md:h-auto md:w-14 md:flex-col md:border-l md:border-t-0 md:py-3">
        <MessageCircle className="h-5 w-5 text-slate-400" aria-label="Chat unlocks after AI results" />
      </aside>
    );
  }

  if (collapsed) {
    return (
      <aside className="flex h-12 w-full shrink-0 flex-row items-center justify-center gap-2 border-t border-slate-200/80 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/95 md:h-auto md:w-14 md:flex-col md:border-l md:border-t-0 md:py-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Open assistant"
        >
          <PanelRightOpen className="h-5 w-5" />
        </button>
        <MessageCircle className="mt-4 h-5 w-5 text-indigo-500" />
      </aside>
    );
  }

  return (
    <aside className="flex max-h-[42vh] w-full min-w-0 shrink-0 flex-col border-t border-slate-200/80 bg-slate-50/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-none md:max-h-none md:h-auto md:w-[min(100%,380px)] md:border-l md:border-t-0 md:shadow-[inset_1px_0_0_rgba(255,255,255,0.5)] lg:w-[400px]">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-3 py-2 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Assistant</span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200/80 dark:hover:bg-slate-800"
          title="Collapse panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <MessageList messages={chatMessages} loading={loading} />
      </div>
      <Composer
        value={input}
        onChange={setInput}
        onSend={send}
        disabled={loading}
        onChipSelect={onChip}
      />
      <div className="border-t border-slate-200/80 px-2 py-1.5 dark:border-slate-800">
        <p className="text-[10px] text-slate-500 dark:text-slate-500">
          Rule-based helper · same logic as the prior prototype
        </p>
      </div>
    </aside>
  );
}
