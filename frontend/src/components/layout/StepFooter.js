import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useWorkflow } from '../../context/WorkflowContext';
import { WORKFLOW_STEPS } from '../../data/mockData';
export function StepFooter({ onNext, nextLabel = 'Continue', nextDisabled = false, nextReady = false, showPrevious = true, }) {
    const { currentStep, goPrevious, goNext } = useWorkflow();
    const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    return (_jsxs("footer", { className: "step-footer", children: [showPrevious && stepIndex > 0 ? (_jsx("button", { type: "button", className: "btn btn-secondary", onClick: goPrevious, children: "\u2190 Previous" })) : (_jsx("span", {})), _jsxs("span", { className: "step-footer-indicator", children: ["Step ", stepIndex + 1, " of ", WORKFLOW_STEPS.length] }), _jsxs("button", { type: "button", className: `btn btn-primary ${nextReady ? 'btn-ready' : ''}`, onClick: onNext ?? goNext, disabled: nextDisabled, children: [nextLabel, " \u2192"] })] }));
}
