import { useState } from "react";
import type { UserDecision } from "../api/types";
import { useSession } from "../context/SessionContext";

const options: UserDecision[] = ["Treat", "Not Treat"];

export function AssessmentStep() {
  const { submitAssessment, predictError, setStep } = useSession();
  const [choice, setChoice] = useState<UserDecision>("Treat");
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setBusy(true);
    try {
      await submitAssessment(choice);
    } catch {
      /* predictError set in context */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Your initial assessment</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Before seeing the AI recommendation, record your clinical judgment.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
        <p className="mb-3 text-sm font-medium text-slate-800 dark:text-slate-200">
          Treatment recommendation
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setChoice(o)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                choice === o
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      {predictError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          {predictError}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep("patient")}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-300"
        >
          Back
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onSubmit}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
        >
          {busy ? "Submitting…" : "Submit & reveal AI"}
        </button>
      </div>
    </div>
  );
}
