import { useSession } from "../context/SessionContext";

export function ReflectionSummary() {
  const {
    prediction,
    setStep,
    canAccessReflection,
    userConfidence,
    setUserConfidence,
    reflection1,
    setReflection1,
    reflection2,
    setReflection2,
    reflection3,
    setReflection3,
    userDecision,
  } = useSession();

  if (!prediction) {
    return (
      <p className="text-sm text-slate-500">
        <button type="button" className="text-indigo-600 underline" onClick={() => setStep("assessment")}>
          Complete assessment
        </button>{" "}
        first.
      </p>
    );
  }

  if (!canAccessReflection) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Uncertainty acknowledgment required</p>
        <p className="mt-2 text-amber-900/90 dark:text-amber-100/85">
          Go back to <strong>AI results</strong> and confirm you acknowledge the model&apos;s limited confidence
          before reflecting.
        </p>
        <button
          type="button"
          onClick={() => setStep("results")}
          className="mt-3 text-sm font-semibold text-amber-800 underline dark:text-amber-200"
        >
          Back to results
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Critical reflection</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Build awareness around this recommendation before closing the session.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
          Your confidence in this recommendation: {userConfidence}%
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={userConfidence}
          onChange={(e) => setUserConfidence(Number(e.target.value))}
          className="mt-3 w-full accent-indigo-600"
        />
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white/90 p-5 dark:border-slate-700 dark:bg-slate-900/80">
        <label className="block text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">What information might be missing?</span>
          <input
            type="text"
            value={reflection1}
            onChange={(e) => setReflection1(e.target.value)}
            placeholder="Patient history, biomarkers, etc."
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">What could make this prediction wrong?</span>
          <input
            type="text"
            value={reflection2}
            onChange={(e) => setReflection2(e.target.value)}
            placeholder="Edge cases, data limits…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800 dark:text-slate-200">
            Would you trust this in a real scenario?
          </span>
          <input
            type="text"
            value={reflection3}
            onChange={(e) => setReflection3(e.target.value)}
            placeholder="AI's role in your practice…"
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 dark:border-slate-700 dark:bg-slate-950/60">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Session summary</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>
            <span className="text-slate-500">Initial decision:</span> {userDecision ?? "—"}
          </li>
          <li>
            <span className="text-slate-500">AI prediction:</span> {prediction.success_percent}% success
          </li>
          <li>
            <span className="text-slate-500">Your confidence:</span> {userConfidence}%
          </li>
          <li className="pt-2 text-slate-500">Reflections</li>
          <li className="pl-2 text-slate-600 dark:text-slate-400">Missing info: {reflection1 || "—"}</li>
          <li className="pl-2 text-slate-600 dark:text-slate-400">Risks: {reflection2 || "—"}</li>
          <li className="pl-2 text-slate-600 dark:text-slate-400">Trust: {reflection3 || "—"}</li>
        </ul>
      </div>
    </div>
  );
}
