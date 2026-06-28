import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function PreferenceCard({ concerns, preferences }) {
    const [expanded, setExpanded] = useState(false);
    return (_jsxs("div", { className: "card preference-card", children: [_jsx("h4", { style: { margin: '0 0 0.75rem', fontSize: '0.95rem', fontWeight: 600 }, children: "Quality of Life & Preferences" }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }, children: "Key Concerns" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }, children: [concerns.slice(0, 3).map((c) => (_jsx("span", { style: {
                                    padding: '0.2rem 0.5rem',
                                    background: 'rgba(6, 182, 212, 0.1)',
                                    color: '#0891b2',
                                    borderRadius: '6px',
                                    fontSize: '0.8rem',
                                    border: '1px solid rgba(6, 182, 212, 0.25)',
                                }, children: c }, c))), concerns.length > 3 && !expanded && (_jsxs("button", { type: "button", onClick: () => setExpanded(true), style: {
                                    padding: '0.2rem 0.5rem',
                                    background: 'transparent',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                }, children: ["+", concerns.length - 3, " more"] }))] }), expanded && concerns.length > 3 && (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }, children: concerns.slice(3).map((c) => (_jsx("span", { style: {
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(6, 182, 212, 0.1)',
                                color: '#0891b2',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                border: '1px solid rgba(6, 182, 212, 0.25)',
                            }, children: c }, c))) }))] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Treatment Priority" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0 }, children: preferences.priorityQoL })] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Hospital Preference" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0 }, children: preferences.hospitalPreference })] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Family Involvement" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0 }, children: preferences.familyInvolvement })] })] })] }));
}
