import { jsx as _jsx } from "react/jsx-runtime";
export function SourceBadge({ type, disabled = false }) {
    const labels = {
        guideline: 'Guideline',
        pubmed: 'PubMed',
        doi: 'DOI',
        rct: 'RCT',
        review: 'Review',
    };
    const colors = {
        guideline: 'bg-blue-50 text-blue-700 border-blue-200',
        pubmed: 'bg-purple-50 text-purple-700 border-purple-200',
        doi: 'bg-green-50 text-green-700 border-green-200',
        rct: 'bg-orange-50 text-orange-700 border-orange-200',
        review: 'bg-teal-50 text-teal-700 border-teal-200',
    };
    return (_jsx("span", { className: `source-badge source-${type} ${disabled ? 'disabled' : ''}`, style: {
            display: 'inline-block',
            padding: '0.15rem 0.4rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            border: '1px solid',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
        }, children: labels[type] }));
}
