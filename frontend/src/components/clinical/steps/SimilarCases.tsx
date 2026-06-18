export function SimilarCases({ similarCases }: { similarCases: any[] }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Similar cases</p>
          <h2>Reference cohort</h2>
        </div>
      </div>
      <div className="card-grid">
        {similarCases.map((item) => (
          <article key={item.caseId} className="info-card case-card">
            <h3>{item.caseId}</h3>
            <p>{item.outcome}</p>
            <ul className="bullet-list">
              {item.features.map((feature: string) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
