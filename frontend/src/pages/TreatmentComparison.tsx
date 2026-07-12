import { useState } from 'react';
import { mockTreatmentOptions, getAssessmentTreatmentLabel } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

export function TreatmentComparison() {
  const { assessment, recordInteraction } = useWorkflow();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="page">
      <PageHeader title="Treatment Options Comparison" badge="Step 4" />

      {assessment && (
        <div className="card card-sm" style={{ marginBottom: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Your initial selection: <strong>{getAssessmentTreatmentLabel(assessment.selectedTreatment)}</strong>
          </p>
        </div>
      )}

      <div className="treatment-comparison-grid">
        {mockTreatmentOptions.map((opt) => (
          <div
            key={opt.id}
            className={`card treatment-option-card ${assessment?.selectedTreatment === opt.id ? 'selected' : ''}`}
            onClick={() => recordInteraction({ type: 'treatment_view', payload: opt.id })}
          >
            <div className="treatment-header">
              <h4>{opt.name}</h4>
              <div className="treatment-badges">
                <span className="strength-badge">{opt.strength}</span>
                <span className={`uncertainty-badge uncertainty-${opt.uncertainty}`}>
                  {opt.uncertainty.toUpperCase()}
                </span>
              </div>
            </div>

            <p className="evidence-strength-label">Evidence: {opt.evidenceStrength}</p>

            <div className="treatment-cols">
              <div className="treatment-section">
                <h5>Benefits</h5>
                <ul>
                  {opt.benefits.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="treatment-section">
                <h5>Risks</h5>
                <ul>
                  {opt.risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            </div>

            <div className="treatment-meta">
              <div>
                <p className="meta-text"><strong>QoL:</strong> {opt.qolImpact}</p>
              </div>
              <div>
                <p className="meta-text"><strong>Monitoring:</strong> {opt.monitoring}</p>
              </div>
            </div>

            {opt.missingData.length > 0 && (
              <div className="treatment-missing">
                <strong style={{ fontSize: '0.75rem' }}>Missing data:</strong>{' '}
                {opt.missingData.join('; ')}
              </div>
            )}

            <details
              className="treatment-section"
              style={{ cursor: 'pointer' }}
              open={expandedCards[opt.id]}
              onToggle={() => toggleExpand(opt.id)}
            >
              <summary style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {expandedCards[opt.id] ? 'Hide details' : 'Show details'}
              </summary>
              <div style={{ marginTop: '0.5rem' }}>
                <h5>Comorbidity Considerations</h5>
                <ul>
                  {opt.comorbidityConsiderations.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </details>
          </div>
        ))}
      </div>

      <StepFooter />
    </div>
  );
}