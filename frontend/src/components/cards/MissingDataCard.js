import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MissingDataCard({ items }) {
    return (_jsxs("div", { className: "card missing-data-card", children: [_jsx("h4", { children: "Missing Data" }), _jsx("p", { className: "missing-intro", children: "The following information gaps may affect decision confidence:" }), _jsx("ul", { className: "missing-list", children: items.map((item) => (_jsxs("li", { children: [_jsx("span", { className: "missing-icon", children: "?" }), item] }, item))) })] }));
}
