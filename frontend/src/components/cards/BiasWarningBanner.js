import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BiasWarningBanner({ warnings }) {
    if (warnings.length === 0)
        return null;
    return (_jsx("div", { className: "bias-warnings", children: warnings.map((w) => (_jsxs("div", { className: "bias-warning", children: [_jsx("span", { className: "bias-icon", children: "\uD83D\uDCA1" }), _jsx("span", { children: w.message })] }, w.id))) }));
}
