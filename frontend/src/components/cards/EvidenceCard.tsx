import type { EvidenceItem } from '../../types';

interface EvidenceCardProps {
  title: string;
  items: EvidenceItem[];
  variant: 'for' | 'against';
}

export function EvidenceCard({ title, items, variant }: EvidenceCardProps) {
  return (
    <div className={`card evidence-card variant-${variant}`}>
      <h4>{title}</h4>
      <ul className="evidence-list">
        {items.map((item, i) => (
          <li key={i}>
            <span className="evidence-text">{item.text}</span>
            {item.source && <span className="evidence-source">{item.source}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
