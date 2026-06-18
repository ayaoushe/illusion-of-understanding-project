import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { EXPLANATION_PROMPTS } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchReflectiveAnswer } from '../services/aiService';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { EvidenceCard } from '../components/cards/EvidenceCard';
import { RiskFlagCard } from '../components/cards/RiskFlagCard';
import { MissingDataCard } from '../components/cards/MissingDataCard';
import { BiasWarningBanner } from '../components/cards/BiasWarningBanner';
export function EvidenceReview() {
    const { evidence, evidenceLoading, assessment, recordInteraction, biasWarnings } = useWorkflow();
    const [activePrompt, setActivePrompt] = useState(null);
    const [promptAnswer, setPromptAnswer] = useState('');
    const [loadingPrompt, setLoadingPrompt] = useState(false);
    const handlePrompt = async (promptId) => {
        if (!assessment)
            return;
        setActivePrompt(promptId);
        setLoadingPrompt(true);
        recordInteraction({ type: 'evidence_prompt', payload: promptId });
        const answer = await fetchReflectiveAnswer(promptId, { assessment });
        setPromptAnswer(answer);
        setLoadingPrompt(false);
    };
    if (evidenceLoading || !evidence) {
        return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", subtitle: "Synthesizing evidence...", badge: "Step 3" }), _jsx("div", { className: "loading-state card", children: "Analyzing clinical evidence..." })] }));
    }
    return (_jsxs("div", { className: "page", children: [_jsx(PageHeader, { title: "AI Evidence Synthesis", subtitle: "Evidence review \u2014 not a final recommendation. Compare with your independent assessment.", badge: "Step 3" }), _jsx(BiasWarningBanner, { warnings: biasWarnings }), _jsx("div", { className: "card evidence-disclaimer", children: _jsx("p", { children: evidence.disclaimer }) }), _jsxs("div", { className: "uncertainty-banner card", children: [_jsxs("div", { className: "uncertainty-header", children: [_jsx("span", { className: "label", children: "Uncertainty Level" }), _jsx("span", { className: `uncertainty-level uncertainty-${evidence.uncertaintyLevel}`, children: evidence.uncertaintyLevel.toUpperCase() })] }), _jsx("p", { children: evidence.uncertaintyDescription }), _jsx("p", { className: "muted confidence-note", children: "Confidence \u2260 correctness. Review contradictory evidence carefully." })] }), _jsxs("div", { className: "evidence-grid", children: [_jsx(EvidenceCard, { title: "Evidence Supporting Your Assessment", items: evidence.evidenceFor, variant: "for" }), _jsx(EvidenceCard, { title: "Evidence Against / Caution Points", items: evidence.evidenceAgainst, variant: "against" })] }), _jsxs("div", { className: "reflective-prompts card", children: [_jsx("h4", { children: "Reflective Exploration" }), _jsx("p", { className: "muted", children: "Engage with the evidence \u2014 don't accept at face value." }), _jsx("div", { className: "prompt-buttons", children: EXPLANATION_PROMPTS.map((p) => (_jsx("button", { type: "button", className: `btn btn-prompt ${activePrompt === p.id ? 'active' : ''}`, onClick: () => handlePrompt(p.id), children: p.label }, p.id))) }), activePrompt && (_jsxs("div", { className: "prompt-response", children: [_jsx("p", { className: "label", children: EXPLANATION_PROMPTS.find((p) => p.id === activePrompt)?.question }), loadingPrompt ? _jsx("p", { className: "muted", children: "Thinking..." }) : _jsx("p", { children: promptAnswer })] }))] }), _jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Key Reasoning Factors" }), _jsx("div", { className: "reasoning-factors", children: evidence.keyReasoningFactors.map((f) => (_jsxs("div", { className: `reasoning-factor direction-${f.direction}`, children: [_jsx("span", { className: "factor-name", children: f.factor }), _jsx("span", { className: `weight-badge weight-${f.weight}`, children: f.weight }), _jsx("span", { className: `direction-badge direction-${f.direction}`, children: f.direction })] }, f.factor))) })] }), _jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Patient-Specific Risk Flags" }), _jsx("div", { className: "risk-flags-grid", children: evidence.riskFlags.map((flag) => (_jsx(RiskFlagCard, { flag: flag }, flag.id))) })] }), _jsx(MissingDataCard, { items: evidence.missingData }), _jsxs("section", { className: "section-block", children: [_jsx("h3", { children: "Guideline & Study Sources" }), _jsx("ul", { className: "source-list", children: evidence.sources.map((s) => (_jsxs("li", { children: [_jsxs("a", { href: s.url, target: "_blank", rel: "noopener noreferrer", children: [s.title, " (", s.year, ")"] }), _jsx("span", { className: "source-badge", children: s.type })] }, s.title))) })] }), _jsx(StepFooter, {})] }));
}
