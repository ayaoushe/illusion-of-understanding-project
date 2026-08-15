//Card design for final decision

import type { HumanAssessment, FinalReflection, AiEvidenceSynthesis } from '../../types';
import { getAssessmentTreatmentLabel } from '../../data/mockData';

interface FinalDecisionSummaryProps {
  assessment: HumanAssessment;
  evidence: AiEvidenceSynthesis | null;
  reflection: FinalReflection | null;
}

export function FinalDecisionSummary({ assessment, evidence, reflection }: FinalDecisionSummaryProps) {
  return (
    <div className="final-summary-grid">
      <div className="summary-column col-initial">
        <h4>Initial Assessment</h4>
        <p className="summary-treatment">
          {getAssessmentTreatmentLabel(assessment.selectedTreatment)}
        </p>
        {assessment.clinicalReasoning && (
          <p className="summary-reasoning">{assessment.clinicalReasoning}</p>
        )}
      </div>

      <div className="summary-column col-evidence">
        <h4>AI Evidence Summary</h4>
        {evidence && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="label" style={{ marginBottom: 0 }}>Uncertainty</span>
              <span className={`uncertainty-level uncertainty-${evidence.uncertaintyLevel}`} style={{ fontSize: '0.65rem' }}>
                {evidence.uncertaintyLevel.toUpperCase()}
              </span>
            </div>
            <p className="summary-reasoning" style={{ fontSize: '0.8rem' }}>{evidence.uncertaintyDescription}</p>
            <div className="bullet-list compact">
              {evidence.keyReasoningFactors.slice(0, 3).map((f) => (
                <li key={f.factor} style={{ fontSize: '0.8rem' }}>
                  {f.factor} (<span className={`direction-${f.direction}`}>{f.direction}</span>)
                </li>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="summary-column col-decision">
        <h4>Final Decision</h4>
        {reflection ? (
          <>
            <p className="summary-treatment">
              {getAssessmentTreatmentLabel(reflection.finalTreatment)}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Changed mind: <strong>{reflection.changedMind}</strong>
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Preferences honored: <strong>{reflection.patientPreferenceHonored ? 'Yes' : 'No'}</strong>
              </span>
            </div>
            <p className="summary-reasoning" style={{ fontSize: '0.8rem' }}>{reflection.finalReasoning}</p>
          </>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Complete the form below to record your final decision.
          </p>
        )}
      </div>
    </div>
  );
}