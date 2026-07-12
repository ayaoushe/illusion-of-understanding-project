import { useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';

interface CitationPopoverProps {
  sourceIndex: number;
  onClose: () => void;
}

interface SourceMeta {
  title: string;
  type: string;
  evidenceLevel: string;
  relevance: string;
  url: string | null;
}

const sourceMeta: SourceMeta[] = [
  { title: 'NCCN Guidelines for NSCLC', type: 'Guideline', evidenceLevel: '1A', relevance: 'Standard of care for EGFR+ NSCLC', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
  { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Primary efficacy data for osimertinib', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
  { title: 'PACIFIC Trial: Durvalumab after CRT', type: 'PubMed (RCT)', evidenceLevel: '1B', relevance: 'Alternative for Stage III after chemoradiation', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
  { title: 'Renal Impairment and Anticancer Drug Selection', type: 'DOI (Review)', evidenceLevel: '2A', relevance: 'Dosing guidance for reduced eGFR', url: 'https://pubmed.ncbi.nlm.nih.gov/38456789' },
  { title: 'Institutional cohort data', type: 'Institutional cohort', evidenceLevel: '3', relevance: 'Local outcomes with similar patient profile', url: null },
  { title: 'Patient clinical context', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Individual patient factors and preferences', url: null },
  { title: 'Lab analysis — prognostic markers', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'LDH, CRP, and hematologic markers', url: null },
  { title: 'Pending workup — surgical candidacy', type: 'Clinical assessment', evidenceLevel: 'N/A', relevance: 'Missing data — requires consultation', url: null },
];

function CitationPopover({ sourceIndex, onClose }: CitationPopoverProps) {
  const meta = sourceMeta[sourceIndex] || { title: 'Source', type: 'Unknown', evidenceLevel: 'N/A', relevance: '', url: null };
  return (
    <div className="citation-popover">
      <h5>{meta.title}</h5>
      <span className="label">Type</span>
      <p>{meta.type}</p>
      <span className="label">Evidence Level</span>
      <p>{meta.evidenceLevel}</p>
      <span className="label">Relevance</span>
      <p>{meta.relevance}</p>
      {meta.url ? (
        <a
          href={meta.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline"
          style={{ marginTop: '0.35rem', width: '100%', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
        >
          Open source
        </a>
      ) : (
        <button
          type="button"
          className="btn btn-sm btn-outline"
          style={{ marginTop: '0.35rem', width: '100%' }}
          disabled
        >
          Source not available
        </button>
      )}
    </div>
  );
}

const missingDataDetails = [
  {
    item: 'Surgical candidacy assessment pending thoracic surgery consultation',
    whyMatters: 'Determines if neoadjuvant or surgical approach is viable',
    impact: 'May open curative-intent surgical options',
    urgency: 'high' as const,
  },
  {
    item: 'Cardiac ejection fraction not yet obtained',
    whyMatters: 'Required for cardiotoxic chemotherapy regimens',
    impact: 'Limits chemoradiation options',
    urgency: 'high' as const,
  },
  {
    item: 'Detailed toxicity history from prior treatments (none documented)',
    whyMatters: 'Baseline tolerance profile for treatment planning',
    impact: 'Uncertainty in tolerability assessment',
    urgency: 'medium' as const,
  },
];

export function EvidenceReview() {
  const { evidence, evidenceLoading } = useWorkflow();
  const [activeTab, setActiveTab] = useState('evidence');
  const [openCitation, setOpenCitation] = useState<number | null>(null);

  const tabs = [
    { id: 'evidence', label: 'Evidence Review' },
    { id: 'missing', label: 'Missing Data' },
    { id: 'risks', label: 'Risk Flags' },
    { id: 'sources', label: 'Sources' },
  ];

  if (evidenceLoading || !evidence) {
    return (
      <div className="page">
        <PageHeader title="AI Evidence Synthesis" badge="Step 3" />
        <div className="loading-state card">Analyzing clinical evidence...</div>
      </div>
    );
  }

  const getCitationIndex = (source: string | undefined): number => {
    const map: Record<string, number> = {
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

  return (
    <div className="page">
      <PageHeader title="AI Evidence Synthesis" badge="Step 3" />

      <div className="card uncertainty-banner">
        <div className="uncertainty-header">
          <span className="label">Uncertainty Level</span>
          <span className={`uncertainty-level uncertainty-${evidence.uncertaintyLevel}`}>
            {evidence.uncertaintyLevel.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', margin: 0 }}>{evidence.uncertaintyDescription}</p>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'evidence' && (
        <>
          <div className="evidence-grid">
            <div className="card evidence-card variant-for">
              <h4 style={{ color: 'var(--success)' }}>✓ Evidence For</h4>
              <ul className="evidence-list">
                {evidence.evidenceFor.map((e, i) => {
                  const ci = getCitationIndex(e.source);
                  return (
                    <li key={i}>
                      <div className="evidence-item-wrapper">
                        {e.text}
                        <button
                          type="button"
                          className="citation-chip"
                          onClick={() => setOpenCitation(openCitation === ci ? null : ci)}
                        >
                          {ci + 1}
                        </button>
                        {openCitation === ci && (
                          <CitationPopover sourceIndex={ci} onClose={() => setOpenCitation(null)} />
                        )}
                        <span className="evidence-source">{e.source}</span>
                        {e.source === 'Missing data' && <span className="missing-data-badge">Missing data</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="card evidence-card variant-against">
              <h4 style={{ color: 'var(--danger)' }}>✗ Evidence Against / Cautions</h4>
              <ul className="evidence-list">
                {evidence.evidenceAgainst.map((e, i) => {
                  const ci = getCitationIndex(e.source);
                  return (
                    <li key={i}>
                      <div className="evidence-item-wrapper">
                        {e.text}
                        <button
                          type="button"
                          className="citation-chip"
                          onClick={() => setOpenCitation(openCitation === ci ? null : ci)}
                        >
                          {ci + 1}
                        </button>
                        {openCitation === ci && (
                          <CitationPopover sourceIndex={ci} onClose={() => setOpenCitation(null)} />
                        )}
                        <span className="evidence-source">{e.source}</span>
                        {e.source === 'Missing data' && <span className="missing-data-badge">Missing data</span>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {evidence.keyReasoningFactors.length > 0 && (
            <div className="card">
              <h4>Key Reasoning Factors</h4>
              <div className="reasoning-factors">
                {evidence.keyReasoningFactors.map((f) => (
                  <div key={f.factor} className={`reasoning-factor direction-${f.direction}`}>
                    <span className="factor-name">{f.factor}</span>
                    <span className={`weight-badge weight-${f.weight}`}>{f.weight}</span>
                    <span className={`direction-badge direction-${f.direction}`}>{f.direction}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'missing' && (
        <div className="missing-detail-grid">
          {missingDataDetails.map((item, i) => (
            <div key={i} className="missing-detail-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <h5>{item.item}</h5>
                <span className={`urgency-badge urgency-${item.urgency}`}>{item.urgency}</span>
              </div>
              <p><strong>Why it matters:</strong> {item.whyMatters}</p>
              <p><strong>Impact:</strong> {item.impact}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'risks' && (
        <section className="section-block">
          <h3>Risk Flags</h3>
          <div className="risk-flags-grid">
            {evidence.riskFlags.map((flag) => (
              <div key={flag.id} className={`card risk-flag-card severity-${flag.severity}`}>
                <div className="risk-flag-header">
                  <span className="risk-flag-icon">⚠️</span>
                  <strong style={{ fontSize: '0.85rem' }}>{flag.title}</strong>
                </div>
                <p style={{ fontSize: '0.8rem', margin: '0 0 0.35rem' }}>{flag.description}</p>
                {flag.relatedTreatments && (
                  <div className="risk-related">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Related:</span>
                    {flag.relatedTreatments.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {sourceMeta.map((s, i) => (
            <div key={i} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.8rem' }}>{s.title}</strong>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <span className="source-badge">{s.type}</span>
                  <span className="source-badge">Level {s.evidenceLevel}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.relevance}</span>
                </div>
              </div>
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-secondary"
                  style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
                >
                  Open
                </a>
              ) : (
                <button type="button" className="btn btn-sm btn-secondary" disabled style={{ whiteSpace: 'nowrap' }}>
                  N/A
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <StepFooter />
    </div>
  );
}