interface PreferenceCardProps {
  concerns: string[];
  preferences: {
    priorityQoL: string;
    hospitalPreference: string;
    familyInvolvement: string;
  };
}

export function PreferenceCard({ concerns, preferences }: PreferenceCardProps) {
  return (
    <div className="card preference-card">
      <h4>Quality of Life & Patient Preferences</h4>
      <div className="preference-section">
        <p className="label">QoL Concerns</p>
        <ul className="bullet-list">
          {concerns.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <div className="preference-grid">
        <div>
          <p className="label">Treatment Priority</p>
          <p>{preferences.priorityQoL}</p>
        </div>
        <div>
          <p className="label">Hospital Preference</p>
          <p>{preferences.hospitalPreference}</p>
        </div>
        <div>
          <p className="label">Family Involvement</p>
          <p>{preferences.familyInvolvement}</p>
        </div>
      </div>
    </div>
  );
}
