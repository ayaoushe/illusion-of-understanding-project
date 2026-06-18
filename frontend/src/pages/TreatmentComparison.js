import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { mockTreatmentOptions, getAssessmentTreatmentLabel } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TreatmentOptionCard } from '../components/cards/TreatmentOptionCard';
export function TreatmentComparison() {
    const { assessment, recordInteraction } = useWorkflow();
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Treatment Options Comparison", subtitle: "Compare all viable options critically. No single option should dominate the decision.", badge: "Step 4" }), _jsx("div", { className: "comparison-notice card", children: _jsxs("p", { children: ["Each option is presented with equal visual weight for critical comparison.", assessment && (_jsxs("span", { children: [" Your initial selection: ", _jsx("strong", { children: getAssessmentTreatmentLabel(assessment.selectedTreatment) })] }))] }) }), _jsx("div", { className: "treatment-comparison-grid", children: mockTreatmentOptions.map((opt) => (_jsx(TreatmentOptionCard, { option: opt, selected: assessment?.selectedTreatment === opt.id, onView: () => recordInteraction({ type: 'treatment_view', payload: opt.id }) }, opt.id))) }), _jsx(StepFooter, {})] }));
}
