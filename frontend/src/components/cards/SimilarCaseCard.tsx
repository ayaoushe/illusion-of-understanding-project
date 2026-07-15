import type { SimilarCase } from '../../types';

interface SimilarCaseCardProps {
  caseData: SimilarCase;
}

const getCaseType = (caseData: SimilarCase): 'supporting' | 'counterfactual' | 'neutral' => {
  if (caseData.caseType === 'rare') return 'counterfactual';
  if (caseData.caseType === 'supporting') return 'supporting';
  return 'neutral';
};

const getCaseColor = (type: 'supporting' | 'counterfactual' | 'neutral') => {
  switch (type) {
    case 'supporting':
      return { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.03)', badge: 'rgba(22, 163, 74, 0.12)', badgeText: '#16a34a' };
    case 'counterfactual':
      return { border: '#d97706', bg: 'rgba(217, 119, 6, 0.03)', badge: 'rgba(217, 119, 6, 0.12)', badgeText: '#d97706' };
    default:
      return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.02)', badge: 'rgba(59, 130, 246, 0.12)', badgeText: '#3b82f6' };
  }
};

export function SimilarCaseCard({ caseData }: SimilarCaseCardProps) {
  const caseType = getCaseType(caseData);
  const colors = getCaseColor(caseType);

  const matchedCriteria = caseData.matchCriteria.filter((c) => c.matched);
  const unmatchedCriteria = caseData.matchCriteria.filter((c) => !c.matched);

  return (
    <div
      className="card similar-case-card"
      style={{
        borderTop: `4px solid ${colors.border}`,
        background: colors.bg,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <strong style={{ fontSize: '1rem', fontWeight: 600 }}>{caseData.caseId}</strong>
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }}>
            <span style={{
              padding: '0.15rem 0.4rem',
              background: colors.badge,
              color: colors.badgeText,
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>
              {caseType === 'supporting' ? 'Supporting' : caseType === 'counterfactual' ? 'Counterfactual' : 'Similar'}
            </span>
            {caseData.caseType === 'rare' && (
              <span style={{
                padding: '0.15rem 0.4rem',
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#0891b2',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                Rare
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.border,
          }}>
            {caseData.matchScore}%
          </span>
          <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0.15rem 0 0', textTransform: 'uppercase' }}>Match</p>
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Match Criteria
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {matchedCriteria.slice(0, 5).map((c) => (
            <span key={c.label} style={{
              padding: '0.2rem 0.4rem',
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16a34a',
              borderRadius: '4px',
              fontSize: '0.7rem',
              border: '1px solid rgba(22, 163, 74, 0.25)',
            }}>
              ✓ {c.label}
            </span>
          ))}
          {unmatchedCriteria.length > 0 && (
            <span style={{
              padding: '0.2rem 0.4rem',
              background: 'rgba(100, 116, 139, 0.1)',
              color: '#64748b',
              borderRadius: '4px',
              fontSize: '0.7rem',
              border: '1px solid rgba(100, 116, 139, 0.2)',
            }}>
              ○ {unmatchedCriteria[0].label}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Presentation
        </p>
        <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0, lineHeight: 1.5 }}>{caseData.presentation}</p>
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Treatment & Outcome
        </p>
        <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: '0 0 0.25rem', fontWeight: 500 }}>{caseData.treatmentUsed}</p>
        <p style={{ fontSize: '0.85rem', color: caseType === 'supporting' ? '#16a34a' : caseType === 'counterfactual' ? '#d97706' : '#3b82f6', margin: 0, fontWeight: 500 }}>
          {caseData.outcome}
        </p>
      </div>

      <div style={{
        padding: '0.5rem',
        background: 'rgba(100, 116, 139, 0.05)',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
      }}>
        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
          <strong>Source:</strong> {caseData.source}
        </p>
      </div>

      {caseData.caseType === 'rare' && (
        <p style={{
          fontSize: '0.75rem',
          color: '#d97706',
          margin: '0.5rem 0 0',
          fontStyle: 'italic',
        }}>
          Rare presentations can inform decisions when guideline evidence is limited.
        </p>
      )}
    </div>
  );
}
