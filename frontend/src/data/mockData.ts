import type { Patient, WorkflowStep } from '../types';
import { STUDY_NAMES, mrnFromId } from '../config/studyCases';

/**
 * Statische Stammdaten der Anwendung.
 *
 * Die frühere NSCLC-Demo (Max Mustermann, Osimertinib-Evidenz, FLAURA-Kohorten,
 * Lungen-Vergleichsfälle) ist entfernt — sie passte nicht mehr zum Mamma-Ca-
 * Setting und war eine Fehlerquelle. Alles Fallbezogene kommt heute aus
 * study_cases.json über services/patientView.ts, services/treatmentEvidence.ts
 * und services/similarCaseView.ts.
 */

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

/** Fallback, falls die Uhrzeit des Rechners nicht lesbar ist. */
const SESSION_DEFAULT_DATE = '2026-06-18';

function today(): string {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return SESSION_DEFAULT_DATE;
  }
}

/** Sitzungsrahmen für Kopf- und Fußzeile; das Datum ist immer der heutige Tag. */
export const sessionContext: Patient['session'] = {
  clinician: 'Dr. A. Petrov, MD — Oncology',
  date: today(),
  time: '09:00',
  version: 'OncoCDSS v2.1',
};

/** Echtes Alter der vier Studienfälle (CURRENT_AGE_DEID aus MSK CHORD). */
const AGE_BY_PATIENT: Record<string, number> = {
  'P-0001568': 63,
  'P-0000081': 50,
  'P-0002566': 73,
  'P-0001862': 41,
};

/**
 * Minimalprofil für Sidebar und Fallauswahl: Name, Aktenzeichen, Alter.
 * Die vollständige Fallansicht baut services/patientView.ts aus study_cases.json.
 */
export function getPatientProfile(patientId: string | null | undefined): Patient {
  const id = patientId ?? '';
  const age = AGE_BY_PATIENT[id];

  return {
    name: STUDY_NAMES[id] ?? 'No patient selected',
    mrn: id ? mrnFromId(id) : '—',
    dateOfBirth: age ? `${2026 - age}` : '—',
    age: age ?? 0,
    gender: 'Female',
    priority: 'MODERATE',
    diagnosis: {
      primaryDiagnosis: id ? 'Breast cancer' : '—',
      stage: '—',
      histology: '—',
      location: '—',
      icd10: '—',
      diagnosisDate: '—',
    },
    performance: { ecog: 0, ecogDescription: '—', lastAssessed: '—' },
    imaging: [],
    labs: {},
    comorbidities: [],
    medications: [],
    contraindications: [],
    qolConcerns: [],
    patientPreferences: { priorityQoL: '—', hospitalPreference: '—', familyInvolvement: '—' },
    missingData: [],
    session: sessionContext,
  };
}
