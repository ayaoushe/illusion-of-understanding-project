import { jsx as _jsx } from "react/jsx-runtime";
export function RiskBadge({ level, label }) {
    const colors = {
        low: { bg: 'rgba(22, 163, 74, 0.12)', color: '#16a34a', border: 'rgba(22, 163, 74, 0.3)' },
        moderate: { bg: 'rgba(217, 119, 6, 0.12)', color: '#d97706', border: 'rgba(217, 119, 6, 0.3)' },
        high: { bg: 'rgba(220, 38, 38, 0.12)', color: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' },
    };
    const defaultLabels = {
        low: 'Low Risk',
        moderate: 'Moderate Risk',
        high: 'High Risk',
    };
    return (_jsx("span", { className: "risk-badge", style: {
            display: 'inline-block',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            fontSize: '0.7rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: colors[level].bg,
            color: colors[level].color,
            border: `1px solid ${colors[level].border}`,
        }, children: label || defaultLabels[level] }));
}
