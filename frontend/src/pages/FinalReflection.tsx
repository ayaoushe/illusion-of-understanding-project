import { useEffect, useState } from 'react';
import { useTreatmentOptions } from '../hooks/useTreatmentOptions';
import { useWorkflow } from '../context/WorkflowContext';
import type { FinalReflection, SimilarCase } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { fetchCase } from '../services/caseService';
import { buildSimilarCases } from '../services/similarCaseView';
import { fetchTreatmentRecommendations, type TreatmentPrediction } from '../services/predictionService';
import { getAssessmentTreatmentLabel } from '../data/mockData';

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
  const { assessment, evidence, reflection, submitReflection, selectedPatientId } = useWorkflow();
  const treatmentOptions = useTreatmentOptions();
  const [treatmentPrediction, setTreatmentPrediction] = useState<TreatmentPrediction | null>(null);
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [form, setForm] = useState<FinalReflection>(
    reflection ?? { ...emptyReflection },
  );
  const [submitted, setSubmitted] = useState(!!reflection);

  useEffect(() => {
    if (!selectedPatientId) return;
    const patientId = selectedPatientId;
    let active = true;

    async function loadSummaries() {
      try {
        const patient = await fetchCase(patientId);
        if (!patient || !active) return;
        const [prediction, cases] = await Promise.all([
          fetchTreatmentRecommendations(patient),
          Promise.resolve(buildSimilarCases(patient, assessment?.selectedTreatment ?? null)),
        ]);
        if (active) {
          setTreatmentPrediction(prediction);
          setSimilarCases(cases);
        }
      } catch {
        if (active) {
          setTreatmentPrediction(null);
          setSimilarCases([]);
        }
      }
    }

    void loadSummaries();
    return () => {
      active = false;
    };
  }, [selectedPatientId, assessment?.selectedTreatment]);

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

  const formatFactorName = (feature: string) =>
    feature
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="page">
      <PageHeader title="Final Reflection" badge="Step 7" />

      <div className="card final-reflection-summary-card final-reflection-initial-card">
        <h4>Initial Assessment</h4>
        <p className="summary-treatment">{getAssessmentTreatmentLabel(assessment.selectedTreatment)}</p>
        {assessment.clinicalReasoning && <p className="summary-reasoning">{assessment.clinicalReasoning}</p>}
      </div>

      <div className="final-summary-grid final-reflection-summary-grid">
        <div className="card final-reflection-summary-card final-reflection-evidence-card">
          <h4>AI Evidence Summary</h4>
          {evidence ? (
            <>
              <div className="final-reflection-summary-meta">
                <span className="label">Uncertainty</span>
                <span className={`uncertainty-level uncertainty-${evidence.uncertaintyLevel}`}>
                  {evidence.uncertaintyLevel.toUpperCase()}
                </span>
              </div>
              <p className="summary-reasoning">{evidence.uncertaintyDescription}</p>
              <div className="reasoning-factors final-reflection-reasoning-factors">
                {evidence.keyReasoningFactors.slice(0, 3).map((factor) => (
                  <div key={factor.factor} className={`reasoning-factor direction-${factor.direction}`}>
                    <span className="factor-name">{factor.factor}</span>
                    <span className={`weight-badge weight-${factor.weight}`}>{factor.weight}</span>
                    <span className={`direction-badge direction-${factor.direction}`}>{factor.direction}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted">Evidence review is not available yet.</p>
          )}
        </div>

        <div className="card final-reflection-summary-card final-reflection-treatment-card">
          <h4>Treatment Recommendations</h4>
          {treatmentPrediction?.recommendations.map((recommendation, index) => (
            <div key={recommendation.id} className="final-reflection-treatment-item final-reflection-list-item">
              <div className="final-reflection-treatment-content">
                <div className="final-reflection-treatment-title">
                  <strong>{index + 1}. {recommendation.name}</strong>
                  <span className="match-score">Model confidence: {recommendation.probability}%</span>
                </div>
                <div className="final-reflection-factor-list">
                  <span className="final-reflection-factor-heading">Top contributing factors</span>
                  {recommendation.shap
                    .slice()
                    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                    .slice(0, 3)
                    .map((factor) => (
                      <span
                        key={factor.feature}
                        className={`final-reflection-factor ${factor.value >= 0 ? 'factor-positive' : 'factor-negative'}`}
                      >
                        <span>{formatFactorName(factor.feature)}</span>
                        <strong>{factor.value >= 0 ? '+' : ''}{factor.value.toFixed(3)}</strong>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          ))}
          {!treatmentPrediction && <p className="muted">Treatment recommendations are not available.</p>}
        </div>

        <div className="card final-reflection-summary-card final-reflection-similar-card">
          <h4>Similar Patients</h4>
          {similarCases.filter((similarCase) => similarCase.relation !== 'current').map((similarCase) => (
            <div key={similarCase.caseId} className="final-reflection-similar-item final-reflection-list-item">
              <div>
                <strong>{similarCase.caseId}</strong>
                <p className={`final-reflection-relation-label relation-${similarCase.relation}`}>
                  {similarCase.relationLabel}
                </p>
                <p style={{ margin: 0 }}>{similarCase.treatmentUsed}</p>
              </div>
              <span className="final-reflection-match-score">
                <strong>{similarCase.matchScore}%</strong>
                <small>match</small>
              </span>
            </div>
          ))}
          {similarCases.length === 0 && <p className="muted">Similar patients are not available.</p>}
        </div>
      </div>


      {!submitted && (
        <div className="reflection-form">
          <div className="form-section card final-reflection-decision-card">
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

          

          <button
            type="button"
            className={`btn final-reflection-submit ${isValid ? 'btn-primary btn-ready' : 'btn-primary'}`}
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
         
        </div>
      )}
    </div>
  );
}