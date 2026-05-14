import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { postAnalyze } from "../api/client";
import type { FeatureRow } from "../api/types";
import { useSession } from "../context/SessionContext";
import { ImportanceChart } from "../components/ImportanceChart";

export function ExplanationPanel() {
  const { patient, prediction, setStep } = useSession();
  const [features, setFeatures] = useState<FeatureRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!prediction) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await postAnalyze(patient);
        if (!cancelled) setFeatures(res.features);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient, prediction]);

  if (!prediction) {
    return (
      <p className="text-sm text-slate-500">
        <button type="button" className="text-indigo-600 underline" onClick={() => setStep("assessment")}>
          Complete assessment
        </button>{" "}
        to see explanations.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">AI reasoning</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Situation comprehension (SA Level 2) — how the model weights clinical factors.
        </p>
      </div>

      {err && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{err}</p>
      )}

      {features && (
        <>
          <ImportanceChart features={features} />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Feature details</h3>
            {features.map((f) => {
              const isOpen = open === f.name;
              return (
                <div
                  key={f.name}
                  className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white dark:border-slate-700 dark:bg-slate-900/80"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : f.name)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 dark:text-slate-200"
                  >
                    <span>
                      {f.name}{" "}
                      <span className="text-slate-500">({Math.round(f.weight * 100)}%)</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {f.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
