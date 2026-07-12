import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const severityLabels = { high: 'High', moderate: 'Moderate', low: 'Low' };
export function RiskFlagCard({ flag }) {
    return (_jsxs("div", { className: `card risk-flag-card severity-${flag.severity}`, children: [_jsxs("div", { className: "risk-flag-header", children: [_jsx("span", { className: "risk-flag-icon", children: "\u26A0" }), _jsx("strong", { children: flag.title }), _jsx("span", { className: `severity-badge severity-${flag.severity}`, children: severityLabels[flag.severity] })] }), _jsx("p", { children: flag.description }), flag.relatedTreatments && flag.relatedTreatments.length > 0 && (_jsxs("div", { className: "risk-related", children: [_jsx("span", { className: "label", children: "Affects:" }), flag.relatedTreatments.map((t) => (_jsx("span", { className: "tag", children: t }, t)))] }))] }));
}
