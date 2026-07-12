import { useState } from 'react';
import type { TreatmentOption } from '../../types';
import { RiskBadge } from './RiskBadge';

interface TreatmentOptionCardProps {
  option: TreatmentOption;
  selected?: boolean;
  onSelect?: () => void;
  onView?: () => void;
  showSelect?: boolean;
  optionNumber?: number;
}

const uncertaintyLabels = { low: 'Low uncertainty', moderate: 'Moderate uncertainty', high: 'High uncertainty' };
const evidenceLabels = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence' };

const getCardColor = (strength: string, selected: boolean) => {
  if (selected) return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)' };
  if (strength.includes('Preferred')) return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.02)' };
  return { border: '#e2e8f0', bg: '#ffffff' };
};

const getSuccessRate = (option: TreatmentOption): number => {
  if (option.evidenceStrength === 'strong') return 72;
  if (option.evidenceStrength === 'moderate') return 58;
  return 45;
};

export function TreatmentOptionCard({
  option,
  selected,
  onSelect,
  onView,
  showSelect = false,
  optionNumber,
}: TreatmentOptionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const cardColor = getCardColor(option.strength, selected || false);
  const successRate = getSuccessRate(option);

  return (
    <div
      className="card treatment-option-card"
      style={{
        borderTop: `4px solid ${cardColor.border}`,
        background: cardColor.bg,
        ...(selected ? { border: '2px solid #3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' } : {}),
      }}
      onMouseEnter={onView}
      onFocus={onView}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          {optionNumber && (
            <span style={{
              display: 'inline-block',
              padding: '0.15rem 0.4rem',
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}>
              Option {optionNumber}
            </span>
          )}
          <h4 style={{ margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 600 }}>{option.name}</h4>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
          <span style={{
            padding: '0.2rem 0.5rem',
            background: option.strength.includes('Preferred') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
            color: option.strength.includes('Preferred') ? '#1e40af' : '#64748b',
            borderRadius: '6px',
            fontSize: '0.65rem',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            {option.strength}
          </span>
          <RiskBadge level={option.uncertainty} />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }}>Expected Benefit</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }}>{successRate}%</span>
        </div>
        <div style={{
          height: '6px',
          background: '#e2e8f0',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            height: '100%',
            width: `${successRate}%`,
            background: successRate > 65 ? '#16a34a' : successRate > 50 ? '#d97706' : '#dc2626',
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{evidenceLabels[option.evidenceStrength]}</p>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Key Benefits
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {option.benefits.slice(0, 4).map((b) => (
            <span key={b} style={{
              padding: '0.2rem 0.5rem',
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16a34a',
              borderRadius: '6px',
              fontSize: '0.75rem',
              border: '1px solid rgba(22, 163, 74, 0.25)',
            }}>
              {b}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Key Risks
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {option.risks.slice(0, 3).map((r) => (
            <span key={r} style={{
              padding: '0.2rem 0.5rem',
              background: 'rgba(220, 38, 38, 0.08)',
              color: '#dc2626',
              borderRadius: '6px',
              fontSize: '0.75rem',
              border: '1px solid rgba(220, 38, 38, 0.2)',
            }}>
              {r}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        style={{
          width: '100%',
          padding: '0.4rem 0.6rem',
          background: 'transparent',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#64748b',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: showDetails ? '0.75rem' : 0,
        }}
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {showDetails && (
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
          {option.contraindications.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Contraindications
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }}>
                {option.contraindications.map((c) => (
                  <li key={c} style={{ fontSize: '0.85rem', color: '#475569' }}>• {c}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Comorbidity Considerations
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }}>
              {option.comorbidityConsiderations.slice(0, 3).map((c) => (
                <li key={c} style={{ fontSize: '0.85rem', color: '#475569' }}>• {c}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                QoL Impact
              </p>
              <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{option.qolImpact}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Monitoring
              </p>
              <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{option.monitoring}</p>
            </div>
          </div>

          {option.missingData.length > 0 && (
            <div style={{
              padding: '0.5rem',
              background: 'rgba(254, 243, 199, 0.3)',
              borderRadius: '6px',
              border: '1px dashed #d97706',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Missing Data
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.2rem' }}>
                {option.missingData.map((m) => (
                  <li key={m} style={{ fontSize: '0.8rem', color: '#78350f' }}>• {m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {showSelect && onSelect && (
        <button
          type="button"
          style={{
            width: '100%',
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '0.75rem',
            background: selected ? '#3b82f6' : 'transparent',
            color: selected ? 'white' : '#3b82f6',
            border: selected ? 'none' : '1px solid #3b82f6',
          }}
          onClick={onSelect}
        >
          {selected ? 'Selected' : 'Select Option'}
        </button>
      )}
    </div>
  );
}
