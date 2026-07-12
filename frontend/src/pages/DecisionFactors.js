import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { mockWhatWouldChange } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
export function DecisionFactors() {
    const { recordInteraction } = useWorkflow();
    useEffect(() => {
        recordInteraction({ type: 'decision_factors_view' });
    }, [recordInteraction]);
    const groups = [
        {
            title: 'Clinical Status Changes',
            color: 'red',
            icon: '✗',
            description: 'Worsening clinical status would shift toward less intensive therapy',
            items: mockWhatWouldChange.filter(f => ['Performance Status', 'Disease Status', 'Toxicity'].includes(f.category)),
        },
        {
            title: 'Comorbidity / Risk Changes',
            color: 'yellow',
            icon: '⚠',
            description: 'New or worsening comorbidities may contraindicate certain options',
            items: mockWhatWouldChange.filter(f => ['Comorbidity', 'Missing Data'].includes(f.category)),
        },
        {
            title: 'Patient Preference Changes',
            color: 'blue',
            icon: '→',
            description: 'Shifting priorities would affect treatment intensity',
            items: mockWhatWouldChange.filter(f => f.category === 'Patient Preference'),
        },
        {
            title: 'Molecular / Lab Changes',
            color: 'green',
            icon: '✓',
            description: 'Different biomarkers would change targeted therapy selection',
            items: mockWhatWouldChange.filter(f => f.category === 'Molecular'),
        },
    ];
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "What Would Change the Decision?", badge: "Step 6" }), _jsx("p", { style: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }, children: "Clinical factors that could shift the final treatment decision." }), _jsx("div", { className: "decision-boundaries-grid", children: groups.map((group) => (_jsxs("div", { className: `card boundary-card color-${group.color}`, children: [_jsxs("div", { className: "boundary-header", children: [_jsx("div", { className: "boundary-icon", children: group.icon }), _jsxs("div", { children: [_jsx("h4", { children: group.title }), _jsx("p", { style: { margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }, children: group.description })] })] }), _jsx("div", { className: "boundary-factors", children: group.items.map((f, i) => (_jsxs("div", { className: "boundary-factor", children: [_jsx("strong", { children: f.factor }), _jsx("p", { children: f.description }), _jsxs("span", { className: "boundary-arrow", children: ["\u2192 ", f.trigger] })] }, f.factor))) })] }, group.title))) }), _jsx(StepFooter, { nextLabel: "Final Reflection" })] }));
}
