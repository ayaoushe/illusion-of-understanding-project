import { useState, useCallback, useEffect, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import type { StepId } from "../api/types";
import { useSession } from "../context/SessionContext";
import { ChatPanel } from "./ChatPanel";
import { StepSidebar } from "./StepSidebar";
import { PatientInputPage } from "../pages/PatientInputPage";
import { AssessmentStep } from "../pages/AssessmentStep";
import { ResultsDashboard } from "../pages/ResultsDashboard";
import { ExplanationPanel } from "../pages/ExplanationPanel";
import { ScenarioExplorer } from "../pages/ScenarioExplorer";
import { ReflectionSummary } from "../pages/ReflectionSummary";

function StepView({ step }: { step: StepId }) {
  const views: Record<StepId, ReactNode> = {
    patient: <PatientInputPage />,
    assessment: <AssessmentStep />,
    results: <ResultsDashboard />,
    explanation: <ExplanationPanel />,
    scenario: <ScenarioExplorer />,
    reflection: <ReflectionSummary />,
  };
  return (
    <div
      key={step}
      className="animate-fadeSlideIn min-h-0 flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
    >
      {views[step]}
    </div>
  );
}

export function AppShell() {
  const { step } = useSession();
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );
  const [chatCollapsed, setChatCollapsed] = useState(false);

  const toggleDark = useCallback(() => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = stored === "dark" || (!stored && prefers);
    document.documentElement.classList.toggle("dark", useDark);
    setDark(useDark);
  }, []);

  return (
    <div className="flex h-screen min-h-0 flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30 md:flex-row">
      <StepSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col border-slate-200/60 dark:border-slate-800/60 md:border-l">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              OncoAI Decision Support
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Situational awareness &amp; critical engagement with AI recommendations
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDark}
            className="rounded-xl border border-slate-200/90 bg-white p-2 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>
        <StepView step={step} />
      </div>
      <ChatPanel collapsed={chatCollapsed} onToggleCollapse={() => setChatCollapsed((c) => !c)} />
    </div>
  );
}
