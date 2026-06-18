import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { mockSimilarCases } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { SimilarCaseCard } from '../components/cards/SimilarCaseCard';
export function SimilarCases() {
    const { recordInteraction } = useWorkflow();
    useEffect(() => {
        recordInteraction({ type: 'similar_cases_view' });
    }, [recordInteraction]);
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Similar & Rare Cases", subtitle: "Cases matched on clinically meaningful criteria \u2014 not decorative similarity.", badge: "Step 5" }), _jsx("div", { className: "cases-notice card", children: _jsx("p", { children: "Similar cases support decision-making when guidelines are limited or patient factors create uncertainty. Match criteria show why each case is relevant." }) }), _jsx("div", { className: "similar-cases-grid", children: mockSimilarCases.map((c) => (_jsx(SimilarCaseCard, { caseData: c }, c.caseId))) }), _jsx(StepFooter, {})] }));
}
