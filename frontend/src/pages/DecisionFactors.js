import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { mockWhatWouldChange, mockDecisionFactors } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { DecisionFactorCard } from '../components/cards/DecisionFactorCard';
export function DecisionFactors() {
    const { recordInteraction } = useWorkflow();
    useEffect(() => {
        recordInteraction({ type: 'decision_factors_view' });
    }, [recordInteraction]);
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Decision Factors", subtitle: "What would need to change \u2014 and which factors currently drive the decision?", badge: "Step 6" }), _jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "What Would Need To Change" }), _jsx("p", { className: "section-desc muted", children: "Clinical decision boundaries \u2014 factors that would alter the treatment approach." }), _jsx("div", { className: "decision-factors-grid", children: mockWhatWouldChange.map((f) => (_jsx(DecisionFactorCard, { factor: f }, f.factor))) })] }), _jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Key Reasoning Factors" }), _jsx("div", { className: "factors-impact-grid", children: mockDecisionFactors.map((f) => (_jsxs("div", { className: "factor-card", children: [_jsx("h4", { children: f.category }), _jsx("p", { children: f.description }), _jsxs("span", { className: "impact-level", children: ["Impact: ", f.impact] })] }, f.category))) })] }), _jsx(StepFooter, { nextLabel: "Final Reflection" })] }));
}
