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


//Step 1: Patient Clinical summary 
const LAB_STATUS_CLASS: Record<string, string> = {
  LOW: 'status-low',
  ELEVATED: 'status-elevated',
  NORMAL: '',
};

export function PatientOverview() {
  const { selectedPatientId } = useWorkflow();
  const [view, setView] = useState<PatientView | null>(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Der Patient wird aus dem echten Studienfall abgeleitet (study_cases.json),
  // nicht aus statischen Mock-Profilen.
  useEffect(() => {
    if (!selectedPatientId) {
      setView(null);
      return;
    }

    let cancelled = false;
    fetchCase(selectedPatientId)
      .then((studyCase) => {
        if (!cancelled) setView(studyCase ? buildPatientView(studyCase) : null);
      })
      .catch(() => {
        if (!cancelled) setView(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'risks', label: 'Risks' },
    { id: 'qol', label: 'QoL & Preferences' },
    { id: 'missing', label: 'Missing Data' },
  ];

  if (!view) {
    return (
      <div className="page">
        <PageHeader title="Patient Overview" badge="Step 1" />
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            {selectedPatientId ? 'Loading patient data…' : 'Select a case to begin.'}
          </p>
        </div>
      </div>
    );
  }

  const activeMetastases = view.metastases.filter((m) => m.present);

  return (
    <div className="page">
      <PageHeader title="Patient Overview" badge="Step 1" />

      <div className="card patient-summary-card">
        <div className="patient-header">
          <div>
            <h3>{view.name}</h3>
            <p className="muted">
              MRN: {view.mrn} · {view.age} yrs · {view.gender}
            </p>
          </div>
        </div>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'summary' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Diagnosis">
            <p className="value">{view.diagnosis.primaryDiagnosis}</p>
            <p className="muted">ICD-10: {view.diagnosis.icd10} — {view.diagnosis.stage}</p>
            <p className="muted">{view.diagnosis.histology}</p>
            <p className="muted">{view.diagnosis.location}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Performance Status">
            <p className="value">{view.performance.ecog !== null ? `ECOG ${view.performance.ecog}` : 'ECOG —'}</p>
            <p className="muted">{view.performance.ecogDescription}</p>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Key Lab Values" variant="warning">
            <div className="lab-items">
              {view.labs.map((lab) => (
                <div key={lab.label} className={`lab-item ${LAB_STATUS_CLASS[lab.status] ?? ''}`}>
                  <span>{lab.label}</span>
                  <span className="value">{lab.value} {lab.unit}</span>
                  <span className="status">{lab.status}</span>
                </div>
              ))}
            </div>
          </ClinicalInfoCard>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div className="overview-grid">
          <ClinicalInfoCard title="Pathology & Biomarkers">
            <table className="data-table">
              <tbody>
                <tr>
                  <td>Histology</td>
                  <td>{view.diagnosis.histology}</td>
                </tr>
                {view.biomarkers.map((b) => (
                  <tr key={b.label}>
                    <td>{b.label}</td>
                    <td>{b.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Documented Tumor Sites">
            {activeMetastases.length > 0 ? (
              <ul className="comorbidity-list">
                {activeMetastases.map((m) => (
                  <li key={m.site}>
                    <strong>{m.site}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ margin: 0 }}>No distant tumor sites documented.</p>
            )}
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Imaging Summary">
            {view.imaging.map((img) => (
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
              {view.comorbidities.map((c) => (
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
              {view.medications.map((m) => (
                <li key={m.name}>
                  <strong>{m.name} {m.dose}</strong> — {m.frequency}
                  <p className="muted">{m.relevance}</p>
                </li>
              ))}
            </ul>
          </ClinicalInfoCard>

          <ClinicalInfoCard title="Contraindications" variant="warning">
            <ul className="contraindication-list">
              {view.contraindications.map((c) => (
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
        <PreferenceCard concerns={view.qolConcerns} preferences={view.patientPreferences} />
      )}

      {activeTab === 'missing' && <CompactMissingDataCard items={view.missingData} />}

      <StepFooter nextLabel="Begin Assessment" />
    </div>
  );
}
