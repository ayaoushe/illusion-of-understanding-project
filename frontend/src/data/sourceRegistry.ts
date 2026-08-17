/**
 * Centralized source registry for Step 3 (AI Evidence Synthesis).
 * All evidence citations must reference a source ID from this registry.
 * Citation chips open source.url directly in a new tab.
 * Patient-context claims use plain labels only.
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
  ATAC_ANASTROZOLE_LANCET_ONCOL: {
    id: 'ATAC_ANASTROZOLE_LANCET_ONCOL',
    title: 'Effect of Anastrozole and Tamoxifen as Adjuvant Treatment for Early-Stage Breast Cancer: 100-Month Analysis of the ATAC Trial',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(07)70385-6/abstract',
    useFor: [
      'Anastrozole',
      'aromatase inhibitor',
      'postmenopausal HR-positive early breast cancer',
      'adjuvant endocrine therapy',
    ],
  },

  BIG198_LETROZOLE_NEJM: {
    id: 'BIG198_LETROZOLE_NEJM',
    title: 'A Comparison of Letrozole and Tamoxifen in Postmenopausal Women with Early Breast Cancer',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa052258',
    useFor: [
      'Letrozole',
      'aromatase inhibitor',
      'postmenopausal HR-positive early breast cancer',
      'adjuvant endocrine therapy',
    ],
  },

  PALOMA2_LETROZOLE_PALBOCICLIB_NEJM: {
    id: 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM',
    title: 'Palbociclib and Letrozole in Advanced Breast Cancer',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1607303',
    useFor: [
      'Letrozole + Palbociclib',
      'CDK4/6 inhibitor',
      'HR-positive HER2-negative advanced breast cancer',
      'first-line endocrine-based therapy',
    ],
  },

  EBCTCG_TAMOXIFEN_LANCET: {
    id: 'EBCTCG_TAMOXIFEN_LANCET',
    title: 'Relevance of Breast Cancer Hormone Receptors and Other Factors to the Efficacy of Adjuvant Tamoxifen: Patient-Level Meta-Analysis of Randomised Trials',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(11)60993-8/fulltext',
    useFor: [
      'Tamoxifen',
      'SERM',
      'HR-positive early breast cancer',
      'adjuvant endocrine therapy',
      'premenopausal or postmenopausal endocrine-responsive disease',
    ],
  },

  SOFT_OVARIAN_SUPPRESSION_NEJM: {
    id: 'SOFT_OVARIAN_SUPPRESSION_NEJM',
    title: 'Adjuvant Ovarian Suppression in Premenopausal Breast Cancer',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1412379',
    useFor: [
      'Leuprolide',
      'GnRH agonist',
      'ovarian function suppression',
      'premenopausal HR-positive breast cancer',
      'adjuvant endocrine therapy',
    ],
  },

  CREATEX_CAPECITABINE_NEJM: {
    id: 'CREATEX_CAPECITABINE_NEJM',
    title: 'Adjuvant Capecitabine for Breast Cancer after Preoperative Chemotherapy (CREATE-X)',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1612645',
    useFor: [
      'Capecitabine',
      'HER2-negative breast cancer',
      'residual disease after neoadjuvant chemotherapy',
      'adjuvant chemotherapy escalation',
    ],
  },

  EBCTCG_ANTHRACYCLINE_TAXANE_LANCET: {
    id: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET',
    title: 'Anthracycline-Containing and Taxane-Containing Chemotherapy for Early-Stage Operable Breast Cancer: A Patient-Level Meta-Analysis of 100,000 Women from 86 Randomised Trials',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)00285-4/fulltext',
    useFor: [
      'Paclitaxel',
      'Cyclophosphamide + Doxorubicin',
      'anthracycline-based chemotherapy',
      'taxane-based chemotherapy',
      'early-stage operable breast cancer',
      'lymph-node-positive disease',
    ],
  },

  EBCTCG_POLYCHEMO_REGIMENS_LANCET: {
    id: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET',
    title: 'Comparisons Between Different Polychemotherapy Regimens for Early Breast Cancer: Meta-Analyses of Long-Term Outcome Among 100,000 Women in 123 Randomised Trials',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(11)61625-5/fulltext',
    useFor: [
      'Cyclophosphamide + Fluorouracil + Methotrexate',
      'CMF',
      'Cyclophosphamide + Doxorubicin',
      'anthracycline-based chemotherapy',
      'chemotherapy regimen comparison',
      'early breast cancer',
    ],
  },

  ESC_CARDIOONCOLOGY_JACC: {
    id: 'ESC_CARDIOONCOLOGY_JACC',
    title: 'The ESC Cardio-Oncology Guidelines: A Roadmap for Clinical Practice and Generating Needed Evidence',
    type: 'Guideline / protocol',
    urlType: 'Publisher full text',
    url: 'https://www.jacc.org/doi/10.1016/j.jaccao.2022.10.010',
    useFor: [
      'Cardiotoxicity monitoring',
      'anthracycline',
      'HER2-targeted therapy',
      'baseline LVEF assessment',
      'cardio-oncology',
    ],
  },

  ASCO_BONE_HEALTH_JCO: {
    id: 'ASCO_BONE_HEALTH_JCO',
    title: 'Management of Osteoporosis in Survivors of Adult Cancers With Nonmetastatic Disease: ASCO Clinical Practice Guideline',
    type: 'Guideline / protocol',
    urlType: 'Publisher full text',
    url: 'https://ascopubs.org/doi/10.1200/JCO.19.01696',
    useFor: [
      'Bone health',
      'aromatase inhibitor bone loss',
      'GnRH agonist bone loss',
      'osteoporosis',
      'fracture risk',
    ],
  },

  CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM: {
    id: 'CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM',
    title: 'Pertuzumab Plus Trastuzumab Plus Docetaxel for Metastatic Breast Cancer (CLEOPATRA)',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1113216',
    useFor: [
      'Paclitaxel + Pertuzumab + Trastuzumab',
      'HER2-positive breast cancer',
      'dual HER2 blockade',
      'taxane plus anti-HER2 therapy',
    ],
  },
};

/** Plain-text labels for patient-specific claims */
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

/**
 * Determine similarity label based on source relevance to a specific clinical context.
 *
 * Adapted for the breast-cancer regime classifier: similarity is judged from disease
 * stage/histology and how closely the trial population matches the treatment being
 * considered (HR/HER2 status is folded into `treatmentId`, since each regime already
 * implies a receptor profile — e.g. an aromatase inhibitor implies HR-positive,
 * a pertuzumab/trastuzumab combination implies HER2-positive).
 */
export function getCohortSimilarityLevel(
  sourceId: string,
  treatmentId: string,
  patientDiagnosis: { stage: string; histology: string; primaryDiagnosis: string },
): 'High' | 'Moderate' | 'Partial' {
  const entry = sourceRegistry[sourceId];
  if (!entry) return 'Partial';

  const diagnosis = patientDiagnosis.primaryDiagnosis.toLowerCase();
  const stage = patientDiagnosis.stage.toUpperCase();
  const isBreast = diagnosis.includes('breast');
  const isEarlyStage = stage.includes('1') || stage.includes('2') || stage.includes('3') || stage.startsWith('I') || stage.startsWith('II') || stage.startsWith('III');
  const isAdvancedOrMetastatic = stage.startsWith('IV') || diagnosis.includes('metastatic');

  if (!isBreast) return 'Partial';

  const treatment = treatmentId.toUpperCase();

  if (sourceId === 'ATAC_ANASTROZOLE_LANCET_ONCOL') {
    if (treatment === 'ANASTROZOLE' && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'BIG198_LETROZOLE_NEJM') {
    if (treatment === 'LETROZOLE' && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM') {
    if (treatment === 'LETROZOLE + PALBOCICLIB' && isAdvancedOrMetastatic) return 'Moderate';
    if (treatment === 'LETROZOLE + PALBOCICLIB') return 'Partial';
    return 'Partial';
  }

  if (sourceId === 'EBCTCG_TAMOXIFEN_LANCET') {
    if (treatment === 'TAMOXIFEN' && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'SOFT_OVARIAN_SUPPRESSION_NEJM') {
    if (treatment === 'LEUPROLIDE' && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'CREATEX_CAPECITABINE_NEJM') {
    if (treatment === 'CAPECITABINE' && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET') {
    if ((treatment === 'PACLITAXEL' || treatment === 'CYCLOPHOSPHAMIDE + DOXORUBICIN') && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'EBCTCG_POLYCHEMO_REGIMENS_LANCET') {
    if ((treatment === 'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE' || treatment === 'CYCLOPHOSPHAMIDE + DOXORUBICIN') && isEarlyStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM') {
    if (treatment === 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB') return 'Moderate';
    return 'Partial';
  }

  return 'Partial';
}