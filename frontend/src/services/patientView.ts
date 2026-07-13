import type { StudyCase } from '../types';
import { STUDY_NAMES, mrnFromId } from '../config/studyCases';

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

/** Deterministischer Hash aus einem String (stabil über Reloads). */
function hashInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function buildPatientView(c: StudyCase): PatientView {
  const f = featureMap(c);
  const ageNum = parseInt(f.CURRENT_AGE_DEID ?? '', 10);
  const age = Number.isFinite(ageNum) ? String(ageNum) : '—';
  const birthYear = Number.isFinite(ageNum) ? 2026 - ageNum : 1970;
  const stage = f.STAGE_HIGHEST_RECORDED ?? 'unknown';
  // Distant metastasis in any site => treat as metastatic (the recorded stage
  // string may still read "Stage 1-3" in the raw data).
  const hasDistantMets = METASTASIS_SITES.some(([key]) => yesNo(f[key]));
  const isMetastatic = stage.includes('4') || hasDistantMets;
  const her2 = yesNo(f.HER2);
  const hr = yesNo(f.HR);
  const smokerRaw = f.SMOKING_PREDICTIONS_3_CLASSES ?? '';
  const isSmoker = smokerRaw.toLowerCase().includes('smoker');

  const mrn = mrnFromId(c.patient_id);

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

  // --- From here on: placeholders, but derived deterministically from the
  //     real features so each of the 4 patients differs. ---

  const ageForLogic = Number.isFinite(ageNum) ? ageNum : 55;
  const nodePos = yesNo(f.LYMPH_NODES);
  const h = hashInt(c.patient_id);

  // Molecular subtype from real HER2/HR — drives histology label.
  const subtype = her2 ? 'HER2-enriched' : hr ? 'luminal (HR+/HER2−)' : 'triple-negative';

  const locations = [
    'Left breast, upper outer quadrant',
    'Right breast, upper outer quadrant',
    'Left breast, lower inner quadrant',
    'Right breast, central / retroareolar',
  ];
  const location = locations[h % locations.length];
  const dxMonth = String((h % 12) + 1).padStart(2, '0');
  const dxDay = String((h % 27) + 1).padStart(2, '0');
  const dobDay = String(((h >> 3) % 27) + 1).padStart(2, '0');

  const anemic = ageForLogic >= 70 || isMetastatic;
  const renalReduced = ageForLogic >= 70;
  const labs: LabValue[] = [
    { label: 'Hemoglobin', value: anemic ? '11.4' : '13.1', unit: 'g/dL', status: anemic ? 'LOW' : 'NORMAL', normal: '12.0–16.0' },
    { label: 'Leukocytes', value: '6.4', unit: 'K/µL', status: 'NORMAL', normal: '4.5–11.0' },
    { label: 'LDH', value: isMetastatic ? '312' : '198', unit: 'U/L', status: isMetastatic ? 'ELEVATED' : 'NORMAL', normal: '140–280' },
    { label: 'eGFR', value: renalReduced ? '74' : '92', unit: 'mL/min', status: renalReduced ? 'LOW' : 'NORMAL', normal: '>90' },
  ];

  const comorbidities: PatientView['comorbidities'] = [];
  if (isSmoker) {
    comorbidities.push({
      name: 'Tobacco use',
      status: 'Former/current',
      implications: 'Consider increased cardiovascular and pulmonary risk.',
    });
  }
  if (ageForLogic >= 60) {
    comorbidities.push({
      name: 'Arterial hypertension',
      status: 'Controlled',
      implications: 'Monitor blood pressure during systemic therapy.',
    });
  }
  if (ageForLogic >= 68) {
    comorbidities.push({
      name: 'Type 2 diabetes mellitus',
      status: 'Controlled',
      implications: 'Monitor glucose, especially under corticosteroid premedication.',
    });
  }
  if (comorbidities.length === 0) {
    comorbidities.push({
      name: 'No relevant comorbidities',
      status: '—',
      implications: 'No additional risk-modifying conditions documented.',
    });
  }

  const medications: PatientView['medications'] = [];
  if (ageForLogic >= 60) {
    medications.push({ name: 'Ramipril', dose: '5 mg', frequency: 'Daily', relevance: 'Blood pressure control' });
  }
  if (ageForLogic >= 68) {
    medications.push({ name: 'Metformin', dose: '500 mg', frequency: 'Twice daily', relevance: 'Monitor renal function with nephrotoxic agents' });
  }
  medications.push({ name: 'Pantoprazole', dose: '20 mg', frequency: 'Daily', relevance: 'Gastric protection' });

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
  if (!her2 && !hr) {
    contraindications.push({
      factor: 'Endocrine / HER2-targeted therapy',
      severity: 'low',
      detail: 'Triple-negative subtype — hormonal and anti-HER2 agents not applicable.',
    });
  }
  if (renalReduced) {
    contraindications.push({
      factor: 'Nephrotoxic agents',
      severity: 'moderate',
      detail: 'Reduced eGFR — dose adjustment for renally cleared drugs may apply.',
    });
  }

  const qolConcerns: string[] = ['Maintaining daily functioning'];
  qolConcerns.push(ageForLogic >= 65 ? 'Preserving independence at home' : 'Continuing to work during treatment');
  if (her2 || !hr) qolConcerns.push('Concern about hair loss and neuropathy from chemotherapy');
  if (hr) qolConcerns.push('Menopausal symptoms from endocrine therapy');
  if (isMetastatic) qolConcerns.push('Managing fatigue and overall symptom burden');
  if (isSmoker) qolConcerns.push('Support to stop smoking');

  const patientPreferences = {
    priorityQoL: isMetastatic
      ? 'Prioritizes quality of life and symptom control'
      : 'Willing to tolerate side effects for curative benefit',
    hospitalPreference: ageForLogic >= 70 || isMetastatic
      ? 'Prefers outpatient / minimal hospital stays'
      : 'Flexible; accepts inpatient care if needed',
    familyInvolvement: ageForLogic >= 65 ? 'Adult children involved in decisions' : 'Partner involved in decisions',
  };

  const missingData: string[] = [];
  if (her2) missingData.push('LVEF (baseline cardiac function) not yet documented');
  missingData.push('Ki-67 proliferation index pending');
  if (hr && !isMetastatic) missingData.push('Genomic recurrence score (Oncotype/MammaPrint) outstanding');
  if (isMetastatic) missingData.push('Biopsy re-confirmation of receptor status at metastatic site pending');
  if (nodePos) missingData.push('Axillary staging (sentinel vs. dissection) to be finalized');
  if (isSmoker) missingData.push('Pulmonary function assessment pending');

  return {
    patientId: c.patient_id,
    name: STUDY_NAMES[c.patient_id] ?? c.patient_id,
    mrn,
    dateOfBirth: `${birthYear}-${dxMonth}-${dobDay}`,
    age,
    gender: 'Female',
    priority: isMetastatic ? 'HIGH' : 'MODERATE',
    diagnosis: {
      primaryDiagnosis: 'Breast cancer',
      stage,
      histology: `Invasive ductal carcinoma, ${subtype}`,
      location,
      icd10: 'C50.9',
      diagnosisDate: `2024-${dxMonth}-${dxDay}`,
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
    qolConcerns,
    patientPreferences,
    missingData,
  };
}
