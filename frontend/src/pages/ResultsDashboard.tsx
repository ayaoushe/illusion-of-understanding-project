import { AlertTriangle, Sparkles } from "lucide-react";
import { useSession } from "../context/SessionContext";
import { DEMO_MODE, SHOW_LEGACY, SHOW_NUDGE } from "../config";

export function ResultsDashboard() {
  const {
    prediction,
    patient,
    setStep,
    nudgeDismissed,
    setNudgeDismissed,
    uncertaintyAcknowledged,
    setUncertaintyAcknowledged,
    showComparison,
    setShowComparison,
    canAccessReflection,
    activeCase,
  } = useSession();

  const showNudge = SHOW_NUDGE && !!prediction && prediction.nudge.eligible && !nudgeDismissed;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">AI prediction</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Future projection (SA Level 3).
        </p>
      </div>

      {activeCase && (
        <div className="rounded-2xl border border-indigo-200/90 bg-indigo-50/70 p-6 shadow-md dark:border-indigo-900/50 dark:bg-indigo-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            AI recommendation
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            {activeCase.prediction}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            Confidence: {activeCase.confidence_percent}%
          </p>
        </div>
      )}

      {!prediction && !activeCase && (
        <p className="text-sm text-slate-500">
          Complete the assessment first.{" "}
          <button type="button" className="text-indigo-600 underline" onClick={() => setStep("assessment")}>
            Go to assessment
          </button>
        </p>
      )}

      {prediction && (
      <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
        Your decision: <strong>{prediction.user_decision}</strong>
      </div>
      )}

      {SHOW_LEGACY && prediction && (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-md dark:border-slate-700 dark:bg-slate-900/80">
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{prediction.success_percent}%</p>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            Treatment success probability
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 text-center shadow-md dark:border-slate-700 dark:bg-slate-900/80">
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{prediction.confidence_percent}%</p>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">Model confidence</p>
        </div>
      </div>
      )}

      {SHOW_NUDGE && prediction?.warnings.map((w) => (
        <div
          key={w}
          className={`flex gap-2 rounded-2xl border px-4 py-3 text-sm ${
            prediction.low_confidence
              ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
              : "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{w}</span>
        </div>
      ))}

      {SHOW_NUDGE && prediction?.requires_uncertainty_acknowledgment && (
        <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900/80">
          <input
            type="checkbox"
            checked={uncertaintyAcknowledged}
            onChange={(e) => setUncertaintyAcknowledged(e.target.checked)}
            className="mt-1 accent-indigo-600"
          />
          <span>I acknowledge this prediction&apos;s uncertainty</span>
        </label>
      )}

      {showNudge && (
        <div className="flex gap-2 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-50">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Critical thinking nudge</p>
            <p className="mt-1 text-amber-900/95 dark:text-amber-100/90">{prediction?.nudge.message}</p>
            <button
              type="button"
              onClick={() => setNudgeDismissed(true)}
              className="mt-2 text-xs font-medium text-amber-800 underline dark:text-amber-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {SHOW_LEGACY && (
      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 dark:border-slate-700 dark:bg-slate-900/80">
        <button
          type="button"
          onClick={() => setShowComparison(!showComparison)}
          className="text-sm font-semibold text-indigo-600 dark:text-indigo-400"
        >
          {showComparison ? "Hide" : "Show"} comparative analysis
        </button>
        {showComparison && prediction && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/60">
              <p className="font-semibold text-slate-800 dark:text-slate-200">Current patient</p>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Age {patient.age}, stage {patient.stage}, tumor {patient.tumor_size} cm
              </p>
              <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                Success: {prediction.success_percent}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/60">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {prediction.comparison.reference_label}
              </p>
              <p className="mt-2 text-slate-600 dark:text-slate-400">{prediction.comparison.reference_summary}</p>
              <p className="mt-2 font-medium text-slate-800 dark:text-slate-200">
                Success: {prediction.comparison.reference_success_percent}%
              </p>
              <p className="mt-2 text-xs italic text-slate-500">{prediction.comparison.note}</p>
            </div>
          </div>
        )}
      </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep("explanation")}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          Feature explanation
        </button>
        {!DEMO_MODE && (
        <button
          type="button"
          onClick={() => setStep("scenario")}
          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          Explore scenarios
        </button>
        )}
        <button
          type="button"
          disabled={!canAccessReflection}
          title={
            canAccessReflection ? undefined : "Acknowledge uncertainty when confidence is low"
          }
          onClick={() => setStep("reflection")}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reflection &amp; summary
        </button>
      </div>
    </div>
  );
}
