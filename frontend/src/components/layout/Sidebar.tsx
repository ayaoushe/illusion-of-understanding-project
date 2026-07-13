import { mockPatient } from '../../data/mockData';
import { useWorkflow } from '../../context/WorkflowContext';
import { STUDY_NAMES, mrnFromId } from '../../config/studyCases';
import { StepNavigation } from './StepNavigation';

export function Sidebar() {
  const { steps, currentStep, canAccessStep, goToStep, clearPatient, selectedPatientId } = useWorkflow();

  const patientName = selectedPatientId ? STUDY_NAMES[selectedPatientId] ?? selectedPatientId : mockPatient.name;

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={clearPatient} title="Zurück zur Patientenauswahl">
        <h1>OncoCDSS</h1>
        <p>Clinical Decision Support</p>
      </button>

      <div className="sidebar-patient">
        <span className="sidebar-patient-label">Current Patient</span>
        <strong>{patientName}</strong>
        <span className="sidebar-patient-mrn">MRN: {selectedPatientId ? mrnFromId(selectedPatientId) : mockPatient.mrn}</span>
      </div>

      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        canAccessStep={canAccessStep}
        onStepClick={goToStep}
      />

      <div className="sidebar-footer">
        <div className="sidebar-clinician">
          <span>{mockPatient.session.clinician}</span>
          <span>{mockPatient.session.date}</span>
        </div>
        <p className="sidebar-research-note">
          Research prototype exploring how explanations influence clinical decision-making.
        </p>
      </div>
    </aside>
  );
}
