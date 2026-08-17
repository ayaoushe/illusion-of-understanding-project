import { useEffect, useState } from 'react';
import { mockSimilarCases } from '../data/mockData';
import { fetchCase } from '../services/caseService';
import { buildSimilarCases } from '../services/similarCaseView';
import { useWorkflow } from '../context/WorkflowContext';
import type { SimilarCase } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

export function SimilarCases() {
  const { recordInteraction, selectedPatientId } = useWorkflow();
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [cases, setCases] = useState<SimilarCase[]>(mockSimilarCases);

  useEffect(() => {
    recordInteraction({ type: 'similar_cases_view' });
  }, [recordInteraction]);

  useEffect(() => {
    if (!selectedPatientId) return;
    let cancelled = false;
    fetchCase(selectedPatientId)
      .then((c) => {
        if (cancelled || !c) return;
        const real = buildSimilarCases(c);
        if (real.length) setCases(real);
      })
      .catch(() => {
        /* Keep the placeholder if remote data is unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  return (
    <div className="page">
      <PageHeader title="Similar Cases" badge="Step 5" />

      <div className="card" style={{ marginBottom: '0.9rem', padding: '0.8rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span className="label">Clinical context</span>
        </div>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          Compare this patient with prior cases that match on key clinical features. Matching cases reflect treatments the model recommends; counterfactual cases show alternative regimens for context only.
        </p>
      </div>

      <div className="similar-cases-grid">
        {cases.map((c) => {
          const isExpanded = expandedCase === c.caseId;
          const visibleCriteria = isExpanded ? c.matchCriteria : c.matchCriteria.slice(0, 4);
          const isCounterfactual = typeof c.isCounterfactual === 'boolean' ? c.isCounterfactual : c.matchScore < 80;

          return (
            <div
              key={c.caseId}
              className={`card similar-case-card ${c.isRare ? 'rare-case' : isCounterfactual ? 'counterfactual' : 'supporting'}`}
            >
              <div className="case-header">
                <div className="case-title-wrap">
                  <strong className="case-id">{c.caseId}</strong>
                  {c.isRare && <span className="rare-badge">RARE</span>}
                </div>

                <div className="case-meta">
                  <span className="match-score">{c.matchScore}% match</span>
                  <span
                    className="badge"
                    style={
                      !isCounterfactual
                        ? { background: 'rgba(22, 163, 74, 0.12)', color: 'var(--success)' }
                        : { background: 'rgba(217, 119, 6, 0.12)', color: 'var(--warning)' }
                    }
                  >
                    {isCounterfactual ? 'Counterfactual' : 'Supporting'}
                  </span>
                </div>
              </div>

              <p className="case-presentation">{c.presentation}</p>

              <div className="case-key-stats">
                <div className="case-stat treatment-stat">
                  <span className="case-stat-label">Treatment</span>
                  <strong className="case-stat-value">{c.treatmentUsed}</strong>
                </div>
                <div className="case-stat outcome-stat">
                  <span className="case-stat-label">Outcome</span>
                  <strong className="case-stat-value outcome-text">{c.outcome}</strong>
                </div>
              </div>

              <div className="similarity-panel">
                <div className="similarity-header">
                  <span>Similarity factors</span>
                </div>

                <div className="match-criteria">
                  {visibleCriteria.map((crit) => (
                    <span key={crit.label} className={`criteria-chip ${crit.matched ? 'matched' : 'unmatched'}`}>
                      {crit.label}
                    </span>
                  ))}
                  {c.matchCriteria.length > 4 && (
                    <button
                      type="button"
                      className="more-pill"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedCase(isExpanded ? null : c.caseId)}
                    >
                      {isExpanded ? 'Hide' : `+${c.matchCriteria.length - 4} more`}
                    </button>
                  )}
                </div>
              </div>

              <div className="case-source">Source: {c.source}</div>

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