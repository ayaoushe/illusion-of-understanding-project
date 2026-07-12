import { useState } from 'react';

interface CompactMissingDataCardProps {
  items: string[];
}

export function CompactMissingDataCard({ items }: CompactMissingDataCardProps) {
  const [expanded, setExpanded] = useState(false);
  const displayCount = 3;
  const showMore = items.length > displayCount;

  const displayItems = expanded ? items : items.slice(0, displayCount);

  return (
    <div className="card compact-missing-data-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>Missing Data</h4>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>{items.length} items</span>
      </div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem' }}>
        Information gaps may affect decision confidence
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.35rem' }}>
        {displayItems.map((item) => (
          <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.85rem' }}>
            <span
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#d97706',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              !
            </span>
            {item}
          </li>
        ))}
      </ul>
      {showMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            marginTop: '0.5rem',
            padding: '0.3rem 0.6rem',
            background: 'transparent',
            border: '1px solid #d97706',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#d97706',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {expanded ? 'Show less' : `Show ${items.length - displayCount} more`}
        </button>
      )}
    </div>
  );
}
