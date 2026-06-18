import type { TreatmentOption } from '../../types';

interface TreatmentOptionCardProps {
  option: TreatmentOption;
  selected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  showSelect?: boolean;
}

const uncertaintyLabels = { low: 'Low uncertainty', moderate: 'Moderate uncertainty', high: 'High uncertainty' };
const evidenceLabels = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence' };

export function TreatmentOptionCard({
  option,
  selected,
  onSelect,
  onView,
  showSelect = false,
}: TreatmentOptionCardProps) {
  return (
    <div
      className={`card treatment-option-card ${selected ? 'selected' : ''}`}
      onMouseEnter={onView}
      onFocus={onView}
    >
      <div className="treatment-header">
        <h4>{option.name}</h4>
        <div className="treatment-badges">
          <span className="strength-badge">{option.strength}</span>
          <span className={`uncertainty-badge uncertainty-${option.uncertainty}`}>
            {uncertaintyLabels[option.uncertainty]}
          </span>
        </div>
      </div>

      <p className="evidence-strength-label">{evidenceLabels[option.evidenceStrength]}</p>

      <div className="treatment-cols">
        <div>
          <p className="label">Expected Benefit</p>
          <ul className="bullet-list compact">
            {option.benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">Main Risks</p>
          <ul className="bullet-list compact">
            {option.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>

      {option.contraindications.length > 0 && (
        <div className="treatment-section alert-warning-inline">
          <p className="label">Contraindications</p>
          <ul className="bullet-list compact">
            {option.contraindications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="treatment-section">
        <p className="label">Comorbidity Considerations</p>
        <ul className="bullet-list compact">
          {option.comorbidityConsiderations.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="treatment-meta">
        <div>
          <p className="label">QoL Impact</p>
          <p className="meta-text">{option.qolImpact}</p>
        </div>
        <div>
          <p className="label">Monitoring</p>
          <p className="meta-text">{option.monitoring}</p>
        </div>
      </div>

      {option.missingData.length > 0 && (
        <div className="treatment-missing">
          <p className="label">Missing Data</p>
          <ul className="bullet-list compact">
            {option.missingData.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {showSelect && onSelect && (
        <button
          type="button"
          className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`}
          onClick={onSelect}
        >
          {selected ? 'Selected' : 'Select Option'}
        </button>
      )}
    </div>
  );
}
