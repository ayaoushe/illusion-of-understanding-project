import type {
  Patient,
  AiEvidenceSynthesis,
  PublishedCohort,
  TreatmentOption,
  SimilarCase,
  DecisionChangeFactor,
  DecisionFactor,
  WorkflowStep,
  RiskFlag,
} from '../types';
import { mrnFromId } from '../config/studyCases';

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'overview', label: 'Patient Overview', shortLabel: 'Overview', number: 1 },
  { id: 'assessment', label: 'Human Initial Assessment', shortLabel: 'Assessment', number: 2 },
  { id: 'evidence', label: 'AI Evidence Synthesis', shortLabel: 'Evidence', number: 3 },
  { id: 'treatment', label: 'Treatment Comparison', shortLabel: 'Treatment', number: 4 },
  { id: 'similar', label: 'Similar Cases', shortLabel: 'Cases', number: 5 },
  { id: 'reflection', label: 'Final Reflection', shortLabel: 'Reflection', number: 6 },
];

export const TREATMENT_OPTION_IDS = ['osimertinib', 'chemoradiation', 'neoadjuvant'] as const;

/** Treatment options for the human assessment dropdown */
export const assessmentTreatmentOptions = [
  { id: 'osimertinib', label: 'Osimertinib (Tagrisso)', category: '1st-line EGFR TKI' },
  { id: 'erlotinib', label: 'Erlotinib (Tarceva)', category: '1st-line EGFR TKI' },
  { id: 'gefitinib', label: 'Gefitinib (Iressa)', category: '1st-line EGFR TKI' },
  { id: 'afatinib', label: 'Afatinib (Gilotrif)', category: '2nd-line EGFR TKI' },
  { id: 'carboplatin-pemetrexed', label: 'Carboplatin + Pemetrexed', category: 'Chemotherapy' },
  { id: 'pembrolizumab', label: 'Pembrolizumab (Keytruda)', category: 'Immunotherapy' },
  { id: 'palliative', label: 'Palliative Care / Best Supportive Care', category: 'Palliative' },
] as const;

export function getAssessmentTreatmentLabel(id: string): string {
  const option = assessmentTreatmentOptions.find((o) => o.id === id);
  return option ? `${option.label} [${option.category}]` : id;
}

export const mockPatient: Patient = {
  name: 'Max Mustermann',
  mrn: '4821-7734',
  dateOfBirth: '1958-03-14',
  age: 66,
  gender: 'Male',
  priority: 'HIGH',

  diagnosis: {
    primaryDiagnosis: 'Non-Small Cell Lung Cancer (NSCLC)',
    stage: 'IIIB',
    histology: 'Adenocarcinoma',
    location: 'Right Upper Lobe (RUL)',
    icd10: 'C34.10',
    diagnosisDate: '2024-09-03',
  },

  performance: {
    ecog: 1,
    ecogDescription: 'Restricted activity, in bed <50% of day',
    lastAssessed: '2025-04-12',
  },

  molecular: {
    egfr: { mutation: 'Exon 19 deletion', status: 'Positive' },
    alk: { status: 'Negative' },
    pdl1: { tps: '42%', level: 'Intermediate' },
    tmb: { value: 8, unit: 'mut/Mb', level: 'Intermediate' },
    kras: { status: 'Negative' },
  },

  imaging: [
    {
      type: 'PET-CT',
      date: '2025-04-28',
      findings: 'Primary: 4.2cm RUL mass. Mediastinal LN involvement (4R, 7). No distant mets.',
    },
    {
      type: 'Brain MRI',
      date: '2025-02-10',
      findings: 'No intracranial metastases detected.',
    },
    {
      type: 'CT Chest/Abd',
      date: '2024-09-15',
      findings: 'Baseline: 3.8cm RUL mass, ipsilateral hilar adenopathy.',
    },
  ],

  labs: {
    hemoglobin: { value: 11.8, unit: 'g/dL', status: 'LOW', normal: '12.0-16.0' },
    wbc: { value: 6.2, unit: 'K/uL', status: 'NORMAL', normal: '4.5-11.0' },
    platelets: { value: 185, unit: 'K/uL', status: 'NORMAL', normal: '150-400' },
    ldh: { value: 425, unit: 'U/L', status: 'ELEVATED', normal: '140-280' },
    creatinine: { value: 0.9, unit: 'mg/dL', status: 'NORMAL', normal: '0.7-1.3' },
    egfr: { value: 64, unit: 'mL/min', stage: 'G2', status: 'MILD_REDUCED' },
    albumin: { value: 3.8, unit: 'g/dL', status: 'NORMAL', normal: '3.5-5.0' },
    ast: { value: 28, unit: 'U/L', status: 'NORMAL', normal: '10-40' },
    alt: { value: 32, unit: 'U/L', status: 'NORMAL', normal: '7-56' },
    inflammation: { crp: { value: 8.2, unit: 'mg/L', status: 'ELEVATED', normal: '<3.0' } },
  },

  comorbidities: [
    {
      name: 'Type 2 Diabetes Mellitus',
      status: 'Controlled',
      hba1c: '7.2%',
      implications: 'Renal-sparing approach preferred; monitor glucose with steroids',
    },
    {
      name: 'Hypertension',
      status: 'Controlled',
      medication: 'Amlodipine 5mg',
      implications: 'Avoid treatments that significantly raise blood pressure',
    },
    {
      name: 'Former smoker',
      status: 'Quit 2018',
      packyears: 30,
      quityear: 2018,
      implications: 'High lung cancer risk history; pulmonary reserve consideration',
    },
    {
      name: 'Mild CKD',
      status: 'eGFR 64 mL/min (G2)',
      implications: 'Renal dose adjustment may apply for platinum agents',
    },
  ],

  medications: [
    { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', relevance: 'BP management; drug interaction screening' },
    { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', relevance: 'Monitor renal function with nephrotoxic agents' },
    { name: 'Omeprazole', dose: '20mg', frequency: 'Daily', relevance: 'May affect oral TKI absorption' },
    { name: 'Lorazepam', dose: '0.5mg', frequency: 'PRN anxiety', relevance: 'Anxiety history — QoL and adherence factor' },
  ],

  contraindications: [
    { factor: 'Cisplatin', severity: 'high', detail: 'eGFR 64 — platinum nephrotoxicity risk' },
    { factor: 'Aggressive multimodal therapy', severity: 'moderate', detail: 'Patient preference for minimal hospitalization' },
    { factor: 'Uncontrolled cardiac status', severity: 'moderate', detail: 'LVEF not yet documented — needed for some regimens' },
  ],

  qolConcerns: [
    'Anxiety management (uses PRN lorazepam)',
    'Prefers minimal hospital stays if possible',
    'Concerned about peripheral neuropathy risk',
    'Wishes to maintain independence at home',
  ],

  patientPreferences: {
    priorityQoL: 'Moderate — willing to tolerate side effects for effectiveness',
    hospitalPreference: 'Minimal overnight stays',
    familyInvolvement: 'Daughter involved in treatment decisions',
  },

  missingData: [
    'Surgical candidacy assessment pending thoracic surgery consultation',
    'Cardiac ejection fraction not yet obtained',
    'Detailed toxicity history from prior treatments (none documented)',
  ],

  session: {
    clinician: 'Dr. A. Petrov, MD — Oncology',
    date: '2026-06-18',
    time: '14:57',
    version: 'OncoCDSS v2.0',
  },
};

const patientProfileOverrides: Record<string, Partial<Patient>> = {
  'P-0001568': {
    name: 'Anna Seeler',
    mrn: mrnFromId('P-0001568'),
    age: 63,
    gender: 'Female',
    diagnosis: { primaryDiagnosis: 'Metastatic Breast Cancer', stage: 'IIA', histology: 'Ductal carcinoma', location: 'Right breast', icd10: 'C50.911', diagnosisDate: '2024-01-22' },
    performance: { ecog: 1, ecogDescription: 'Restricted activity, in bed <50% of day', lastAssessed: '2025-03-08' },
  },
  'P-0000081': {
    name: 'Bianca Stefen',
    mrn: mrnFromId('P-0000081'),
    age: 58,
    gender: 'Female',
    diagnosis: { primaryDiagnosis: 'Hormone-Receptor Positive Breast Cancer', stage: 'IIB', histology: 'Lobular carcinoma', location: 'Left breast', icd10: 'C50.812', diagnosisDate: '2023-11-10' },
    performance: { ecog: 0, ecogDescription: 'Fully active', lastAssessed: '2025-04-01' },
  },
  'P-0002566': {
    name: 'Clara Campista',
    mrn: mrnFromId('P-0002566'),
    age: 71,
    gender: 'Female',
    diagnosis: { primaryDiagnosis: 'Advanced Lung Adenocarcinoma', stage: 'IIIB', histology: 'Adenocarcinoma', location: 'Left upper lobe', icd10: 'C34.12', diagnosisDate: '2024-03-18' },
    performance: { ecog: 2, ecogDescription: 'Ambulatory and capable of self-care, but unable to work', lastAssessed: '2025-05-05' },
  },
  'P-0001862': {
    name: 'Diana Ernst',
    mrn: mrnFromId('P-0001862'),
    age: 67,
    gender: 'Female',
    diagnosis: { primaryDiagnosis: 'Oligometastatic NSCLC', stage: 'IVA', histology: 'Adenocarcinoma', location: 'Right lower lobe', icd10: 'C34.31', diagnosisDate: '2024-06-09' },
    performance: { ecog: 1, ecogDescription: 'Restricted activity, in bed <50% of day', lastAssessed: '2025-04-20' },
  },
};

export function getPatientProfile(patientId: string | null | undefined): Patient {
  if (!patientId) return mockPatient;
  const overrides = patientProfileOverrides[patientId];
  if (!overrides) return mockPatient;

  return {
    ...mockPatient,
    ...overrides,
    diagnosis: { ...mockPatient.diagnosis, ...(overrides.diagnosis ?? {}) },
    performance: { ...mockPatient.performance, ...(overrides.performance ?? {}) },
    molecular: {
      ...mockPatient.molecular,
      ...(overrides.molecular ?? {}),
      egfr: { ...mockPatient.molecular.egfr, ...((overrides.molecular?.egfr) ?? {}) },
      alk: { ...mockPatient.molecular.alk, ...((overrides.molecular?.alk) ?? {}) },
      pdl1: { ...mockPatient.molecular.pdl1, ...((overrides.molecular?.pdl1) ?? {}) },
      tmb: { ...mockPatient.molecular.tmb, ...((overrides.molecular?.tmb) ?? {}) },
      kras: { ...mockPatient.molecular.kras, ...((overrides.molecular?.kras) ?? {}) },
    },
  };
}

export const mockRiskFlags = [
  {
    id: 'renal',
    title: 'Renal Function Concern',
    severity: 'moderate' as const,
    description: 'eGFR 64 limits platinum-based chemotherapy; dose adjustments required',
    relatedTreatments: ['chemoradiation', 'neoadjuvant'],
  },
  {
    id: 'hypertension',
    title: 'Hypertension Risk',
    severity: 'moderate' as const,
    description: 'Durvalumab and some chemo agents may worsen blood pressure control',
    relatedTreatments: ['chemoradiation'],
  },
  {
    id: 'anemia',
    title: 'Baseline Anemia',
    severity: 'moderate' as const,
    description: 'Hgb 11.8 g/dL increases myelosuppression risk with intensive regimens',
    relatedTreatments: ['chemoradiation', 'neoadjuvant'],
  },
  {
    id: 'neuropathy',
    title: 'Neuropathy / QoL Risk',
    severity: 'low' as const,
    description: 'Patient explicitly concerned about peripheral neuropathy from platinum agents',
    relatedTreatments: ['neoadjuvant', 'chemoradiation'],
  },
  {
    id: 'frailty',
    title: 'ECOG & Frailty Consideration',
    severity: 'low' as const,
    description: 'ECOG 1 is favorable but age 66 with comorbidities warrants cautious escalation',
    relatedTreatments: ['neoadjuvant'],
  },
];

export const mockAiEvidence: AiEvidenceSynthesis = {
  title: 'AI Evidence Synthesis',
  disclaimer:
    'Evidence-based synthesis of guidelines and literature. This is decision support — not a final recommendation. All outputs require clinician verification.',
  uncertaintyLevel: 'moderate',
  uncertaintySummary: 'Strong molecular evidence supports TKI therapy, but surgical candidacy and cardiac function remain undetermined.',
  uncertaintyDescription:
    'Strong molecular evidence supports TKI therapy, but surgical candidacy and cardiac function remain undetermined. Patient similarity to published cohorts is moderate.',

  evidenceFor: [
    { text: 'EGFR Exon 19 deletion is a strong TKI-sensitizing mutation supported by first-line osimertinib trial data.', source: 'FLAURA_OSIMERTINIB_NEJM' },
    { text: 'First-line osimertinib improved progression-free survival versus gefitinib or erlotinib in EGFR-mutated advanced NSCLC.', source: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM' },
    { text: 'Outpatient TKI aligns with patient preference for minimal hospitalization', source: 'Patient context' },
    { text: 'Oral targeted therapy avoids nephrotoxic platinum agents given mild renal impairment', source: 'Clinical data' },
    { text: 'Lower myelotoxicity vs chemotherapy given baseline anemia', source: 'Lab values' },
  ],

  evidenceAgainst: [
    { text: 'Stage IIIB may benefit from concurrent chemoradiation with consolidation immunotherapy in unresectable disease', source: 'PACIFIC_DURVALUMAB_PMC' },
    { text: 'Surgical candidacy not yet assessed — multimodal approach may be viable', source: 'Missing data' },
    { text: 'LVEF unknown — limits assessment of cardiotoxic regimens', source: 'Missing data' },
  ],

  missingData: mockPatient.missingData,

  riskFlags: mockRiskFlags,
  publishedCohorts: [
    {
      cohortName: 'FLAURA: Osimertinib overall survival in EGFR+ advanced NSCLC',
      population: 'Untreated EGFR-mutated advanced NSCLC receiving first-line osimertinib',
      similarityLevel: 'Moderate',
      matchingFactors: ['EGFR mutation', 'First-line TKI setting', 'Outpatient preference'],
      limitationFactors: ['Trial population metastatic/advanced, not locally advanced IIIB', 'Trial population younger than this case'],
      implication: 'Supports targeted therapy with close monitoring.',
      sourceLabel: 'FLAURA_OSIMERTINIB_NEJM',
      sourceUrl: '',
    },
  ],

  keyReasoningFactors: [
    { factor: 'EGFR mutation status', weight: 'high', direction: 'supports' },
    { factor: 'Renal function (eGFR 64)', weight: 'high', direction: 'cautions' },
    { factor: 'Patient QoL preferences', weight: 'medium', direction: 'supports' },
    { factor: 'Baseline anemia', weight: 'medium', direction: 'cautions' },
    { factor: 'Anxiety history', weight: 'medium', direction: 'supports' },
    { factor: 'Incomplete cardiac workup', weight: 'medium', direction: 'cautions' },
  ],

  sources: [],
};

function createTreatmentEvidenceProfile(params: {
  uncertaintyLevel: AiEvidenceSynthesis['uncertaintyLevel'];
  uncertaintySummary: string;
  uncertaintyDescription: string;
  evidenceFor: Array<{ text: string; source: string }>;
  evidenceAgainst: Array<{ text: string; source: string }>;
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
    missingData: mockPatient.missingData,
    riskFlags: params.riskFlags,
    publishedCohorts: params.publishedCohorts,
    sources: params.sources,
    keyReasoningFactors: params.reasoningFactors,
  };
}

export const mockTreatmentEvidenceById: Record<string, AiEvidenceSynthesis> = {
  osimertinib: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Strong targeted-therapy evidence remains the best fit for this patient, but missing cardiac and surgical data keep confidence moderate.',
    uncertaintyDescription: 'The EGFR-targeted pathway is well supported, yet unresolved surgical candidacy and cardiac workup still affect certainty.',
    evidenceFor: [
      { text: 'EGFR Exon 19 deletion aligns with first-line osimertinib evidence in EGFR-mutated advanced NSCLC.', source: 'FLAURA_OSIMERTINIB_NEJM' },
      { text: 'First-line osimertinib demonstrated improved progression-free survival versus gefitinib or erlotinib.', source: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM' },
      { text: 'Osimertinib offers outpatient delivery that suits the patient\'s preference for minimal hospitalization.', source: 'Patient context' },
      { text: 'Oral targeted therapy is preferred given mild renal impairment and baseline diabetes.', source: 'Clinical data' },
    ],
    evidenceAgainst: [
      { text: 'Stage IIIB disease may still justify chemoradiation with consolidation durvalumab in unresectable locally advanced disease.', source: 'PACIFIC_DURVALUMAB_PMC' },
      { text: 'Missing cardiac evaluation limits confidence in any highly intensive regimen.', source: 'Missing data' },
      { text: 'Surgical candidacy not yet assessed — multimodal approach may remain viable.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[0], mockRiskFlags[2], mockRiskFlags[3]],
    publishedCohorts: [
      { cohortName: 'FLAURA: Osimertinib overall survival in EGFR+ advanced NSCLC', population: 'Untreated EGFR-mutated advanced NSCLC, first-line osimertinib', similarityLevel: 'Moderate', matchingFactors: ['EGFR mutation', 'First-line TKI setting', 'Outpatient preference'], limitationFactors: ['Trial population metastatic/advanced, not locally advanced IIIB', 'Limited surgical data'], implication: 'Strong support for targeted therapy with close monitoring.', sourceLabel: 'FLAURA_OSIMERTINIB_NEJM', sourceUrl: '' },
      { cohortName: 'FLAURA: Osimertinib vs gefitinib/erlotinib', population: 'First-line EGFR-mutated advanced NSCLC randomized to osimertinib or first-generation TKI', similarityLevel: 'Moderate', matchingFactors: ['EGFR mutation', 'First-line targeted therapy'], limitationFactors: ['Advanced/metastatic trial population', 'Not stage IIIB-specific'], implication: 'Supports osimertinib over older EGFR TKIs when available.', sourceLabel: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'EGFR mutation status', weight: 'high', direction: 'supports' },
      { factor: 'Renal function', weight: 'medium', direction: 'supports' },
      { factor: 'Cardiac workup', weight: 'medium', direction: 'cautions' },
    ],
  }),
  erlotinib: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Erlotinib remains a reasonable EGFR-directed option, although it is less favored than osimertinib for this case.',
    uncertaintyDescription: 'The evidence is clinically reasonable, but lower efficacy versus osimertinib makes the choice less compelling than newer agents.',
    evidenceFor: [
      { text: 'Erlotinib improved progression-free survival versus chemotherapy as first-line treatment in EGFR mutation-positive advanced NSCLC.', source: 'EURTAC_ERLOTINIB_LANCET' },
      { text: 'It may be acceptable when oral therapy and tolerability are prioritized.', source: 'Patient context' },
      { text: 'The outpatient regimen aligns with quality-of-life goals and reduced hospital exposure.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'First-line osimertinib demonstrated superior progression-free survival versus gefitinib or erlotinib in EGFR-mutated NSCLC.', source: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM' },
      { text: 'Without complete cardiac workup, escalation to intensive disease-directed regimens remains uncertain.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[0], mockRiskFlags[2]],
    publishedCohorts: [
      { cohortName: 'EURTAC: Erlotinib in EGFR+ advanced NSCLC', population: 'European patients with EGFR mutation-positive advanced NSCLC, first-line erlotinib', similarityLevel: 'Moderate', matchingFactors: ['EGFR mutation', 'Oral therapy preference', 'First-line TKI setting'], limitationFactors: ['Older generation TKI', 'Advanced/metastatic trial population'], implication: 'Reasonable fallback if newer agents are not available or tolerated.', sourceLabel: 'EURTAC_ERLOTINIB_LANCET', sourceUrl: '' },
      { cohortName: 'FLAURA comparator: osimertinib vs first-generation TKI', population: 'First-line EGFR-mutated advanced NSCLC randomized to osimertinib or gefitinib/erlotinib', similarityLevel: 'Partial', matchingFactors: ['EGFR mutation', 'First-line targeted strategy'], limitationFactors: ['Shows superiority of osimertinib over erlotinib', 'Not locally advanced IIIB-specific'], implication: 'Cautions against erlotinib when osimertinib is available.', sourceLabel: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'First-line EGFR targeting', weight: 'high', direction: 'supports' },
      { factor: 'Treatment convenience', weight: 'medium', direction: 'supports' },
      { factor: 'Relative efficacy gap', weight: 'medium', direction: 'cautions' },
    ],
  }),
  gefitinib: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Gefitinib is a plausible EGFR-directed alternative, but it is less favored than newer genotypically optimized agents.',
    uncertaintyDescription: 'This option has targeted-therapy rationale, though the evidence base is less contemporary than osimertinib.',
    evidenceFor: [
      { text: 'Gefitinib improved outcomes versus chemotherapy in EGFR mutation-positive pulmonary adenocarcinoma.', source: 'IPASS_GEFITINIB_NEJM' },
      { text: 'Gefitinib demonstrated benefit over chemotherapy in EGFR-mutated NSCLC in a dedicated randomized trial.', source: 'GEFITINIB_EGFR_MUTATION_NEJM' },
      { text: 'Oral administration supports a lower-burden treatment experience.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'First-line osimertinib demonstrated superior progression-free survival versus gefitinib in EGFR-mutated advanced NSCLC.', source: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM' },
      { text: 'Therapy selection should be revisited if symptoms or disease burden worsen.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[0], mockRiskFlags[3]],
    publishedCohorts: [
      { cohortName: 'IPASS: Gefitinib in EGFR-selected pulmonary adenocarcinoma', population: 'Patients with EGFR mutation-positive pulmonary adenocarcinoma', similarityLevel: 'Partial', matchingFactors: ['EGFR mutation', 'Oral targeted therapy'], limitationFactors: ['Older evidence base', 'Not stage IIIB-specific'], implication: 'May be suitable if a less intensive treatment pathway is preferred.', sourceLabel: 'IPASS_GEFITINIB_NEJM', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Targeted therapy rationale', weight: 'medium', direction: 'supports' },
      { factor: 'Need for newer-generation option', weight: 'medium', direction: 'cautions' },
    ],
  }),
  afatinib: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Afatinib remains a viable EGFR-directed option, but toxicity and resistance concerns make it more uncertain than newer agents.',
    uncertaintyDescription: 'This path has meaningful targeted-therapy support but should be weighed against side-effect burden and treatment convenience.',
    evidenceFor: [
      { text: 'Afatinib is an established irreversible EGFR inhibitor for EGFR mutation-positive NSCLC, including del19 mutations.', source: 'AFATINIB_LUX_LUNG_REVIEW_PMC' },
      { text: 'LUX-Lung 7 evaluated afatinib versus gefitinib in EGFR mutation-positive NSCLC.', source: 'AFATINIB_LUX_LUNG_7_PMC' },
      { text: 'It can be considered when a non-osimertinib EGFR TKI is preferred.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'Higher toxicity burden may be less acceptable in a patient with QoL concerns and baseline anemia.', source: 'Patient context' },
      { text: 'First-line osimertinib demonstrated superior progression-free survival versus gefitinib, a relevant comparator for afatinib selection.', source: 'FLAURA_FIRSTLINE_OSIMERTINIB_NEJM' },
    ],
    riskFlags: [mockRiskFlags[2], mockRiskFlags[3]],
    publishedCohorts: [
      { cohortName: 'LUX-Lung review: Afatinib in EGFR+ NSCLC', population: 'EGFR-mutant NSCLC patients receiving afatinib across LUX-Lung trials', similarityLevel: 'Partial', matchingFactors: ['EGFR del19 mutation', 'Mutation-driven strategy'], limitationFactors: ['Higher toxicity burden', 'Less contemporary than osimertinib'], implication: 'Useful if a more conservative targeted approach is needed.', sourceLabel: 'AFATINIB_LUX_LUNG_REVIEW_PMC', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Targeted strategy', weight: 'medium', direction: 'supports' },
      { factor: 'Tolerability', weight: 'medium', direction: 'cautions' },
    ],
  }),
  'carboplatin-pemetrexed': createTreatmentEvidenceProfile({
    uncertaintyLevel: 'high',
    uncertaintySummary: 'Platinum-based chemotherapy remains a plausible option, but renal and anemia concerns make it less suitable than targeted therapy.',
    uncertaintyDescription: 'The evidence base is broad, yet features of the patient profile create meaningful concern around tolerability and toxicity.',
    evidenceFor: [
      { text: 'Pemetrexed is an established agent for advanced nonsquamous NSCLC, often combined with platinum chemotherapy.', source: 'PEMETREXED_NSCLC_REVIEW_PMC' },
      { text: 'Carboplatin plus pemetrexed is a standard protocol for locally advanced or metastatic nonsquamous NSCLC.', source: 'CARBOPLATIN_PEMETREXED_EVIQ' },
    ],
    evidenceAgainst: [
      { text: 'Renal function and anemia increase the risk of toxicity and treatment delays.', source: 'Clinical data' },
      { text: 'Patient preference for minimal hospitalization and outpatient care argues against a highly intensive regimen.', source: 'Patient context' },
      { text: 'Incomplete cardiac workup limits confidence in an aggressive plan.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[0], mockRiskFlags[2], mockRiskFlags[4]],
    publishedCohorts: [
      { cohortName: 'Pemetrexed in advanced nonsquamous NSCLC', population: 'Patients with advanced nonsquamous NSCLC receiving pemetrexed-based chemotherapy', similarityLevel: 'Moderate', matchingFactors: ['Nonsquamous histology', 'Systemic therapy context'], limitationFactors: ['Higher toxicity risk', 'Renal impairment in this patient'], implication: 'Reasonable if clinical fitness and treatment goals favor intensity.', sourceLabel: 'PEMETREXED_NSCLC_REVIEW_PMC', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Disease burden', weight: 'medium', direction: 'supports' },
      { factor: 'Renal function', weight: 'high', direction: 'cautions' },
      { factor: 'QoL preference', weight: 'medium', direction: 'cautions' },
    ],
  }),
  pembrolizumab: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'high',
    uncertaintySummary: 'Immunotherapy is plausible in selected PD-L1-positive disease, but the patient\'s case lacks confirming context and raises concern for toxicity.',
    uncertaintyDescription: 'The evidence is variable and the patient\'s incomplete workup makes immune-based therapy a less certain fit.',
    evidenceFor: [
      { text: 'Pembrolizumab plus pemetrexed and platinum improved outcomes in metastatic nonsquamous NSCLC in KEYNOTE-189.', source: 'KEYNOTE_189_PEMBROLIZUMAB_PMC' },
      { text: 'Five-year outcomes from KEYNOTE-189 support pembrolizumab combination therapy in metastatic nonsquamous NSCLC.', source: 'KEYNOTE_189_PDF' },
    ],
    evidenceAgainst: [
      { text: 'This pathway may be less attractive if quality-of-life and tolerance are primary goals.', source: 'Patient context' },
      { text: 'Incomplete cardiac workup and inflammatory markers limit confidence in benefit.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[1], mockRiskFlags[2], mockRiskFlags[3]],
    publishedCohorts: [
      { cohortName: 'KEYNOTE-189: Pembrolizumab plus pemetrexed and platinum', population: 'Previously untreated metastatic nonsquamous NSCLC', similarityLevel: 'Partial', matchingFactors: ['Nonsquamous histology', 'Systemic therapy context'], limitationFactors: ['Metastatic trial population', 'EGFR+ patient not typical ICI-first population'], implication: 'Could be revisited if biomarker and tolerance data improve.', sourceLabel: 'KEYNOTE_189_PEMBROLIZUMAB_PMC', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'Immune-biology fit', weight: 'medium', direction: 'supports' },
      { factor: 'Toxicity tolerance', weight: 'high', direction: 'cautions' },
    ],
  }),
  palliative: createTreatmentEvidenceProfile({
    uncertaintyLevel: 'low',
    uncertaintySummary: 'Best supportive care has clear rationale when symptom control and quality of life are the primary goals.',
    uncertaintyDescription: 'The evidence is less disease-directed, but the patient preference and symptom burden make this a reasonable path when goals are comfort and function.',
    evidenceFor: [
      { text: 'Early palliative care improved quality of life and mood in metastatic NSCLC without compromising survival.', source: 'EARLY_PALLIATIVE_CARE_NSCLC_PDF' },
      { text: 'ASCO guidelines support early integration of palliative care for patients with cancer.', source: 'ASCO_PALLIATIVE_CARE_JCO' },
      { text: 'The patient\'s outpatient preference and QoL concerns support a less intensive approach.', source: 'Patient context' },
    ],
    evidenceAgainst: [
      { text: 'If curative or disease-control intent is still desired, this approach may under-treat the cancer.', source: 'Clinical data' },
      { text: 'Incomplete disease and workup data limit confidence in ruling out more active treatment.', source: 'Missing data' },
    ],
    riskFlags: [mockRiskFlags[3], mockRiskFlags[4]],
    publishedCohorts: [
      { cohortName: 'Early palliative care in metastatic NSCLC', population: 'Patients with newly diagnosed metastatic NSCLC receiving early palliative care', similarityLevel: 'Moderate', matchingFactors: ['QoL-centered goals', 'Symptom-focused management'], limitationFactors: ['Metastatic trial population', 'Less disease-directed benefit'], implication: 'Good fit when symptom relief is the dominant objective.', sourceLabel: 'EARLY_PALLIATIVE_CARE_NSCLC_PDF', sourceUrl: '' },
    ],
    sources: [],
    reasoningFactors: [
      { factor: 'QoL goals', weight: 'high', direction: 'supports' },
      { factor: 'Disease-control intent', weight: 'medium', direction: 'cautions' },
    ],
  }),
};

export const mockTreatmentOptions: TreatmentOption[] = [
  {
    id: 'osimertinib',
    name: 'EGFR TKI Monotherapy (Osimertinib)',
    benefits: ['High efficacy for EGFR+ mutation', 'Outpatient therapy', 'Preserves QoL', 'CNS penetration'],
    risks: ['Rash (40–50%)', 'Diarrhea (~30%)', 'Nail changes', 'QT prolongation (monitor EKG)'],
    contraindications: ['Known hypersensitivity to osimertinib'],
    comorbidityConsiderations: [
      'Safe with controlled hypertension',
      'No significant metabolic interaction with diabetes medications',
      'Anxiety-compatible — no psychiatric adverse effects',
      'Standard dosing acceptable at eGFR 64',
    ],
    qolImpact: 'Generally favorable — outpatient, manageable side effects, preserves daily function',
    monitoring: 'EKG baseline and periodic; LFTs monthly; imaging at 8–12 weeks',
    strength: 'NCCN Preferred',
    evidenceStrength: 'strong',
    uncertainty: 'low',
    missingData: ['Long-term resistance mutation monitoring plan'],
    sources: [
      { title: 'FLAURA', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
      { title: 'NCCN NSCLC Guidelines', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
    ],
  },
  {
    id: 'chemoradiation',
    name: 'Concurrent Chemoradiation + Durvalumab',
    benefits: ['Aggressive local control', 'Established for Stage III NSCLC', 'Potential for durable response'],
    risks: ['Esophagitis (15–30%)', 'Pneumonitis (5–10%)', 'Myelosuppression', 'Significant fatigue'],
    contraindications: ['Cisplatin at eGFR <60', 'Uncontrolled intercurrent illness'],
    comorbidityConsiderations: [
      'Durvalumab may worsen hypertension',
      'Carboplatin required (not cisplatin) at eGFR 64',
      'Hyperglycemia risk from corticosteroids with diabetes',
      'High myelotoxicity risk with baseline anemia',
      'Intensive schedule may exacerbate anxiety',
    ],
    qolImpact: 'Substantial short-term toxicity; potential long-term pulmonary fibrosis',
    monitoring: 'Weekly labs during RT; PFTs baseline and post-RT; BP monitoring',
    strength: 'NCCN Alternative',
    evidenceStrength: 'moderate',
    uncertainty: 'moderate',
    missingData: ['LVEF assessment', 'Pulmonary function baseline'],
    sources: [{ title: 'PACIFIC Trial', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' }],
  },
  {
    id: 'neoadjuvant',
    name: 'Neoadjuvant Chemotherapy + Surgery',
    benefits: ['Potential curative intent', 'Tumor downstaging possible', 'Definitive local control if resectable'],
    risks: ['Peripheral neuropathy', 'Infection risk', 'Delayed wound healing', 'Extended recovery'],
    contraindications: ['Cisplatin contraindicated', 'Medically inoperable status TBD'],
    comorbidityConsiderations: [
      'Carboplatin less effective than cisplatin — efficacy concern',
      'Diabetes increases surgical wound healing risk',
      'Low hemoglobin raises perioperative risk',
      'Major surgery may trigger anxiety decompensation',
      'ECOG 1 borderline for aggressive multimodal approach',
    ],
    qolImpact: 'Major — extended timeline, recovery period, permanent changes from surgery',
    monitoring: 'PFTs, cardiac clearance pre-op; weekly labs during chemo; post-op surveillance imaging',
    strength: 'NCCN Alternative',
    evidenceStrength: 'moderate',
    uncertainty: 'high',
    missingData: ['Surgical candidacy assessment', 'Cardiac clearance', 'Detailed pulmonary function'],
    sources: [{ title: 'NCCN NSCLC Guidelines', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' }],
  },
];

export const mockSimilarCases: SimilarCase[] = [
  {
    caseId: 'Case #2847',
    matchScore: 92,
    matchCriteria: [
      { label: 'Same tumor type (NSCLC)', matched: true },
      { label: 'Same stage (IIIB)', matched: true },
      { label: 'Same mutation (EGFR Exon 19 del)', matched: true },
      { label: 'Similar age (62–70)', matched: true },
      { label: 'Similar ECOG (1)', matched: true },
      { label: 'Similar renal impairment', matched: true },
      { label: 'Similar comorbidities', matched: false },
    ],
    presentation: 'Female, 68y, EGFR+ Exon 19 del NSCLC IIIB, eGFR 58, ECOG 1',
    treatmentUsed: 'Osimertinib 80mg daily',
    outcome: 'Excellent response — 28mo PFS, well-tolerated, no grade 3+ AE',
    source: 'FLAURA Trial cohort',
  },
  {
    caseId: 'Case #3102',
    matchScore: 78,
    matchCriteria: [
      { label: 'Same tumor type (NSCLC)', matched: true },
      { label: 'Same stage (IIIB)', matched: true },
      { label: 'Same mutation (EGFR+)', matched: true },
      { label: 'Similar age (62–70)', matched: true },
      { label: 'Similar ECOG (1)', matched: true },
      { label: 'Hypertension present', matched: true },
      { label: 'Anxiety history', matched: true },
    ],
    presentation: 'Male, 64y, EGFR+ del NSCLC IIIB, HTN, anxiety, preferred outpatient treatment',
    treatmentUsed: 'Osimertinib with supportive care protocol',
    outcome: 'Good response — 18mo PFS, anxiety managed with psychiatry collaboration',
    source: 'Institutional database',
  },
  {
    caseId: 'Case #1956',
    matchScore: 71,
    isRare: true,
    matchCriteria: [
      { label: 'Same tumor type (NSCLC)', matched: true },
      { label: 'Same stage (IIIB)', matched: true },
      { label: 'Same mutation (EGFR+)', matched: true },
      { label: 'Low hemoglobin at baseline', matched: true },
      { label: 'Similar age (62–70)', matched: true },
      { label: 'Anemia management needed', matched: true },
      { label: 'Prior treatment history', matched: false },
    ],
    presentation: 'Female, 67y, EGFR+ NSCLC IIIB, Hgb 11.2, iron deficiency anemia',
    treatmentUsed: 'Osimertinib + iron supplementation + hematology referral',
    outcome: 'Hgb improved to 13.1 after 4 weeks; maintained treatment response',
    source: 'Institutional database (rare presentation)',
  },
];

export const mockWhatWouldChange: DecisionChangeFactor[] = [
  {
    category: 'Performance Status',
    factor: 'Worsening ECOG to 2+',
    description: 'Declining functional status would shift toward less intensive therapy',
    trigger: 'Reassess treatment intensity; consider supportive care or single-agent TKI only',
  },
  {
    category: 'Comorbidity',
    factor: 'Uncontrolled blood pressure',
    description: 'BP >160/100 despite medication would contraindicate immunotherapy components',
    trigger: 'Avoid durvalumab; reconsider TKI monotherapy or RT alone',
  },
  {
    category: 'Molecular',
    factor: 'Different mutation status (e.g., ALK+)',
    description: 'Would completely change targeted therapy selection',
    trigger: 'Switch to appropriate TKI (e.g., alectinib for ALK+)',
  },
  {
    category: 'Patient Preference',
    factor: 'Patient prioritizes quality of life over aggressiveness',
    description: 'Shift from curative-intent multimodal to symptom-focused approach',
    trigger: 'Consider TKI monotherapy or palliative RT; avoid surgery',
  },
  {
    category: 'Missing Data',
    factor: 'LVEF <50% on cardiac workup',
    description: 'Would contraindicate anthracycline-containing or cardiotoxic regimens',
    trigger: 'Exclude chemoradiation with certain agents; favor TKI',
  },
  {
    category: 'Disease Status',
    factor: 'Disease progression on imaging',
    description: 'New distant metastases would upstage and change treatment intent',
    trigger: 'Re-stage; consider systemic therapy escalation or clinical trial',
  },
  {
    category: 'Toxicity',
    factor: 'Grade 3+ TKI adverse events',
    description: 'Poor tolerance would necessitate treatment switch',
    trigger: 'Dose reduction, switch to alternative TKI, or consider chemotherapy',
  },
];

export const mockDecisionFactors: DecisionFactor[] = [
  { category: 'Molecular Profile', description: 'EGFR Exon 19 deletion strongly supports TKI approach', impact: '+++' },
  { category: 'Renal Function', description: 'eGFR 64 limits platinum chemotherapy — favors TKI', impact: '++' },
  { category: 'Performance & QoL', description: 'ECOG 1 with outpatient preference aligns with TKI', impact: '++' },
  { category: 'Anxiety History', description: 'Less intensive outpatient therapy better tolerated psychologically', impact: '+' },
  { category: 'Lab Markers', description: 'Anemia and elevated LDH caution against myelotoxic regimens', impact: '+' },
  { category: 'Patient Preferences', description: 'Values effectiveness with manageable side effects — TKI fits', impact: '++' },
  { category: 'Guidelines', description: 'NCCN preferred approach for EGFR+ NSCLC with strong RCT evidence', impact: '+++' },
  { category: 'Incomplete Workup', description: 'Missing surgical and cardiac assessments limit multimodal options', impact: '+' },
];

export const EXPLANATION_PROMPTS = [
  { id: 'why', label: 'Why?', question: 'Why does the evidence support this direction?' },
  { id: 'why-not', label: 'Why not?', question: 'What argues against the leading option?' },
  { id: 'uncertainty', label: 'What increases uncertainty?', question: 'What factors make this decision less certain?' },
  { id: 'contradicts', label: 'What contradicts?', question: 'What evidence contradicts the current assessment?' },
  { id: 'change', label: 'What would change the outcome?', question: 'What would need to change for a different decision?' },
] as const;

export const REFLECTIVE_CHAT_PROMPTS = [
  'Why do you trust this prediction?',
  'What evidence contradicts your conclusion?',
  'Would your decision change under greater uncertainty?',
  'Which patient factor matters most to your final choice?',
  'What would you tell the patient about remaining uncertainty?',
];
