interface MissingDataCardProps {
  items: string[];
}

export function MissingDataCard({ items }: MissingDataCardProps) {
  return (
    <div className="card missing-data-card">
      <h4>Missing Data</h4>
      <p className="missing-intro">The following information gaps may affect decision confidence:</p>
      <ul className="missing-list">
        {items.map((item) => (
          <li key={item}>
            <span className="missing-icon">?</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
