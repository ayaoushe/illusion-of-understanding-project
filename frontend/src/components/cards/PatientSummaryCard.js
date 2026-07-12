import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function PatientSummaryCard({ patient }) {
    return (_jsx("div", { className: "card patient-summary-card", children: _jsxs("div", { className: "patient-header", children: [_jsxs("div", { children: [_jsx("h3", { children: patient.name }), _jsxs("p", { className: "muted", children: ["MRN: ", patient.mrn, " \u00B7 DOB: ", patient.dateOfBirth, " (", patient.age, " yrs) \u00B7 ", patient.gender] })] }), _jsxs("span", { className: `priority-badge priority-${patient.priority.toLowerCase()}`, children: [patient.priority, " PRIORITY"] })] }) }));
}
