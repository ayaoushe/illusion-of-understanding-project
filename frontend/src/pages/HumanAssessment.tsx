import { useState, useEffect } from 'react';
import { assessmentTreatmentOptions } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import type { HumanAssessment } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

const emptyForm: HumanAssessment = {
  selectedTreatment: '',
  clinicalReasoning: '',
  uncertainties: '',
  missingInformation: '',
  qolConcern: '',
  patientPreferenceConsidered: false,
};

export function HumanAssessment() {
  const { submitAssessment, startAssessment, assessmentComplete } = useWorkflow();
  const [form, setForm] = useState<HumanAssessment>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startAssessment();
  }, [startAssessment]);

  const update = <K extends keyof HumanAssessment>(key: K, value: HumanAssessment[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isValid = Boolean(form.selectedTreatment);

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    await submitAssessment(form);
    setSubmitting(false);
  };

  if (assessmentComplete) {
    return (
      <div className="page">
        <PageHeader
          title="Human Initial Assessment"
          subtitle="Your independent assessment has been recorded. AI evidence is now available."
          badge="Step 2 — Complete"
        />
        <div className="card assessment-complete-card">
          <p>✓ Assessment recorded and locked. Proceed to AI Evidence Synthesis.</p>
        </div>
        <StepFooter nextLabel="View Evidence" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Human Initial Assessment"
        subtitle="Human-first clinical input — form your judgment before any AI output."
        badge="Step 2"
      />

      <div className="card assessment-primary-card">
        <label className="label" htmlFor="treatment-select">
          Proposed Treatment Plan <span className="required-star">*</span>
        </label>
        <select
          id="treatment-select"
          className="treatment-dropdown"
          value={form.selectedTreatment}
          onChange={(e) => update('selectedTreatment', e.target.value)}
        >
          <option value="">Select a treatment option...</option>
          {assessmentTreatmentOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label} [{opt.category}]
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`btn btn-lock-assessment ${isValid ? 'btn-ready' : ''}`}
          onClick={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? 'Recording...' : 'Record Assessment & Lock'}
        </button>

        <p className="assessment-lock-note">
          🔒 AI insights are intentionally hidden on this screen to preserve independent clinical judgment.
        </p>
      </div>

      <details className="card assessment-optional-details">
        <summary>Additional clinical notes (optional)</summary>
        <div className="assessment-form">
          <div className="form-section">
            <h4>Clinical Reasoning</h4>
            <textarea
              rows={3}
              placeholder="Which clinical factors most influenced your decision?"
              value={form.clinicalReasoning}
              onChange={(e) => update('clinicalReasoning', e.target.value)}
            />
          </div>

          <div className="form-section">
            <h4>Uncertainties</h4>
            <textarea
              rows={2}
              placeholder="What aspects of this case remain uncertain?"
              value={form.uncertainties}
              onChange={(e) => update('uncertainties', e.target.value)}
            />
          </div>

          <div className="form-section">
            <h4>Missing Information</h4>
            <textarea
              rows={2}
              placeholder="What additional data would strengthen your decision?"
              value={form.missingInformation}
              onChange={(e) => update('missingInformation', e.target.value)}
            />
          </div>

          <div className="form-section">
            <h4>Quality-of-Life Concern</h4>
            <textarea
              rows={2}
              placeholder="Which QoL factors are most relevant for this patient?"
              value={form.qolConcern}
              onChange={(e) => update('qolConcern', e.target.value)}
            />
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.patientPreferenceConsidered}
              onChange={(e) => update('patientPreferenceConsidered', e.target.checked)}
            />
            Patient preferences were considered in this assessment
          </label>
        </div>
      </details>

      <StepFooter
        showPrevious
        onNext={handleSubmit}
        nextLabel={submitting ? 'Recording...' : 'Record Assessment & Lock'}
        nextDisabled={!isValid || submitting}
        nextReady={isValid}
      />
    </div>
  );
}
