import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { mockPatient } from '../../data/mockData';
import { useWorkflow } from '../../context/WorkflowContext';
import { StepNavigation } from './StepNavigation';
export function Sidebar() {
    const { steps, currentStep, canAccessStep, goToStep } = useWorkflow();
    return (_jsxs("aside", { className: "sidebar", children: [_jsxs("div", { className: "sidebar-brand", children: [_jsx("h1", { children: "OncoCDSS" }), _jsx("p", { children: "Clinical Decision Support" })] }), _jsxs("div", { className: "sidebar-patient", children: [_jsx("span", { className: "sidebar-patient-label", children: "Current Patient" }), _jsx("strong", { children: mockPatient.name }), _jsxs("span", { className: "sidebar-patient-mrn", children: ["MRN: ", mockPatient.mrn] })] }), _jsx(StepNavigation, { steps: steps, currentStep: currentStep, canAccessStep: canAccessStep, onStepClick: goToStep }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs("div", { className: "sidebar-clinician", children: [_jsx("span", { children: mockPatient.session.clinician }), _jsx("span", { children: mockPatient.session.date })] }), _jsx("p", { className: "sidebar-research-note", children: "Research prototype exploring how explanations influence clinical decision-making." })] })] }));
}
