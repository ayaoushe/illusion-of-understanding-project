import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ClinicalInfoCard({ title, variant = 'default', children, collapsible = false, defaultOpen = true, }) {
    if (collapsible) {
        return (_jsxs("details", { className: `card clinical-info-card variant-${variant}`, open: defaultOpen, children: [_jsx("summary", { className: "clinical-info-summary", children: _jsx("h4", { children: title }) }), _jsx("div", { className: "clinical-info-body", children: children })] }));
    }
    return (_jsxs("div", { className: `card clinical-info-card variant-${variant}`, children: [_jsx("h4", { children: title }), children] }));
}
