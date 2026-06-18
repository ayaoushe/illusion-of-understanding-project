export function DecisionFactors({ factors }: { factors: any[] }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Decision factors</p>
          <h2>Contextual considerations</h2>
        </div>
      </div>
      <div className="card-grid">
        {factors.map((item) => (
          <article key={item.factor} className="info-card factor-card">
            <h3>{item.factor}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
