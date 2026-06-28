import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function CompactMissingDataCard({ items }) {
    const [expanded, setExpanded] = useState(false);
    const displayCount = 3;
    const showMore = items.length > displayCount;
    const displayItems = expanded ? items : items.slice(0, displayCount);
    return (_jsxs("div", { className: "card compact-missing-data-card", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }, children: [_jsx("h4", { style: { margin: 0, fontSize: '0.9rem', fontWeight: 600 }, children: "Missing Data" }), _jsxs("span", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }, children: [items.length, " items"] })] }), _jsx("p", { style: { fontSize: '0.8rem', color: '#64748b', margin: '0 0 0.5rem' }, children: "Information gaps may affect decision confidence" }), _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.35rem' }, children: displayItems.map((item) => (_jsxs("li", { style: { display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.85rem' }, children: [_jsx("span", { style: {
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: '#d97706',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                flexShrink: 0,
                            }, children: "!" }), item] }, item))) }), showMore && (_jsx("button", { type: "button", onClick: () => setExpanded(!expanded), style: {
                    marginTop: '0.5rem',
                    padding: '0.3rem 0.6rem',
                    background: 'transparent',
                    border: '1px solid #d97706',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: '#d97706',
                    fontWeight: 500,
                    cursor: 'pointer',
                }, children: expanded ? 'Show less' : `Show ${items.length - displayCount} more` }))] }));
}
