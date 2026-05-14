import { useSession } from "../context/SessionContext";

const stages = ["I", "II", "III", "IV"] as const;
const prior = ["No", "Yes"] as const;
const severity = ["Low", "Moderate", "High"] as const;

export function PatientInputPage() {
  const { patient, setPatient, setStep } = useSession();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Patient profile</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Situation awareness — current clinical snapshot (SA Level 1).
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-lg shadow-slate-200/30 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-black/20">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Age</span>
            <input
              type="number"
              min={18}
              max={100}
              value={patient.age}
              onChange={(e) => setPatient({ age: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Cancer stage</span>
            <select
              value={patient.stage}
              onChange={(e) => setPatient({ stage: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Prior treatment</span>
            <select
              value={patient.prior_treatment}
              onChange={(e) => setPatient({ prior_treatment: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            >
              {prior.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">Symptom severity</span>
            <select
              value={patient.symptom_severity}
              onChange={(e) => setPatient({ symptom_severity: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
            >
              {severity.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-full block text-sm sm:col-span-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Tumor size (cm): {patient.tumor_size}
            </span>
            <input
              type="range"
              min={0.5}
              max={15}
              step={0.1}
              value={patient.tumor_size}
              onChange={(e) => setPatient({ tumor_size: Number(e.target.value) })}
              className="mt-2 w-full accent-indigo-600"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep("assessment")}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:opacity-95 sm:w-auto sm:px-8"
      >
        Continue to assessment
      </button>
    </div>
  );
}
