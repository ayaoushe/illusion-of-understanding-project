const CHIPS = [
  "Explain prediction",
  "Show key factors",
  "Treatment options",
] as const;

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({ onSelect, disabled }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {CHIPS.map((label) => (
        <button
          key={label}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(label)}
          className="rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-indigo-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-indigo-300 dark:hover:border-indigo-500/40 dark:hover:bg-slate-800"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
