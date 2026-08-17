import { useState, useEffect } from 'react';
import { useTreatmentOptions } from '../hooks/useTreatmentOptions';
import { useWorkflow } from '../context/WorkflowContext';
import type { HumanAssessment } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';


//Step 2: The clinican records a treatment before seeing any AI evidence

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
  const treatmentOptions = useTreatmentOptions();
  const [form, setForm] = useState<HumanAssessment>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Marks when the clinician started this step, used for the assessment-duration
  // telemetry consumed by detectBiasWarnings (e.g. flagging rushed decisions).
  
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

  //Assessment is locked after submission
  if (assessmentComplete) {
    return (
      <div className="page">
        <PageHeader title="Human Initial Assessment" badge="Step 2 — Complete" />
        <div className="card assessment-complete-card">
          <p style={{ margin: 0, fontSize: '0.9rem' }}>✓ Assessment recorded. Proceed to AI Evidence Synthesis.</p>
        </div>
        <StepFooter nextLabel="View Evidence" />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Human Initial Assessment" badge="Step 2" />

      <div className="assessment-centered">
        <div className="card assessment-main-card">
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
            {treatmentOptions.map((opt) => (
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

          <details className="assessment-optional-details" style={{ marginTop: '1rem', cursor: 'pointer' }}>
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
                  placeholder="What aspects remain uncertain?"
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
                  placeholder="Which QoL factors are most relevant?"
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
        </div>
      </div>

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