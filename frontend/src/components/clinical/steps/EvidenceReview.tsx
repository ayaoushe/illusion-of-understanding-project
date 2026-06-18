export function EvidenceReview({ evidence }: { evidence: any }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Evidence review</p>
          <h2>Key findings and guidelines</h2>
        </div>
      </div>
      <div className="card-grid">
        <article className="info-card">
          <h3>Laboratory results</h3>
          <div className="data-list">
            {evidence.labs.map((lab: any) => (
              <div key={lab.label} className="data-item">
                <span>{lab.label}</span>
                <strong>{lab.result}</strong>
                <small>{lab.status}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="info-card">
          <h3>Imaging impressions</h3>
          <div className="data-list">
            {evidence.imaging.map((item: any) => (
              <div key={item.label} className="data-item">
                <span>{item.label}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="info-card full-width">
          <h3>Practice guidelines</h3>
          <ul className="bullet-list">
            {evidence.guidelines.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
