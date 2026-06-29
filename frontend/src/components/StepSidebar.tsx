import {
  Activity,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import type { StepId } from "../api/types";
import { useSession } from "../context/SessionContext";
import { DEMO_MODE } from "../config";

const STEPS: { id: StepId; label: string; icon: typeof UserCircle }[] = [
  { id: "patient", label: "Patient", icon: UserCircle },
  { id: "assessment", label: "Assessment", icon: ClipboardList },
  { id: "results", label: "AI results", icon: LayoutDashboard },
  { id: "explanation", label: "Explanation", icon: Activity },
  { id: "scenario", label: "Scenarios", icon: FlaskConical },
  { id: "reflection", label: "Reflection", icon: MessageSquare },
];

export function StepSidebar() {
  const {
    step,
    setStep,
    canAccessPostPredictSteps,
    canAccessReflection,
    cases,
    activeCaseId,
    setActiveCase,
  } = useSession();

  const steps = DEMO_MODE ? STEPS.filter((s) => s.id !== "scenario") : STEPS;

  const locked = (id: StepId) => {
    if (id === "patient" || id === "assessment") return false;
    if (id === "reflection") return !canAccessReflection;
    return !canAccessPostPredictSteps;
  };

  return (
    <nav className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto border-b border-slate-200/80 bg-white/70 px-2 py-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/50 md:w-56 md:flex-col md:gap-0 md:border-b-0 md:border-r md:px-0 md:py-4">
      {cases.length > 0 && (
        <label className="order-first w-44 shrink-0 px-2 md:order-none md:mb-3 md:w-auto md:px-3">
          <span className="mb-1 hidden text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 md:block">
            Demo case
          </span>
          <select
            value={activeCaseId ?? ""}
            onChange={(e) => setActiveCase(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-950"
            title="Switching a case restarts the assessment"
          >
            {cases.map((c) => (
              <option key={c.patient_id} value={c.patient_id}>
                {c.patient_id}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="hidden px-3 pb-3 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Workflow
        </p>
      </div>
      <ul className="flex min-w-0 flex-row gap-0.5 px-1 md:flex-col md:px-2">
        {steps.map(({ id, label, icon: Icon }) => {
          const isActive = step === id;
          const isLocked = locked(id);
          return (
            <li key={id}>
              <button
                type="button"
                disabled={isLocked}
                onClick={() => setStep(id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : isLocked
                      ? "cursor-not-allowed text-slate-400 dark:text-slate-600"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="font-medium">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto hidden border-t border-slate-200/80 px-3 pt-4 dark:border-slate-800 md:block">
        <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300">OncoAI</span> — research
          prototype. Not clinical advice.
        </p>
      </div>
    </nav>
  );
}
