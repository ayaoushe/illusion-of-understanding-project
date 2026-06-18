import { useState } from 'react';
import { assessmentTreatmentOptions, mockAiEvidence } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import type { FinalReflection } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { FinalDecisionSummary } from '../components/cards/FinalDecisionSummary';
import { BiasWarningBanner } from '../components/cards/BiasWarningBanner';

const emptyReflection: FinalReflection = {
  changedMind: 'no',
  finalTreatment: '',
  finalReasoning: '',
  patientPreferenceHonored: true,
  remainingUncertainties: '',
  sourcesChecked: [],
  whatMatteredMost: '',
};

export function FinalReflection() {
  const { assessment, evidence, reflection, submitReflection, biasWarnings } = useWorkflow();
  const [form, setForm] = useState<FinalReflection>(
    reflection ?? { ...emptyReflection, finalTreatment: assessment?.selectedTreatment ?? '' },
  );
  const [submitted, setSubmitted] = useState(!!reflection);

  if (!assessment) {
    return (
      <div className="page">
        <PageHeader title="Final Reflection" badge="Step 7" />
        <div className="card">Complete your initial assessment first.</div>
      </div>
    );
  }

  const update = <K extends keyof FinalReflection>(key: K, value: FinalReflection[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSource = (source: string) => {
    setForm((prev) => ({
      ...prev,
      sourcesChecked: prev.sourcesChecked.includes(source)
        ? prev.sourcesChecked.filter((s) => s !== source)
        : [...prev.sourcesChecked, source],
    }));
  };

  const handleSubmit = () => {
    submitReflection(form);
    setSubmitted(true);
  };

  const isValid = Boolean(form.finalTreatment) && form.finalReasoning.trim().length >= 10;

  return (
    <div className="page">
      <PageHeader
        title="Final Reflection"
        subtitle="Synthesize your decision — compare your judgment with AI evidence."
        badge="Step 7"
      />

      <BiasWarningBanner warnings={biasWarnings} />

      <FinalDecisionSummary
        assessment={assessment}
        evidence={evidence}
        reflection={submitted ? form : null}
      />

      {!submitted && (
        <div className="reflection-form">
          <div className="form-section card">
            <h4>Did the AI evidence change your opinion?</h4>
            <div className="radio-group">
              {(['yes', 'no', 'partially'] as const).map((v) => (
                <label key={v} className="radio-option">
                  <input
                    type="radio"
                    name="changedMind"
                    checked={form.changedMind === v}
                    onChange={() => update('changedMind', v)}
                  />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section card">
            <h4>Final Treatment Decision</h4>
            <select
              className="treatment-dropdown"
              value={form.finalTreatment}
              onChange={(e) => update('finalTreatment', e.target.value)}
            >
              <option value="">Select a treatment option...</option>
              {assessmentTreatmentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} [{opt.category}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-section card">
            <h4>What information mattered most?</h4>
            <textarea
              rows={2}
              value={form.whatMatteredMost}
              onChange={(e) => update('whatMatteredMost', e.target.value)}
              placeholder="Which clinical factors or evidence were most influential?"
            />
          </div>

          <div className="form-section card">
            <h4>Final Reasoning</h4>
            <textarea
              rows={4}
              value={form.finalReasoning}
              onChange={(e) => update('finalReasoning', e.target.value)}
              placeholder="Explain your final treatment decision..."
            />
          </div>

          <div className="form-section card">
            <h4>What uncertainty remains?</h4>
            <textarea
              rows={3}
              value={form.remainingUncertainties}
              onChange={(e) => update('remainingUncertainties', e.target.value)}
              placeholder="What questions or gaps remain after this decision process?"
            />
          </div>

          <div className="form-section card">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.patientPreferenceHonored}
                onChange={(e) => update('patientPreferenceHonored', e.target.checked)}
              />
              Patient preferences were honored in the final decision
            </label>
          </div>

          <div className="form-section card">
            <h4>Sources Reviewed</h4>
            <div className="source-checkboxes">
              {mockAiEvidence.sources.map((s) => (
                <label key={s.title} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.sourcesChecked.includes(s.title)}
                    onChange={() => toggleSource(s.title)}
                  />
                  {s.title} ({s.year})
                </label>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`btn btn-primary btn-submit-reflection ${isValid ? 'btn-ready' : ''}`}
            onClick={handleSubmit}
            disabled={!isValid}
          >
            Complete Reflection
          </button>
        </div>
      )}

      {submitted && (
        <div className="reflection-complete card">
          <h4>Reflection Complete</h4>
          <p>
            Your decision process has been recorded. This prototype explores how explanations influence
            clinical trust and decision-making — not automated diagnosis.
          </p>
          {form.changedMind !== 'no' && (
            <p className="mind-change-note">
              You indicated your opinion {form.changedMind === 'yes' ? 'changed' : 'partially changed'} after reviewing AI evidence.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
