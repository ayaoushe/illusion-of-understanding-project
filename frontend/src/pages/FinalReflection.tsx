import { useState } from 'react';
import { useTreatmentOptions } from '../hooks/useTreatmentOptions';
import { useWorkflow } from '../context/WorkflowContext';
import type { FinalReflection } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { FinalDecisionSummary } from '../components/cards/FinalDecisionSummary';

//Step 6:  Captures whether/how the AI evidence changed the
//clinician's mind and their final treatment decision, so it can be compared
 //against the initial HumanAssessment
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
  const { assessment, evidence, reflection, submitReflection } = useWorkflow();
  const treatmentOptions = useTreatmentOptions();
  const [form, setForm] = useState<FinalReflection>(
    reflection ?? { ...emptyReflection, finalTreatment: assessment?.selectedTreatment ?? '' },
  );
  const [submitted, setSubmitted] = useState(!!reflection);
  const [notesOpen, setNotesOpen] = useState(false);

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

  const handleSubmit = () => {
    submitReflection(form);
    setSubmitted(true);
  };

  // No strict validation — user can submit with just a treatment selected
  const isValid = Boolean(form.finalTreatment);

  return (
    <div className="page">
      <PageHeader title="Final Reflection" badge="Step 7" />

      {/* Sobald eine Therapie gewählt ist, steht sie live im Kasten — nicht erst nach dem Absenden. */}
      <FinalDecisionSummary
        assessment={assessment}
        evidence={evidence}
        reflection={submitted || form.finalTreatment ? form : null}
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
              {treatmentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} [{opt.category}]
                </option>
              ))}
            </select>
          </div>

          <details className="card" style={{ cursor: 'pointer' }} open={notesOpen}>
            <summary
              style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}
              onClick={(e) => { e.preventDefault(); setNotesOpen(!notesOpen); }}
            >
              {notesOpen ? '−' : '+'} Add clinical reasoning notes
            </summary>
            {notesOpen && (
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }}>
                <div className="form-section">
                  <h4>What information mattered most?</h4>
                  <textarea
                    rows={2}
                    value={form.whatMatteredMost}
                    onChange={(e) => update('whatMatteredMost', e.target.value)}
                    placeholder="Which clinical factors or evidence were most influential?"
                  />
                </div>
                <div className="form-section">
                  <h4>Final Reasoning</h4>
                  <textarea
                    rows={3}
                    value={form.finalReasoning}
                    onChange={(e) => update('finalReasoning', e.target.value)}
                    placeholder="Explain your final treatment decision..."
                  />
                </div>
                <div className="form-section">
                  <h4>What uncertainty remains?</h4>
                  <textarea
                    rows={2}
                    value={form.remainingUncertainties}
                    onChange={(e) => update('remainingUncertainties', e.target.value)}
                    placeholder="What questions or gaps remain?"
                  />
                </div>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.patientPreferenceHonored}
                    onChange={(e) => update('patientPreferenceHonored', e.target.checked)}
                  />
                  Patient preferences were honored in the final decision
                </label>
              </div>
            )}
          </details>

          <button
            type="button"
            className={`btn ${isValid ? 'btn-primary btn-ready' : 'btn-primary'}`}
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