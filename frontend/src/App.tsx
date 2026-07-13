import type { ReactNode } from 'react';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Sidebar } from './components/layout/Sidebar';
import { PatientOverview } from './pages/PatientOverview';
import { HumanAssessment } from './pages/HumanAssessment';
import { EvidenceReview } from './pages/EvidenceReview';
import { TreatmentComparison } from './pages/TreatmentComparison';
import { SimilarCases } from './pages/SimilarCases';
import { DecisionFactors } from './pages/DecisionFactors';
import { FinalReflection } from './pages/FinalReflection';
import { CaseSelection } from './pages/CaseSelection';

function WorkflowContent() {
  const { currentStep, selectedPatientId } = useWorkflow();

  if (!selectedPatientId) {
    return <CaseSelection />;
  }

  const pages: Record<string, ReactNode> = {
    overview: <PatientOverview />,
    assessment: <HumanAssessment />,
    evidence: <EvidenceReview />,
    treatment: <TreatmentComparison />,
    similar: <SimilarCases />,
    decision: <DecisionFactors />,
    reflection: <FinalReflection />,
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{pages[currentStep]}</main>
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
