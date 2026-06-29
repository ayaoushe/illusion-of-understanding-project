import { useEffect, useState } from "react";
import { postScenario } from "../api/client";
import type { ScenarioResponse } from "../api/types";
import { useSession } from "../context/SessionContext";
import { DEMO_MODE } from "../config";

type Dim = "tumor_size" | "age" | "stage";

const stages = ["I", "II", "III", "IV"] as const;

export function ScenarioExplorer() {
  const { patient, prediction, setStep } = useSession();
  const [variable, setVariable] = useState<Dim>("tumor_size");
  const [tumorSize, setTumorSize] = useState(patient.tumor_size);
  const [age, setAge] = useState(patient.age);
  const [stage, setStage] = useState(patient.stage);
  const [result, setResult] = useState<ScenarioResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setTumorSize(patient.tumor_size);
    setAge(patient.age);
    setStage(patient.stage);
  }, [patient]);

  useEffect(() => {
    if (DEMO_MODE) return;
    if (!prediction) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      (async () => {
        try {
          const val =
            variable === "tumor_size" ? tumorSize : variable === "age" ? age : stage;
          const res = await postScenario(patient, variable, val);
          if (!cancelled) {
            setResult(res);
            setErr(null);
          }
        } catch (e) {
          if (!cancelled) setErr(e instanceof Error ? e.message : "Scenario failed");
        }
      })();
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [patient, prediction, variable, tumorSize, age, stage]);

  if (DEMO_MODE) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200/90 bg-white/80 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
        Scenario explorer is not available in demo mode (no live model backend).
      </div>
    );
  }

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Scenario explorer</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          What-if: adjust one variable and compare to the baseline prediction.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-md dark:border-slate-700 dark:bg-slate-900/80">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Variable</label>
        <select
          value={variable}
          onChange={(e) => setVariable(e.target.value as Dim)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
        >
          <option value="tumor_size">Tumor size</option>
          <option value="age">Age</option>
          <option value="stage">Stage</option>
        </select>

        {variable === "tumor_size" && (
          <label className="mt-4 block text-sm">
            <span className="text-slate-700 dark:text-slate-300">Tumor size (cm): {tumorSize}</span>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.1}
              value={tumorSize}
              onChange={(e) => setTumorSize(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
          </label>
        )}
        {variable === "age" && (
          <label className="mt-4 block text-sm">
            <span className="text-slate-700 dark:text-slate-300">Age: {age}</span>
            <input
              type="range"
              min={18}
              max={100}
              step={1}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-2 w-full accent-indigo-600"
            />
          </label>
        )}
        {variable === "stage" && (
          <label className="mt-4 block text-sm">
            <span className="text-slate-700 dark:text-slate-300">Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      {result && (
        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Updated success probability</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{result.scenario_percent}%</p>
          <p
            className={`mt-1 text-sm font-medium ${
              result.delta_percent_points >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {result.delta_percent_points >= 0 ? "+" : ""}
            {result.delta_percent_points}% vs baseline ({result.baseline_percent}%)
          </p>
        </div>
      )}
    </div>
  );
}
