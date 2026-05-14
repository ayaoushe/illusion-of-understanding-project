import { useCallback } from "react";
import { Send } from "lucide-react";
import { SuggestionChips } from "./SuggestionChips";

interface ComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled?: boolean;
  onChipSelect: (text: string) => void;
}

export function Composer({
  value,
  onChange,
  onSend,
  disabled,
  onChipSelect,
}: ComposerProps) {
  const send = useCallback(() => {
    if (!value.trim() || disabled) return;
    onSend();
  }, [value, disabled, onSend]);

  return (
    <div className="shrink-0 border-t border-slate-200/80 bg-slate-50/90 px-3 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto max-w-3xl space-y-2">
        <SuggestionChips onSelect={onChipSelect} disabled={disabled} />
        <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/30 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            disabled={disabled}
            placeholder="Ask about prediction, patient factors, confidence..."
            className="h-12 w-full rounded-2xl bg-transparent py-3 pl-4 pr-14 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={send}
            disabled={disabled || !value.trim()}
            className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
