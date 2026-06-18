import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StepNavigation({ steps, currentStep, canAccessStep, onStepClick }) {
    return (_jsx("nav", { className: "step-nav", "aria-label": "Workflow steps", children: steps.map((step) => {
            const isActive = step.id === currentStep;
            const isLocked = !canAccessStep(step.id);
            const isComplete = steps.findIndex((s) => s.id === currentStep) > step.number - 1;
            return (_jsxs("button", { type: "button", className: `step-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isComplete ? 'complete' : ''}`, onClick: () => onStepClick(step.id), disabled: isLocked, "aria-current": isActive ? 'step' : undefined, children: [_jsx("span", { className: "step-number", children: isComplete && !isActive ? '✓' : step.number }), _jsx("span", { className: "step-label", children: step.shortLabel }), isLocked && _jsx("span", { className: "step-lock", children: "\uD83D\uDD12" })] }, step.id));
        }) }));
}
