import type { StudyCase } from '../types';
import { STUDY_NAMES, mrnFromId } from '../config/studyCases';
import { buildMissingData } from './missingData';
import { sessionContext } from '../data/mockData';
import { SIMULATED_WORKUP } from '../data/simulatedWorkup';

export interface Biomarker {
  label: string;
  value: string;
  real: boolean;
}

export interface MetastasisSite {
  site: string;
  present: boolean;
  /**
   * true = kein Registerbefund, sondern simulierte Staging-Diagnostik.
   * Bewusst NICHT im UI dargestellt: ein sichtbarer "simulated"-Hinweis nur bei
   * einem der Fälle wäre ein Störfaktor für die Vertrauensmessung. Die
   * Herkunft steht in data/simulatedWorkup.ts und im Provenienz-Artefakt.
   */
  simulated?: boolean;
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
  performance: { ecog: number | null; ecogDescription: string; lastAssessed: string };
  biomarkers: Biomarker[];
  metastases: MetastasisSite[];
  labs: LabValue[];
  imaging: Array<{ type: string; date: string; findings: string; simulated?: boolean }>;
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

function hashInt(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * Bezugsdatum der Fallansicht: der Tag, an dem über die Erstlinie entschieden
 * wird. Die Rohdaten liefern nur Tagesabstände dazu, daraus werden hier
 * darstellbare Datumsangaben.
 */
const DECISION_DATE = sessionContext.date;

function dateBefore(days: number): string {
  const d = new Date(`${DECISION_DATE}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const ECOG_TEXT: Record<number, string> = {
  0: 'Fully active, no restriction',
  1: 'Restricted in strenuous activity, ambulatory',
  2: 'Ambulatory, up more than 50% of waking hours',
  3: 'Limited self-care, confined to bed or chair over 50% of waking hours',
  4: 'Completely disabled, no self-care',
};

/** "… (M8500/3 | C508)" -> "C50.8" */
function icdFromIcdO(description: string | null | undefined): string | null {
  const match = description?.match(/C(\d{2})(\d)/);
  return match ? `C${match[1]}.${match[2]}` : null;
}

/** "INFILTRATING DUCT CARCINOMA | BREAST, UIQ (M8500/3 | C502)" -> "Breast, UIQ" */
function locationFromIcdO(description: string | null | undefined): string | null {
  if (!description) return null;
  const site = description.split('|')[1]?.split('(')[0]?.trim();
  if (!site) return null;
  return site
    .toLowerCase()
    .replace(/\bnos\b/, 'not otherwise specified')
    .replace(/\buiq\b/, 'upper outer quadrant')
    .replace(/^\w/, (m) => m.toUpperCase());
}

export function buildPatientView(c: StudyCase): PatientView {
  const f = featureMap(c);
  const clinical = c.clinical ?? {};
  const ageNum = parseInt(f.CURRENT_AGE_DEID ?? '', 10);
  const age = Number.isFinite(ageNum) ? String(ageNum) : '—';
  const birthYear = Number.isFinite(ageNum) ? 2026 - ageNum : 1970;
  // Registerangabe ist genauer als das grobe "Stage 1-3" des Modell-Merkmals.
  const preciseGroup = clinical.stage?.pathological_group ?? clinical.stage?.registry_path_group ?? null;
  const stage = preciseGroup ? `Stage ${preciseGroup}` : (f.STAGE_HIGHEST_RECORDED ?? 'unknown');
  // Die Organ-Flags in MSK CHORD bedeuten "jemals dokumentierte Beteiligung",
  // nicht "aktuell metastasiert". Nur das Stadium entscheidet über M1.
  const isMetastatic = stage.includes('4');
  const her2 = yesNo(f.HER2);
  const hr = yesNo(f.HR);
  const smokerRaw = f.SMOKING_PREDICTIONS_3_CLASSES ?? '';
  const isSmoker = smokerRaw.toLowerCase().includes('smoker');

  const mrn = mrnFromId(c.patient_id);

  // Bevorzugt die datierten Befunde aus dem Register; die Organ-Flags des
  // Modells sind nur der Rückfall, wenn kein Kontext geladen ist.
  const hasContext = Boolean(c.clinical);
  const documentedSites = clinical.tumor_sites ?? [];
  // Nur wenn das Register vor Therapiestart nichts hergibt: simulierte
  // Staging-Diagnostik, sofern für diesen Fall hinterlegt (s. simulatedWorkup.ts).
  const workup = documentedSites.length ? undefined : SIMULATED_WORKUP[c.patient_id];
  const metastases: MetastasisSite[] = hasContext
    ? documentedSites.length
      ? documentedSites.map((t) => ({ site: t.site, present: true }))
      : (workup?.sites ?? []).map((site) => ({ site, present: true, simulated: true }))
    : METASTASIS_SITES.map(([key, label]) => ({ site: label, present: yesNo(f[key]) }));
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
    {
      label: 'MSI status',
      value: clinical.assay?.msi_score != null
        ? `${f.MSI_TYPE ?? '—'} (score ${clinical.assay.msi_score})`
        : (f.MSI_TYPE ?? '—'),
      real: true,
    },
    { label: 'Tumor purity', value: f.TUMOR_PURITY ? `${f.TUMOR_PURITY} %` : '—', real: true },
    { label: 'Smoking status', value: isSmoker ? 'Former/current smoker' : 'Never smoked', real: true },
  ];

  // Aus den datierten Registerbefunden; ohne Kontext bleibt der alte Platzhalter.
  const imaging = documentedSites.length
    ? documentedSites.map((t) => ({
        type: t.modality ? `${t.modality} — ${t.site}` : `Imaging — ${t.site}`,
        date: dateBefore(t.days_before_first_line),
        findings: `Tumor involvement documented at ${t.site.toLowerCase()}${t.source ? ` (${t.source})` : ''}.`,
      }))
    : (workup?.imaging ?? []).map((e) => ({
        type: e.type,
        date: dateBefore(e.daysBefore),
        findings: e.findings,
        simulated: true,
      }));


  const ageForLogic = Number.isFinite(ageNum) ? ageNum : 55;
  const nodePos = yesNo(f.LYMPH_NODES);
  const h = hashInt(c.patient_id);

  // HER2-enriched setzt HR-negativ voraus; HR+/HER2+ ist luminal B.
  const subtype = her2
    ? hr
      ? 'luminal B (HR+/HER2+)'
      : 'HER2-enriched (HR−/HER2+)'
    : hr
      ? 'luminal (HR+/HER2−)'
      : 'triple-negative';

  const locations = [
    'Left breast, upper outer quadrant',
    'Right breast, upper outer quadrant',
    'Left breast, lower inner quadrant',
    'Right breast, central / retroareolar',
  ];
  const location = locations[h % locations.length];
  // Der Registertext trägt Topografie und ICD-O-Code: "… | BREAST, UIQ (M8500/3 | C502)"
  const registryText = clinical.diagnosis?.description ?? null;
  const icdCode = icdFromIcdO(registryText);
  const dxMonth = String((h % 12) + 1).padStart(2, '0');
  const dxDay = String((h % 27) + 1).padStart(2, '0');
  const dobMonth = String(((h >> 5) % 12) + 1).padStart(2, '0');
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

  // Gemeinsame Quelle mit dem Evidenz-Tab in Step 3 (services/missingData.ts).
  const missingData = buildMissingData({
    hr,
    her2,
    nodes: nodePos,
    hasEcog: Boolean(clinical.ecog),
  }).map((m) => m.item);

  return {
    patientId: c.patient_id,
    name: STUDY_NAMES[c.patient_id] ?? c.patient_id,
    mrn,
    dateOfBirth: `${birthYear}-${dobMonth}-${dobDay}`,
    age,
    gender: clinical.sex ?? 'Female',
    priority: isMetastatic ? 'HIGH' : 'MODERATE',
    diagnosis: {
      primaryDiagnosis: clinical.histology?.cancer_type_detailed ?? 'Breast cancer',
      stage,
      histology: `${clinical.histology?.icd_o_description ?? 'Invasive ductal carcinoma'}, ${subtype}`,
      location: locationFromIcdO(registryText) ?? location,
      icd10: icdCode ?? 'C50.9',
      diagnosisDate: clinical.diagnosis
        ? dateBefore(clinical.diagnosis.days_before_first_line)
        : `2024-${dxMonth}-${dxDay}`,
    },
    performance: {
      // Vor dem Entscheidungszeitpunkt liegt in MSK CHORD kein ECOG vor;
      // dann bleibt das Feld leer, statt eine Zahl zu erfinden.
      ecog: clinical.ecog?.value ?? null,
      ecogDescription: clinical.ecog
        ? ECOG_TEXT[clinical.ecog.value] ?? '—'
        : 'Not documented before treatment decision',
      lastAssessed: clinical.ecog ? dateBefore(clinical.ecog.days_before_first_line) : '—',
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
