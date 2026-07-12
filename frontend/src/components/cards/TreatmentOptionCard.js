import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { RiskBadge } from './RiskBadge';
const uncertaintyLabels = { low: 'Low uncertainty', moderate: 'Moderate uncertainty', high: 'High uncertainty' };
const evidenceLabels = { strong: 'Strong evidence', moderate: 'Moderate evidence', limited: 'Limited evidence' };
const getCardColor = (strength, selected) => {
    if (selected)
        return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)' };
    if (strength.includes('Preferred'))
        return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.02)' };
    return { border: '#e2e8f0', bg: '#ffffff' };
};
const getSuccessRate = (option) => {
    if (option.evidenceStrength === 'strong')
        return 72;
    if (option.evidenceStrength === 'moderate')
        return 58;
    return 45;
};
export function TreatmentOptionCard({ option, selected, onSelect, onView, showSelect = false, optionNumber, }) {
    const [showDetails, setShowDetails] = useState(false);
    const cardColor = getCardColor(option.strength, selected || false);
    const successRate = getSuccessRate(option);
    return (_jsxs("div", { className: "card treatment-option-card", style: {
            borderTop: `4px solid ${cardColor.border}`,
            background: cardColor.bg,
            ...(selected ? { border: '2px solid #3b82f6', boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)' } : {}),
        }, onMouseEnter: onView, onFocus: onView, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }, children: [_jsxs("div", { children: [optionNumber && (_jsxs("span", { style: {
                                    display: 'inline-block',
                                    padding: '0.15rem 0.4rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#3b82f6',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    marginBottom: '0.35rem',
                                }, children: ["Option ", optionNumber] })), _jsx("h4", { style: { margin: '0.25rem 0 0', fontSize: '1rem', fontWeight: 600 }, children: option.name })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }, children: [_jsx("span", { style: {
                                    padding: '0.2rem 0.5rem',
                                    background: option.strength.includes('Preferred') ? 'rgba(59, 130, 246, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                                    color: option.strength.includes('Preferred') ? '#1e40af' : '#64748b',
                                    borderRadius: '6px',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                }, children: option.strength }), _jsx(RiskBadge, { level: option.uncertainty })] })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }, children: [_jsx("span", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase' }, children: "Expected Benefit" }), _jsxs("span", { style: { fontSize: '0.85rem', fontWeight: 700, color: '#16a34a' }, children: [successRate, "%"] })] }), _jsx("div", { style: {
                            height: '6px',
                            background: '#e2e8f0',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '0.5rem',
                        }, children: _jsx("div", { style: {
                                height: '100%',
                                width: `${successRate}%`,
                                background: successRate > 65 ? '#16a34a' : successRate > 50 ? '#d97706' : '#dc2626',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease',
                            } }) }), _jsx("p", { style: { fontSize: '0.8rem', color: '#64748b', margin: 0 }, children: evidenceLabels[option.evidenceStrength] })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.4rem' }, children: "Key Benefits" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }, children: option.benefits.slice(0, 4).map((b) => (_jsx("span", { style: {
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(22, 163, 74, 0.1)',
                                color: '#16a34a',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                border: '1px solid rgba(22, 163, 74, 0.25)',
                            }, children: b }, b))) })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.4rem' }, children: "Key Risks" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }, children: option.risks.slice(0, 3).map((r) => (_jsx("span", { style: {
                                padding: '0.2rem 0.5rem',
                                background: 'rgba(220, 38, 38, 0.08)',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                border: '1px solid rgba(220, 38, 38, 0.2)',
                            }, children: r }, r))) })] }), _jsx("button", { type: "button", onClick: () => setShowDetails(!showDetails), style: {
                    width: '100%',
                    padding: '0.4rem 0.6rem',
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#64748b',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginBottom: showDetails ? '0.75rem' : 0,
                }, children: showDetails ? 'Hide details' : 'Show details' }), showDetails && (_jsxs("div", { style: { paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }, children: [option.contraindications.length > 0 && (_jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }, children: "Contraindications" }), _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }, children: option.contraindications.map((c) => (_jsxs("li", { style: { fontSize: '0.85rem', color: '#475569' }, children: ["\u2022 ", c] }, c))) })] })), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }, children: "Comorbidity Considerations" }), _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.25rem' }, children: option.comorbidityConsiderations.slice(0, 3).map((c) => (_jsxs("li", { style: { fontSize: '0.85rem', color: '#475569' }, children: ["\u2022 ", c] }, c))) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "QoL Impact" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0 }, children: option.qolImpact })] }), _jsxs("div", { children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Monitoring" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0 }, children: option.monitoring })] })] }), option.missingData.length > 0 && (_jsxs("div", { style: {
                            padding: '0.5rem',
                            background: 'rgba(254, 243, 199, 0.3)',
                            borderRadius: '6px',
                            border: '1px dashed #d97706',
                        }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#d97706', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Missing Data" }), _jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.2rem' }, children: option.missingData.map((m) => (_jsxs("li", { style: { fontSize: '0.8rem', color: '#78350f' }, children: ["\u2022 ", m] }, m))) })] }))] })), showSelect && onSelect && (_jsx("button", { type: "button", style: {
                    width: '100%',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '0.75rem',
                    background: selected ? '#3b82f6' : 'transparent',
                    color: selected ? 'white' : '#3b82f6',
                    border: selected ? 'none' : '1px solid #3b82f6',
                }, onClick: onSelect, children: selected ? 'Selected' : 'Select Option' }))] }));
}
