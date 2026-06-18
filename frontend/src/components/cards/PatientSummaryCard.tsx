import type { Patient } from '../../types';

interface PatientSummaryCardProps {
  patient: Patient;
}

export function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  return (
    <div className="card patient-summary-card">
      <div className="patient-header">
        <div>
          <h3>{patient.name}</h3>
          <p className="muted">
            MRN: {patient.mrn} · DOB: {patient.dateOfBirth} ({patient.age} yrs) · {patient.gender}
          </p>
        </div>
        <span className={`priority-badge priority-${patient.priority.toLowerCase()}`}>
          {patient.priority} PRIORITY
        </span>
      </div>
    </div>
  );
}
