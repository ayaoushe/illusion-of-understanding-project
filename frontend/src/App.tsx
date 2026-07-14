import type { ReactNode } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Sidebar } from './components/layout/Sidebar';
import { PatientOverview } from './pages/PatientOverview';
import { HumanAssessment } from './pages/HumanAssessment';
import { EvidenceReview } from './pages/EvidenceReview';
import { TreatmentComparison } from './pages/TreatmentComparison';
import { SimilarCases } from './pages/SimilarCases';
import { FinalReflection } from './pages/FinalReflection';

function WorkflowContent() {
  const { currentStep, selectedPatientId } = useWorkflow();

  const pages: Record<string, ReactNode> = {
    overview: <PatientOverview />,
    assessment: <HumanAssessment />,
    evidence: <EvidenceReview />,
    treatment: <TreatmentComparison />,
    similar: <SimilarCases />,
    reflection: <FinalReflection />,
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {selectedPatientId ? pages[currentStep] : <NoPatientSelected />}
      </main>
    </div>
  );
}

function NoPatientSelected() {
  return (
    <div className="empty-case-state">
      <section className="empty-case-card" aria-labelledby="empty-case-title">
        <div className="empty-case-icon" aria-hidden="true">ID</div>
        <h2 id="empty-case-title">No patient case selected</h2>
        <p>
          Select one of the predefined study cases from the sidebar to begin the clinical decision workflow.
        </p>
        <span>Use the case selector on the left to start.</span>
      </section>
    </div>
  );
}

function App() {
  return (
    <WorkflowProvider>
      <WorkflowContent />
    </WorkflowProvider>
  );
}

export default App;
