import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
const sourceMeta = [
    { title: 'NCCN Guidelines for NSCLC', type: 'Guideline', evidenceLevel: '1A', relevance: 'Standard of care for EGFR+ NSCLC', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
    { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Primary efficacy data for osimertinib', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
    { title: 'PACIFIC Trial: Durvalumab after CRT', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Alternative for Stage III after chemoradiation', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
    { title: 'Renal Impairment and Anticancer Drug Selection', type: 'DOI (Review)', evidenceLevel: '2A', relevance: 'Dosing guidance for reduced eGFR', url: 'https://pubmed.ncbi.nlm.nih.gov/38456789' },
    { title: 'Institutional cohort data', type: 'Institutional cohort', evidenceLevel: '3', relevance: 'Local outcomes with similar patient profile', url: null },
    { title: 'Patient clinical context', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Individual patient factors and preferences', url: null },
    { title: 'Lab analysis — prognostic markers', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'LDH, CRP, and hematologic markers', url: null },
    { title: 'Pending workup — surgical candidacy', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Missing data — requires consultation', url: null },
];
function CitationPopover({ sourceIndex, onClose }) {
    const meta = sourceMeta[sourceIndex] || { title: 'Source', type: 'Unknown', evidenceLevel: 'N/A', relevance: '', url: null };
    return (_jsxs("div", { className: "citation-popover", children: [_jsx("h5", { children: meta.title }), _jsx("span", { className: "label", children: "Type" }), _jsx("p", { children: meta.type }), _jsx("span", { className: "label", children: "Evidence Level" }), _jsx("p", { children: meta.evidenceLevel }), _jsx("span", { className: "label", children: "Relevance" }), _jsx("p", { children: meta.relevance }), meta.url ? (_jsx("a", { href: meta.url, target: "_blank", rel: "noopener noreferrer", className: "btn btn-sm btn-outline", style: { marginTop: '0.35rem', width: '100%', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }, children: "Open source" })) : (_jsx("button", { type: "button", className: "btn btn-sm btn-outline", style: { marginTop: '0.35rem', width: '100%' }, disabled: true, children: "Source not available" }))] }));
}
const missingDataDetails = [
    {
        item: 'Surgical candidacy assessment pending thoracic surgery consultation',
        whyMatters: 'Determines if neoadjuvant or surgical approach is viable',
        impact: 'May open curative-intent surgical options',
        urgency: 'high',
    },
    {
        item: 'Cardiac ejection fraction not yet obtained',
        whyMatters: 'Required for cardiotoxic chemotherapy regimens',
        impact: 'Limits chemoradiation options',
        urgency: 'high',
    },
    {
        item: 'Detailed toxicity history from prior treatments (none documented)',
        whyMatters: 'Baseline tolerance profile for treatment planning',
        impact: 'Uncertainty in tolerability assessment',
        urgency: 'medium',
    },
];
export function EvidenceReview() {
    const { evidence, evidenceLoading } = useWorkflow();
    const [activeTab, setActiveTab] = useState('evidence');
    const [openCitation, setOpenCitation] = useState(null);
    const tabs = [
        { id: 'evidence', label: 'Evidence Review' },
        { id: 'missing', label: 'Missing Data' },
        { id: 'risks', label: 'Risk Flags' },
        { id: 'sources', label: 'Sources' },
    ];
    if (evidenceLoading || !evidence) {
        return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", badge: "Step 3" }), _jsx("div", { className: "loading-state card", children: "Analyzing clinical evidence..." })] }));
    }
    const getCitationIndex = (source) => {
        const map = {
            'FLAURA Trial': 1,
            'NCCN Guidelines': 0,
            'Patient context': 5,
            'Renal dosing review': 3,
            'Lab analysis': 6,
            'PACIFIC Trial': 2,
            'Prognostic markers': 6,
            'Pending workup': 7,
            'Inflammation markers': 6,
            'Missing data': 7,
        };
        return map[source ?? ''] ?? 0;
    };
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", badge: "Step 3" }), _jsxs("div", { className: "card uncertainty-banner", children: [_jsxs("div", { className: "uncertainty-header", children: [_jsx("span", { className: "label", children: "Uncertainty Level" }), _jsx("span", { className: `uncertainty-level uncertainty-${evidence.uncertaintyLevel}`, children: evidence.uncertaintyLevel.toUpperCase() })] }), _jsx("p", { style: { fontSize: '0.85rem', margin: 0 }, children: evidence.uncertaintyDescription })] }), _jsx(TabBar, { tabs: tabs, activeTab: activeTab, onTabChange: setActiveTab }), activeTab === 'evidence' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "evidence-grid", children: [_jsxs("div", { className: "card evidence-card variant-for", children: [_jsx("h4", { style: { color: 'var(--success)' }, children: "\u2713 Evidence For" }), _jsx("ul", { className: "evidence-list", children: evidence.evidenceFor.map((e, i) => {
                                            const ci = getCitationIndex(e.source);
                                            return (_jsx("li", { children: _jsxs("div", { className: "evidence-item-wrapper", children: [e.text, _jsx("button", { type: "button", className: "citation-chip", onClick: () => setOpenCitation(openCitation === ci ? null : ci), children: ci + 1 }), openCitation === ci && (_jsx(CitationPopover, { sourceIndex: ci, onClose: () => setOpenCitation(null) })), _jsx("span", { className: "evidence-source", children: e.source }), e.source === 'Missing data' && _jsx("span", { className: "missing-data-badge", children: "Missing data" })] }) }, i));
                                        }) })] }), _jsxs("div", { className: "card evidence-card variant-against", children: [_jsx("h4", { style: { color: 'var(--danger)' }, children: "\u2717 Evidence Against / Cautions" }), _jsx("ul", { className: "evidence-list", children: evidence.evidenceAgainst.map((e, i) => {
                                            const ci = getCitationIndex(e.source);
                                            return (_jsx("li", { children: _jsxs("div", { className: "evidence-item-wrapper", children: [e.text, _jsx("button", { type: "button", className: "citation-chip", onClick: () => setOpenCitation(openCitation === ci ? null : ci), children: ci + 1 }), openCitation === ci && (_jsx(CitationPopover, { sourceIndex: ci, onClose: () => setOpenCitation(null) })), _jsx("span", { className: "evidence-source", children: e.source }), e.source === 'Missing data' && _jsx("span", { className: "missing-data-badge", children: "Missing data" })] }) }, i));
                                        }) })] })] }), evidence.keyReasoningFactors.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h4", { children: "Key Reasoning Factors" }), _jsx("div", { className: "reasoning-factors", children: evidence.keyReasoningFactors.map((f) => (_jsxs("div", { className: `reasoning-factor direction-${f.direction}`, children: [_jsx("span", { className: "factor-name", children: f.factor }), _jsx("span", { className: `weight-badge weight-${f.weight}`, children: f.weight }), _jsx("span", { className: `direction-badge direction-${f.direction}`, children: f.direction })] }, f.factor))) })] }))] })), activeTab === 'missing' && (_jsx("div", { className: "missing-detail-grid", children: missingDataDetails.map((item, i) => (_jsxs("div", { className: "missing-detail-card", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }, children: [_jsx("h5", { children: item.item }), _jsx("span", { className: `urgency-badge urgency-${item.urgency}`, children: item.urgency })] }), _jsxs("p", { children: [_jsx("strong", { children: "Why it matters:" }), " ", item.whyMatters] }), _jsxs("p", { children: [_jsx("strong", { children: "Impact:" }), " ", item.impact] })] }, i))) })), activeTab === 'risks' && (_jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Risk Flags" }), _jsx("div", { className: "risk-flags-grid", children: evidence.riskFlags.map((flag) => (_jsxs("div", { className: `card risk-flag-card severity-${flag.severity}`, children: [_jsxs("div", { className: "risk-flag-header", children: [_jsx("span", { className: "risk-flag-icon", children: "\u26A0\uFE0F" }), _jsx("strong", { style: { fontSize: '0.85rem' }, children: flag.title })] }), _jsx("p", { style: { fontSize: '0.8rem', margin: '0 0 0.35rem' }, children: flag.description }), flag.relatedTreatments && (_jsxs("div", { className: "risk-related", children: [_jsx("span", { style: { fontSize: '0.7rem', color: 'var(--text-muted)' }, children: "Related:" }), flag.relatedTreatments.map((t) => (_jsx("span", { className: "tag", children: t }, t)))] }))] }, flag.id))) })] })), activeTab === 'sources' && (_jsx("div", { style: { display: 'grid', gap: '0.4rem' }, children: sourceMeta.map((s, i) => (_jsxs("div", { className: "card card-sm", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("strong", { style: { fontSize: '0.8rem' }, children: s.title }), _jsxs("div", { style: { display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }, children: [_jsx("span", { className: "source-badge", children: s.type }), _jsxs("span", { className: "source-badge", children: ["Level ", s.evidenceLevel] }), _jsx("span", { style: { fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }, children: s.relevance })] })] }), s.url ? (_jsx("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", className: "btn btn-sm btn-secondary", style: { whiteSpace: 'nowrap', textDecoration: 'none' }, children: "Open" })) : (_jsx("button", { type: "button", className: "btn btn-sm btn-secondary", disabled: true, style: { whiteSpace: 'nowrap' }, children: "N/A" }))] }, i))) })), _jsx(StepFooter, {})] }));
}
