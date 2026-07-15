import { useEffect, useState } from 'react';
import { similarCasesByPatient } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

export function SimilarCases() {
  const { recordInteraction, selectedPatientId } = useWorkflow();
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const similarCases = selectedPatientId
    ? similarCasesByPatient[selectedPatientId as keyof typeof similarCasesByPatient] ?? []
    : [];

  const emptyStateText = selectedPatientId
    ? 'Für diesen Patienten wurden noch keine ähnlichen Fälle hinterlegt.'
    : 'Wähle zuerst einen Patienten aus, um patientenspezifische Vergleichsfälle zu sehen.';

  useEffect(() => {
    recordInteraction({ type: 'similar_cases_view' });
  }, [recordInteraction]);

  return (
    <div className="page">
      <PageHeader title="Similar & Rare Cases" badge="Step 5" />

      <div className="similar-cases-grid">
        {similarCases.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {emptyStateText}
          </div>
        ) : (
          similarCases.map((c) => {
            const isExpanded = expandedCase === c.caseId;
            const isRare = c.caseType === 'rare';
            const badgeLabel = isRare ? 'Rare' : c.caseType === 'supporting' ? 'Supporting' : 'Counterfactual';
            const badgeStyle = isRare
              ? { background: 'rgba(190, 18, 60, 0.12)', color: 'var(--danger)' }
              : c.caseType === 'supporting'
              ? { background: 'rgba(22, 163, 74, 0.12)', color: 'var(--success)' }
              : { background: 'rgba(217, 119, 6, 0.12)', color: 'var(--warning)' };

            return (
              <div
                key={c.caseId}
                className={`card similar-case-card ${isRare ? 'rare-case' : c.caseType === 'supporting' ? 'supporting' : 'counterfactual'}`}
              >
                <div className="case-header">
                  <div className="case-header-main">
                    <div className="case-id-row">
                      <strong className="case-id">{c.caseId}</strong>
                      {isRare && <span className="rare-badge">Rare</span>}
                    </div>
                    <span className="case-badge" style={badgeStyle}>
                      {badgeLabel}
                    </span>
                  </div>
                  <div className="case-meta">
                    <span className="match-score">{c.matchScore}% match</span>
                  </div>
                </div>

                <div className="case-section similarities">
                  <div className="case-section-title">Similarities</div>
                  <div className="similarity-list">
                    {c.similarities.slice(0, 3).map((item) => (
                      <span key={item} className="similarity-pill">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="case-section differences">
                  <div className="case-section-title">Key differences</div>
                  <div className="difference-list">
                    {c.differences.slice(0, 2).map((difference) => (
                      <div key={`${difference.feature}-${difference.currentPatient}`} className="difference-row">
                        <div className="difference-cell difference-feature">{difference.feature}</div>
                        <div className="difference-cell">
                          <span className="difference-label">Current patient</span>
                          <span>{difference.currentPatient}</span>
                        </div>
                        <div className="difference-cell">
                          <span className="difference-label">Similar case</span>
                          <span>{difference.comparisonCase}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="case-takeaway">{c.takeaway}</p>
                <div className="case-meta-line">
                  <strong>Treatment:</strong> {c.treatmentUsed}
                </div>
                <div className="case-meta-line">
                  <strong>Outcome:</strong> <span className="outcome-text">{c.outcome}</span>
                </div>

                <details
                  className="case-details"
                  open={isExpanded}
                  onToggle={() => setExpandedCase(isExpanded ? null : c.caseId)}
                >
                  <summary className="details-toggle">{isExpanded ? 'Hide details' : 'Show details'}</summary>
                  <div className="detail-panel">
                    <div className="detail-group">
                      <div className="detail-label">Presentation</div>
                      <div className="detail-text">{c.presentation}</div>
                    </div>

                    {c.matchCriteria.length > 0 && (
                      <div className="detail-group">
                        <div className="detail-label">Match criteria</div>
                        <div className="detail-list">
                          {c.matchCriteria.map((crit) => (
                            <span key={crit.label} className={`criteria-chip ${crit.matched ? 'matched' : 'unmatched'}`}>
                              {crit.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="detail-group">
                      <div className="detail-label">Treatment</div>
                      <div className="detail-text">{c.treatmentUsed}</div>
                    </div>

                    <div className="detail-group">
                      <div className="detail-label">Outcome</div>
                      <div className="detail-text">{c.outcome}</div>
                    </div>

                    <div className="detail-group">
                      <div className="detail-label">Source</div>
                      <div className="detail-text">{c.source}</div>
                    </div>
                  </div>
                </details>
              </div>
            );
          })
        )}
      </div>

      <StepFooter />
    </div>
  );
}