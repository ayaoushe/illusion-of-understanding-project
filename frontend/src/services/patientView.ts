/**
 * Baut die Patientenübersicht (Step 1) aus einem Studienfall.
 *
 * ACHTUNG — diese Datei mischt drei Sorten von Daten, und man sieht ihnen das
 * im UI nicht an. Wer hier etwas ändert oder Werte übernimmt, muss wissen,
 * welche Sorte er vor sich hat:
 *
 *   ECHT        aus MSK CHORD, unverändert. Alter, Geschlecht, Stadium,
 *               Histologie, Lokalisation, alle Biomarker, ECOG, Tumorsites.
 *
 *   ABGELEITET  regelbasiert aus echten Werten berechnet. MRN, Subtyp,
 *               ICD-10, Diagnosedatum, Priority, Missing Data. Kein neuer
 *               Inhalt, aber eine Interpretation — die Regel kann falsch sein.
 *
 *   ERFUNDEN    frei erfunden, nur plausibel gemacht. Labor, Komorbiditäten,
 *               Medikation, QoL, Präferenzen, Tag und Monat des Geburtsdatums.
 *               Steht so in keiner Akte. Die betreffenden Stellen sind unten
 *               einzeln markiert.
 *
 * Zwei Regeln, an denen schon Fehler hingen:
 *
 *   1. Zeitliche Trennung. Sichtbar ist nur, was VOR Beginn der Erstlinie
 *      dokumentiert war. Die Organ-Flags des Modells (LIVER, BONE, …) sind
 *      undatiert und bedeuten "jemals im Verlauf" — sie dürfen die Anzeige
 *      nicht steuern. Deshalb kommen Tumorlokalisationen aus den datierten
 *      Registerbefunden und die Metastasierung allein aus dem Stadium.
 *
 *   2. Das pathologische Stadium ist ein Nach-OP-Befund. Es zählt nur, wenn
 *      vor Therapiebeginn tatsächlich operiert wurde (siehe stageAtDecision.ts).
 *
 * Das Modell selbst sieht von alldem nur die 18 Merkmale aus `options[].features`
 * — nichts, was hier zusätzlich berechnet oder erfunden wird.
 */
import type { StudyCase } from '../types';
import { STUDY_NAMES, mrnFromId } from '../config/studyCases';
import { STAGE_AT_DECISION } from '../data/stageAtDecision';

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
  performance: { ecog: number | null; ecogDescription: string; lastAssessed: string };
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

/**
 * ERFUNDEN — erzeugt aus der Patienten-ID eine feste Pseudozufallszahl.
 * Damit werden Tag und Monat von Geburts- und Diagnosedatum gewürfelt, wenn
 * das Register nichts hergibt. Gleiche ID -> gleiches Datum, damit die Anzeige
 * zwischen zwei Aufrufen nicht springt. Diese Tage bedeuten nichts.
 */
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
const DECISION_DATE = '2026-06-18';

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
  // Das Stadium zum Entscheidungszeitpunkt (s. data/stageAtDecision.ts). Das
  // pathologische Stadium der Sample-Datei ist ein Nach-OP-Befund und taugt nur,
  // wenn vor Therapiebeginn überhaupt operiert wurde.
  const operatedBeforeDecision = (clinical.events_before_first_line?.surgeries_before ?? 0) > 0;
  const preciseGroup =
    STAGE_AT_DECISION[c.patient_id]?.group ??
    (operatedBeforeDecision
      ? (clinical.stage?.pathological_group ?? clinical.stage?.registry_path_group ?? null)
      : (clinical.stage?.clinical_group ?? null));
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
  const metastases: MetastasisSite[] = hasContext
    ? documentedSites.map((t) => ({ site: t.site, present: true }))
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
    : [
        {
          type: 'Imaging',
          date: '—',
          findings: 'No tumor sites documented before treatment decision.',
        },
      ];


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

  // ===================================================================
  // ERFUNDEN — ab hier bis zu den Missing Data steht nichts mehr aus dem
  // Register. MSK CHORD enthält kein Routinelabor, keine Komorbiditäten,
  // keine Medikation und keine Präferenzen; für die Studie braucht die
  // Oberfläche aber gefüllte Karten. Erzeugt wird alles aus zwei Schaltern:
  // Alter und Stadium. Keiner dieser Werte darf in eine Auswertung.
  //
  // Echt ist an dieser Stelle nur der Raucherstatus (Modellmerkmal).
  // ===================================================================

  const anemic = ageForLogic >= 70 || isMetastatic;
  const renalReduced = ageForLogic >= 70;
  const labs: LabValue[] = [
    { label: 'Hemoglobin', value: anemic ? '11.4' : '13.1', unit: 'g/dL', status: anemic ? 'LOW' : 'NORMAL', normal: '12.0–16.0' },
    { label: 'Leukocytes', value: '6.4', unit: 'K/µL', status: 'NORMAL', normal: '4.5–11.0' },
    { label: 'LDH', value: isMetastatic ? '312' : '198', unit: 'U/L', status: isMetastatic ? 'ELEVATED' : 'NORMAL', normal: '140–280' },
    { label: 'eGFR', value: renalReduced ? '74' : '92', unit: 'mL/min', status: renalReduced ? 'LOW' : 'NORMAL', normal: '>90' },
  ];
  //
  
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
  if (ageForLogic >= 60) {
    comorbidities.push({
      name: 'Type 2 diabetes mellitus',
      status: 'Controlled',
      implications: 'Monitor glucose, especially under corticosteroid premedication.',
    });
  }
  if (ageForLogic >= 45 && ageForLogic < 60) {
  comorbidities.push({
    name: 'Dyslipidemia',
    status: 'Controlled',
    implications: 'Consider cardiovascular risk during long-term systemic treatment.',
  });
}
  if (comorbidities.length === 0) {
    comorbidities.push({
      name: 'No relevant comorbidities',
      status: '—',
      implications: 'No additional risk-modifying conditions documented.',
    });
  }

  // Mockdaten die nicht im eigentlichen Datenset vorkommen
  const medications: PatientView['medications'] = [];
  if (ageForLogic >= 55) {
    medications.push({ name: 'Ramipril', dose: '5 mg', frequency: 'Daily', relevance: 'Blood pressure control' });
  }
  if (ageForLogic >= 60) {
    medications.push({ name: 'Metformin', dose: '500 mg', frequency: 'Twice daily', relevance: 'Monitor renal function with nephrotoxic agents' });
  }
  if (ageForLogic >= 45 && ageForLogic < 60) {
  medications.push({
    name: 'Atorvastatin',
    dose: '20 mg',
    frequency: 'Daily',
    relevance: 'Lipid management',
  });
}
  medications.push({ name: 'Pantoprazole', dose: '20 mg', frequency: 'Daily', relevance: 'Gastric protection' });
  //

  const contraindications: PatientView['contraindications'] = [];
  if (her2) {
    contraindications.push({
      factor: 'Cardiotoxicity (trastuzumab)',
      severity: 'moderate',
      detail: 'LVEF monitoring required before and during HER2-targeted therapy.',
    });
  }
  if (isSmoker) {
  contraindications.push({
    factor: 'Pulmonary risk',
    severity: 'low',
    detail: 'Smoking history may increase pulmonary complications and should be considered during treatment planning.',
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
  if (contraindications.length === 0) {
  contraindications.push({
    factor: 'No major contraindications identified',
    severity: 'low',
    detail: 'No major treatment-limiting contraindication documented.',
  });
}

  // Mockdaten die nicht im eigentlichen Datenset vorkommen

  const qolConcerns: string[] = ['Maintaining daily functioning'];
  qolConcerns.push(ageForLogic >= 60 ? 'Preserving independence and physical functioning' : 'Continuing to work during treatment');
  if (her2 || !hr) qolConcerns.push('Concern about hair loss and neuropathy from chemotherapy');
  if (hr) qolConcerns.push('Managing menopausal symptoms from endocrine therapy');
  if (isMetastatic) qolConcerns.push('Managing fatigue and overall symptom burden');
  if (isSmoker) qolConcerns.push('Support to stop smoking');

  const patientPreferences = {
    priorityQoL: isMetastatic
      ? 'Prioritizes quality of life and symptom control'
      : 'Willing to tolerate side effects for curative benefit',
    hospitalPreference: ageForLogic >= 60 || isMetastatic
      ? 'Prefers outpatient / minimal hospital stays'
      : 'Flexible; accepts inpatient care if needed',
    familyInvolvement: ageForLogic >= 60 ? 'Adult children involved in decisions' : 'Partner involved in decisions',
  };

  // ===================================================================
  // Ende des erfundenen Teils.
  //
  // ABGELEITET — die Missing-Data-Liste beschreibt echte Lücken des
  // Datensatzes: LVEF, Menopausenstatus, Knochendichte und BRCA sind in
  // MSK CHORD tatsächlich nicht enthalten. Welcher Punkt erscheint, hängt
  // am Rezeptorstatus und am Nodalbefund der Patientin, also an echten
  // Merkmalen. Step 3 führt eine eigene Liste (EvidenceReview.tsx) — die
  // beiden laufen auseinander, das ist noch offen.
  // ===================================================================
  const missingData: string[] = [];

  if (her2 || isMetastatic || nodePos) {
    missingData.push('Baseline LVEF / echocardiogram not yet documented');
  }
  if (hr) {
    missingData.push('Menopausal status not formally confirmed');
    missingData.push('Baseline bone density (DEXA) not assessed');
  }
  if (!hr && !her2) {
    missingData.push('Germline BRCA1/2 testing not yet performed');
  }

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
