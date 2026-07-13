import { mrnFromId } from '../config/studyCases';
export const WORKFLOW_STEPS = [
    { id: 'overview', label: 'Patient Overview', shortLabel: 'Overview', number: 1 },
    { id: 'assessment', label: 'Human Initial Assessment', shortLabel: 'Assessment', number: 2 },
    { id: 'evidence', label: 'AI Evidence Synthesis', shortLabel: 'Evidence', number: 3 },
    { id: 'treatment', label: 'Treatment Comparison', shortLabel: 'Treatment', number: 4 },
    { id: 'similar', label: 'Similar Cases', shortLabel: 'Cases', number: 5 },
    { id: 'decision', label: 'Decision Factors', shortLabel: 'Factors', number: 6 },
    { id: 'reflection', label: 'Final Reflection', shortLabel: 'Reflection', number: 7 },
];
export const TREATMENT_OPTION_IDS = ['osimertinib', 'chemoradiation', 'neoadjuvant'];
/** Treatment options for the human assessment dropdown */
export const assessmentTreatmentOptions = [
    { id: 'osimertinib', label: 'Osimertinib (Tagrisso)', category: '1st-line EGFR TKI' },
    { id: 'erlotinib', label: 'Erlotinib (Tarceva)', category: '1st-line EGFR TKI' },
    { id: 'gefitinib', label: 'Gefitinib (Iressa)', category: '1st-line EGFR TKI' },
    { id: 'afatinib', label: 'Afatinib (Gilotrif)', category: '2nd-line EGFR TKI' },
    { id: 'carboplatin-pemetrexed', label: 'Carboplatin + Pemetrexed', category: 'Chemotherapy' },
    { id: 'pembrolizumab', label: 'Pembrolizumab (Keytruda)', category: 'Immunotherapy' },
    { id: 'palliative', label: 'Palliative Care / Best Supportive Care', category: 'Palliative' },
];
export function getAssessmentTreatmentLabel(id) {
    const option = assessmentTreatmentOptions.find((o) => o.id === id);
    return option ? `${option.label} [${option.category}]` : id;
}
export const mockPatient = {
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
const patientProfileOverrides = {
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
export function getPatientProfile(patientId) {
    if (!patientId)
        return mockPatient;
    const overrides = patientProfileOverrides[patientId];
    if (!overrides)
        return mockPatient;
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
        severity: 'moderate',
        description: 'eGFR 64 limits platinum-based chemotherapy; dose adjustments required',
        relatedTreatments: ['chemoradiation', 'neoadjuvant'],
    },
    {
        id: 'hypertension',
        title: 'Hypertension Risk',
        severity: 'moderate',
        description: 'Durvalumab and some chemo agents may worsen blood pressure control',
        relatedTreatments: ['chemoradiation'],
    },
    {
        id: 'anemia',
        title: 'Baseline Anemia',
        severity: 'moderate',
        description: 'Hgb 11.8 g/dL increases myelosuppression risk with intensive regimens',
        relatedTreatments: ['chemoradiation', 'neoadjuvant'],
    },
    {
        id: 'neuropathy',
        title: 'Neuropathy / QoL Risk',
        severity: 'low',
        description: 'Patient explicitly concerned about peripheral neuropathy from platinum agents',
        relatedTreatments: ['neoadjuvant', 'chemoradiation'],
    },
    {
        id: 'frailty',
        title: 'ECOG & Frailty Consideration',
        severity: 'low',
        description: 'ECOG 1 is favorable but age 66 with comorbidities warrants cautious escalation',
        relatedTreatments: ['neoadjuvant'],
    },
];
export const mockAiEvidence = {
    title: 'AI Evidence Synthesis',
    disclaimer: 'Evidence-based synthesis of guidelines and literature. This is decision support — not a final recommendation. All outputs require clinician verification.',
    uncertaintyLevel: 'moderate',
    uncertaintySummary: 'Strong molecular evidence supports TKI therapy, but surgical candidacy and cardiac function remain undetermined.',
    uncertaintyDescription: 'Strong molecular evidence supports TKI therapy, but surgical candidacy and cardiac function remain undetermined. Patient similarity to published cohorts is moderate.',
    evidenceFor: [
        { text: 'EGFR Exon 19 deletion is a strong TKI-sensitizing mutation (ORR >70%)', source: 'FLAURA Trial' },
        { text: 'Osimertinib crosses CNS barrier — relevant given stage IIIB disease', source: 'NCCN Guidelines' },
        { text: 'Outpatient TKI aligns with patient preference for minimal hospitalization', source: 'Patient context' },
        { text: 'Renal-sparing profile avoids nephrotoxic platinum agents', source: 'Renal dosing review' },
        { text: 'Lower myelotoxicity vs chemotherapy given baseline anemia', source: 'Lab analysis' },
    ],
    evidenceAgainst: [
        { text: 'Stage IIIB may benefit from concurrent chemoradiation per some guidelines', source: 'PACIFIC Trial' },
        { text: 'Elevated LDH (425) suggests higher tumor burden — may need aggressive approach', source: 'Prognostic markers' },
        { text: 'Surgical candidacy not yet assessed — multimodal approach may be viable', source: 'Pending workup' },
        { text: 'Elevated CRP may predict poorer immunotherapy outcomes if considered later', source: 'Inflammation markers' },
        { text: 'LVEF unknown — limits assessment of cardiotoxic regimens', source: 'Missing data' },
    ],
    missingData: mockPatient.missingData,
    riskFlags: mockRiskFlags,
    publishedCohorts: [
        {
            cohortName: 'FLAURA Trial Cohort',
            population: 'EGFR+ advanced NSCLC treated with first-line targeted therapy',
            similarityLevel: 'High',
            matchingFactors: ['EGFR mutation', 'Stage III disease context', 'Outpatient preference'],
            limitationFactors: ['Trial population younger than this case'],
            implication: 'Supports a targeted therapy-first strategy.',
            sourceLabel: 'FLAURA Trial',
            sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/36841857',
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
    sources: [
        { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
        { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', year: 2023, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
        { title: 'PACIFIC Trial: Durvalumab after CRT', year: 2018, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
        { title: 'Renal Impairment and Anticancer Drug Selection', year: 2024, type: 'Review', url: 'https://pubmed.ncbi.nlm.nih.gov/38456789' },
    ],
};
function createTreatmentEvidenceProfile(params) {
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
export const mockTreatmentEvidenceById = {
    osimertinib: createTreatmentEvidenceProfile({
        uncertaintyLevel: 'moderate',
        uncertaintySummary: 'Strong targeted-therapy evidence remains the best fit for this patient, but missing cardiac and surgical data keep confidence moderate.',
        uncertaintyDescription: 'The EGFR-targeted pathway is well supported, yet unresolved surgical candidacy and cardiac workup still affect certainty.',
        evidenceFor: [
            { text: 'EGFR Exon 19 deletion is a strong TKI-sensitizing alteration and aligns with first-line targeted treatment.', source: 'FLAURA Trial' },
            { text: 'Osimertinib offers outpatient delivery that suits the patient’s preference for minimal hospitalization.', source: 'Patient context' },
            { text: 'Renal-sparing dosing is preferred given mild renal impairment and baseline diabetes.', source: 'Renal dosing review' },
        ],
        evidenceAgainst: [
            { text: 'Stage IIIB disease may still justify multimodal treatment in some centers, especially if local control is prioritized.', source: 'PACIFIC Trial' },
            { text: 'Missing cardiac evaluation limits confidence in any highly intensive regimen.', source: 'Missing data' },
            { text: 'Elevated LDH suggests a more aggressive disease burden than the current case description captures.', source: 'Prognostic markers' },
        ],
        riskFlags: [mockRiskFlags[0], mockRiskFlags[2], mockRiskFlags[3]],
        publishedCohorts: [
            { cohortName: 'FLAURA Trial Cohort', population: 'EGFR+ advanced NSCLC, first-line TKI treated', similarityLevel: 'High', matchingFactors: ['EGFR mutation', 'Stage IIIB disease', 'Outpatient preference'], limitationFactors: ['Trial population younger than this case', 'Limited surgical data'], implication: 'Strong support for targeted therapy with close monitoring.', sourceLabel: 'FLAURA Trial', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
            { cohortName: 'EGFR+ real-world NSCLC cohort', population: 'Real-world patients receiving EGFR TKIs in community oncology', similarityLevel: 'Moderate', matchingFactors: ['Comparable comorbidity burden', 'QoL-focused care pathway'], limitationFactors: ['Less complete molecular workup', 'No surgery outcomes captured'], implication: 'Supports a TKI-first approach if symptoms and tolerability remain manageable.', sourceLabel: 'Institutional cohort', sourceUrl: 'https://www.nccn.org' },
            { cohortName: 'CNS-active TKI cohort', population: 'Patients selected for osimertinib due to CNS or symptom burden', similarityLevel: 'Partial', matchingFactors: ['Outpatient preference', 'Need for symptom control'], limitationFactors: ['Not all patients had stage III disease'], implication: 'Suggests good fit if CNS symptoms or tolerability concerns are present.', sourceLabel: 'Guideline synthesis', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', year: 2023, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
            { title: 'PACIFIC Trial: Durvalumab after CRT', year: 2018, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
        ],
        reasoningFactors: [
            { factor: 'EGFR mutation status', weight: 'high', direction: 'supports' },
            { factor: 'Renal function', weight: 'medium', direction: 'supports' },
            { factor: 'Cardiac workup', weight: 'medium', direction: 'cautions' },
        ],
    }),
    erlotinib: createTreatmentEvidenceProfile({
        uncertaintyLevel: 'moderate',
        uncertaintySummary: 'Erlotinib remains a reasonable EGFR-directed option, although it is less favored than osimertinib for this case.',
        uncertaintyDescription: 'The evidence is clinically reasonable, but lower efficacy and weaker CNS activity make the choice less compelling than newer agents.',
        evidenceFor: [
            { text: 'Erlotinib is an established EGFR-directed agent and remains active in selected patients.', source: 'NCCN Guidelines' },
            { text: 'It may be acceptable when oral therapy and tolerability are prioritized.', source: 'Patient context' },
            { text: 'The outpatient regimen aligns with quality-of-life goals and reduced hospital exposure.', source: 'Patient context' },
        ],
        evidenceAgainst: [
            { text: 'Compared with osimertinib, erlotinib has less favorable efficacy and CNS activity.', source: 'FLAURA Trial' },
            { text: 'Baseline renal and metabolic factors require careful monitoring during treatment.', source: 'Renal dosing review' },
            { text: 'Without complete cardiac workup, escalation to intensive disease-directed regimens remains uncertain.', source: 'Missing data' },
        ],
        riskFlags: [mockRiskFlags[0], mockRiskFlags[2]],
        publishedCohorts: [
            { cohortName: 'Erlotinib real-world cohort', population: 'EGFR+ NSCLC patients treated with first-generation TKIs', similarityLevel: 'Moderate', matchingFactors: ['Oral therapy preference', 'Similar comorbidity profile'], limitationFactors: ['Older generation TKI', 'Lower CNS activity'], implication: 'Reasonable fallback if newer agents are not available or tolerated.', sourceLabel: 'Institutional cohort', sourceUrl: 'https://www.nccn.org' },
            { cohortName: 'First-generation EGFR TKI cohort', population: 'Patients with EGFR mutation and limited metastatic burden', similarityLevel: 'Partial', matchingFactors: ['Targeted strategy favored'], limitationFactors: ['Less durable benefit than osimertinib'], implication: 'Can support a conservative strategy when toxicity risk is a priority.', sourceLabel: 'Guideline synthesis', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', year: 2023, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
        ],
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
            { text: 'Gefitinib remains a recognized EGFR TKI option in select patients.', source: 'NCCN Guidelines' },
            { text: 'Oral administration supports a lower-burden treatment experience.', source: 'Patient context' },
        ],
        evidenceAgainst: [
            { text: 'Current evidence is less robust than for newer agents and may be less effective in broader populations.', source: 'FLAURA Trial' },
            { text: 'Therapy selection should be revisited if symptoms or disease burden worsen.', source: 'Missing data' },
        ],
        riskFlags: [mockRiskFlags[0], mockRiskFlags[3]],
        publishedCohorts: [
            { cohortName: 'Gefitinib-treated EGFR+ cohort', population: 'Selected patients with EGFR mutations and mild disease burden', similarityLevel: 'Partial', matchingFactors: ['Oral targeted therapy', 'Similar symptom goals'], limitationFactors: ['Older evidence base'], implication: 'May be suitable if a less intensive treatment pathway is preferred.', sourceLabel: 'Guideline synthesis', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', year: 2023, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
        ],
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
            { text: 'Afatinib is an established irreversible EGFR inhibitor for selected EGFR-mutated disease.', source: 'NCCN Guidelines' },
            { text: 'It can be considered when a non-osimertinib EGFR TKI is preferred.', source: 'Patient context' },
        ],
        evidenceAgainst: [
            { text: 'Higher toxicity burden may be less acceptable in a patient with QoL concerns and baseline anemia.', source: 'Patient context' },
            { text: 'The current evidence profile is less favorable than optimized TKI pathways.', source: 'FLAURA Trial' },
        ],
        riskFlags: [mockRiskFlags[2], mockRiskFlags[3]],
        publishedCohorts: [
            { cohortName: 'Afatinib-treated EGFR+ cohort', population: 'EGFR-mutant NSCLC patients receiving ERBB-family inhibition', similarityLevel: 'Partial', matchingFactors: ['Mutation-driven strategy'], limitationFactors: ['Higher toxicity burden', 'Less contemporary evidence'], implication: 'Useful if a more conservative targeted approach is needed.', sourceLabel: 'Guideline synthesis', sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'FLAURA Trial: Osimertinib in EGFR+ NSCLC', year: 2023, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/36841857' },
        ],
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
            { text: 'Platinum-based chemotherapy remains an established option for fit patients with non-squamous disease.', source: 'NCCN Guidelines' },
            { text: 'The patient’s disease burden and stage may warrant consideration of systemic cytotoxic treatment.', source: 'PACIFIC Trial' },
        ],
        evidenceAgainst: [
            { text: 'Renal function and anemia increase the risk of toxicity and treatment delays.', source: 'Renal dosing review' },
            { text: 'Patient preference for minimal hospitalization and outpatient care argues against a highly intensive regimen.', source: 'Patient context' },
            { text: 'Incomplete cardiac workup limits confidence in an aggressive plan.', source: 'Missing data' },
        ],
        riskFlags: [mockRiskFlags[0], mockRiskFlags[2], mockRiskFlags[4]],
        publishedCohorts: [
            { cohortName: 'Platinum-based chemotherapy cohort', population: 'Fit patients with stage III NSCLC and non-squamous histology', similarityLevel: 'Moderate', matchingFactors: ['Stage III disease', 'Systemic therapy context'], limitationFactors: ['Higher toxicity risk', 'Renal impairment'], implication: 'Reasonable if clinical fitness and treatment goals favor intensity.', sourceLabel: 'Institutional cohort', sourceUrl: 'https://www.nccn.org' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'PACIFIC Trial: Durvalumab after CRT', year: 2018, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
        ],
        reasoningFactors: [
            { factor: 'Disease burden', weight: 'medium', direction: 'supports' },
            { factor: 'Renal function', weight: 'high', direction: 'cautions' },
            { factor: 'QoL preference', weight: 'medium', direction: 'cautions' },
        ],
    }),
    pembrolizumab: createTreatmentEvidenceProfile({
        uncertaintyLevel: 'high',
        uncertaintySummary: 'Immunotherapy is plausible in selected PD-L1-positive disease, but the patient’s case lacks confirming context and raises concern for toxicity.',
        uncertaintyDescription: 'The evidence is variable and the patient’s incomplete workup makes immune-based therapy a less certain fit.',
        evidenceFor: [
            { text: 'PD-L1 expression and immune checkpoint therapy can be relevant in select NSCLC settings.', source: 'NCCN Guidelines' },
            { text: 'Immunotherapy may be considered if disease control is prioritized over convenience.', source: 'PACIFIC Trial' },
        ],
        evidenceAgainst: [
            { text: 'The patient’s inflammatory markers and incomplete workup introduce uncertainty around benefit.', source: 'Prognostic markers' },
            { text: 'This pathway may be less attractive if quality-of-life and tolerance are primary goals.', source: 'Patient context' },
            { text: 'Toxicity and follow-up requirements are significant.', source: 'Missing data' },
        ],
        riskFlags: [mockRiskFlags[1], mockRiskFlags[2], mockRiskFlags[3]],
        publishedCohorts: [
            { cohortName: 'Immunotherapy NSCLC cohort', population: 'Patients with PD-L1-positive disease receiving checkpoint blockade', similarityLevel: 'Partial', matchingFactors: ['Tumor biology fit'], limitationFactors: ['Unclear PD-L1 context', 'Higher toxicity'], implication: 'Could be revisited if biomarker and tolerance data improve.', sourceLabel: 'Institutional cohort', sourceUrl: 'https://www.nccn.org' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'PACIFIC Trial: Durvalumab after CRT', year: 2018, type: 'RCT', url: 'https://pubmed.ncbi.nlm.nih.gov/28102484' },
        ],
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
            { text: 'Supportive care is often appropriate when goals shift toward symptom control and maintaining function.', source: 'Patient context' },
            { text: 'The patient’s outpatient preference and QoL concerns support a less intensive approach.', source: 'Patient context' },
        ],
        evidenceAgainst: [
            { text: 'If curative or disease-control intent is still desired, this approach may under-treat the cancer.', source: 'NCCN Guidelines' },
            { text: 'Incomplete disease and workup data limit confidence in ruling out more active treatment.', source: 'Missing data' },
        ],
        riskFlags: [mockRiskFlags[3], mockRiskFlags[4]],
        publishedCohorts: [
            { cohortName: 'Supportive-care NSCLC cohort', population: 'Patients prioritizing symptom relief and preserved function', similarityLevel: 'High', matchingFactors: ['QoL-centered goals', 'Outpatient preference'], limitationFactors: ['Less disease-directed benefit'], implication: 'Good fit when symptom relief is the dominant objective.', sourceLabel: 'Institutional cohort', sourceUrl: 'https://www.nccn.org' },
        ],
        sources: [
            { title: 'NCCN Guidelines for NSCLC', year: 2025, type: 'Guideline', url: 'https://pubmed.ncbi.nlm.nih.gov/35882123' },
            { title: 'Institutional supportive care pathway', year: 2024, type: 'Institutional cohort', url: 'https://www.nccn.org' },
        ],
        reasoningFactors: [
            { factor: 'QoL goals', weight: 'high', direction: 'supports' },
            { factor: 'Disease-control intent', weight: 'medium', direction: 'cautions' },
        ],
    }),
};
export const mockTreatmentOptions = [
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
export const mockSimilarCases = [
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
export const mockWhatWouldChange = [
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
export const mockDecisionFactors = [
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
];
export const REFLECTIVE_CHAT_PROMPTS = [
    'Why do you trust this prediction?',
    'What evidence contradicts your conclusion?',
    'Would your decision change under greater uncertainty?',
    'Which patient factor matters most to your final choice?',
    'What would you tell the patient about remaining uncertainty?',
];
