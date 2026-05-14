import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Stethoscope, User } from "lucide-react";
import type { Role } from "../types";

const COLLAPSE_LEN = 360;

interface MessageBubbleProps {
  role: Role;
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const long = !isUser && content.length > COLLAPSE_LEN;
  const shown = long && !expanded ? `${content.slice(0, COLLAPSE_LEN).trim()}…` : content;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className={`flex w-full animate-fadeSlideIn gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/90 to-violet-600/90 text-white shadow-md shadow-indigo-500/20">
          <Stethoscope className="h-4 w-4" aria-hidden />
        </div>
      )}
      <div
        className={`group relative max-w-[min(85%,42rem)] rounded-2xl py-3 pl-4 pr-10 text-sm leading-relaxed shadow-md ${
          isUser
            ? "bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-indigo-500/25"
            : "border border-slate-200/80 bg-white/95 text-slate-800 shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-black/30"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{shown}</p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={`mt-2 flex items-center gap-1 text-xs font-medium ${
              isUser ? "text-indigo-100 hover:text-white" : "text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            }`}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Show more
              </>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={copy}
          className={`absolute right-2 top-2 rounded-lg p-1.5 opacity-0 transition group-hover:opacity-100 focus:opacity-100 ${
            isUser
              ? "text-indigo-100 hover:bg-white/10"
              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Copy message"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <User className="h-4 w-4" aria-hidden />
        </div>
      )}
    </div>
  );
}
