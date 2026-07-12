import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SourceBadge } from './SourceBadge';
const getSourceTypeFromLabel = (label) => {
    const lower = label.toLowerCase();
    if (lower.includes('guideline') || lower.includes('nccn'))
        return 'guideline';
    if (lower.includes('pubmed'))
        return 'pubmed';
    if (lower.includes('doi'))
        return 'doi';
    if (lower.includes('trial') || lower.includes('rct') || lower.includes('flaura') || lower.includes('pacific'))
        return 'rct';
    return 'review';
};
export function EvidenceCard({ title, items, variant }) {
    return (_jsxs("div", { className: `card evidence-card variant-${variant}`, children: [_jsx("h4", { children: title }), _jsx("ul", { className: "evidence-list", children: items.map((item, i) => (_jsxs("li", { children: [_jsx("span", { className: "evidence-text", children: item.text }), _jsxs("div", { className: "evidence-meta", children: [item.source && _jsx("span", { className: "evidence-source", children: item.source }), item.source && (_jsx("div", { className: "evidence-source-badges", children: _jsx(SourceBadge, { type: getSourceTypeFromLabel(item.source), disabled: true }) }))] })] }, i))) })] }));
}
