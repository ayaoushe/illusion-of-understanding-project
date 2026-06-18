export function PatientOverview({ patient }: { patient: any }) {
  return (
    <section>
      <div className="section-header">
        <div>
          <p className="section-label">Patient overview</p>
          <h2>{patient.name}</h2>
        </div>
        <span className="pill">ID {patient.id}</span>
      </div>
      <div className="card-grid">
        <article className="info-card">
          <h3>Clinical summary</h3>
          <p>{patient.summary}</p>
        </article>
        <article className="info-card">
          <h3>Current encounter</h3>
          <p>{patient.encounter}</p>
        </article>
        <article className="info-card full-width">
          <h3>Vitals</h3>
          <div className="data-list">
            {patient.vitals.map((item: any) => (
              <div key={item.label} className="data-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
