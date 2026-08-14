/**
 * Centralized source registry for Step 3 (AI Evidence Synthesis).
 * All evidence citations must reference a source ID from this registry.
 *
 * Rules:
 * - Citation chips open source.url directly in a new tab (target="_blank", rel="noopener noreferrer").
 * - No popover/modal before opening a source.
 * - Patient-context claims use plain labels only — no citation chips.
 * - If no registry source fits a claim, leave it uncited.
 */

export type SourceUrlType = 'PDF' | 'PMC full text' | 'Publisher full text' | 'Guideline / protocol';

export interface SourceRegistryEntry {
  id: string;
  title: string;
  type: string;
  url: string;
  urlType: SourceUrlType;
  useFor: string[];
}

export const sourceRegistry: Record<string, SourceRegistryEntry> = {
  // --- Klinische Belege für die Mamma-Ca-Regime (geprüft, Stand 08/2026) ---
  ESMO_EARLY_BREAST_CANCER_2024: {
    id: 'ESMO_EARLY_BREAST_CANCER_2024',
    title: 'Loibl S et al. — Early breast cancer: ESMO Clinical Practice Guideline (Ann Oncol 2024;35:159–182)',
    type: 'Guideline',
    urlType: 'Guideline / protocol',
    url: 'https://www.annalsofoncology.org/article/S0923-7534(23)05104-9/fulltext',
    useFor: [
      'systemic therapy at this stage',
      'HER2-directed therapy is usually part of the plan',
      'endocrine therapy indication',
      'nodal involvement and treatment intensity',
    ],
  },
  APHINITY_NEJM_2017: {
    id: 'APHINITY_NEJM_2017',
    title: 'von Minckwitz G et al. — Adjuvant Pertuzumab and Trastuzumab in Early HER2-Positive Breast Cancer (APHINITY, NEJM 2017;377:122–131)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1703643',
    useFor: [
      'dual HER2 blockade',
      'HER2-positive node-positive early breast cancer',
      'pertuzumab plus trastuzumab',
    ],
  },
  BIG_1_98_NEJM_2005: {
    id: 'BIG_1_98_NEJM_2005',
    title: 'BIG 1-98 Collaborative Group (Thürlimann B et al.) — A Comparison of Letrozole and Tamoxifen in Postmenopausal Women with Early Breast Cancer (NEJM 2005;353:2747–2757)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa052258',
    useFor: [
      'aromatase inhibition',
      'letrozole versus tamoxifen',
      'postmenopausal endocrine therapy',
    ],
  },
  SOFT_TEXT_NEJM_2014: {
    id: 'SOFT_TEXT_NEJM_2014',
    title: 'Pagani O et al. — Adjuvant Exemestane with Ovarian Suppression in Premenopausal Breast Cancer (TEXT/SOFT, NEJM 2014;371:107–118)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1404037',
    useFor: [
      'ovarian suppression',
      'premenopausal endocrine therapy',
      'aromatase inhibitor requires ovarian suppression',
    ],
  },
  SOFT_NEJM_2015: {
    id: 'SOFT_NEJM_2015',
    title: 'Francis PA et al. — Adjuvant Ovarian Suppression in Premenopausal Breast Cancer (SOFT, NEJM 2015;372:436–446)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1412379',
    useFor: [
      'ovarian suppression added to tamoxifen',
      'GnRH agonist as sole endocrine therapy',
    ],
  },
  TAILORX_NEJM_2018: {
    id: 'TAILORX_NEJM_2018',
    title: 'Sparano JA et al. — Adjuvant Chemotherapy Guided by a 21-Gene Expression Assay in Breast Cancer (TAILORx, NEJM 2018;379:111–121)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1804710',
    useFor: [
      'genomic recurrence score',
      'chemotherapy benefit in HR-positive disease',
      'Ki-67 and proliferation',
    ],
  },
  EBCTCG_POLYCHEMOTHERAPY_LANCET_2012: {
    id: 'EBCTCG_POLYCHEMOTHERAPY_LANCET_2012',
    title: 'EBCTCG — Comparisons between different polychemotherapy regimens for early breast cancer (Lancet 2012;379:432–444)',
    type: 'Meta-analysis',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(11)61625-5/fulltext',
    useFor: [
      'anthracycline-based chemotherapy',
      'anthracycline-free combination chemotherapy',
      'CMF versus anthracycline',
      'taxane chemotherapy',
    ],
  },
  PALOMA2_NEJM_2016: {
    id: 'PALOMA2_NEJM_2016',
    title: 'Finn RS et al. — Palbociclib and Letrozole in Advanced Breast Cancer (PALOMA-2, NEJM 2016;375:1925–1936)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1607303',
    useFor: [
      'CDK4/6 inhibition',
      'palbociclib plus letrozole',
      'advanced/metastatic setting',
      'neutropenia under palbociclib',
    ],
  },
  ESC_CARDIO_ONCOLOGY_2022: {
    id: 'ESC_CARDIO_ONCOLOGY_2022',
    title: '2022 ESC Guidelines on cardio-oncology (Eur Heart J 2022;43:4229–4361)',
    type: 'Guideline',
    urlType: 'Guideline / protocol',
    url: 'https://academic.oup.com/eurheartj/article/43/41/4229/6673995',
    useFor: [
      'baseline LVEF before cardiotoxic therapy',
      'anthracycline cardiotoxicity',
      'trastuzumab and pertuzumab cardiac monitoring',
    ],
  },
  CREATE_X_NEJM_2017: {
    id: 'CREATE_X_NEJM_2017',
    title: 'Masuda N et al. — Adjuvant Capecitabine for Breast Cancer after Preoperative Chemotherapy (CREATE-X, NEJM 2017;376:2147–2159)',
    type: 'Randomised trial',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1612645',
    useFor: [
      'capecitabine in early breast cancer',
      'capecitabine after residual disease',
      'oral fluoropyrimidine chemotherapy',
    ],
  },
  CAPECITABINE_HFS_JOPP_2006: {
    id: 'CAPECITABINE_HFS_JOPP_2006',
    title: 'Gressett SM et al. — Management of hand-foot syndrome induced by capecitabine (J Oncol Pharm Pract 2006;12:131–141)',
    type: 'Review',
    urlType: 'Publisher full text',
    url: 'https://journals.sagepub.com/doi/10.1177/1078155206069242',
    useFor: ['hand-foot syndrome', 'capecitabine dose-limiting toxicity'],
  },
  XELODA_EMA_SMPC: {
    id: 'XELODA_EMA_SMPC',
    title: 'Xeloda (capecitabine) — EMA summary of product characteristics',
    type: 'Product information',
    urlType: 'Guideline / protocol',
    url: 'https://www.ema.europa.eu/en/medicines/human/EPAR/xeloda',
    useFor: ['renal dose adjustment', 'capecitabine contraindications'],
  },
  // --- Grundlagen dieser Anwendung: Datensatz und Verfahren ---
  MSK_CHORD_2024: {
    id: 'MSK_CHORD_2024',
    title: 'MSK-CHORD 2024 — clinico-genomic cohort underlying the model and the comparison groups',
    type: 'Dataset',
    urlType: 'Publisher full text',
    url: 'https://www.cbioportal.org/study/summary?id=msk_chord_2024',
    useFor: [
      'Model probabilities for a regimen',
      'Similar registry cases',
      'Registry cohorts and first-line practice',
    ],
  },
  RANDOM_FOREST_BREIMAN_2001: {
    id: 'RANDOM_FOREST_BREIMAN_2001',
    title: 'Breiman L. — Random Forests (Machine Learning 45:5–32)',
    type: 'Method',
    urlType: 'Publisher full text',
    url: 'https://doi.org/10.1023/A:1010933404324',
    useFor: ['Class probabilities as tree votes', 'Proximity as a similarity measure'],
  },
  SHAP_LUNDBERG_2017: {
    id: 'SHAP_LUNDBERG_2017',
    title: 'Lundberg & Lee — A Unified Approach to Interpreting Model Predictions (NeurIPS 2017)',
    type: 'Method',
    urlType: 'Publisher full text',
    url: 'https://arxiv.org/abs/1705.07874',
    useFor: ['Feature attributions shown per regimen'],
  },















};

/** Plain-text labels for patient-specific claims — no citation chips. */
export const PATIENT_CONTEXT_LABELS = new Set([
  'Patient context',
  'Clinical data',
  'Lab values',
  'Missing data',
]);

export function isPatientContextSource(source: string | undefined | null): boolean {
  if (!source) return false;
  return PATIENT_CONTEXT_LABELS.has(source);
}

export function isRegistrySource(source: string | undefined | null): boolean {
  if (!source) return false;
  return Boolean(sourceRegistry[source]);
}

/** Get a source URL by source ID. Returns null for non-registry sources. */
export function getSourceUrl(sourceId: string | undefined | null): string | null {
  if (!sourceId) return null;
  const entry = sourceRegistry[sourceId];
  return entry?.url ?? null;
}

/** Get source title by source ID. */
export function getSourceTitle(sourceId: string | undefined | null): string {
  if (!sourceId) return '';
  const entry = sourceRegistry[sourceId];
  return entry?.title ?? '';
}

/** Get source type by source ID. */
export function getSourceType(sourceId: string | undefined | null): string {
  if (!sourceId) return '';
  const entry = sourceRegistry[sourceId];
  return entry?.type ?? '';
}

/** Get the URL type badge label for a source ID. */
export function getSourceUrlType(sourceId: string | undefined | null): SourceUrlType | null {
  if (!sourceId) return null;
  const entry = sourceRegistry[sourceId];
  return entry?.urlType ?? null;
}

/** Resolve sources array from a list of source IDs. Removes duplicates. */
export function getSourcesByIds(ids: string[]): SourceRegistryEntry[] {
  const seen = new Set<string>();
  const result: SourceRegistryEntry[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const entry = sourceRegistry[id];
    if (entry) result.push(entry);
  }
  return result;
}

/** Extract unique, valid registry source IDs from evidence items and published cohorts. */
export function extractSourceIdsFromEvidence(
  evidenceFor: Array<{ text: string; source?: string }>,
  evidenceAgainst: Array<{ text: string; source?: string }>,
  publishedCohorts: Array<{ sourceLabel?: string }> = [],
): string[] {
  const ids = new Set<string>();
  for (const item of [...evidenceFor, ...evidenceAgainst]) {
    if (item.source && sourceRegistry[item.source]) {
      ids.add(item.source);
    }
  }
  for (const cohort of publishedCohorts) {
    if (cohort.sourceLabel && sourceRegistry[cohort.sourceLabel]) {
      ids.add(cohort.sourceLabel);
    }
  }
  return Array.from(ids);
}

/** Determine similarity label based on source relevance to a specific clinical context. */
