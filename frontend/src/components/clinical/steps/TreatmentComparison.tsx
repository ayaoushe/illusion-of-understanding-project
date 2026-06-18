export function TreatmentComparison({ treatments }: { treatments: any[] }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Treatment comparison</p>
          <h2>Option matrix</h2>
        </div>
      </div>
      <div className="grid-cols-3">
        {treatments.map((item) => (
          <article key={item.name} className="info-card treatment-card">
            <h3>{item.name}</h3>
            <div className="card-detail">
              <strong>Benefit</strong>
              <p>{item.benefit}</p>
            </div>
            <div className="card-detail">
              <strong>Risk</strong>
              <p>{item.risk}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
