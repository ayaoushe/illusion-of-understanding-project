import { useMemo, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
import { getAssessmentTreatmentLabel } from '../data/mockData';
import type { PublishedCohort } from '../types';

interface CitationPopoverProps {
  sourceLabel: string;
  onClose: () => void;
}

interface SourceMeta {
  title: string;
  type: string;
  evidenceLevel: string;
  relevance: string;
  url: string | null;
}

type EvidenceTabId = 'evidence' | 'missing' | 'risks' | 'published' | 'sources';

const sourceMetaByLabel: Record<string, SourceMeta> = {
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

function CitationPopover({ sourceLabel, onClose }: CitationPopoverProps) {
  const meta = sourceMetaByLabel[sourceLabel] || { title: 'Source', type: 'Unknown', evidenceLevel: 'N/A', relevance: '', url: null };
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
        <a href={meta.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: '0.35rem', width: '100%', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
          Open source
        </a>
      ) : (
        <button type="button" className="btn btn-sm btn-outline" style={{ marginTop: '0.35rem', width: '100%' }} disabled>
          Source not available
        </button>
      )}
      <button type="button" className="btn btn-sm btn-secondary" onClick={onClose} style={{ marginTop: '0.4rem', width: '100%' }}>
        Close
      </button>
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
  const { assessment, evidence, evidenceLoading } = useWorkflow();
  const [activeTab, setActiveTab] = useState<EvidenceTabId>('evidence');
  const [openCitation, setOpenCitation] = useState<string | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<EvidenceTabId[]>(['evidence']);

  const tabs = useMemo(
    () => [
      { id: 'evidence', label: 'Evidence Review' },
      { id: 'missing', label: 'Missing Data' },
      { id: 'risks', label: 'Risk Flags' },
      { id: 'published', label: 'Published Cohorts' },
      { id: 'sources', label: 'Sources' },
    ],
    [],
  );

  if (evidenceLoading || !evidence) {
    return (
      <div className="page">
        <PageHeader title="AI Evidence Synthesis" badge="Step 3" />
        <div className="loading-state card">Analyzing clinical evidence...</div>
      </div>
    );
  }

  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as EvidenceTabId;
    setActiveTab(nextTab);
    setVisitedTabs((prev) => (prev.includes(nextTab) ? prev : [...prev, nextTab]));
  };

  const reviewedCount = visitedTabs.length;
  const allTabsVisited = reviewedCount === tabs.length;
  const selectedTreatmentLabel = assessment?.selectedTreatment ? getAssessmentTreatmentLabel(assessment.selectedTreatment) : 'Selected treatment';

  const getBadge = (text: string) => {
    if (/missing|caution/i.test(text)) {
      return 'Caution';
    }
    return null;
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

      <div className="card" style={{ marginBottom: '0.75rem', padding: '0.8rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <strong style={{ fontSize: '0.9rem' }}>{selectedTreatmentLabel}</strong>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{evidence.uncertaintySummary}</p>
          </div>
          <span className="source-badge">{reviewedCount}/{tabs.length} tabs reviewed</span>
        </div>
      </div>

      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      <p style={{ margin: '0.35rem 0 0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Review all evidence tabs to continue: {reviewedCount}/{tabs.length} reviewed
      </p>

      {activeTab === 'evidence' && (
        <>
          <div className="evidence-grid">
            <div className="card evidence-card variant-for">
              <h4 style={{ color: 'var(--success)' }}>✓ Evidence For</h4>
              <ul className="evidence-list">
                {evidence.evidenceFor.map((e, i) => {
                  const sourceLabel = e.source ?? 'Patient context';
                  const badge = getBadge(e.text);
                  return (
                    <li key={i}>
                      <div className="evidence-item-wrapper">
                        {e.text}
                        <button type="button" className="citation-chip" onClick={() => setOpenCitation(openCitation === sourceLabel ? null : sourceLabel)}>
                          [{i + 1}]
                        </button>
                        {openCitation === sourceLabel && <CitationPopover sourceLabel={sourceLabel} onClose={() => setOpenCitation(null)} />}
                        <span className="evidence-source">{sourceLabel}</span>
                        {badge && <span className="missing-data-badge">{badge}</span>}
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
                  const sourceLabel = e.source ?? 'Patient context';
                  const badge = getBadge(e.text);
                  return (
                    <li key={i}>
                      <div className="evidence-item-wrapper">
                        {e.text}
                        <button type="button" className="citation-chip" onClick={() => setOpenCitation(openCitation === sourceLabel ? null : sourceLabel)}>
                          [{i + 1}]
                        </button>
                        {openCitation === sourceLabel && <CitationPopover sourceLabel={sourceLabel} onClose={() => setOpenCitation(null)} />}
                        <span className="evidence-source">{sourceLabel}</span>
                        {badge && <span className="missing-data-badge">{badge}</span>}
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

      {activeTab === 'published' && (
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {evidence.publishedCohorts.map((cohort: PublishedCohort, index: number) => (
            <div key={`${cohort.cohortName}-${index}`} className="card" style={{ display: 'grid', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <h5 style={{ margin: 0 }}>{cohort.cohortName}</h5>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>{cohort.population}</p>
                </div>
                <span className="source-badge">Similarity {cohort.similarityLevel}</span>
              </div>
              <div style={{ display: 'grid', gap: '0.25rem' }}>
                <div><strong>Matching factors:</strong> {cohort.matchingFactors.join(', ')}</div>
                <div><strong>Limitations:</strong> {cohort.limitationFactors.join(', ')}</div>
                <div><strong>Treatment implication:</strong> {cohort.implication}</div>
              </div>
              {cohort.sourceUrl ? (
                <a href={cohort.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ justifySelf: 'start', textDecoration: 'none' }}>
                  View cohort source
                </a>
              ) : (
                <span className="source-badge">{cohort.sourceLabel}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {evidence.sources.map((s, i) => (
            <div key={`${s.title}-${i}`} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.8rem' }}>{s.title}</strong>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <span className="source-badge">{s.type}</span>
                  <span className="source-badge">Level {s.year}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{s.title}</span>
                </div>
              </div>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
                Open
              </a>
            </div>
          ))}
        </div>
      )}

      <StepFooter nextDisabled={!allTabsVisited} nextLabel={allTabsVisited ? 'Continue' : 'Review all evidence tabs'} />
    </div>
  );
}