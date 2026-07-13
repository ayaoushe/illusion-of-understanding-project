import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
import { getAssessmentTreatmentLabel } from '../data/mockData';
const sourceMetaByLabel = {
    'NCCN Guidelines': { title: 'NCCN Guidelines for NSCLC', type: 'Guideline', evidenceLevel: '1A', relevance: 'Standard of care guidance for NSCLC treatment selection.', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
    'FLAURA Trial': { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Primary efficacy data for osimertinib and EGFR-directed therapy.', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
    'PACIFIC Trial': { title: 'PACIFIC Trial: Durvalumab after CRT', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Alternative for stage III disease after chemoradiation.', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
    'Renal dosing review': { title: 'Renal Impairment and Anticancer Drug Selection', type: 'DOI (Review)', evidenceLevel: '2A', relevance: 'Dosing guidance for reduced eGFR and renal-sparing approaches.', url: 'https://pubmed.ncbi.nlm.nih.gov/38456789' },
    'Institutional cohort': { title: 'Institutional cohort data', type: 'Institutional cohort', evidenceLevel: '3', relevance: 'Local outcomes with a similar patient profile.', url: 'https://www.nccn.org' },
    'Patient context': { title: 'Patient clinical context', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Individual patient factors, preference, and feasibility.', url: null },
    'Prognostic markers': { title: 'Lab analysis — prognostic markers', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'LDH, CRP, and hematologic markers informing uncertainty.', url: null },
    'Missing data': { title: 'Pending workup — surgical candidacy', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Missing data that may change the recommended treatment pathway.', url: null },
    'Assessment alignment': { title: 'Assessment alignment', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'The selected treatment pathway is being compared with the patient’s clinical profile.', url: null },
    'Guideline synthesis': { title: 'Guideline synthesis', type: 'Guideline', evidenceLevel: '2A', relevance: 'Cross-guideline synthesis for treatment selection.', url: 'https://www.nccn.org' },
};
function CitationPopover({ sourceLabel, onClose }) {
    const meta = sourceMetaByLabel[sourceLabel] || { title: 'Source', type: 'Unknown', evidenceLevel: 'N/A', relevance: '', url: null };
    return (_jsxs("div", { className: "citation-popover", children: [_jsx("h5", { children: meta.title }), _jsx("span", { className: "label", children: "Type" }), _jsx("p", { children: meta.type }), _jsx("span", { className: "label", children: "Evidence Level" }), _jsx("p", { children: meta.evidenceLevel }), _jsx("span", { className: "label", children: "Relevance" }), _jsx("p", { children: meta.relevance }), meta.url ? (_jsx("a", { href: meta.url, target: "_blank", rel: "noopener noreferrer", className: "btn btn-sm btn-outline", style: { marginTop: '0.35rem', width: '100%', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }, children: "Open source" })) : (_jsx("button", { type: "button", className: "btn btn-sm btn-outline", style: { marginTop: '0.35rem', width: '100%' }, disabled: true, children: "Source not available" })), _jsx("button", { type: "button", className: "btn btn-sm btn-secondary", onClick: onClose, style: { marginTop: '0.4rem', width: '100%' }, children: "Close" })] }));
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
    const { assessment, evidence, evidenceLoading } = useWorkflow();
    const [activeTab, setActiveTab] = useState('evidence');
    const [openCitation, setOpenCitation] = useState(null);
    const [visitedTabs, setVisitedTabs] = useState(['evidence']);
    const tabs = useMemo(() => [
        { id: 'evidence', label: 'Evidence Review' },
        { id: 'missing', label: 'Missing Data' },
        { id: 'risks', label: 'Risk Flags' },
        { id: 'published', label: 'Published Cohorts' },
        { id: 'sources', label: 'Sources' },
    ], []);
    if (evidenceLoading || !evidence) {
        return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", badge: "Step 3" }), _jsx("div", { className: "loading-state card", children: "Analyzing clinical evidence..." })] }));
    }
    const handleTabChange = (tabId) => {
        const nextTab = tabId;
        setActiveTab(nextTab);
        setVisitedTabs((prev) => (prev.includes(nextTab) ? prev : [...prev, nextTab]));
    };
    const reviewedCount = visitedTabs.length;
    const allTabsVisited = reviewedCount === tabs.length;
    const selectedTreatmentLabel = assessment?.selectedTreatment ? getAssessmentTreatmentLabel(assessment.selectedTreatment) : 'Selected treatment';
    const getBadge = (text) => {
        if (/missing|caution/i.test(text)) {
            return 'Caution';
        }
        return null;
    };
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", badge: "Step 3" }), _jsxs("div", { className: "card uncertainty-banner", children: [_jsxs("div", { className: "uncertainty-header", children: [_jsx("span", { className: "label", children: "Uncertainty Level" }), _jsx("span", { className: `uncertainty-level uncertainty-${evidence.uncertaintyLevel}`, children: evidence.uncertaintyLevel.toUpperCase() })] }), _jsx("p", { style: { fontSize: '0.85rem', margin: 0 }, children: evidence.uncertaintyDescription })] }), _jsx("div", { className: "card", style: { marginBottom: '0.75rem', padding: '0.8rem 1rem' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { fontSize: '0.9rem' }, children: selectedTreatmentLabel }), _jsx("p", { style: { margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }, children: evidence.uncertaintySummary })] }), _jsxs("span", { className: "source-badge", children: [reviewedCount, "/", tabs.length, " tabs reviewed"] })] }) }), _jsx(TabBar, { tabs: tabs, activeTab: activeTab, onTabChange: handleTabChange }), _jsxs("p", { style: { margin: '0.35rem 0 0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }, children: ["Review all evidence tabs to continue: ", reviewedCount, "/", tabs.length, " reviewed"] }), activeTab === 'evidence' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "evidence-grid", children: [_jsxs("div", { className: "card evidence-card variant-for", children: [_jsx("h4", { style: { color: 'var(--success)' }, children: "\u2713 Evidence For" }), _jsx("ul", { className: "evidence-list", children: evidence.evidenceFor.map((e, i) => {
                                            const sourceLabel = e.source ?? 'Patient context';
                                            const badge = getBadge(e.text);
                                            return (_jsx("li", { children: _jsxs("div", { className: "evidence-item-wrapper", children: [e.text, _jsxs("button", { type: "button", className: "citation-chip", onClick: () => setOpenCitation(openCitation === sourceLabel ? null : sourceLabel), children: ["[", i + 1, "]"] }), openCitation === sourceLabel && _jsx(CitationPopover, { sourceLabel: sourceLabel, onClose: () => setOpenCitation(null) }), _jsx("span", { className: "evidence-source", children: sourceLabel }), badge && _jsx("span", { className: "missing-data-badge", children: badge })] }) }, i));
                                        }) })] }), _jsxs("div", { className: "card evidence-card variant-against", children: [_jsx("h4", { style: { color: 'var(--danger)' }, children: "\u2717 Evidence Against / Cautions" }), _jsx("ul", { className: "evidence-list", children: evidence.evidenceAgainst.map((e, i) => {
                                            const sourceLabel = e.source ?? 'Patient context';
                                            const badge = getBadge(e.text);
                                            return (_jsx("li", { children: _jsxs("div", { className: "evidence-item-wrapper", children: [e.text, _jsxs("button", { type: "button", className: "citation-chip", onClick: () => setOpenCitation(openCitation === sourceLabel ? null : sourceLabel), children: ["[", i + 1, "]"] }), openCitation === sourceLabel && _jsx(CitationPopover, { sourceLabel: sourceLabel, onClose: () => setOpenCitation(null) }), _jsx("span", { className: "evidence-source", children: sourceLabel }), badge && _jsx("span", { className: "missing-data-badge", children: badge })] }) }, i));
                                        }) })] })] }), evidence.keyReasoningFactors.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h4", { children: "Key Reasoning Factors" }), _jsx("div", { className: "reasoning-factors", children: evidence.keyReasoningFactors.map((f) => (_jsxs("div", { className: `reasoning-factor direction-${f.direction}`, children: [_jsx("span", { className: "factor-name", children: f.factor }), _jsx("span", { className: `weight-badge weight-${f.weight}`, children: f.weight }), _jsx("span", { className: `direction-badge direction-${f.direction}`, children: f.direction })] }, f.factor))) })] }))] })), activeTab === 'missing' && (_jsx("div", { className: "missing-detail-grid", children: missingDataDetails.map((item, i) => (_jsxs("div", { className: "missing-detail-card", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }, children: [_jsx("h5", { children: item.item }), _jsx("span", { className: `urgency-badge urgency-${item.urgency}`, children: item.urgency })] }), _jsxs("p", { children: [_jsx("strong", { children: "Why it matters:" }), " ", item.whyMatters] }), _jsxs("p", { children: [_jsx("strong", { children: "Impact:" }), " ", item.impact] })] }, i))) })), activeTab === 'risks' && (_jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Risk Flags" }), _jsx("div", { className: "risk-flags-grid", children: evidence.riskFlags.map((flag) => (_jsxs("div", { className: `card risk-flag-card severity-${flag.severity}`, children: [_jsxs("div", { className: "risk-flag-header", children: [_jsx("span", { className: "risk-flag-icon", children: "\u26A0\uFE0F" }), _jsx("strong", { style: { fontSize: '0.85rem' }, children: flag.title })] }), _jsx("p", { style: { fontSize: '0.8rem', margin: '0 0 0.35rem' }, children: flag.description }), flag.relatedTreatments && (_jsxs("div", { className: "risk-related", children: [_jsx("span", { style: { fontSize: '0.7rem', color: 'var(--text-muted)' }, children: "Related:" }), flag.relatedTreatments.map((t) => (_jsx("span", { className: "tag", children: t }, t)))] }))] }, flag.id))) })] })), activeTab === 'published' && (_jsx("div", { style: { display: 'grid', gap: '0.6rem' }, children: evidence.publishedCohorts.map((cohort, index) => (_jsxs("div", { className: "card", style: { display: 'grid', gap: '0.4rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }, children: [_jsxs("div", { children: [_jsx("h5", { style: { margin: 0 }, children: cohort.cohortName }), _jsx("p", { style: { margin: '0.2rem 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }, children: cohort.population })] }), _jsxs("span", { className: "source-badge", children: ["Similarity ", cohort.similarityLevel] })] }), _jsxs("div", { style: { display: 'grid', gap: '0.25rem' }, children: [_jsxs("div", { children: [_jsx("strong", { children: "Matching factors:" }), " ", cohort.matchingFactors.join(', ')] }), _jsxs("div", { children: [_jsx("strong", { children: "Limitations:" }), " ", cohort.limitationFactors.join(', ')] }), _jsxs("div", { children: [_jsx("strong", { children: "Treatment implication:" }), " ", cohort.implication] })] }), cohort.sourceUrl ? (_jsx("a", { href: cohort.sourceUrl, target: "_blank", rel: "noopener noreferrer", className: "btn btn-sm btn-secondary", style: { justifySelf: 'start', textDecoration: 'none' }, children: "View cohort source" })) : (_jsx("span", { className: "source-badge", children: cohort.sourceLabel }))] }, `${cohort.cohortName}-${index}`))) })), activeTab === 'sources' && (_jsx("div", { style: { display: 'grid', gap: '0.4rem' }, children: evidence.sources.map((s, i) => (_jsxs("div", { className: "card card-sm", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("strong", { style: { fontSize: '0.8rem' }, children: s.title }), _jsxs("div", { style: { display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }, children: [_jsx("span", { className: "source-badge", children: s.type }), _jsxs("span", { className: "source-badge", children: ["Level ", s.year] }), _jsx("span", { style: { fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }, children: s.title })] })] }), _jsx("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", className: "btn btn-sm btn-secondary", style: { whiteSpace: 'nowrap', textDecoration: 'none' }, children: "Open" })] }, `${s.title}-${i}`))) })), _jsx(StepFooter, { nextDisabled: !allTabsVisited, nextLabel: allTabsVisited ? 'Continue' : 'Review all evidence tabs' })] }));
}
