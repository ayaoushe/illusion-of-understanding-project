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
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [promptAnswer, setPromptAnswer] = useState('');
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  const handlePrompt = async (promptId: string) => {
    if (!assessment) return;
    setActivePrompt(promptId);
    setLoadingPrompt(true);
    recordInteraction({ type: 'evidence_prompt', payload: promptId });
    const answer = await fetchReflectiveAnswer(promptId, { assessment });
    setPromptAnswer(answer);
    setLoadingPrompt(false);
  };

  if (evidenceLoading || !evidence) {
    return (
      <div className="page">
        <PageHeader title="AI Evidence Synthesis" subtitle="Synthesizing evidence..." badge="Step 3" />
        <div className="loading-state card">Analyzing clinical evidence...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="AI Evidence Synthesis"
        subtitle="Evidence review — not a final recommendation. Compare with your independent assessment."
        badge="Step 3"
      />

      <BiasWarningBanner warnings={biasWarnings} />

      <div className="card evidence-disclaimer">
        <p>{evidence.disclaimer}</p>
      </div>

      <div className="uncertainty-banner card">
        <div className="uncertainty-header">
          <span className="label">Uncertainty Level</span>
          <span className={`uncertainty-level uncertainty-${evidence.uncertaintyLevel}`}>
            {evidence.uncertaintyLevel.toUpperCase()}
          </span>
        </div>
        <p>{evidence.uncertaintyDescription}</p>
        <p className="muted confidence-note">Confidence ≠ correctness. Review contradictory evidence carefully.</p>
      </div>

      <div className="evidence-grid">
        <EvidenceCard title="Evidence Supporting Your Assessment" items={evidence.evidenceFor} variant="for" />
        <EvidenceCard title="Evidence Against / Caution Points" items={evidence.evidenceAgainst} variant="against" />
      </div>

      <div className="reflective-prompts card">
        <h4>Reflective Exploration</h4>
        <p className="muted">Engage with the evidence — don't accept at face value.</p>
        <div className="prompt-buttons">
          {EXPLANATION_PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`btn btn-prompt ${activePrompt === p.id ? 'active' : ''}`}
              onClick={() => handlePrompt(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {activePrompt && (
          <div className="prompt-response">
            <p className="label">{EXPLANATION_PROMPTS.find((p) => p.id === activePrompt)?.question}</p>
            {loadingPrompt ? <p className="muted">Thinking...</p> : <p>{promptAnswer}</p>}
          </div>
        )}
      </div>

      <section className="section-block">
        <h3>Key Reasoning Factors</h3>
        <div className="reasoning-factors">
          {evidence.keyReasoningFactors.map((f) => (
            <div key={f.factor} className={`reasoning-factor direction-${f.direction}`}>
              <span className="factor-name">{f.factor}</span>
              <span className={`weight-badge weight-${f.weight}`}>{f.weight}</span>
              <span className={`direction-badge direction-${f.direction}`}>{f.direction}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h3>Patient-Specific Risk Flags</h3>
        <div className="risk-flags-grid">
          {evidence.riskFlags.map((flag) => (
            <RiskFlagCard key={flag.id} flag={flag} />
          ))}
        </div>
      </section>

      <MissingDataCard items={evidence.missingData} />

      <section className="section-block">
        <h3>Guideline & Study Sources</h3>
        <ul className="source-list">
          {evidence.sources.map((s) => (
            <li key={s.title}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title} ({s.year})
              </a>
              <span className="source-badge">{s.type}</span>
            </li>
          ))}
        </ul>
      </section>

      <StepFooter />
    </div>
  );
}
