export function TypingIndicator() {
  return (
    <div
      className="inline-flex max-w-[85%] items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-md shadow-slate-200/40 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-black/20"
      aria-label="Assistant is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500"
          style={{
            animation: `typingDot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
