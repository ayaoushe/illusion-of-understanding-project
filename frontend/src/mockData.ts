export const mockPatient = {
  name: 'Amina Khan',
  age: 63,
  gender: 'Female',
  id: 'PT-2026-04',
  encounter: 'Presenting with fatigue and mild dyspnea',
  vitals: [
    { label: 'Heart rate', value: '82 bpm' },
    { label: 'Blood pressure', value: '132/84 mmHg' },
    { label: 'Oxygen saturation', value: '96%' },
    { label: 'Temperature', value: '37.1°C' },
  ],
  summary:
    'A 63-year-old female with a history of hypertension and type 2 diabetes presenting with intermittent chest discomfort and elevated risk profile.',
};

export const mockAssessment = {
  clinicianNotes:
    'Review ECG, labs, and prior imaging. Patient reports recent activity-related chest tightness with mild relief after rest.',
  likelyDiagnosis: 'Stable angina with possible microvascular ischemia',
  concerns: [
    'Diabetic risk for atypical presentation',
    'Moderate renal function decline',
    'Polypharmacy interactions',
  ],
};

export const mockEvidence = {
  labs: [
    { label: 'Troponin I', result: '0.04 ng/mL', status: 'Normal' },
    { label: 'HbA1c', result: '7.8%', status: 'Elevated' },
    { label: 'LDL cholesterol', result: '132 mg/dL', status: 'Borderline' },
  ],
  imaging: [
    { label: 'ECG', text: 'Non-specific ST depressions in V4–V6' },
    { label: 'Chest X-ray', text: 'No acute cardiopulmonary abnormality' },
  ],
  guidelines: [
    'Conservative management with anti-anginal therapy is appropriate for stable symptoms.',
    'Evaluate renal function before initiating contrast imaging studies.',
  ],
};

export const mockTreatments = [
  {
    name: 'Beta-blocker therapy',
    benefit: 'Improves symptom control and reduces myocardial oxygen demand.',
    risk: 'May worsen fatigue and mask hypoglycemia symptoms.',
  },
  {
    name: 'Nitrate therapy',
    benefit: 'Rapid relief of chest discomfort and preload reduction.',
    risk: 'Potential headache and hypotension.',
  },
  {
    name: 'Lifestyle optimization',
    benefit: 'Addresses long-term cardiovascular risk factors.',
    risk: 'Relies on patient adherence and follow-up.',
  },
];

export const mockCases = [
  {
    caseId: 'Case 211',
    features: ['Female, 62', 'T2DM', 'Atypical chest discomfort', 'Normal troponin'],
    outcome: 'Managed with medical therapy and close outpatient follow-up.',
  },
  {
    caseId: 'Case 317',
    features: ['Hypertension', 'Moderate LDL elevation', 'Non-urgent stress test'],
    outcome: 'Stable, with adjustment to anti-anginal regimen.',
  },
];

export const mockFactors = [
  { factor: 'Clinical risk', description: 'Intermediate pre-test probability for coronary artery disease.' },
  { factor: 'Patient preferences', description: 'Prefers conservative strategy over invasive testing.' },
  { factor: 'System constraints', description: 'Limited same-day imaging availability.' },
];

export const mockReflection = {
  question: 'Which information contributed most to the recommended plan?',
  notes:
    'Combining symptoms with consistent risk factors and non-diagnostic ECG findings supports a cautious management plan, prioritizing safety and patient-centered follow-up.',
  nextSteps: ['Document patient discussion', 'Schedule follow-up in 2 weeks', 'Reassess if symptoms worsen'],
};
