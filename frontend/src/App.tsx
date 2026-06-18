import { useState } from 'react';
import { Sidebar } from './components/clinical/Sidebar';
import { StepContent } from './components/clinical/StepContent';
import { mockPatient, mockAssessment, mockEvidence, mockTreatments, mockCases, mockFactors, mockReflection } from './mockData';

const steps = [
  'Patient Overview',
  'Human Assessment',
  'Evidence Review',
  'Treatment Comparison',
  'Similar Cases',
  'Decision Factors',
  'Final Reflection',
] as const;

type Step = (typeof steps)[number];

function App() {
  const [activeStep, setActiveStep] = useState<Step>('Patient Overview');

  return (
    <div className="app-shell">
      <Sidebar steps={steps} activeStep={activeStep} onStepChange={setActiveStep} />
      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Clinical decision support</p>
            <h1>Illusion of Understanding</h1>
          </div>
          <div className="status-card">
            <span>Patient status</span>
            <strong>Stable</strong>
          </div>
        </header>
        <StepContent
          step={activeStep}
          patient={mockPatient}
          assessment={mockAssessment}
          evidence={mockEvidence}
          treatments={mockTreatments}
          similarCases={mockCases}
          factors={mockFactors}
          reflection={mockReflection}
        />
      </main>
    </div>
  );
}

export default App;
