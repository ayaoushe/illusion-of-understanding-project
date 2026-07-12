import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Sidebar } from './components/layout/Sidebar';
import { PatientOverview } from './pages/PatientOverview';
import { HumanAssessment } from './pages/HumanAssessment';
import { EvidenceReview } from './pages/EvidenceReview';
import { TreatmentComparison } from './pages/TreatmentComparison';
import { SimilarCases } from './pages/SimilarCases';
import { DecisionFactors } from './pages/DecisionFactors';
import { FinalReflection } from './pages/FinalReflection';
function WorkflowContent() {
    const { currentStep } = useWorkflow();
    const pages = {
        overview: _jsx(PatientOverview, {}),
        assessment: _jsx(HumanAssessment, {}),
        evidence: _jsx(EvidenceReview, {}),
        treatment: _jsx(TreatmentComparison, {}),
        similar: _jsx(SimilarCases, {}),
        decision: _jsx(DecisionFactors, {}),
        reflection: _jsx(FinalReflection, {}),
    };
    return (_jsxs("div", { className: "app-shell", children: [_jsx(Sidebar, {}), _jsx("main", { className: "main-content", children: pages[currentStep] })] }));
}
function App() {
    return (_jsx(WorkflowProvider, { children: _jsx(WorkflowContent, {}) }));
}
export default App;
