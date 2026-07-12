import { mockPatient } from '../../data/mockData';
import { useWorkflow } from '../../context/WorkflowContext';
import { StepNavigation } from './StepNavigation';

export function Sidebar() {
  const { steps, currentStep, canAccessStep, goToStep, clearPatient } = useWorkflow();

  return (
    <aside className="sidebar">
      <button type="button" className="sidebar-brand" onClick={clearPatient} title="Zurück zur Patientenauswahl">
        <h1>OncoCDSS</h1>
        <p>Clinical Decision Support</p>
      </button>

      <div className="sidebar-patient">
        <span className="sidebar-patient-label">Current Patient</span>
        <strong>{mockPatient.name}</strong>
        <span className="sidebar-patient-mrn">MRN: {mockPatient.mrn}</span>
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
