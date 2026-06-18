export function HumanAssessment({ assessment }: { assessment: any }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Human assessment</p>
          <h2>Clinical reasoning summary</h2>
        </div>
      </div>
      <div className="card-grid">
        <article className="info-card">
          <h3>Clinician notes</h3>
          <p>{assessment.clinicianNotes}</p>
        </article>
        <article className="info-card">
          <h3>Most likely diagnosis</h3>
          <p>{assessment.likelyDiagnosis}</p>
        </article>
        <article className="info-card full-width">
          <h3>Primary concerns</h3>
          <ul className="bullet-list">
            {assessment.concerns.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
