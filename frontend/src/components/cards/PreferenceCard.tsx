//Card design for Preferences in Patient Overview

import { useState } from 'react';

interface PreferenceCardProps {
  concerns: string[];
  preferences: {
    priorityQoL: string;
    hospitalPreference: string;
    familyInvolvement: string;
  };
}

export function PreferenceCard({ concerns, preferences }: PreferenceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card preference-card">
      <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 600 }}>Quality of Life & Preferences</h4>
      
      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Key Concerns
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {concerns.slice(0, 3).map((c) => (
            <span key={c} style={{
              padding: '0.2rem 0.5rem',
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#0891b2',
              borderRadius: '6px',
              fontSize: '0.8rem',
              border: '1px solid rgba(6, 182, 212, 0.25)',
            }}>
              {c}
            </span>
          ))}
          {concerns.length > 3 && !expanded && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              style={{
                padding: '0.2rem 0.5rem',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              +{concerns.length - 3} more
            </button>
          )}
        </div>
        {expanded && concerns.length > 3 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
            {concerns.slice(3).map((c) => (
              <span key={c} style={{
                padding: '0.2rem 0.5rem',
                background: 'rgba(6, 182, 212, 0.1)',
                color: '#0891b2',
                borderRadius: '6px',
                fontSize: '0.8rem',
                border: '1px solid rgba(6, 182, 212, 0.25)',
              }}>
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Treatment Priority
          </p>
          <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{preferences.priorityQoL}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Hospital Preference
          </p>
          <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{preferences.hospitalPreference}</p>
        </div>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Family Involvement
          </p>
          <p style={{ fontSize: '0.85rem', color: '#0f172a', margin: 0 }}>{preferences.familyInvolvement}</p>
        </div>
      </div>
    </div>
  );
}
