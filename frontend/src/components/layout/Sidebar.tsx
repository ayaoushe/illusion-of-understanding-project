import { mockPatient } from '../../data/mockData';
import { useWorkflow } from '../../context/WorkflowContext';
import { StepNavigation } from './StepNavigation';

export function Sidebar() {
  const { steps, currentStep, canAccessStep, goToStep, selectedPatient } = useWorkflow();
  const patient = selectedPatient ?? mockPatient;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>OncoCDSS</h1>
        <p>Clinical Decision Support</p>
      </div>

      <div className="sidebar-patient">
        <span className="sidebar-patient-label">Current Patient</span>
        <strong>{patient.name}</strong>
        <span className="sidebar-patient-mrn">MRN: {patient.mrn}</span>
      </div>

      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        canAccessStep={canAccessStep}
        onStepClick={goToStep}
      />

      <div className="sidebar-footer">
        <div className="sidebar-clinician">
          <span>{patient.session.clinician}</span>
          <span>{patient.session.date}</span>
        </div>
        <p className="sidebar-research-note">
          Research prototype exploring how explanations influence clinical decision-making.
        </p>
      </div>
    </aside>
  );
}
