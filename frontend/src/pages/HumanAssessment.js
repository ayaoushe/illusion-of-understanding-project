import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { assessmentTreatmentOptions } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
const emptyForm = {
    selectedTreatment: '',
    clinicalReasoning: '',
    uncertainties: '',
    missingInformation: '',
    qolConcern: '',
    patientPreferenceConsidered: false,
};
export function HumanAssessment() {
    const { submitAssessment, startAssessment, assessmentComplete } = useWorkflow();
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    useEffect(() => {
        startAssessment();
    }, [startAssessment]);
    const update = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const isValid = Boolean(form.selectedTreatment);
    const handleSubmit = async () => {
        if (!isValid || submitting)
            return;
        setSubmitting(true);
        await submitAssessment(form);
        setSubmitting(false);
    };
    if (assessmentComplete) {
        return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Human Initial Assessment", badge: "Step 2 \u2014 Complete" }), _jsx("div", { className: "card assessment-complete-card", children: _jsx("p", { style: { margin: 0, fontSize: '0.9rem' }, children: "\u2713 Assessment recorded. Proceed to AI Evidence Synthesis." }) }), _jsx(StepFooter, { nextLabel: "View Evidence" })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "Human Initial Assessment", badge: "Step 2" }), _jsx("div", { className: "assessment-centered", children: _jsxs("div", { className: "card assessment-main-card", children: [_jsxs("label", { className: "label", htmlFor: "treatment-select", children: ["Proposed Treatment Plan ", _jsx("span", { className: "required-star", children: "*" })] }), _jsxs("select", { id: "treatment-select", className: "treatment-dropdown", value: form.selectedTreatment, onChange: (e) => update('selectedTreatment', e.target.value), children: [_jsx("option", { value: "", children: "Select a treatment option..." }), assessmentTreatmentOptions.map((opt) => (_jsxs("option", { value: opt.id, children: [opt.label, " [", opt.category, "]"] }, opt.id)))] }), _jsx("button", { type: "button", className: `btn btn-lock-assessment ${isValid ? 'btn-ready' : ''}`, onClick: handleSubmit, disabled: !isValid || submitting, children: submitting ? 'Recording...' : 'Record Assessment & Lock' }), _jsxs("details", { className: "assessment-optional-details", style: { marginTop: '1rem', cursor: 'pointer' }, children: [_jsx("summary", { children: "Additional clinical notes (optional)" }), _jsxs("div", { className: "assessment-form", children: [_jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "Clinical Reasoning" }), _jsx("textarea", { rows: 3, placeholder: "Which clinical factors most influenced your decision?", value: form.clinicalReasoning, onChange: (e) => update('clinicalReasoning', e.target.value) })] }), _jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "Uncertainties" }), _jsx("textarea", { rows: 2, placeholder: "What aspects remain uncertain?", value: form.uncertainties, onChange: (e) => update('uncertainties', e.target.value) })] }), _jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "Missing Information" }), _jsx("textarea", { rows: 2, placeholder: "What additional data would strengthen your decision?", value: form.missingInformation, onChange: (e) => update('missingInformation', e.target.value) })] }), _jsxs("div", { className: "form-section", children: [_jsx("h4", { children: "Quality-of-Life Concern" }), _jsx("textarea", { rows: 2, placeholder: "Which QoL factors are most relevant?", value: form.qolConcern, onChange: (e) => update('qolConcern', e.target.value) })] }), _jsxs("label", { className: "checkbox-label", children: [_jsx("input", { type: "checkbox", checked: form.patientPreferenceConsidered, onChange: (e) => update('patientPreferenceConsidered', e.target.checked) }), "Patient preferences were considered in this assessment"] })] })] })] }) }), _jsx(StepFooter, { showPrevious: true, onNext: handleSubmit, nextLabel: submitting ? 'Recording...' : 'Record Assessment & Lock', nextDisabled: !isValid || submitting, nextReady: isValid })] }));
}
