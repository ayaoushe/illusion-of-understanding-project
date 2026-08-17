import { useMemo, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TabBar } from '../components/layout/TabBar';
import { getAssessmentTreatmentLabel } from '../data/mockData';
import {
  getSourceUrl,
  getSourceTitle,
  getSourceUrlType,
  getSourcesByIds,
  extractSourceIdsFromEvidence,
  isPatientContextSource,
  isRegistrySource,
} from '../data/sourceRegistry';
import type { PublishedCohort } from '../types';
import type { SourceRegistryEntry } from '../data/sourceRegistry';

//Step 3: Clinicans unlocks Evidence for and against their assessment

type EvidenceTabId = 'evidence' | 'missing' | 'risks' | 'published' | 'sources';

const uncertaintyExplanations: Record<string, string> = {
  low: 'Evidence closely matches the current patient profile; key required data are available.',
  moderate: 'Evidence partially matches the current patient profile, but some relevant clinical factors or missing data limit certainty.',
  high: 'Evidence is weakly matched or important patient-specific information is missing; recommendation should be interpreted cautiously.',
};

/**
 * Der Reiter "Missing Data" in Step 3.
 *
 * ACHTUNG — diese Liste ist fest verdrahtet und fuer alle vier Patientinnen
 * identisch. Sie wird NICHT aus `evidence.missingData` gespeist, obwohl das
 * Feld existiert und gefuellt ist. Step 1 (patientView.ts) baut seine eigene,
 * fallabhaengige Liste; die beiden zeigen derselben Patientin daher
 * unterschiedliche Luecken an. Bekannt und noch nicht aufgeloest.
 *
 * Wer den Text hier aendert, aendert ihn fuer alle Faelle und alle zehn
 * Therapieoptionen gleichzeitig.
 */
const missingDataDetails = [
  {
    item: 'Baseline LVEF / echocardiogram not yet obtained',
    whyMatters: 'Required before starting anthracycline or HER2-targeted (trastuzumab/pertuzumab) regimens',
    impact: 'Limits confidence in cardiotoxic treatment options',
    urgency: 'high' as const,
  },
  {
    item: 'Menopausal status not formally confirmed',
    whyMatters: 'Determines whether an aromatase inhibitor or ovarian suppression is appropriate',
    impact: 'Affects choice between endocrine therapy options',
    urgency: 'high' as const,
  },
  {
    item: 'Baseline bone density (DEXA) not assessed',
    whyMatters: 'Aromatase inhibitors and ovarian suppression accelerate bone loss',
    impact: 'Affects monitoring and bone-protective therapy planning',
    urgency: 'medium' as const,
  },
  {
    item: 'Germline BRCA1/2 testing not yet performed',
    whyMatters: 'Can affect chemotherapy sensitivity and future risk-reduction counseling',
    impact: 'Uncertainty in long-term treatment and surveillance planning',
    urgency: 'medium' as const,
  },
];


//Renders evidence for the selected cases and assessed treatment
export function EvidenceReview() {
  const { assessment, evidence, evidenceLoading } = useWorkflow();
  const [activeTab, setActiveTab] = useState<EvidenceTabId>('evidence');
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
        <PageHeader title="AI Evidence Synthesis" badge="Step 3 of 6" />
        <div className="loading-state card">Analyzing clinical evidence...</div>
      </div>
    );
  }

  //Tracks which tabs have been opened at leat once to unlock continue button
  const handleTabChange = (tabId: string) => {
    const nextTab = tabId as EvidenceTabId;
    setActiveTab(nextTab);
    setVisitedTabs((prev) => (prev.includes(nextTab) ? prev : [...prev, nextTab]));
  };

  const reviewedCount = visitedTabs.length;
  const allTabsVisited = reviewedCount === tabs.length;
  const selectedTreatmentLabel = assessment?.selectedTreatment ? getAssessmentTreatmentLabel(assessment.selectedTreatment) : 'Selected treatment';

  /** Resolve source IDs referenced in evidence items and published cohorts */
  const referencedSourceIds = useMemo(
    () => extractSourceIdsFromEvidence(evidence.evidenceFor, evidence.evidenceAgainst, evidence.publishedCohorts),
    [evidence.evidenceFor, evidence.evidenceAgainst, evidence.publishedCohorts],
  );

  /** Citation numbers assigned only to registry-backed evidence claims */
  const citationNumberBySource = useMemo(() => {
    const map = new Map<string, number>();
    let counter = 1;
    for (const item of [...evidence.evidenceFor, ...evidence.evidenceAgainst]) {
      if (item.source && isRegistrySource(item.source) && !map.has(item.source)) {
        map.set(item.source, counter++);
      }
    }
    return map;
  }, [evidence.evidenceFor, evidence.evidenceAgainst]);

  /** Full source entries for the Sources tab */
  const referencedSources = useMemo(
    () => getSourcesByIds(referencedSourceIds),
    [referencedSourceIds],
  );

  //Flag evidence with missing or caution badge
  const getBadge = (text: string) => {
    if (/missing|caution/i.test(text)) {
      return 'Caution';
    }
    return null;
  };

  /** Render a single evidence item — citation chips only for registry-backed claims */
  const renderEvidenceItem = (text: string, source: string | undefined) => {
    const sourceUrl = getSourceUrl(source);
    const badge = getBadge(text);
    const isPatientContext = isPatientContextSource(source);
    const citationNumber = source ? citationNumberBySource.get(source) : undefined;

    return (
      <li>
        <div className="evidence-item-wrapper">
          {text}
          {sourceUrl && citationNumber != null && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="citation-chip citation-chip-link"
              title={`Open source: ${getSourceTitle(source)}`}
            >
              [{citationNumber}]
            </a>
          )}
          {isPatientContext && source && (
            <span className="evidence-source">{source}</span>
          )}
          {source && isRegistrySource(source) && (
            <span className="evidence-source">{getSourceTitle(source)}</span>
          )}
          {badge && <span className="missing-data-badge">{badge}</span>}
        </div>
      </li>
    );
  };

  return (
    <div className="page">
      <PageHeader title="AI Evidence Synthesis" badge="Step 3 of 6" />

      <div className="card uncertainty-banner">
        <div className="uncertainty-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="label">Uncertainty Level</span>
            <div className="tooltip-info">
              <span className="tooltip-icon">ℹ</span>
              <div className="tooltip-content">
                <strong style={{ fontSize: '0.9rem', marginBottom: '0.3rem', display: 'block' }}
                >{evidence.uncertaintyLevel.toUpperCase()}</strong>
                <p>{uncertaintyExplanations[evidence.uncertaintyLevel] || ''}</p>
              </div>
            </div>
          </div>
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
                {evidence.evidenceFor.map((e) => renderEvidenceItem(e.text, e.source))}
              </ul>
            </div>
            <div className="card evidence-card variant-against">
              <h4 style={{ color: 'var(--danger)' }}>✗ Evidence Against / Cautions</h4>
              <ul className="evidence-list">
                {evidence.evidenceAgainst.map((e) => renderEvidenceItem(e.text, e.source))}
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
          {evidence.publishedCohorts.map((cohort: PublishedCohort, index: number) => {
            // Resolve cohort source URL from registry if sourceLabel matches a registry ID
            const cohortSourceUrl = cohort.sourceUrl || getSourceUrl(cohort.sourceLabel);
            return (
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
                {cohortSourceUrl ? (
                  <a href={cohortSourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ justifySelf: 'start', textDecoration: 'none' }}>
                    View cohort source
                  </a>
                ) : (
                  <span className="source-badge">{cohort.sourceLabel}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'sources' && (
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {referencedSources.length === 0 && (
            <div className="card card-sm" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No published sources are referenced by the current evidence items. Clinical assessments are based on patient-specific factors.
            </div>
          )}
          {referencedSources.map((s: SourceRegistryEntry, i: number) => {
            const urlType = s.urlType || null;
            return (
              <div key={`${s.id}-${i}`} className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '0.8rem' }}>{s.title}</strong>
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                    <span className="source-badge">{s.type}</span>
                    {urlType && <span className="source-badge">{urlType}</span>}
                  </div>
                </div>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
                  Open
                </a>
              </div>
            );
          })}
          <div className="card card-sm" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', textAlign: 'center' }}>
            Links open the most direct available source. Full PDFs may depend on publisher access rights.
          </div>
        </div>
      )}

      <StepFooter nextDisabled={!allTabsVisited} nextLabel={allTabsVisited ? 'Continue' : 'Review all evidence tabs'} />
    </div>
  );
}