export type WorkflowStepId =
  | 'overview'
  | 'assessment'
  | 'evidence'
  | 'treatment'
  | 'similar'
  | 'reflection';

export interface WorkflowStep {
  id: WorkflowStepId;
  label: string;
  shortLabel: string;
  number: number;
}

export interface HumanAssessment {
  selectedTreatment: string;
  clinicalReasoning: string;
  uncertainties: string;
  missingInformation: string;
  qolConcern: string;
  patientPreferenceConsidered: boolean;
  completedAt?: string;
}

export interface FinalReflection {
  changedMind: 'yes' | 'no' | 'partially';
  finalTreatment: string;
  finalReasoning: string;
  patientPreferenceHonored: boolean;
  remainingUncertainties: string;
  sourcesChecked: string[];
  whatMatteredMost: string;
}

export interface InteractionTelemetry {
  assessmentStartTime: number | null;
  assessmentSubmitTime: number | null;
  evidenceInteractions: string[];
  treatmentCardsViewed: string[];
  similarCasesViewed: boolean;
  decisionFactorsViewed: boolean;
  explanationPromptsUsed: number;
  warningsShown: string[];
}

export interface Patient {
  name: string;
  mrn: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  priority: string;
  diagnosis: {
    primaryDiagnosis: string;
    stage: string;
    histology: string;
    location: string;
    icd10: string;
    diagnosisDate: string;
  };
  performance: {
    ecog: number;
    ecogDescription: string;
    lastAssessed: string;
  };
  molecular: {
    egfr: { mutation: string; status: string };
    alk: { status: string };
    pdl1: { tps: string; level: string };
    tmb: { value: number; unit: string; level: string };
    kras: { status: string };
  };
  imaging: Array<{ type: string; date: string; findings: string }>;
  labs: Record<string, unknown>;
  comorbidities: Array<{
    name: string;
    status: string;
    implications: string;
    hba1c?: string;
    medication?: string;
    packyears?: number;
    quityear?: number;
  }>;
  medications: Array<{
    name: string;
    dose: string;
    frequency: string;
    relevance: string;
  }>;
  contraindications: Array<{
    factor: string;
    severity: 'high' | 'moderate' | 'low';
    detail: string;
  }>;
  qolConcerns: string[];
  patientPreferences: {
    priorityQoL: string;
    hospitalPreference: string;
    familyInvolvement: string;
  };
  missingData: string[];
  session: {
    clinician: string;
    date: string;
    time: string;
    version: string;
  };
}

export interface RiskFlag {
  id: string;
  title: string;
  severity: 'high' | 'moderate' | 'low';
  description: string;
  relatedTreatments?: string[];
}

export interface EvidenceItem {
  text: string;
  source?: string;
}

export interface PublishedCohort {
  cohortName: string;
  population: string;
  similarityLevel: 'High' | 'Moderate' | 'Partial';
  matchingFactors: string[];
  limitationFactors: string[];
  implication: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface AiEvidenceSynthesis {
  title: string;
  disclaimer: string;
  uncertaintyLevel: 'low' | 'moderate' | 'high';
  uncertaintySummary: string;
  uncertaintyDescription: string;
  evidenceFor: EvidenceItem[];
  evidenceAgainst: EvidenceItem[];
  missingData: string[];
  riskFlags: RiskFlag[];
  publishedCohorts: PublishedCohort[];
  sources: Array<{
    title: string;
    year: number;
    type: string;
    url: string;
  }>;
  keyReasoningFactors: Array<{
    factor: string;
    weight: 'high' | 'medium' | 'low';
    direction: 'supports' | 'cautions' | 'neutral';
  }>;
}

export interface TreatmentOption {
  id: string;
  name: string;
  benefits: string[];
  risks: string[];
  contraindications: string[];
  comorbidityConsiderations: string[];
  qolImpact: string;
  monitoring: string;
  strength: string;
  evidenceStrength: 'strong' | 'moderate' | 'limited';
  uncertainty: 'low' | 'moderate' | 'high';
  missingData: string[];
  sources: Array<{ title: string; url: string }>;
}

export interface SimilarCase {
  caseId: string;
  isRare?: boolean;
  matchCriteria: Array<{ label: string; matched: boolean }>;
  presentation: string;
  treatmentUsed: string;
  outcome: string;
  source: string;
  matchScore: number;
}

/** Echte klinische Felder aus MSK CHORD, gefiltert auf "vor Start der Erstlinie". */
export interface ClinicalContext {
  sex?: string | null;
  histology?: {
    cancer_type_detailed?: string | null;
    oncotree_code?: string | null;
    icd_o_description?: string | null;
    primary_site?: string | null;
    sample_type?: string | null;
    metastatic_site?: string | null;
  };
  stage?: {
    coarse?: string | null;
    clinical_group?: string | null;
    pathological_group?: string | null;
    registry_path_group?: string | null;
  };
  diagnosis?: {
    days_before_first_line: number;
    description?: string | null;
    source?: string | null;
  } | null;
  ecog?: {
    value: number;
    days_before_first_line: number;
    n_measurements_before: number;
    range_before: [number, number];
  } | null;
  tumor_markers?: Record<string, { unit?: string | null; points: Array<{ days_before_first_line: number; value: number }> }>;
  tumor_sites?: Array<{ site: string; days_before_first_line: number; modality?: string | null; source?: string | null }>;
  events_before_first_line?: { surgeries_before: number; radiation_before: number; progressions_before: number };
  assay?: { msi_score?: number | null; gene_panel?: string | null };
  /** Nur für die Auswertung — nicht vor der Entscheidung anzeigen. */
  outcome?: { os_months?: number | null; os_status?: string | null };
}

export interface StudyCase {
  patient_id: string;
  study_label?: string;
  clinical?: ClinicalContext;
  /** Top-1-Regime des Modells */
  prediction?: string;
  confidence_percent?: number;
  /** Alle Regime-Klassen mit Wahrscheinlichkeit (aus predictions.json) */
  probabilities?: Record<string, number>;
  options: Array<{
    regime?: string;
    rank?: number;
    probability?: number;
    features: Array<{ name: string; value: string; weight?: number; explanation?: string }>;
  }>;
}

export interface DecisionChangeFactor {
  factor: string;
  description: string;
  trigger: string;
  category: string;
}

export interface DecisionFactor {
  category: string;
  description: string;
  impact: string;
}
