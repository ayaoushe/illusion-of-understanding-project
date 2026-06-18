import type { SimilarCase } from '../../types';

interface SimilarCaseCardProps {
  caseData: SimilarCase;
}

export function SimilarCaseCard({ caseData }: SimilarCaseCardProps) {
  return (
    <div className={`card similar-case-card ${caseData.isRare ? 'rare-case' : ''}`}>
      <div className="case-header">
        <div>
          <strong>{caseData.caseId}</strong>
          {caseData.isRare && <span className="rare-badge">Rare Case</span>}
        </div>
        <div className="case-meta">
          <span className="match-score">{caseData.matchScore}% match</span>
          <span className="badge">{caseData.source}</span>
        </div>
      </div>

      <p className="label">Why Similar</p>
      <div className="match-criteria">
        {caseData.matchCriteria.map((c) => (
          <span key={c.label} className={`criteria-chip ${c.matched ? 'matched' : 'unmatched'}`}>
            {c.matched ? '✓' : '○'} {c.label}
          </span>
        ))}
      </div>

      <p className="label">Presentation</p>
      <p>{caseData.presentation}</p>

      <p className="label">Treatment & Outcome</p>
      <p>{caseData.treatmentUsed}</p>
      <p className="outcome-text">{caseData.outcome}</p>

      {caseData.isRare && (
        <p className="rare-note">
          Rare presentations can inform decisions when guideline evidence is limited.
        </p>
      )}
    </div>
  );
}
