import { useState } from 'react';
import { mockPatient } from '../data/mockData';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
import { ClinicalInfoCard } from '../components/cards/ClinicalInfoCard';
import { PreferenceCard } from '../components/cards/PreferenceCard';
import { CompactMissingDataCard } from '../components/cards/CompactMissingDataCard';

export function PatientOverview() {
  const { molecular, labs } = mockPatient;
  const hemoglobin = labs.hemoglobin as { value: number; unit: string; status: string; normal: string };
  const ldh = labs.ldh as { value: number; unit: string; status: string; normal: string };
  const crp = (labs.inflammation as { crp: { value: number; unit: string } }).crp;
  const egfr = labs.egfr as { value: number; unit: string; stage: string };

  const [activeTab, setActiveTab] = useState('summary');

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
            <h3>{mockPatient.name}</h3>
            <p className="muted">
              MRN: {mockPatient.mrn} · DOB: {mockPatient.dateOfBirth} ({mockPatient.age} yrs) · {mockPatient.gender}
            </p>
          </div>
          <span className={`priority-badge priority-${mockPatient.priority.toLowerCase()}`}>
            {mockPatient.priority} PRIORITY
          </span>
        </div>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'summary' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Diagnosis">
            <p className="value">{mockPatient.diagnosis.primaryDiagnosis}</p>
            <p className="muted">ICD-10: {mockPatient.diagnosis.icd10} — Stage {mockPatient.diagnosis.stage}</p>
            <p className="muted">{mockPatient.diagnosis.histology} · {mockPatient.diagnosis.location}</p>
            <p className="muted">Diagnosed: {mockPatient.diagnosis.diagnosisDate}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Performance Status">
            <p className="value">ECOG {mockPatient.performance.ecog}</p>
            <p className="muted">{mockPatient.performance.ecogDescription}</p>
            <p className="muted">Last assessed: {mockPatient.performance.lastAssessed}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Key Lab Values" variant="warning">
            <div className="lab-items">
              <div className="lab-item status-low">
                <span>Hemoglobin</span>
                <span className="value">{hemoglobin.value} {hemoglobin.unit}</span>
                <span className="status">LOW</span>
              </div>
              <div className="lab-item status-elevated">
                <span>LDH</span>
                <span className="value">{ldh.value} {ldh.unit}</span>
                <span className="status">ELEVATED</span>
              </div>
              <div className="lab-item status-elevated">
                <span>CRP</span>
                <span className="value">{crp.value} {crp.unit}</span>
                <span className="status">ELEVATED</span>
              </div>
              <div className="lab-item">
                <span>eGFR</span>
                <span className="value">{egfr.value} {egfr.unit}</span>
                <span className="status">G2</span>
              </div>
            </div>
          </ClinicalInfoCard>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Pathology & Molecular">
            <table className="data-table">
              <tbody>
                <tr><td>Histology</td><td>{mockPatient.diagnosis.histology}</td></tr>
                <tr><td>EGFR</td><td>{molecular.egfr.mutation} — <span className="highlight">{molecular.egfr.status}</span></td></tr>
                <tr><td>ALK</td><td>{molecular.alk.status}</td></tr>
                <tr><td>PD-L1 TPS</td><td>{molecular.pdl1.tps} ({molecular.pdl1.level})</td></tr>
                <tr><td>TMB</td><td>{molecular.tmb.value} {molecular.tmb.unit} ({molecular.tmb.level})</td></tr>
                <tr><td>KRAS</td><td>{molecular.kras.status}</td></tr>
              </tbody>
            </table>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Imaging Summary">
            {mockPatient.imaging.map((img) => (
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
              {mockPatient.comorbidities.map((c) => (
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
              {mockPatient.medications.map((m) => (
                <li key={m.name}>
                  <strong>{m.name} {m.dose}</strong> — {m.frequency}
                  <p className="muted">{m.relevance}</p>
                </li>
              ))}
            </ul>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Contraindications" variant="warning">
            <ul className="contraindication-list">
              {mockPatient.contraindications.map((c) => (
                <li key={c.factor} className={`contra-${c.severity}`}>
                  <strong>{c.factor}</strong>
                  <span className={`severity-badge severity-${c.severity}`}>{c.severity}</span>
                  <p>{c.detail}</p>
                </li>
              ))}
            </ul>
          </ClinicalInfoCard>
        </div>
      )}

      {activeTab === 'qol' && (
        <PreferenceCard concerns={mockPatient.qolConcerns} preferences={mockPatient.patientPreferences} />
      )}

      {activeTab === 'missing' && (
        <CompactMissingDataCard items={mockPatient.missingData} />
      )}

      <StepFooter nextLabel="Begin Assessment" />
    </div>
  );
}