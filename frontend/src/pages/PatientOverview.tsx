import { useEffect, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchCase } from '../services/caseService';
import { buildPatientView, type PatientView } from '../services/patientView';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
import { ClinicalInfoCard } from '../components/cards/ClinicalInfoCard';
import { PreferenceCard } from '../components/cards/PreferenceCard';
import { CompactMissingDataCard } from '../components/cards/CompactMissingDataCard';

export function PatientOverview() {
  const { selectedPatientId } = useWorkflow();
  const [patient, setPatient] = useState<PatientView | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (!selectedPatientId) return;
    fetchCase(selectedPatientId).then((c) => {
      if (c) setPatient(buildPatientView(c));
    });
  }, [selectedPatientId]);

  if (!patient) {
    return (
      <div className="page">
        <PageHeader title="Patient Overview" badge="Step 1" />
        <p className="muted">Loading patient data…</p>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'risks', label: 'Risks' },
    { id: 'qol', label: 'QoL & Preferences' },
    { id: 'missing', label: 'Missing Data' },
  ];

  return (
    <div className="page">
      <PageHeader title="Patient Overview" badge="Step 1" />

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

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'summary' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Diagnosis">
            <p className="value">{patient.diagnosis.primaryDiagnosis}</p>
            <p className="muted">ICD-10: {patient.diagnosis.icd10} — {patient.diagnosis.stage}</p>
            <p className="muted">{patient.diagnosis.histology} · {patient.diagnosis.location}</p>
            <p className="muted">Diagnosed: {patient.diagnosis.diagnosisDate}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Performance Status">
            <p className="value">ECOG {patient.performance.ecog}</p>
            <p className="muted">{patient.performance.ecogDescription}</p>
            <p className="muted">Last assessed: {patient.performance.lastAssessed}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Biomarkers (model features)" variant="highlight">
            <table className="data-table">
              <tbody>
                {patient.biomarkers.map((b) => (
                  <tr key={b.label}>
                    <td>{b.label}</td>
                    <td><span className="highlight">{b.value}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ClinicalInfoCard>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Metastasis status">
            <table className="data-table">
              <tbody>
                {patient.metastases.map((m) => (
                  <tr key={m.site}>
                    <td>{m.site}</td>
                    <td>
                      <span className={m.present ? 'status-elevated' : ''}>
                        {m.present ? 'Detected' : 'Not detected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Key Lab Values" variant="warning">
            <div className="lab-items">
              {patient.labs.map((l) => (
                <div key={l.label} className={`lab-item status-${l.status.toLowerCase()}`}>
                  <span>{l.label}</span>
                  <span className="value">{l.value} {l.unit}</span>
                  <span className="status">{l.status}</span>
                </div>
              ))}
            </div>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Imaging Summary">
            {patient.imaging.map((img) => (
              <div key={img.type} className="imaging-item">
                <div className="imaging-header">
                  <strong>{img.type}</strong>
                  <span className="muted">{img.date}</span>
                </div>
                <p style={{ fontSize: '0.85rem', margin: '0.15rem 0 0' }}>{img.findings}</p>
              </div>
            ))}
          </ClinicalInfoCard>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Comorbidities" variant="highlight">
            <ul className="comorbidity-list">
              {patient.comorbidities.map((c) => (
                <li key={c.name}>
                  <strong>{c.name}</strong>
                  <span className="detail">{c.status}</span>
                  <p className="implication">{c.implications}</p>
                </li>
              ))}
            </ul>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Current Medications" variant="info">
            <ul className="medication-list">
              {patient.medications.map((m) => (
                <li key={m.name}>
                  <strong>{m.name} {m.dose}</strong> — {m.frequency}
                  <p className="muted">{m.relevance}</p>
                </li>
              ))}
            </ul>
          </ClinicalInfoCard>

          {patient.contraindications.length > 0 && (
            <ClinicalInfoCard title="Contraindications" variant="warning">
              <ul className="contraindication-list">
                {patient.contraindications.map((c) => (
                  <li key={c.factor} className={`contra-${c.severity}`}>
                    <strong>{c.factor}</strong>
                    <span className={`severity-badge severity-${c.severity}`}>{c.severity}</span>
                    <p>{c.detail}</p>
                  </li>
                ))}
              </ul>
            </ClinicalInfoCard>
          )}
        </div>
      )}

      {activeTab === 'qol' && (
        <PreferenceCard concerns={patient.qolConcerns} preferences={patient.patientPreferences} />
      )}

      {activeTab === 'missing' && <CompactMissingDataCard items={patient.missingData} />}

      <StepFooter nextLabel="Begin Assessment" />
    </div>
  );
}
