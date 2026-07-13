import type { StudyCase } from '../types';
import { STUDY_NAMES } from '../config/studyCases';

/**
 * Builds a patient view for the Overview from a study case (ML prediction).
 * Values that really exist in the data (model features) are taken over as-is;
 * everything else is filled with plausible, deterministic placeholders
 * (breast-cancer context).
 */

export interface Biomarker {
  label: string;
  value: string;
  real: boolean;
}

export interface MetastasisSite {
  site: string;
  present: boolean;
}

export interface LabValue {
  label: string;
  value: string;
  unit: string;
  status: 'NORMAL' | 'LOW' | 'ELEVATED';
  normal: string;
}

export interface PatientView {
  patientId: string;
  name: string;
  mrn: string;
  dateOfBirth: string;
  age: string;
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
  performance: { ecog: number; ecogDescription: string; lastAssessed: string };
  biomarkers: Biomarker[];
  metastases: MetastasisSite[];
  labs: LabValue[];
  imaging: Array<{ type: string; date: string; findings: string }>;
  comorbidities: Array<{ name: string; status: string; implications: string }>;
  medications: Array<{ name: string; dose: string; frequency: string; relevance: string }>;
  contraindications: Array<{ factor: string; severity: 'high' | 'moderate' | 'low'; detail: string }>;
  qolConcerns: string[];
  patientPreferences: { priorityQoL: string; hospitalPreference: string; familyInvolvement: string };
  missingData: string[];
}

/** Feature-Name -> Wert des Patienten (über alle Optionen zusammengeführt). */
export function featureMap(c: StudyCase): Record<string, string> {
  const map: Record<string, string> = {};
  for (const opt of c.options) {
    for (const f of opt.features) {
      if (!(f.name in map)) map[f.name] = f.value;
    }
  }
  return map;
}

const METASTASIS_SITES: Array<[string, string]> = [
  ['BONE', 'Bone'],
  ['LIVER', 'Liver'],
  ['LUNG', 'Lung'],
  ['CNS_BRAIN', 'CNS / Brain'],
  ['PLEURA', 'Pleura'],
  ['ADRENAL_GLANDS', 'Adrenal glands'],
  ['REPRODUCTIVE_ORGANS', 'Reproductive organs'],
  ['INTRA_ABDOMINAL', 'Intra-abdominal'],
  ['OTHER', 'Other'],
];

function yesNo(v: string | undefined): boolean {
  return (v ?? '').toLowerCase() === 'yes';
}

export function buildPatientView(c: StudyCase): PatientView {
  const f = featureMap(c);
  const ageNum = parseInt(f.CURRENT_AGE_DEID ?? '', 10);
  const age = Number.isFinite(ageNum) ? String(ageNum) : '—';
  const birthYear = Number.isFinite(ageNum) ? 2026 - ageNum : 1970;
  const stage = f.STAGE_HIGHEST_RECORDED ?? 'unbekannt';
  const isMetastatic = stage.includes('4');
  const her2 = yesNo(f.HER2);
  const hr = yesNo(f.HR);
  const smokerRaw = f.SMOKING_PREDICTIONS_3_CLASSES ?? '';
  const isSmoker = smokerRaw.toLowerCase().includes('smoker');

  // MRN plausibel aus der ID ableiten (deterministisch).
  const digits = c.patient_id.replace(/\D/g, '');
  const mrn = `${digits.slice(0, 4)}-${digits.slice(4)}`;

  const metastases: MetastasisSite[] = METASTASIS_SITES.map(([key, label]) => ({
    site: label,
    present: yesNo(f[key]),
  }));
  const activeMets = metastases.filter((m) => m.present).map((m) => m.site);

  const biomarkers: Biomarker[] = [
    { label: 'HER2', value: her2 ? 'Positive' : 'Negative', real: true },
    { label: 'Hormone receptor (HR)', value: hr ? 'Positive' : 'Negative', real: true },
    { label: 'Stage', value: stage, real: true },
    { label: 'Lymph nodes', value: yesNo(f.LYMPH_NODES) ? 'Involved' : 'Clear', real: true },
    {
      label: 'TMB (nonsynonymous)',
      value: f.TMB_NONSYNONYMOUS ? `${Number(f.TMB_NONSYNONYMOUS).toFixed(1)} mut/Mb` : '—',
      real: true,
    },
    { label: 'MSI status', value: f.MSI_TYPE ?? '—', real: true },
    { label: 'Tumor purity', value: f.TUMOR_PURITY ? `${f.TUMOR_PURITY} %` : '—', real: true },
    { label: 'Smoking status', value: isSmoker ? 'Former/current smoker' : 'Never smoked', real: true },
  ];

  // Imaging: generated from the real metastasis sites (plausible).
  const imaging = [
    {
      type: 'CT chest/abdomen',
      date: '2025-03-18',
      findings:
        activeMets.length > 0
          ? `Metastases detected: ${activeMets.join(', ')}.`
          : 'No distant metastases detected.',
    },
    {
      type: 'Mammography / ultrasound',
      date: '2024-11-02',
      findings: `Primary breast tumor${yesNo(f.LYMPH_NODES) ? ' with axillary lymph node involvement' : ''}.`,
    },
  ];

  // --- From here on: plausible placeholders (not present in the raw data) ---

  const labs: LabValue[] = [
    { label: 'Hemoglobin', value: '12.6', unit: 'g/dL', status: 'NORMAL', normal: '12.0–16.0' },
    { label: 'Leukocytes', value: '6.4', unit: 'K/µL', status: 'NORMAL', normal: '4.5–11.0' },
    { label: 'LDH', value: isMetastatic ? '312' : '198', unit: 'U/L', status: isMetastatic ? 'ELEVATED' : 'NORMAL', normal: '140–280' },
    { label: 'eGFR', value: '88', unit: 'mL/min', status: 'NORMAL', normal: '>90' },
  ];

  const comorbidities = [
    {
      name: isSmoker ? 'Tobacco use' : 'No tobacco use',
      status: isSmoker ? 'Former/current' : 'Never',
      implications: isSmoker
        ? 'Consider increased cardiovascular and pulmonary risk.'
        : 'No smoking-related additional risk.',
    },
    {
      name: 'Arterial hypertension',
      status: 'Controlled',
      implications: 'Monitor blood pressure during systemic therapy.',
    },
  ];

  const medications = [
    { name: 'Ramipril', dose: '5 mg', frequency: 'Daily', relevance: 'Blood pressure control' },
    { name: 'Pantoprazole', dose: '20 mg', frequency: 'Daily', relevance: 'Gastric protection' },
  ];

  const contraindications: PatientView['contraindications'] = [];
  if (her2) {
    contraindications.push({
      factor: 'Cardiotoxicity (trastuzumab)',
      severity: 'moderate',
      detail: 'LVEF monitoring required before and during HER2-targeted therapy.',
    });
  }
  if (isMetastatic) {
    contraindications.push({
      factor: 'Curative-intent local therapy',
      severity: 'moderate',
      detail: 'Metastatic stage — systemic treatment approach takes priority.',
    });
  }

  return {
    patientId: c.patient_id,
    name: STUDY_NAMES[c.patient_id] ?? c.patient_id,
    mrn,
    dateOfBirth: `${birthYear}-05-14`,
    age,
    gender: 'Female',
    priority: isMetastatic ? 'HIGH' : 'MODERATE',
    diagnosis: {
      primaryDiagnosis: 'Breast cancer',
      stage,
      histology: 'Invasive ductal carcinoma (NST)',
      location: 'Left breast, upper outer quadrant',
      icd10: 'C50.9',
      diagnosisDate: '2024-10-28',
    },
    performance: {
      ecog: isMetastatic ? 1 : 0,
      ecogDescription: isMetastatic ? 'Restricted activity' : 'Fully active, no restriction',
      lastAssessed: '2025-03-20',
    },
    biomarkers,
    metastases,
    labs,
    imaging,
    comorbidities,
    medications,
    contraindications,
    qolConcerns: [
      'Maintaining daily functioning',
      'Concern about hair loss and neuropathy',
      'Family support important',
    ],
    patientPreferences: {
      priorityQoL: 'Balance of efficacy and quality of life',
      hospitalPreference: 'Prefers outpatient treatment where possible',
      familyInvolvement: 'Partner involved in decisions',
    },
    missingData: [
      'LVEF (baseline cardiac function) not yet documented',
      'Ki-67 proliferation index pending',
      'Genomic recurrence score (if indicated) outstanding',
    ],
  };
}
