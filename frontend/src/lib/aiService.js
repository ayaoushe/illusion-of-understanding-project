// Placeholder AI service module for the clinical decision support prototype.
// Real ML model calls and backend integration will be added later.

const mockTreatmentSuggestions = [
  {
    name: 'Platinum-based doublet chemotherapy',
    expectedBenefit: 'May reduce tumor burden and prolong progression-free survival.',
    risks: 'Myelosuppression, nausea, neuropathy.',
    contraindications: 'Severe renal impairment, poor performance status.',
    qolImpact: 'Moderate short-term toxicity with potential long-term benefit.',
    monitoring: 'CBC, renal function, electrolytes before each cycle.',
    evidenceStrength: 'Moderate; supported by phase II/III trials in similar histologies.',
    missingData: 'Limited data on patient preference for trade-offs with toxicity.',
  },
  {
    name: 'Targeted therapy (EGFR inhibitor)',
    expectedBenefit: 'Potential for durable response if EGFR mutation is present.',
    risks: 'Skin rash, diarrhea, mild liver enzyme elevations.',
    contraindications: 'No confirmed actionable EGFR mutation; interstitial lung disease history.',
    qolImpact: 'Generally better tolerated than chemotherapy, but requires daily adherence.',
    monitoring: 'Liver function tests and dermatologic review every 4 weeks.',
    evidenceStrength: 'High for EGFR-mutated non-small cell lung cancer; low if mutation status unknown.',
    missingData: 'Molecular profiling results are pending in this prototype.',
  },
  {
    name: 'Palliative radiation therapy',
    expectedBenefit: 'Symptom relief for localized chest pain and dyspnea.',
    risks: 'Fatigue, esophagitis, radiation dermatitis.',
    contraindications: 'Poor baseline pulmonary reserve, prior high-dose thoracic radiation.',
    qolImpact: 'Short-term inconvenience with likely improvement in symptom control.',
    monitoring: 'Weekly symptom review and periodic imaging as needed.',
    evidenceStrength: 'Moderate for symptom-directed palliative care; variable based on lesion location.',
    missingData: 'Precise radiation field planning and timing are not modeled yet.',
  },
];

const mockSimilarCases = [
  {
    patientId: 'LC-049',
    presentation: 'Stage IIIA adenocarcinoma, ECOG 1, EGFR-negative',
    outcome: 'Stabilized with chemoradiation and supportive symptom management.',
  },
  {
    patientId: 'LC-112',
    presentation: 'Stage IV squamous cell carcinoma, ECOG 2, PD-L1 30%',
    outcome: 'Partial response to immunotherapy with careful toxicity monitoring.',
  },
];

const mockEvidenceReview = {
  findings: [
    'Strong evidence supports targeted therapy when actionable mutations are confirmed.',
    'Chemotherapy remains standard for patients without targetable alterations and good functional status.',
    'Quality-of-life outcomes are more favorable with lower-toxicity regimens when clinical status allows.',
  ],
  notes: 'Mock evidence is advisory only and not intended as clinical recommendation. Real evidence summaries will be sourced from validated literature and guidelines.',
};

const mockDecisionFactors = [
  {
    factor: 'Patient preference',
    description: 'Prefers outpatient treatment with minimal hospital stays and values symptom control.',
  },
  {
    factor: 'Performance status',
    description: 'ECOG 1 with ability to perform light activities but limited strenuous exertion.',
  },
  {
    factor: 'Comorbidities',
    description: 'Chronic kidney disease and COPD raise risk for intensive chemotherapy and thoracic radiation.',
  },
];

export function getTreatmentSuggestions(patient) {
  // Returns mock treatment options for prototype UI testing.
  // Real implementation will query ML models or backend services using patient features.
  return mockTreatmentSuggestions;
}

export function getSimilarCases(patient) {
  // Returns mock historical cases for similarity comparison.
  // Replace with real case retrieval logic once the backend is available.
  return mockSimilarCases;
}

export function getEvidenceReview(patient, doctorAssessment) {
  // Returns a mock evidence review summary that combines patient context and assessment.
  // In future, this should use clinical knowledge sources and model reasoning.
  return mockEvidenceReview;
}

export function getDecisionFactors(patient) {
  // Returns mock decision factors used to structure the clinical choice conversation.
  // Backend logic will later determine these factors from patient data and guidelines.
  return mockDecisionFactors;
}
