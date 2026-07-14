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
  FLAURA_OSIMERTINIB_NEJM: {
    id: 'FLAURA_OSIMERTINIB_NEJM',
    title: 'Overall Survival with Osimertinib in Untreated, EGFR-Mutated Advanced NSCLC',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1913662',
    useFor: [
      'Osimertinib',
      'first-line EGFR TKI',
      'EGFR-mutated advanced NSCLC',
      'EGFR Exon 19 deletion',
      'EGFR L858R',
    ],
  },

  FLAURA_FIRSTLINE_OSIMERTINIB_NEJM: {
    id: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM',
    title: 'Osimertinib in Untreated EGFR-Mutated Advanced Non–Small-Cell Lung Cancer',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1713137',
    useFor: [
      'Osimertinib',
      'first-line EGFR-mutated NSCLC',
      'progression-free survival',
      'comparison with gefitinib or erlotinib',
    ],
  },

  EURTAC_ERLOTINIB_LANCET: {
    id: 'EURTAC_ERLOTINIB_LANCET',
    title: 'Erlotinib versus standard chemotherapy as first-line treatment for European patients with advanced EGFR mutation-positive NSCLC',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(11)70393-X/fulltext',
    useFor: [
      'Erlotinib',
      'first-line EGFR TKI',
      'EGFR mutation-positive NSCLC',
      'advanced NSCLC',
    ],
  },

  IPASS_GEFITINIB_NEJM: {
    id: 'IPASS_GEFITINIB_NEJM',
    title: 'Gefitinib or Carboplatin–Paclitaxel in Pulmonary Adenocarcinoma',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa0810699',
    useFor: [
      'Gefitinib',
      'first-line EGFR TKI',
      'pulmonary adenocarcinoma',
      'EGFR mutation-positive NSCLC',
      'older first-generation EGFR TKI evidence',
    ],
  },

  GEFITINIB_EGFR_MUTATION_NEJM: {
    id: 'GEFITINIB_EGFR_MUTATION_NEJM',
    title: 'Gefitinib or Chemotherapy for Non–Small-Cell Lung Cancer with Mutated EGFR',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa0909530',
    useFor: [
      'Gefitinib',
      'EGFR-mutated NSCLC',
      'first-line targeted therapy',
      'comparison with chemotherapy',
    ],
  },

  AFATINIB_LUX_LUNG_REVIEW_PMC: {
    id: 'AFATINIB_LUX_LUNG_REVIEW_PMC',
    title: 'Afatinib for the treatment of EGFR mutation-positive NSCLC',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC7448811/',
    useFor: [
      'Afatinib',
      'EGFR mutation-positive NSCLC',
      'EGFR del19',
      'LUX-Lung 3',
      'LUX-Lung 6',
      'second-line or alternative EGFR TKI context',
    ],
  },

  AFATINIB_LUX_LUNG_7_PMC: {
    id: 'AFATINIB_LUX_LUNG_7_PMC',
    title: 'Afatinib in lung cancer harboring EGFR mutation in the LUX-Lung trials',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5009085/',
    useFor: [
      'Afatinib',
      'comparison with gefitinib',
      'EGFR mutation-positive NSCLC',
      'LUX-Lung 7',
    ],
  },

  PEMETREXED_NSCLC_REVIEW_PMC: {
    id: 'PEMETREXED_NSCLC_REVIEW_PMC',
    title: 'Role of pemetrexed in advanced non-small-cell lung cancer',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3267597/',
    useFor: [
      'Pemetrexed',
      'advanced nonsquamous NSCLC',
      'chemotherapy',
      'carboplatin plus pemetrexed context',
    ],
  },

  CARBOPLATIN_PEMETREXED_EVIQ: {
    id: 'CARBOPLATIN_PEMETREXED_EVIQ',
    title: 'NSCLC locally advanced or metastatic carboplatin and pemetrexed protocol',
    type: 'Guideline / protocol',
    urlType: 'Publisher full text',
    url: 'https://www.eviq.org.au/medical-oncology/respiratory/non-small-cell-lung-cancer-advanced-metastatic/1261-nsclc-locally-advanced-or-metastatic-carbopla',
    useFor: [
      'Carboplatin + Pemetrexed',
      'advanced nonsquamous NSCLC',
      'chemotherapy protocol',
      'monitoring and toxicity context',
    ],
  },

  KEYNOTE_189_PEMBROLIZUMAB_PMC: {
    id: 'KEYNOTE_189_PEMBROLIZUMAB_PMC',
    title: 'Pembrolizumab Plus Pemetrexed and Platinum in Nonsquamous NSCLC: 5-Year Outcomes From KEYNOTE-189',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10082311/',
    useFor: [
      'Pembrolizumab',
      'pembrolizumab plus pemetrexed and platinum',
      'metastatic nonsquamous NSCLC',
      'immunotherapy',
    ],
  },

  KEYNOTE_189_PDF: {
    id: 'KEYNOTE_189_PDF',
    title: 'Pembrolizumab Plus Pemetrexed and Platinum in Nonsquamous NSCLC: 5-Year Outcomes PDF',
    type: 'PDF',
    urlType: 'PDF',
    url: 'https://scientiasalut.gencat.cat/bitstream/handle/11351/9808/pembrolizumab_plus_pemetrexed_platinum_nonsquamous_non_small_cell_lung_cancer_5_year_outcomes_phase_3_keynote_189_study_2023.pdf?isAllowed=y&sequence=1',
    useFor: [
      'Pembrolizumab',
      'KEYNOTE-189',
      'metastatic nonsquamous NSCLC',
      'PDF source',
    ],
  },

  PACIFIC_DURVALUMAB_PMC: {
    id: 'PACIFIC_DURVALUMAB_PMC',
    title: 'Five-Year Survival Outcomes From the PACIFIC Trial',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9015199/',
    useFor: [
      'Durvalumab',
      'chemoradiotherapy',
      'unresectable stage III NSCLC',
      'PACIFIC trial',
      'published cohort',
    ],
  },

  OLIGOMETASTATIC_LCT_PMC: {
    id: 'OLIGOMETASTATIC_LCT_PMC',
    title: 'Local consolidative therapy in metastatic non-small cell lung cancer',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6783748/',
    useFor: [
      'oligometastatic NSCLC',
      'local consolidative therapy',
      'selected stage IV NSCLC',
      'published cohort',
    ],
  },

  CHECKMATE_816_PMC: {
    id: 'CHECKMATE_816_PMC',
    title: 'Neoadjuvant Nivolumab plus Chemotherapy in Resectable Lung Cancer',
    type: 'PMC full text',
    urlType: 'PMC full text',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9844511/',
    useFor: [
      'neoadjuvant chemo-immunotherapy',
      'resectable NSCLC',
      'nivolumab plus chemotherapy',
      'published cohort',
    ],
  },

  EARLY_PALLIATIVE_CARE_NSCLC_PDF: {
    id: 'EARLY_PALLIATIVE_CARE_NSCLC_PDF',
    title: 'Early Palliative Care for Patients with Metastatic Non–Small-Cell Lung Cancer',
    type: 'PDF',
    urlType: 'PDF',
    url: 'https://www.dgpalliativmedizin.de/images/stories/Temel_Early_Palliative_Care_NSCLC_NEJM2010.pdf',
    useFor: [
      'Palliative Care',
      'Best Supportive Care',
      'metastatic NSCLC',
      'quality of life',
      'early palliative care',
    ],
  },

  ASCO_PALLIATIVE_CARE_JCO: {
    id: 'ASCO_PALLIATIVE_CARE_JCO',
    title: 'Palliative Care for Patients With Cancer: ASCO Guideline Update',
    type: 'Publisher full text',
    urlType: 'Publisher full text',
    url: 'https://ascopubs.org/doi/10.1200/JCO.24.00542',
    useFor: [
      'Palliative Care',
      'Best Supportive Care',
      'cancer palliative care guideline',
      'early integration of palliative care',
    ],
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
export function getCohortSimilarityLevel(
  sourceId: string,
  treatmentId: string,
  patientDiagnosis: { stage: string; histology: string; primaryDiagnosis: string },
  molecular: { egfr: { status: string }; alk: { status: string }; pdl1: { level: string } },
): 'High' | 'Moderate' | 'Partial' {
  const entry = sourceRegistry[sourceId];
  if (!entry) return 'Partial';

  const diagnosis = patientDiagnosis.primaryDiagnosis.toLowerCase();
  const stage = patientDiagnosis.stage.toUpperCase();
  const isNSCLC = diagnosis.includes('nsclc') || diagnosis.includes('lung');
  const isEGFRPositive = molecular.egfr.status === 'Positive';
  const isAdvancedStage = stage.startsWith('IV') || stage === 'IIIB' || stage === 'IIIA';

  if (!isNSCLC) return 'Partial';

  if (sourceId === 'FLAURA_OSIMERTINIB_NEJM' || sourceId === 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM') {
    if (isEGFRPositive && treatmentId === 'osimertinib' && isAdvancedStage) return 'Moderate';
    if (isEGFRPositive && treatmentId === 'osimertinib') return 'Partial';
    return 'Partial';
  }

  if (sourceId === 'EURTAC_ERLOTINIB_LANCET') {
    if (isEGFRPositive && treatmentId === 'erlotinib' && isAdvancedStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'IPASS_GEFITINIB_NEJM' || sourceId === 'GEFITINIB_EGFR_MUTATION_NEJM') {
    if (isEGFRPositive && treatmentId === 'gefitinib' && isAdvancedStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'AFATINIB_LUX_LUNG_REVIEW_PMC' || sourceId === 'AFATINIB_LUX_LUNG_7_PMC') {
    if (isEGFRPositive && treatmentId === 'afatinib' && isAdvancedStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'PACIFIC_DURVALUMAB_PMC') {
    if (stage.startsWith('III') && treatmentId === 'chemoradiation') return 'Moderate';
    if (stage.startsWith('III')) return 'Partial';
    return 'Partial';
  }

  if (sourceId === 'OLIGOMETASTATIC_LCT_PMC') {
    if (stage.startsWith('IV')) return 'Partial';
    return 'Partial';
  }

  if (sourceId === 'CHECKMATE_816_PMC') {
    if (treatmentId === 'neoadjuvant') return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'KEYNOTE_189_PEMBROLIZUMAB_PMC' || sourceId === 'KEYNOTE_189_PDF') {
    if (treatmentId === 'pembrolizumab' && isAdvancedStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'PEMETREXED_NSCLC_REVIEW_PMC' || sourceId === 'CARBOPLATIN_PEMETREXED_EVIQ') {
    if (treatmentId === 'carboplatin-pemetrexed' && isAdvancedStage) return 'Moderate';
    return 'Partial';
  }

  if (sourceId === 'EARLY_PALLIATIVE_CARE_NSCLC_PDF' || sourceId === 'ASCO_PALLIATIVE_CARE_JCO') {
    if (treatmentId === 'palliative') return 'Moderate';
    return 'Partial';
  }

  return 'Partial';
}
