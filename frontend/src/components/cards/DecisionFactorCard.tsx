import type { DecisionChangeFactor } from '../../types';

interface DecisionFactorCardProps {
  factor: DecisionChangeFactor;
}

export function DecisionFactorCard({ factor }: DecisionFactorCardProps) {
  return (
    <div className="card decision-factor-card">
      <span className="factor-category">{factor.category}</span>
      <h4>{factor.factor}</h4>
      <p>{factor.description}</p>
      <div className="factor-trigger">
        <span className="label">If this changes:</span>
        <p>{factor.trigger}</p>
      </div>
    </div>
  );
}
