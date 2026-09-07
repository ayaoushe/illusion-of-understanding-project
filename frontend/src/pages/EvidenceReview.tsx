import { useEffect, useMemo, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchCase } from '../services/caseService';
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
import { MISSING_DATA_ITEMS } from '../data/missingDataCatalog';
import type { PublishedCohort } from '../types';
import type { SourceRegistryEntry } from '../data/sourceRegistry';

//Step 3: Clinicans unlocks Evidence for and against their assessment

type EvidenceTabId = 'evidence' | 'missing' | 'risks' | 'published' | 'sources';

const uncertaintyExplanations: Record<string, string> = {
  low: 'Evidence closely matches the current patient profile; key required data are available.',
  moderate: 'Evidence partially matches the current patient profile, but some relevant clinical factors or missing data limit certainty.',
  high: 'Evidence is weakly matched or important patient-specific information is missing; recommendation should be interpreted cautiously.',
};

// Gemeinsame Quelle mit Step 1 (data/missingDataCatalog.ts), damit die
// Patientenuebersicht und dieser Reiter dieselben Punkte zeigen.
const missingDataDetails = MISSING_DATA_ITEMS;
const ONCOTYPE_MISSING_DATA_LABEL = 'Oncotype DX recurrence score not yet obtained';

/**
 * HER2 / HR are patient-level features, not treatment-level ones — the same
 * study case repeats them inside every entry of `options[].features[]` (once
 * per candidate regime). We just need one occurrence, so we scan the options
 * until we find the named feature and read its "Yes"/"No" value.
 */
function extractPatientFeatureIsYes(studyCase: unknown, featureName: string): boolean | null {
  const options = (studyCase as { options?: Array<{ features?: Array<{ name: string; value: string }> }> } | null)?.options ?? [];
  for (const option of options) {
    const match = option.features?.find((f) => f.name === featureName);
    if (match) return match.value === 'Yes';
  }
  return null;
}


//Renders evidence for the selected cases and assessed treatment
export function EvidenceReview() {
  const {
    assessment,
    evidence,
    evidenceLoading,
    evidenceVisitedTabs,
    markEvidenceTabVisited,
    markEvidenceTabsReviewed,
    selectedPatientId,
  } = useWorkflow();
  const [activeTab, setActiveTab] = useState<EvidenceTabId>('evidence');
  const [her2Positive, setHer2Positive] = useState<boolean | null>(null);
  const [hrPositive, setHrPositive] = useState<boolean | null>(null);

  // Patient-level HER2/HR status, read straight from the study case so the two
  // conditional cautions below can apply regardless of which regimen the
  // model predicted for this patient.
  useEffect(() => {
    if (!selectedPatientId) {
      setHer2Positive(null);
      setHrPositive(null);
      return;
    }
    let cancelled = false;
    fetchCase(selectedPatientId).then((studyCase) => {
      if (cancelled) return;
      setHer2Positive(extractPatientFeatureIsYes(studyCase, 'HER2'));
      setHrPositive(extractPatientFeatureIsYes(studyCase, 'HR'));
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

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

  useEffect(() => {
    markEvidenceTabVisited('evidence');
  }, [markEvidenceTabVisited]);

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
    markEvidenceTabVisited(nextTab);
  };

  const reviewedCount = evidenceVisitedTabs.length;
  const allTabsVisited = reviewedCount === tabs.length;

  useEffect(() => {
    if (allTabsVisited) markEvidenceTabsReviewed();
  }, [allTabsVisited, markEvidenceTabsReviewed]);

  const selectedTreatmentLabel = assessment?.selectedTreatment ? getAssessmentTreatmentLabel(assessment.selectedTreatment) : 'Selected treatment';
  const showOncotypeMissingData =
    assessment?.selectedTreatment === 'CYCLOPHOSPHAMIDE + DOXORUBICIN' &&
    her2Positive === false &&
    hrPositive === true;
  const visibleMissingDataDetails = missingDataDetails.filter(
    (item) => item.item !== ONCOTYPE_MISSING_DATA_LABEL || showOncotypeMissingData,
  );
  const visibleKeyReasoningFactors = evidence.keyReasoningFactors.filter(
    (factor) => !factor.factor.toLowerCase().includes('oncotype') || showOncotypeMissingData,
  );

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

  /**
   * Evidence-against items that depend on this patient's receptor status
   * rather than being fixed per regimen. Kept out of mockData.ts, which is
   * static per treatment, so they only appear for patients they actually
   * apply to.
   */
  const conditionalCautions = useMemo(() => {
    const items: Array<{ text: string; source?: string; suppressBadge?: boolean }> = [];
    const treatmentId = assessment?.selectedTreatment;

    if (treatmentId === 'CYCLOPHOSPHAMIDE + DOXORUBICIN' && her2Positive) {
      items.push({
        text: 'This treatment regimen does not include HER2-targeted therapy.',
        source: 'Patient context',
      });
    }

    if (treatmentId === 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB' && her2Positive && hrPositive) {
      items.push({
        text: 'Limited evidence exists for this combination in patients who are both HER2-positive and HR-positive.',
        source: 'Patient context',
      });
    }

    if (treatmentId === 'CYCLOPHOSPHAMIDE + DOXORUBICIN' && !her2Positive && hrPositive) {
      items.push({
        text: 'Genomic risk stratification (Oncotype DX recurrence score) is missing; potential risk of overtreatment with chemotherapy.',
        source: 'Missing Data',
        suppressBadge: true,
      });
    }

    return items;
  }, [assessment?.selectedTreatment, her2Positive, hrPositive]);

  //Flag evidence with missing or caution badge
  const getBadge = (text: string) => {
    if (/missing|caution/i.test(text)) {
      return 'Caution';
    }
    return null;
  };

  /** Render a single evidence item — citation chips only for registry-backed claims */
  const renderEvidenceItem = (text: string, source: string | undefined, suppressBadge = false) => {
    const sourceUrl = getSourceUrl(source);
    const badge = suppressBadge ? null : getBadge(text);
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
                {evidence.evidenceFor.map((e) => renderEvidenceItem(e.text, e.source, e.suppressBadge))}
              </ul>
            </div>
            <div className="card evidence-card variant-against">
              <h4 style={{ color: 'var(--danger)' }}>✗ Evidence Against / Cautions</h4>
              <ul className="evidence-list">
                {evidence.evidenceAgainst.map((e) => renderEvidenceItem(e.text, e.source, e.suppressBadge))}
                {conditionalCautions.map((e) => renderEvidenceItem(e.text, e.source, e.suppressBadge))}
              </ul>
            </div>
          </div>

          {visibleKeyReasoningFactors.length > 0 && (
            <div className="card">
              <h4>Key Reasoning Factors</h4>
              <div className="reasoning-factors">
                {visibleKeyReasoningFactors.map((f) => (
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
          {visibleMissingDataDetails.map((item, i) => (
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
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Drugs with a similar risk:</span>
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