import type { RiskFlag } from '../../types';

interface RiskFlagCardProps {
  flag: RiskFlag;
}

const severityLabels = { high: 'High', moderate: 'Moderate', low: 'Low' };

export function RiskFlagCard({ flag }: RiskFlagCardProps) {
  return (
    <div className={`card risk-flag-card severity-${flag.severity}`}>
      <div className="risk-flag-header">
        <span className="risk-flag-icon">⚠</span>
        <strong>{flag.title}</strong>
        <span className={`severity-badge severity-${flag.severity}`}>{severityLabels[flag.severity]}</span>
      </div>
      <p>{flag.description}</p>
      {flag.relatedTreatments && flag.relatedTreatments.length > 0 && (
        <div className="risk-related">
          <span className="label">Affects:</span>
          {flag.relatedTreatments.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
