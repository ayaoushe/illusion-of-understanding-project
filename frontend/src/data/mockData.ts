
import type {
  Patient,
  AiEvidenceSynthesis,
  PublishedCohort,
  WorkflowStep,
  RiskFlag,
} from '../types';
import { STUDY_NAMES, mrnFromId } from '../config/studyCases';

//Workflowsteps
export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'overview', label: 'Patient Overview', shortLabel: 'Overview', number: 1 },
  { id: 'assessment', label: 'Human Initial Assessment', shortLabel: 'Assessment', number: 2 },
  { id: 'evidence', label: 'AI Evidence Synthesis', shortLabel: 'Evidence', number: 3 },
  { id: 'treatment', label: 'Treatment Comparison', shortLabel: 'Treatment', number: 4 },
  { id: 'similar', label: 'Similar Cases', shortLabel: 'Cases', number: 5 },
  { id: 'reflection', label: 'Final Reflection', shortLabel: 'Reflection', number: 6 },
];


/**
 * Treatment options for the assessment dropdowns.
 *
 * Die `id` ist exakt der Regime-String des ML-Modells (aus 'classes' in model_meta.json bzw. die Keys von 'probabilities' in
 * study_cases)
 * Diese Liste dient als Label-Katalog und als Fallback-Reihenfolge, solange kein Fall geladen ist
 * die tatsächliche Reihenfolge im Dropdown kommt aus den Fall-Wahrscheinlichkeiten.
 */
export const assessmentTreatmentOptions = [
  { id: 'ANASTROZOLE', label: 'Anastrozole', category: 'Endocrine — aromatase inhibitor' },
  { id: 'LETROZOLE', label: 'Letrozole', category: 'Endocrine — aromatase inhibitor' },
  { id: 'LETROZOLE + PALBOCICLIB', label: 'Letrozole + Palbociclib', category: 'Endocrine + CDK4/6 inhibitor' },
  { id: 'TAMOXIFEN', label: 'Tamoxifen', category: 'Endocrine — SERM' },
  { id: 'LEUPROLIDE', label: 'Leuprolide', category: 'Endocrine — GnRH agonist' },
  { id: 'CAPECITABINE', label: 'Capecitabine', category: 'Chemotherapy' },
  { id: 'PACLITAXEL', label: 'Paclitaxel', category: 'Chemotherapy' },
  { id: 'CYCLOPHOSPHAMIDE + DOXORUBICIN', label: 'Cyclophosphamide + Doxorubicin', category: 'Chemotherapy' },
  {
    id: 'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE',
    label: 'Cyclophosphamide + Fluorouracil + Methotrexate',
    category: 'Chemotherapy',
  },
  {
    id: 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB',
    label: 'Paclitaxel + Pertuzumab + Trastuzumab',
    category: 'Chemotherapy + HER2-targeted',
  },
] as const;

export function getAssessmentTreatmentLabel(id: string): string {
  const option = assessmentTreatmentOptions.find((o) => o.id === id);
  return option ? `${option.label} [${option.category}]` : id;
}

/**
 * Minimalprofil fuer Sidebar und Fallauswahl: Name und Aktenzeichen.
 *
 * Die frueheren statischen NSCLC-Profile (mockPatient, patientProfileOverrides)
 * sind entfernt. Sie wurden seit der Umstellung der Patient Overview auf
 * study_cases.json nirgends mehr angezeigt, enthielten aber Lungenkrebs-
 * Diagnosen unter den IDs der Brustkrebs-Studienfaelle. Alles Fallbezogene
 * kommt heute aus services/patientView.ts.
 */
export function getPatientProfile(patientId: string | null | undefined): Patient {
  const id = patientId ?? '';
  return {
    name: STUDY_NAMES[id] ?? 'No patient selected',
    mrn: id ? mrnFromId(id) : '—',
  };
}

//Risk Flags for the AI Evidence
export const mockRiskFlags = [
  {
    id: 'cardiac',
    title: 'Cardiotoxicity Risk',
    severity: 'moderate' as const,
    description: 'Anthracyclines (doxorubicin) and HER2-targeted agents (trastuzumab/pertuzumab) carry a risk of LVEF decline; baseline and on-treatment cardiac monitoring is required.',
    relatedTreatments: ['CYCLOPHOSPHAMIDE + DOXORUBICIN', 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB'],
  },
  {
    id: 'myelosuppression',
    title: 'Myelosuppression / Neutropenia Risk',
    severity: 'moderate' as const,
    description: 'Combination chemotherapy regimens carry meaningful neutropenia risk; growth-factor support and dose delays may be needed.',
    relatedTreatments: ['CYCLOPHOSPHAMIDE + DOXORUBICIN', 'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE', 'PACLITAXEL', 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB'],
  },
  {
    id: 'bone-health',
    title: 'Bone Density / Fracture Risk',
    severity: 'low' as const,
    description: 'Aromatase inhibitors and ovarian suppression accelerate bone loss; baseline DEXA and calcium/vitamin D or bisphosphonate planning should be considered.',
    relatedTreatments: ['ANASTROZOLE', 'LETROZOLE', 'LETROZOLE + PALBOCICLIB', 'LEUPROLIDE'],
  },
  {
    id: 'thromboembolic',
    title: 'Thromboembolic / Endometrial Risk',
    severity: 'moderate' as const,
    description: 'Tamoxifen is associated with increased risk of venous thromboembolism and endometrial changes; gynecologic monitoring is advised.',
    relatedTreatments: ['TAMOXIFEN'],
  },
  {
    id: 'hepatic-renal',
    title: 'Hepatic / Renal Function Concern',
    severity: 'moderate' as const,
    description: 'Capecitabine and combination chemotherapy require adequate hepatic and renal clearance; dose adjustments may be needed if function is impaired.',
    relatedTreatments: ['CAPECITABINE', 'CYCLOPHOSPHAMIDE + DOXORUBICIN'],
  },
  {
    id: 'neuropathy',
    title: 'Peripheral Neuropathy Risk',
    severity: 'low' as const,
    description: 'Taxane-based regimens (paclitaxel) carry a dose-dependent risk of peripheral neuropathy, which can affect quality of life and treatment adherence.',
    relatedTreatments: ['PACLITAXEL', 'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB'],
  },
];


// Function to create Evidence Profiles for every regime

function createTreatmentEvidenceProfile(params: {
  uncertaintyLevel: AiEvidenceSynthesis['uncertaintyLevel'];
  uncertaintySummary: string;
  uncertaintyDescription: string;
  evidenceFor: Array<{ text: string; source: string }>;
  evidenceAgainst: Array<{ text: string; source: string }>;
  missingData: string[];
  riskFlags: RiskFlag[];
  publishedCohorts: PublishedCohort[];
  sources: Array<{ title: string; year: number; type: string; url: string }>;
  reasoningFactors: Array<{ factor: string; weight: 'high' | 'medium' | 'low'; direction: 'supports' | 'cautions' | 'neutral' }>;
}): AiEvidenceSynthesis {
  return {
    title: 'AI Evidence Synthesis',
    disclaimer: 'Evidence-based synthesis of guidelines and literature. This is decision support — not a final recommendation. All outputs require clinician verification.',
    uncertaintyLevel: params.uncertaintyLevel,
    uncertaintySummary: params.uncertaintySummary,
    uncertaintyDescription: params.uncertaintyDescription,
    evidenceFor: params.evidenceFor,
    evidenceAgainst: params.evidenceAgainst,
    missingData: params.missingData,
    riskFlags: params.riskFlags,
    publishedCohorts: params.publishedCohorts,
    sources: params.sources,
    keyReasoningFactors: params.reasoningFactors,
  };
}

// Missing Data samples
const commonMissingData = [
  'Baseline LVEF / echocardiogram not yet documented',
  'Menopausal status not formally confirmed',
  'Baseline bone density (DEXA) not assessed',
  'Germline BRCA1/2 testing not yet performed',
];

/**
 * Evidence synthesis per treatment regime.
 *
 * Die Keys entsprechen exakt den Regime-Strings des ML-Modells (siehe `classes` in
 * model_meta.json und `assessmentTreatmentOptions` oben) — nicht generischen Wirkstoff-IDs.
 */
export const mockTreatmentEvidenceById: Record<string, AiEvidenceSynthesis> = {
  ANASTROZOLE: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Anastrozole is well supported for postmenopausal, HR-positive early breast cancer, but menopausal status and bone health are unconfirmed.',
    uncertaintyDescription: 'The ATAC trial provides strong long-term evidence for anastrozole over tamoxifen in postmenopausal HR-positive disease, but confirmation of menopausal status and baseline bone density would improve confidence.',
    evidenceFor: [
      { text: 'HR-positive status supports adjuvant aromatase inhibitor therapy over observation alone.', source: 'ATAC_ANASTROZOLE_LANCET_ONCOL' },
      { text: 'Anastrozole showed superior long-term efficacy and a more favorable safety profile than tamoxifen in postmenopausal HR-positive early breast cancer.', source: 'ATAC_ANASTROZOLE_LANCET_ONCOL' },
      { text: 'Oral outpatient therapy aligns with a preference for minimal hospital visits.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'Menopausal status has not been formally confirmed — required to appropriately select an aromatase inhibitor.', source: 'Missing data' },
      { text: 'Baseline bone density is unknown.', source: 'Missing data' },
      { text: 'Aromatase inhibitors accelerate bone loss and increase fracture risk, which guidelines recommend assessing before treatment.', source: 'ASCO_BONE_HEALTH_JCO' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[2]],
    publishedCohorts: [
      { cohortName: 'ATAC: Anastrozole vs tamoxifen in postmenopausal early breast cancer', population: 'Postmenopausal women with HR-positive early-stage breast cancer', similarityLevel: 'Moderate', matchingFactors: ['HR-positive disease', 'Early-stage', 'Adjuvant endocrine setting'], limitationFactors: ['Requires confirmed postmenopausal status', 'Long follow-up trial population may differ demographically'], implication: 'Strong support for anastrozole if postmenopausal status is confirmed.', sourceLabel: 'ATAC_ANASTROZOLE_LANCET_ONCOL', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HR-positive status', weight: 'high', direction: 'supports' },
      { factor: 'Menopausal status unconfirmed', weight: 'medium', direction: 'cautions' },
      { factor: 'Bone health', weight: 'low', direction: 'cautions' },
    ],
  }),

  LETROZOLE: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Letrozole is a well-evidenced first-line aromatase inhibitor for HR-positive disease, with efficacy comparable to or better than tamoxifen.',
    uncertaintyDescription: 'BIG 1-98 supports letrozole as at least as effective as tamoxifen in postmenopausal HR-positive breast cancer, though menopausal confirmation and bone-health baseline remain outstanding.',
    evidenceFor: [
      { text: 'Letrozole demonstrated improved disease-free survival compared with tamoxifen in postmenopausal HR-positive early breast cancer.', source: 'BIG198_LETROZOLE_NEJM' },
      { text: 'HR-positive status supports an aromatase-inhibitor-based approach.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'Menopausal status has not been formally confirmed.', source: 'Missing data' },
      { text: 'Baseline bone density is unknown.', source: 'Missing data' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[2]],
    publishedCohorts: [
      { cohortName: 'BIG 1-98: Letrozole vs tamoxifen as initial adjuvant therapy', population: 'Postmenopausal women with endocrine-responsive early breast cancer', similarityLevel: 'Moderate', matchingFactors: ['HR-positive disease', 'Early-stage', 'Adjuvant endocrine setting'], limitationFactors: ['Requires confirmed postmenopausal status'], implication: 'Supports letrozole as an effective first-line endocrine option.', sourceLabel: 'BIG198_LETROZOLE_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HR-positive status', weight: 'high', direction: 'supports' },
      { factor: 'Menopausal status unconfirmed', weight: 'medium', direction: 'cautions' },
    ],
  }),

  'LETROZOLE + PALBOCICLIB': createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Adding palbociclib to letrozole meaningfully extends progression-free survival in HR-positive/HER2-negative disease, but this benefit is best established in the advanced/metastatic setting.',
    uncertaintyDescription: 'PALOMA-2 strongly supports this combination for HR-positive, HER2-negative advanced disease; applicability to earlier-stage disease and hematologic monitoring needs remain considerations.',
    evidenceFor: [
      { text: 'Palbociclib plus letrozole significantly prolonged progression-free survival compared with letrozole alone in HR-positive, HER2-negative advanced breast cancer.', source: 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM' },
      { text: 'HR-positive, HER2-negative status matches the population shown to benefit from CDK4/6 inhibitor combination therapy.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'The trial supporting this combination enrolled patients with advanced/metastatic disease, so applicability to earlier-stage disease is less direct.', source: 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM' },
      { text: 'Neutropenia was the most common toxicity with palbociclib and requires regular blood count monitoring.', source: 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[1], mockRiskFlags[2]],
    publishedCohorts: [
      { cohortName: 'PALOMA-2: Palbociclib plus letrozole as first-line therapy', population: 'HR-positive, HER2-negative advanced breast cancer, no prior systemic therapy for advanced disease', similarityLevel: 'Moderate', matchingFactors: ['HR-positive', 'HER2-negative', 'Endocrine-based combination'], limitationFactors: ['Advanced/metastatic trial population', 'Higher hematologic toxicity than endocrine monotherapy'], implication: 'Supports combination therapy when disease extent and monitoring capacity allow.', sourceLabel: 'PALOMA2_LETROZOLE_PALBOCICLIB_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HR-positive / HER2-negative status', weight: 'high', direction: 'supports' },
      { factor: 'Hematologic monitoring burden', weight: 'medium', direction: 'cautions' },
    ],
  }),

  TAMOXIFEN: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'low',
    uncertaintySummary: 'Tamoxifen has decades of patient-level meta-analytic support for HR-positive breast cancer regardless of menopausal status, making it a reliable option here.',
    uncertaintyDescription: 'The evidence base for tamoxifen in HR-positive disease is exceptionally mature; the main open questions relate to thromboembolic and endometrial monitoring rather than efficacy.',
    evidenceFor: [
      { text: 'Five years of adjuvant tamoxifen substantially reduces recurrence and mortality in HR-positive early breast cancer, regardless of menopausal status.', source: 'EBCTCG_TAMOXIFEN_LANCET' },
      { text: 'Tamoxifen does not require confirmed menopausal status, which suits this case while that workup is pending.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'Tamoxifen carries a higher risk of venous thromboembolism and endometrial changes than aromatase inhibitors, warranting gynecologic monitoring.', source: 'ATAC_ANASTROZOLE_LANCET_ONCOL' },
      { text: 'Baseline bone density and cardiac workup are still pending.', source: 'Missing data' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[3]],
    publishedCohorts: [
      { cohortName: 'EBCTCG: Adjuvant tamoxifen patient-level meta-analysis', population: 'HR-positive early breast cancer across 20 randomised trials of about 5 years of tamoxifen', similarityLevel: 'High', matchingFactors: ['HR-positive disease', 'Early-stage', 'Adjuvant endocrine setting'], limitationFactors: ['Meta-analytic aggregate, not individually matched', 'Menopausal status not required but affects concurrent agent choice'], implication: 'Strong, broadly applicable support for tamoxifen in this HR-positive case.', sourceLabel: 'EBCTCG_TAMOXIFEN_LANCET', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HR-positive status', weight: 'high', direction: 'supports' },
      { factor: 'Menopausal status not required for eligibility', weight: 'medium', direction: 'supports' },
      { factor: 'Thromboembolic / endometrial risk', weight: 'medium', direction: 'cautions' },
    ],
  }),

  LEUPROLIDE: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Ovarian suppression with leuprolide adds benefit mainly in premenopausal, higher-risk HR-positive disease, most clearly when paired with an aromatase inhibitor or tamoxifen.',
    uncertaintyDescription: 'The SOFT trial supports ovarian suppression in premenopausal HR-positive breast cancer, particularly in younger patients or those who remain premenopausal after chemotherapy; confirmation of menopausal status and prior chemotherapy exposure would sharpen this recommendation.',
    evidenceFor: [
      { text: 'Adding ovarian function suppression to endocrine therapy reduced disease recurrence in premenopausal HR-positive early breast cancer.', source: 'SOFT_OVARIAN_SUPPRESSION_NEJM' },
      { text: 'Absolute benefit was largest in younger women and those remaining premenopausal after chemotherapy.', source: 'SOFT_OVARIAN_SUPPRESSION_NEJM' },
    ],
    evidenceAgainst: [
      { text: 'Menopausal status has not been formally confirmed, which affects whether ovarian suppression adds meaningful benefit.', source: 'Missing data' },
      { text: 'Adding ovarian suppression was associated with a higher frequency of menopausal-type side effects than endocrine therapy alone.', source: 'SOFT_OVARIAN_SUPPRESSION_NEJM' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[2]],
    publishedCohorts: [
      { cohortName: 'SOFT: Ovarian suppression added to endocrine therapy', population: 'Premenopausal women with HR-positive early breast cancer', similarityLevel: 'Moderate', matchingFactors: ['HR-positive disease', 'Early-stage', 'Candidate for ovarian suppression'], limitationFactors: ['Requires confirmed premenopausal status', 'Benefit varies by age and chemotherapy history'], implication: 'Reasonable if the patient is confirmed premenopausal and at meaningful recurrence risk.', sourceLabel: 'SOFT_OVARIAN_SUPPRESSION_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HR-positive status', weight: 'high', direction: 'supports' },
      { factor: 'Menopausal status unconfirmed', weight: 'high', direction: 'cautions' },
    ],
  }),

  CAPECITABINE: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Capecitabine has the clearest evidence base as an escalation strategy for HER2-negative disease with residual tumor after neoadjuvant chemotherapy.',
    uncertaintyDescription: 'CREATE-X establishes a survival benefit for capecitabine specifically in HER2-negative patients with residual invasive disease after neoadjuvant chemotherapy; applicability outside that setting is less direct.',
    evidenceFor: [
      { text: 'Adjuvant capecitabine improved disease-free and overall survival in HER2-negative breast cancer with residual disease after neoadjuvant chemotherapy.', source: 'CREATEX_CAPECITABINE_NEJM' },
      { text: 'Oral outpatient dosing suits a preference for minimal hospital visits.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'The trial establishing this survival benefit specifically enrolled patients with residual disease after neoadjuvant chemotherapy, so applicability may be narrower outside that context.', source: 'CREATEX_CAPECITABINE_NEJM' },
      { text: 'Hepatic and renal function have not been fully characterized, which affects capecitabine dosing.', source: 'Missing data' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[4]],
    publishedCohorts: [
      { cohortName: 'CREATE-X: Adjuvant capecitabine after preoperative chemotherapy', population: 'HER2-negative breast cancer with residual invasive disease after neoadjuvant chemotherapy', similarityLevel: 'Partial', matchingFactors: ['HER2-negative disease', 'Chemotherapy-eligible'], limitationFactors: ['Trial specifically enrolled patients with residual disease post-neoadjuvant therapy'], implication: 'Most compelling if used as escalation after incomplete response to standard chemotherapy.', sourceLabel: 'CREATEX_CAPECITABINE_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HER2-negative status', weight: 'high', direction: 'supports' },
      { factor: 'Hepatic/renal function unconfirmed', weight: 'medium', direction: 'cautions' },
    ],
  }),

  PACLITAXEL: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Taxane-based chemotherapy is well supported for early-stage breast cancer, with the main open questions relating to neuropathy risk and cardiac baseline.',
    uncertaintyDescription: 'Large patient-level meta-analyses support taxane-containing regimens for reducing recurrence in early breast cancer; neuropathy risk and incomplete cardiac workup temper confidence.',
    evidenceFor: [
      { text: 'Taxane-containing chemotherapy regimens reduced recurrence compared with regimens omitting taxanes in early-stage operable breast cancer.', source: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET' },
      { text: 'Disease stage and nodal status support systemic chemotherapy.', source: 'Clinical data' },
    ],
    evidenceAgainst: [
      { text: 'Taxane-containing regimens carry a dose-dependent risk of peripheral neuropathy, which can affect quality of life and treatment adherence.', source: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET' },
      { text: 'Baseline cardiac workup is incomplete.', source: 'Missing data' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[1], mockRiskFlags[5]],
    publishedCohorts: [
      { cohortName: 'EBCTCG: Taxane-containing chemotherapy in early breast cancer', population: 'Patients with early-stage operable breast cancer across 86 randomised trials', similarityLevel: 'Moderate', matchingFactors: ['Early-stage disease', 'Chemotherapy-eligible'], limitationFactors: ['Aggregate trial population, not individually matched', 'Neuropathy risk not captured in efficacy endpoints'], implication: 'Supports taxane-based chemotherapy with neuropathy monitoring.', sourceLabel: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Stage / nodal involvement', weight: 'high', direction: 'supports' },
      { factor: 'Neuropathy risk', weight: 'medium', direction: 'cautions' },
    ],
  }),

  'CYCLOPHOSPHAMIDE + DOXORUBICIN': createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Anthracycline-based combination chemotherapy has strong outcome data for node-positive early breast cancer, but cardiotoxicity risk requires a documented baseline LVEF.',
    uncertaintyDescription: 'Patient-level meta-analyses consistently show anthracycline-based regimens reduce recurrence and mortality versus non-anthracycline or no chemotherapy; the main caution is unconfirmed cardiac baseline before starting doxorubicin.',
    evidenceFor: [
      { text: 'Anthracycline-based chemotherapy substantially reduced breast cancer recurrence and mortality compared with regimens without anthracyclines.', source: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET' },
      { text: 'Cyclophosphamide plus an anthracycline is one of the best-studied adjuvant regimens for node-positive early breast cancer.', source: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET' },
      { text: 'Nodal involvement and disease stage support a standard anthracycline-based approach.', source: 'Clinical data' },
    ],
    evidenceAgainst: [
      { text: 'Baseline LVEF has not been documented.', source: 'Missing data' },
      { text: 'Anthracyclines carry a recognized cardiotoxicity risk; guidelines recommend baseline LVEF assessment before starting therapy.', source: 'ESC_CARDIOONCOLOGY_JACC' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[0], mockRiskFlags[1], mockRiskFlags[4]],
    publishedCohorts: [
      { cohortName: 'EBCTCG: Anthracycline-based chemotherapy in early breast cancer', population: 'Node-positive and node-negative early breast cancer across 86 randomised trials', similarityLevel: 'Moderate', matchingFactors: ['Node-positive disease', 'Early-stage', 'Chemotherapy-eligible'], limitationFactors: ['Aggregate trial population, not individually matched', 'Cardiac fitness at baseline not accounted for'], implication: 'Strong support for this regimen once baseline cardiac function is confirmed adequate.', sourceLabel: 'EBCTCG_ANTHRACYCLINE_TAXANE_LANCET', sourceUrl: '' },
      { cohortName: 'EBCTCG: Polychemotherapy regimen comparisons', population: 'Early breast cancer patients across 123 randomised trials comparing chemotherapy regimens', similarityLevel: 'Moderate', matchingFactors: ['Node-positive disease', 'Anthracycline-based regimen'], limitationFactors: ['Aggregate trial population, not individually matched'], implication: 'Confirms anthracycline-based regimens outperform CMF for higher-risk disease.', sourceLabel: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Nodal involvement', weight: 'high', direction: 'supports' },
      { factor: 'Baseline cardiac workup', weight: 'high', direction: 'cautions' },
      { factor: 'Myelosuppression risk', weight: 'medium', direction: 'cautions' },
    ],
  }),

  'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE': createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Classic CMF chemotherapy remains a reasonable non-anthracycline option, though modern anthracycline/taxane-based regimens generally show superior outcomes.',
    uncertaintyDescription: 'Large meta-analyses show CMF reduces recurrence versus no chemotherapy, but anthracycline-based regimens are generally more effective — CMF is most relevant when anthracyclines are contraindicated (e.g., unconfirmed or reduced cardiac function).',
    evidenceFor: [
      { text: 'CMF chemotherapy reduces recurrence and mortality compared with no adjuvant chemotherapy in early breast cancer.', source: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET' },
      { text: 'Anthracyclines carry a recognized cardiotoxicity risk and guidelines recommend baseline LVEF assessment before starting one, which is not yet available for this case.', source: 'ESC_CARDIOONCOLOGY_JACC' },
    ],
    evidenceAgainst: [
      { text: 'Anthracycline-based regimens showed superior outcomes to CMF in the same meta-analysis.', source: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET' },
      { text: 'Methotrexate component requires adequate renal function.', source: 'Missing data' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[1]],
    publishedCohorts: [
      { cohortName: 'EBCTCG: CMF vs anthracycline-based regimens', population: 'Early breast cancer patients across 123 randomised trials comparing chemotherapy regimens', similarityLevel: 'Partial', matchingFactors: ['Chemotherapy-eligible', 'Early-stage disease'], limitationFactors: ['CMF shown to be less effective than anthracycline-based regimens in the same analysis'], implication: 'Reasonable fallback if anthracyclines are not appropriate.', sourceLabel: 'EBCTCG_POLYCHEMO_REGIMENS_LANCET', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Non-anthracycline option', weight: 'medium', direction: 'supports' },
      { factor: 'Lower efficacy than anthracycline-based regimens', weight: 'medium', direction: 'cautions' },
    ],
  }),

  'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB': createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Dual HER2 blockade with pertuzumab and trastuzumab plus a taxane is strongly supported for HER2-positive disease, though baseline cardiac function must be confirmed first.',
    uncertaintyDescription: 'CLEOPATRA established a substantial survival benefit for adding pertuzumab to trastuzumab and taxane chemotherapy in HER2-positive disease; the regimen requires confirmed baseline and on-treatment cardiac monitoring given trastuzumab-related cardiotoxicity risk.',
    evidenceFor: [
      { text: 'Adding pertuzumab to trastuzumab and taxane chemotherapy significantly improved progression-free and overall survival in HER2-positive breast cancer.', source: 'CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM' },
      { text: 'HER2-positive status directly matches the population shown to benefit from dual HER2 blockade.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'Baseline LVEF has not been documented.', source: 'Missing data' },
      { text: 'HER2-targeted therapy (trastuzumab/pertuzumab) carries a recognized cardiotoxicity risk; guidelines recommend baseline and every-3-month LVEF monitoring.', source: 'ESC_CARDIOONCOLOGY_JACC' },
      { text: 'The trial combining pertuzumab, trastuzumab and taxane chemotherapy reported meaningful rates of neutropenia and diarrhea requiring monitoring.', source: 'CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM' },
    ],
    missingData: commonMissingData,
    riskFlags: [mockRiskFlags[0], mockRiskFlags[1], mockRiskFlags[5]],
    publishedCohorts: [
      { cohortName: 'CLEOPATRA: Pertuzumab, trastuzumab and taxane chemotherapy', population: 'HER2-positive breast cancer treated with pertuzumab, trastuzumab, and taxane chemotherapy', similarityLevel: 'Moderate', matchingFactors: ['HER2-positive disease', 'Chemotherapy-eligible'], limitationFactors: ['Original trial population was metastatic; here applied in an earlier-stage context', 'Requires confirmed baseline cardiac function'], implication: 'Strong support for dual HER2 blockade once cardiac clearance is confirmed.', sourceLabel: 'CLEOPATRA_PERTUZUMAB_TRASTUZUMAB_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'HER2-positive status', weight: 'high', direction: 'supports' },
      { factor: 'Baseline cardiac workup', weight: 'high', direction: 'cautions' },
    ],
  }),
};




// Mock Similar Case, used if Similar Cases wont load