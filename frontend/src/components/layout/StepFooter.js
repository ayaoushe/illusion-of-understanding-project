import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useCallback } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { WORKFLOW_STEPS } from '../../data/mockData';
export function StepFooter({ onNext, nextLabel = 'Continue', nextDisabled = false, nextReady = false, showPrevious = true, }) {
    const { currentStep, goPrevious, goNext } = useWorkflow();
    const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    const handleNext = onNext ?? goNext;
    const handleKeyDown = useCallback((e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            const target = e.target;
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'SELECT')
                return;
            e.preventDefault();
            if (!nextDisabled)
                handleNext();
        }
    }, [handleNext, nextDisabled]);
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    return (_jsxs("nav", { className: "sticky-nav", children: [showPrevious && stepIndex > 0 ? (_jsx("button", { type: "button", className: "btn btn-secondary", onClick: goPrevious, children: "\u2190 Previous" })) : (_jsx("span", {})), _jsxs("span", { className: "sticky-nav-indicator", children: ["Step ", stepIndex + 1, " of ", WORKFLOW_STEPS.length] }), _jsxs("button", { type: "button", className: `btn btn-primary ${nextReady ? 'btn-ready' : ''}`, onClick: handleNext, disabled: nextDisabled, children: [nextLabel, " \u2192"] })] }));
}
