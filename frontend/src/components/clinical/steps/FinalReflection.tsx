export function FinalReflection({ reflection }: { reflection: any }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Final reflection</p>
          <h2>Reasoning summary</h2>
        </div>
      </div>
      <div className="card-grid">
        <article className="info-card full-width">
          <h3>{reflection.question}</h3>
          <p>{reflection.notes}</p>
        </article>
        <article className="info-card">
          <h3>Next steps</h3>
          <ul className="bullet-list">
            {reflection.nextSteps.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
