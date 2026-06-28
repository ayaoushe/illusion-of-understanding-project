import { useEffect, useState } from 'react';
import { mockSimilarCases } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

export function SimilarCases() {
  const { recordInteraction } = useWorkflow();
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  useEffect(() => {
    recordInteraction({ type: 'similar_cases_view' });
  }, [recordInteraction]);

  return (
    <div className="page">
      <PageHeader title="Similar & Rare Cases" badge="Step 5" />

      <div className="similar-cases-grid">
        {mockSimilarCases.map((c) => {
          const isExpanded = expandedCase === c.caseId;
          return (
            <div
              key={c.caseId}
              className={`card similar-case-card ${c.isRare ? 'rare-case' : c.matchScore >= 80 ? 'supporting' : 'counterfactual'}`}
            >
              <div className="case-header">
                <div>
                  <strong style={{ fontSize: '0.9rem' }}>{c.caseId}</strong>
                  {c.isRare && <span className="rare-badge">RARE</span>}
                </div>
                <div className="case-meta">
                  <span className="match-score">{c.matchScore}% match</span>
                  <span className="badge" style={c.matchScore >= 80 ? { background: 'rgba(22, 163, 74, 0.12)', color: 'var(--success)' } : { background: 'rgba(217, 119, 6, 0.12)', color: 'var(--warning)' }}>
                    {c.matchScore >= 80 ? 'Supporting' : 'Counterfactual'}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{c.presentation}</p>

              <div className="match-criteria">
                {c.matchCriteria.slice(0, 4).map((crit) => (
                  <span key={crit.label} className={`criteria-chip ${crit.matched ? 'matched' : 'unmatched'}`}>
                    {crit.label}
                  </span>
                ))}
                {c.matchCriteria.length > 4 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.2rem 0.4rem' }}>
                    +{c.matchCriteria.length - 4} more
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong>Treatment:</strong> {c.treatmentUsed}
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <strong>Outcome:</strong> <span className="outcome-text">{c.outcome}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Source: {c.source}
              </div>

              {c.matchCriteria.length > 4 && (
                <details
                  style={{ cursor: 'pointer', marginTop: '0.35rem' }}
                  open={isExpanded}
                  onToggle={() => setExpandedCase(isExpanded ? null : c.caseId)}
                >
                  <summary style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </summary>
                  <div className="match-criteria" style={{ marginTop: '0.35rem' }}>
                    {c.matchCriteria.slice(4).map((crit) => (
                      <span key={crit.label} className={`criteria-chip ${crit.matched ? 'matched' : 'unmatched'}`}>
                        {crit.label}
                      </span>
                    ))}
                  </div>
                </details>
              )}

              {c.isRare && (
                <div className="rare-note">
                  Rare presentation — consider with caution. Limited comparative data.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StepFooter />
    </div>
  );
}