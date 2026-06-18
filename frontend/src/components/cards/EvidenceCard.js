import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EvidenceCard({ title, items, variant }) {
    return (_jsxs("div", { className: `card evidence-card variant-${variant}`, children: [_jsx("h4", { children: title }), _jsx("ul", { className: "evidence-list", children: items.map((item, i) => (_jsxs("li", { children: [_jsx("span", { className: "evidence-text", children: item.text }), item.source && _jsx("span", { className: "evidence-source", children: item.source })] }, i))) })] }));
}
