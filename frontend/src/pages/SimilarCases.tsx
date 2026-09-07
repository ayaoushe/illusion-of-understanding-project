import { useEffect, useState } from 'react';
import { fetchCase } from '../services/caseService';
import { buildSimilarCases } from '../services/similarCaseView';
import { useWorkflow } from '../context/WorkflowContext';
import type { SimilarCase } from '../types';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

/** Badge background/text color per relation — kept inline since relation is dynamic. */
const RELATION_STYLE: Record<SimilarCase['relation'], { background: string; color: string }> = {
  current: { background: 'rgba(100, 116, 139, 0.12)', color: 'var(--muted, #64748b)' },
  supporting_ai: { background: 'rgba(22, 163, 74, 0.12)', color: 'var(--success, #16a34a)' },
  supporting_doctor: { background: 'rgba(37, 99, 235, 0.12)', color: 'var(--info, #2563eb)' },
  not_supporting: { background: 'rgba(217, 119, 6, 0.12)', color: 'var(--warning, #d97706)' },
};

const CARD_CLASS: Record<SimilarCase['relation'], string> = {
  current: 'current-case',
  supporting_ai: 'supporting supporting-ai',
  supporting_doctor: 'supporting supporting-doctor',
  not_supporting: 'counterfactual',
};

//Step 5: Shows the patients most similar cases to show how they were treated and the outcome
export function SimilarCases() {
  const { recordInteraction, selectedPatientId, assessment } = useWorkflow();
  // Leer starten statt mit NSCLC-Platzhaltern: bis die echten Nachbarn geladen
  // sind, soll nichts dastehen, was wie ein Vergleichsfall aussieht.
  const [cases, setCases] = useState<SimilarCase[]>([]);

  useEffect(() => {
    recordInteraction({ type: 'similar_cases_view' });
  }, [recordInteraction]);

  useEffect(() => {
    if (!selectedPatientId) return;
    let cancelled = false;
    fetchCase(selectedPatientId)
      .then((c) => {
        if (cancelled || !c) return;
        const real = buildSimilarCases(c, assessment?.selectedTreatment ?? null);
        if (real.length) setCases(real);
      })
      .catch(() => {
        /* Ohne Falldaten bleibt die Liste leer. */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId, assessment?.selectedTreatment]);

  return (
    <div className="page">
      <PageHeader title="Similar Cases" badge="Step 5" />

      <div className="card" style={{ marginBottom: '0.9rem', padding: '0.8rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
          <span className="label">Clinical context</span>
        </div>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>
          Compare this patient with prior registry cases that match on key clinical features. Two cases received the
          same treatment as the AI recommendation or the doctor's actual choice; two received a different treatment
          than both, for contrast.
        </p>
      </div>

      <div className="similar-cases-grid">
        {cases.length === 0 && (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              {selectedPatientId ? 'Loading comparable cases…' : 'Select a case to begin.'}
            </p>
          </div>
        )}
        {cases.map((c, index) => {
          const isCurrent = c.relation === 'current';
          const badgeStyle = RELATION_STYLE[c.relation];
          const counterfactualIndex =
            c.relation === 'not_supporting'
              ? cases.slice(0, index + 1).filter((item) => item.relation === 'not_supporting').length
              : 0;
          const positionClass =
            c.relation === 'not_supporting' ? `counterfactual-${counterfactualIndex}` : '';

          return (
            <div
              key={c.caseId}
              className={`card similar-case-card ${CARD_CLASS[c.relation]} ${c.isRare ? 'rare-case' : ''} ${positionClass}`}
            >
              <div className="case-header">
                <div className="case-title-wrap">
                  <strong className="case-id">{c.caseId}</strong>
                  {c.isRare && <span className="rare-badge">RARE</span>}
                </div>

                <div className="case-meta">
                  {!isCurrent && <span className="match-score">{c.matchScore}% match</span>}
                  <span className="badge" style={badgeStyle}>
                    {c.relationLabel}
                  </span>
                </div>
              </div>

              <p className="case-presentation">{c.presentation}</p>

              {isCurrent ? (
                <p className="muted" style={{ fontSize: '0.82rem', margin: '0 0 0.6rem' }}>
                  {c.relationDescription}
                </p>
              ) : (
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
              )}

              <div className="similarity-panel">
                <div className="similarity-header">
                  <span>{isCurrent ? 'Clinical profile' : 'Similarity factors'}</span>
                </div>

                <div className="match-criteria">
                  {c.matchCriteria.map((crit) => (
                    <span
                      key={crit.label}
                      className={`criteria-chip ${isCurrent ? 'reference' : crit.matched ? 'matched' : 'unmatched'}`}
                    >
                      {crit.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="case-source">Source: {c.source}</div>

              
            </div>
          );
        })}
      </div>

      <StepFooter />
    </div>
  );
}