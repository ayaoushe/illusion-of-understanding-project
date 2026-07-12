import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function DecisionFactorCard({ factor }) {
    return (_jsxs("div", { className: "card decision-factor-card", children: [_jsx("span", { className: "factor-category", children: factor.category }), _jsx("h4", { children: factor.factor }), _jsx("p", { children: factor.description }), _jsxs("div", { className: "factor-trigger", children: [_jsx("span", { className: "label", children: "If this changes:" }), _jsx("p", { children: factor.trigger })] })] }));
}
