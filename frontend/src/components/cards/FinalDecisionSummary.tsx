import type { HumanAssessment, FinalReflection, AiEvidenceSynthesis } from '../../types';
import { getAssessmentTreatmentLabel } from '../../data/mockData';

interface FinalDecisionSummaryProps {
  assessment: HumanAssessment;
  evidence: AiEvidenceSynthesis | null;
  reflection: FinalReflection | null;
}

export function FinalDecisionSummary({ assessment, evidence, reflection }: FinalDecisionSummaryProps) {
  return (
    <div className="final-summary">
      <div className="summary-comparison">
        <div className="summary-column">
          <h4>Your Initial Assessment</h4>
          <p className="summary-treatment">
            {getAssessmentTreatmentLabel(assessment.selectedTreatment)}
          </p>
          {assessment.clinicalReasoning && (
            <p className="summary-reasoning">{assessment.clinicalReasoning}</p>
          )}
        </div>

        <div className="summary-divider">
          <span>vs</span>
        </div>

        <div className="summary-column">
          <h4>AI Evidence Summary</h4>
          {evidence && (
            <>
              <p className="summary-uncertainty">
                Uncertainty: <strong>{evidence.uncertaintyLevel}</strong>
              </p>
              <p className="summary-reasoning">{evidence.uncertaintyDescription}</p>
              <p className="label">Key factors</p>
              <ul className="bullet-list compact">
                {evidence.keyReasoningFactors.slice(0, 4).map((f) => (
                  <li key={f.factor}>
                    {f.factor} ({f.direction})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {reflection && (
        <div className="summary-final">
          <h4>Final Decision</h4>
          <div className="final-decision-grid">
            <div>
              <p className="label">Changed Mind?</p>
              <p className="value">{reflection.changedMind}</p>
            </div>
            <div>
              <p className="label">Final Treatment</p>
              <p className="value">{getAssessmentTreatmentLabel(reflection.finalTreatment)}</p>
            </div>
            <div>
              <p className="label">Patient Preference Honored</p>
              <p className="value">{reflection.patientPreferenceHonored ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <p className="label">Final Reasoning</p>
          <p>{reflection.finalReasoning}</p>
          <p className="label">Remaining Uncertainties</p>
          <p>{reflection.remainingUncertainties}</p>
        </div>
      )}
    </div>
  );
}
