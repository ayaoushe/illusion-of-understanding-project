import type { EvidenceItem } from '../../types';
import { SourceBadge } from './SourceBadge';

interface EvidenceCardProps {
  title: string;
  items: EvidenceItem[];
  variant: 'for' | 'against';
}

const getSourceTypeFromLabel = (label: string): 'guideline' | 'pubmed' | 'doi' | 'rct' | 'review' => {
  const lower = label.toLowerCase();
  if (lower.includes('guideline') || lower.includes('nccn')) return 'guideline';
  if (lower.includes('pubmed')) return 'pubmed';
  if (lower.includes('doi')) return 'doi';
  if (lower.includes('trial') || lower.includes('rct') || lower.includes('flaura') || lower.includes('pacific')) return 'rct';
  return 'review';
};

export function EvidenceCard({ title, items, variant }: EvidenceCardProps) {
  return (
    <div className={`card evidence-card variant-${variant}`}>
      <h4>{title}</h4>
      <ul className="evidence-list">
        {items.map((item, i) => (
          <li key={i}>
            <span className="evidence-text">{item.text}</span>
            <div className="evidence-meta">
              {item.source && <span className="evidence-source">{item.source}</span>}
              {item.source && (
                <div className="evidence-source-badges">
                  <SourceBadge type={getSourceTypeFromLabel(item.source)} disabled />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
