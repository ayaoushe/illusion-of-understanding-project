import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { assessmentTreatmentOptions } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { FinalDecisionSummary } from '../components/cards/FinalDecisionSummary';
const emptyReflection = {
    changedMind: 'no',
    finalTreatment: '',
    finalReasoning: '',
    patientPreferenceHonored: true,
    remainingUncertainties: '',
    sourcesChecked: [],
    whatMatteredMost: '',
};
export function FinalReflection() {
    const { assessment, evidence, reflection, submitReflection } = useWorkflow();
    const [form, setForm] = useState(reflection ?? { ...emptyReflection, finalTreatment: assessment?.selectedTreatment ?? '' });
    const [submitted, setSubmitted] = useState(!!reflection);
    const [notesOpen, setNotesOpen] = useState(false);
    if (!assessment) {
        return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Final Reflection", badge: "Step 7" }), _jsx("div", { className: "card", children: "Complete your initial assessment first." })] }));
    }
    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const handleSubmit = () => {
        submitReflection(form);
        setSubmitted(true);
    };
    // No strict validation — user can submit with just a treatment selected
    const isValid = Boolean(form.finalTreatment);
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Final Reflection", badge: "Step 7" }), submitted ? (_jsx(FinalDecisionSummary, { assessment: assessment, evidence: evidence, reflection: form })) : (_jsx(FinalDecisionSummary, { assessment: assessment, evidence: evidence, reflection: null })), !submitted && (_jsxs("div", { className: "reflection-form", children: [_jsxs("div", { className: "form-section card", children: [_jsx("h4", { children: "Did the AI evidence change your opinion?" }), _jsx("div", { className: "radio-group", children: ['yes', 'no', 'partially'].map((v) => (_jsxs("label", { className: "radio-option", children: [_jsx("input", { type: "radio", name: "changedMind", checked: form.changedMind === v, onChange: () => update('changedMind', v) }), v.charAt(0).toUpperCase() + v.slice(1)] }, v))) })] }), _jsxs("div", { className: "form-section card", children: [_jsx("h4", { children: "Final Treatment Decision" }), _jsxs("select", { className: "treatment-dropdown", value: form.finalTreatment, onChange: (e) => update('finalTreatment', e.target.value), children: [_jsx("option", { value: "", children: "Select a treatment option..." }), assessmentTreatmentOptions.map((opt) => (_jsxs("option", { value: opt.id, children: [opt.label, " [", opt.category, "]"] }, opt.id)))] })] }), _jsxs("details", { className: "card", style: { cursor: 'pointer' }, open: notesOpen, children: [_jsxs("summary", { style: { fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }, onClick: (e) => { e.preventDefault(); setNotesOpen(!notesOpen); }, children: [notesOpen ? '−' : '+', " Add clinical reasoning notes"] }), notesOpen && (_jsxs("div", { style: { marginTop: '0.75rem', display: 'grid', gap: '0.75rem' }, children: [_jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "What information mattered most?" }), _jsx("textarea", { rows: 2, value: form.whatMatteredMost, onChange: (e) => update('whatMatteredMost', e.target.value), placeholder: "Which clinical factors or evidence were most influential?" })] }), _jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "Final Reasoning" }), _jsx("textarea", { rows: 3, value: form.finalReasoning, onChange: (e) => update('finalReasoning', e.target.value), placeholder: "Explain your final treatment decision..." })] }), _jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "What uncertainty remains?" }), _jsx("textarea", { rows: 2, value: form.remainingUncertainties, onChange: (e) => update('remainingUncertainties', e.target.value), placeholder: "What questions or gaps remain?" })] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: form.patientPreferenceHonored, onChange: (e) => update('patientPreferenceHonored', e.target.checked) }), "Patient preferences were honored in the final decision"] })] }))] }), _jsx("button", { type: "button", className: `btn ${isValid ? 'btn-primary btn-ready' : 'btn-primary'}`, onClick: handleSubmit, disabled: !isValid, children: "Complete Reflection" })] })), submitted && (_jsxs("div", { className: "reflection-complete card", children: [_jsx("h4", { children: "Reflection Complete" }), form.changedMind !== 'no' && (_jsxs("p", { className: "mind-change-note", children: ["You indicated your opinion ", form.changedMind === 'yes' ? 'changed' : 'partially changed', " after reviewing AI evidence."] }))] }))] }));
}
