import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface CaseRecord {
  id: string;
  diagnosis: string;
  image_url: string;
  evidence_for: string[];
  evidence_against: string[];
}

export function SupabaseCaseExplorer() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [activeCase, setActiveCase] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      if (!supabase) {
        setError(
          "Supabase client is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
        );
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("cases")
        .select("id, diagnosis, image_url, evidence_for, evidence_against");

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        const rows = data as CaseRecord[];
        const validCases = rows.filter(
          (item) =>
            typeof item.image_url === "string" &&
            item.image_url.startsWith("/images/ISIC_")
        );

        if (validCases.length === 0) {
          setError(
            "No valid ISIC image cases were returned. Please upload matching images or update the Supabase records."
          );
        }

        setCases(validCases);
      }
      setLoading(false);
    }

    loadCases();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeCase && cases.length) {
      setActiveCase(cases[0]);
    }
  }, [cases, activeCase]);

  const selected = useMemo(
    () => activeCase || cases[0] || null,
    [activeCase, cases]
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading case hypotheses...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Case viewer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
            Explainable medical hypotheses
          </h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Supabase powered
        </span>
      </div>

      {error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">
          {error}
        </div>
      ) : cases.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-400">
          No case data returned from Supabase.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
          <aside className="space-y-3">
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950/70">
              {selected?.image_url ? (
                <img
                  src={selected.image_url}
                  alt={selected.diagnosis}
                  onError={(event) => {
                    event.currentTarget.src = '/images/ISIC_0000000.jpg';
                  }}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center p-4 text-sm text-slate-500 dark:text-slate-400">
                  No image available for this case.
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Hypothesis library</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Select a diagnostic hypothesis to inspect evidence and image context.
              </p>
            </div>
            {cases.map((caseItem) => {
              const isActive = selected?.id === caseItem.id;
              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => setActiveCase(caseItem)}
                  className={`group flex w-full flex-col gap-2 rounded-3xl border px-4 py-4 text-left transition focus:outline-none ${
                    isActive
                      ? "border-indigo-500 bg-indigo-500 text-white shadow-lg"
                      : "border-slate-200 bg-white text-slate-900 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  }`}
                >
                  <span className="text-sm font-semibold">{caseItem.diagnosis}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Case {caseItem.id.slice(0, 8)}</span>
                </button>
              );
            })}
          </aside>

          <main className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Active diagnosis
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {selected?.diagnosis}
                </h3>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Explore evidence
              </span>
            </div>
            <div className="mt-5 rounded-3xl border border-slate-200/90 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Detailed evidence and context are shown on the right. Use the case preview above to compare visual features across hypotheses.
              </p>
            </div>
          </main>

          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Evidence for</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                {selected?.evidence_for.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/80">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Evidence against</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                {selected?.evidence_against.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-3 dark:border-rose-800/50 dark:bg-rose-950/20">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
