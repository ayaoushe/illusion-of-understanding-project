import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const getCaseType = (caseData) => {
    if (caseData.isRare)
        return 'counterfactual';
    if (caseData.matchScore >= 85)
        return 'supporting';
    return 'neutral';
};
const getCaseColor = (type) => {
    switch (type) {
        case 'supporting':
            return { border: '#16a34a', bg: 'rgba(22, 163, 74, 0.03)', badge: 'rgba(22, 163, 74, 0.12)', badgeText: '#16a34a' };
        case 'counterfactual':
            return { border: '#d97706', bg: 'rgba(217, 119, 6, 0.03)', badge: 'rgba(217, 119, 6, 0.12)', badgeText: '#d97706' };
        default:
            return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.02)', badge: 'rgba(59, 130, 246, 0.12)', badgeText: '#3b82f6' };
    }
};
export function SimilarCaseCard({ caseData }) {
    const caseType = getCaseType(caseData);
    const colors = getCaseColor(caseType);
    const matchedCriteria = caseData.matchCriteria.filter((c) => c.matched);
    const unmatchedCriteria = caseData.matchCriteria.filter((c) => !c.matched);
    return (_jsxs("div", { className: "card similar-case-card", style: {
            borderTop: `4px solid ${colors.border}`,
            background: colors.bg,
        }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { fontSize: '1rem', fontWeight: 600 }, children: caseData.caseId }), _jsxs("div", { style: { display: 'flex', gap: '0.35rem', marginTop: '0.35rem' }, children: [_jsx("span", { style: {
                                            padding: '0.15rem 0.4rem',
                                            background: colors.badge,
                                            color: colors.badgeText,
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }, children: caseType === 'supporting' ? 'Supporting' : caseType === 'counterfactual' ? 'Counterfactual' : 'Similar' }), caseData.isRare && (_jsx("span", { style: {
                                            padding: '0.15rem 0.4rem',
                                            background: 'rgba(6, 182, 212, 0.12)',
                                            color: '#0891b2',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                        }, children: "Rare" }))] })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsxs("span", { style: {
                                    fontSize: '1.25rem',
                                    fontWeight: 700,
                                    color: colors.border,
                                }, children: [caseData.matchScore, "%"] }), _jsx("p", { style: { fontSize: '0.7rem', color: '#64748b', margin: '0.15rem 0 0', textTransform: 'uppercase' }, children: "Match" })] })] }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.35rem' }, children: "Match Criteria" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }, children: [matchedCriteria.slice(0, 5).map((c) => (_jsxs("span", { style: {
                                    padding: '0.2rem 0.4rem',
                                    background: 'rgba(22, 163, 74, 0.1)',
                                    color: '#16a34a',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    border: '1px solid rgba(22, 163, 74, 0.25)',
                                }, children: ["\u2713 ", c.label] }, c.label))), unmatchedCriteria.length > 0 && (_jsxs("span", { style: {
                                    padding: '0.2rem 0.4rem',
                                    background: 'rgba(100, 116, 139, 0.1)',
                                    color: '#64748b',
                                    borderRadius: '4px',
                                    fontSize: '0.7rem',
                                    border: '1px solid rgba(100, 116, 139, 0.2)',
                                }, children: ["\u25CB ", unmatchedCriteria[0].label] }))] })] }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Presentation" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: 0, lineHeight: 1.5 }, children: caseData.presentation })] }), _jsxs("div", { style: { marginBottom: '0.75rem' }, children: [_jsx("p", { style: { fontSize: '0.75rem', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }, children: "Treatment & Outcome" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#0f172a', margin: '0 0 0.25rem', fontWeight: 500 }, children: caseData.treatmentUsed }), _jsx("p", { style: { fontSize: '0.85rem', color: caseType === 'supporting' ? '#16a34a' : caseType === 'counterfactual' ? '#d97706' : '#3b82f6', margin: 0, fontWeight: 500 }, children: caseData.outcome })] }), _jsx("div", { style: {
                    padding: '0.5rem',
                    background: 'rgba(100, 116, 139, 0.05)',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                }, children: _jsxs("p", { style: { fontSize: '0.7rem', color: '#64748b', margin: 0 }, children: [_jsx("strong", { children: "Source:" }), " ", caseData.source] }) }), caseData.isRare && (_jsx("p", { style: {
                    fontSize: '0.75rem',
                    color: '#d97706',
                    margin: '0.5rem 0 0',
                    fontStyle: 'italic',
                }, children: "Rare presentations can inform decisions when guideline evidence is limited." }))] }));
}
