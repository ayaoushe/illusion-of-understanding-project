import type {
  ContradictionBlock,
  SituationalAwarenessBlock,
  UncertaintyProfileBlock,
} from "../../api/types";

export function UncertaintyConfidencePanel({
  confidencePercent,
  profile,
}: {
  confidencePercent: number;
  profile: UncertaintyProfileBlock;
}) {
  const zoneColor =
    profile.risk_zone === "elevated"
      ? "text-rose-700 dark:text-rose-300"
      : profile.risk_zone === "moderate"
        ? "text-amber-800 dark:text-amber-200"
        : "text-emerald-800 dark:text-emerald-200";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/85">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Confidence vs reliability</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Mitigates overtrust: self-reported model confidence is not the same as case reliability in this prototype.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Model confidence</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-violet-500/90"
              style={{ width: `${Math.min(100, confidencePercent)}%` }}
            />
          </div>
          <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{confidencePercent}%</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reliability index (sim.)</p>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-slate-600 dark:bg-slate-400"
              style={{ width: `${Math.min(100, profile.reliability_percent)}%` }}
            />
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{profile.reliability_percent}%</p>
        </div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${zoneColor}`}>Risk zone: {profile.risk_zone}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{profile.reliability_narrative}</p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{profile.confidence_calibration_note}</p>
      <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">{profile.ambiguity_note}</p>
      {profile.conflicting_indicators.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
          <p className="text-xs font-semibold text-amber-950 dark:text-amber-100">Conflicting indicators</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-950/90 dark:text-amber-50/90">
            {profile.conflicting_indicators.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ContradictionEnginePanel({ block }: { block: ContradictionBlock }) {
  return (
    <div className="rounded-2xl border border-rose-200/70 bg-rose-50/40 p-5 dark:border-rose-900/40 dark:bg-rose-950/25">
      <h3 className="text-sm font-semibold text-rose-950 dark:text-rose-50">Counterarguments &amp; limits</h3>
      <p className="mt-1 text-xs text-rose-900/80 dark:text-rose-100/80">
        Reduces confirmation bias by foregrounding how the recommendation could fail.
      </p>
      <div className="mt-4 space-y-4 text-sm">
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800/90 dark:text-rose-200/90">
            Why the model might be wrong
          </p>
          <ul className="mt-2 space-y-1.5 text-rose-950/90 dark:text-rose-50/90">
            {block.why_model_might_be_wrong.map((x) => (
              <li key={x} className="leading-snug">
                {x}
              </li>
            ))}
          </ul>
        </section>
        {block.contradictory_indicators.length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800/90 dark:text-rose-200/90">
              Contradictory evidence
            </p>
            <ul className="mt-2 space-y-1.5 text-rose-950/90 dark:text-rose-50/90">
              {block.contradictory_indicators.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
        )}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800/90 dark:text-rose-200/90">
            Alternative framings
          </p>
          <ul className="mt-2 space-y-1.5 text-rose-950/90 dark:text-rose-50/90">
            {block.alternative_interpretations.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
        {block.atypical_warnings.length > 0 && (
          <section className="rounded-xl border border-rose-300/60 bg-white/60 p-3 text-xs dark:border-rose-800/50 dark:bg-rose-950/40">
            {block.atypical_warnings.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export function EndsleySaPanel({ sa }: { sa: SituationalAwarenessBlock }) {
  return (
    <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/35 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
      <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-50">Situational awareness (Endsley L1–L3)</h3>
      <p className="mt-1 text-xs text-indigo-900/80 dark:text-indigo-100/75">
        Structured perception → comprehension → projection to support meta-cognition, not extra charts.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-xs dark:border-indigo-800/40 dark:bg-slate-900/60">
          <p className="font-semibold text-indigo-900 dark:text-indigo-200">Level 1 — Perception</p>
          <ul className="mt-2 space-y-1 text-indigo-950/90 dark:text-indigo-50/85">
            {sa.level1_perception.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-xs dark:border-indigo-800/40 dark:bg-slate-900/60">
          <p className="font-semibold text-indigo-900 dark:text-indigo-200">Level 2 — Comprehension</p>
          <ul className="mt-2 space-y-1 text-indigo-950/90 dark:text-indigo-50/85">
            {sa.level2_comprehension.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/70 p-3 text-xs dark:border-indigo-800/40 dark:bg-slate-900/60">
          <p className="font-semibold text-indigo-900 dark:text-indigo-200">Level 3 — Projection</p>
          <ul className="mt-2 space-y-1 text-indigo-950/90 dark:text-indigo-50/85">
            {sa.level3_projection.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
