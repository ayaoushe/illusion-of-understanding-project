import type { SimilarCase, SimilarNeighbor, StudyCase } from '../types';
import { getAssessmentTreatmentLabel } from '../data/mockData';

/**
 * Übersetzt die vom Modell gefundenen Nachbarfälle (RF-Proximity, siehe
 * ml/pipeline.py → build_similar_cases) in die Darstellung von Step 5.
 *
 * Die Nachbarn stammen aus dem Trainingsset: abgeschlossene Registerfälle,
 * deren Verlauf bekannt ist. Ihr Outcome darf gezeigt werden — das Outcome der
 * Indexpatientin selbst nicht, es wird hier bewusst nirgends gelesen.
 */

/** Reihenfolge der Chips: klinischer Kern zuerst, Messwerte zuletzt. */
const FIELD_ORDER = [
  'HR',
  'HER2',
  'STAGE_HIGHEST_RECORDED',
  'LYMPH_NODES',
  'LIVER',
  'BONE',
  'LUNG',
  'SMOKING_PREDICTIONS_3_CLASSES',
  'MSI_TYPE',
  'CURRENT_AGE_DEID',
  'TMB_NONSYNONYMOUS',
  'TUMOR_PURITY',
];

function criterionLabel(field: string, value: string | number | null): string {
  const v = value === null ? '—' : String(value);
  const yes = v.toLowerCase() === 'yes';
  switch (field) {
    case 'HR':
      return `Hormone receptor ${yes ? 'positive' : 'negative'}`;
    case 'HER2':
      return `HER2 ${yes ? 'positive' : 'negative'}`;
    case 'STAGE_HIGHEST_RECORDED':
      return v;
    case 'LYMPH_NODES':
      return `Lymph nodes ${yes ? 'involved' : 'clear'}`;
    case 'LIVER':
      return yes ? 'Liver involvement' : 'No liver involvement';
    case 'BONE':
      return yes ? 'Bone involvement' : 'No bone involvement';
    case 'LUNG':
      return yes ? 'Lung involvement' : 'No lung involvement';
    case 'SMOKING_PREDICTIONS_3_CLASSES':
      return v.toLowerCase() === 'never' ? 'Never smoked' : `Smoking: ${v}`;
    case 'MSI_TYPE':
      return `MSI ${v.toLowerCase()}`;
    case 'CURRENT_AGE_DEID':
      return `Age ${value === null ? '—' : Math.round(Number(value))}`;
    case 'TMB_NONSYNONYMOUS':
      return `TMB ${value === null ? '—' : Number(value).toFixed(1)} mut/Mb`;
    case 'TUMOR_PURITY':
      return `Tumor purity ${value === null ? 'not reported' : `${Number(value)} %`}`;
    default:
      return `${field}: ${v}`;
  }
}

function presentation(n: SimilarNeighbor): string {
  const f = n.features;
  const age = f.CURRENT_AGE_DEID === null ? '—' : Math.round(Number(f.CURRENT_AGE_DEID));
  const hr = String(f.HR ?? '').toLowerCase() === 'yes' ? 'HR+' : 'HR−';
  const her2 = String(f.HER2 ?? '').toLowerCase() === 'yes' ? 'HER2+' : 'HER2−';
  const nodes = String(f.LYMPH_NODES ?? '').toLowerCase() === 'yes' ? 'nodal involvement' : 'node negative';
  return `Female, ${age}y, ${hr}/${her2}, ${f.STAGE_HIGHEST_RECORDED ?? '—'}, ${nodes}`;
}

function outcomeText(n: SimilarNeighbor): string {
  const status = n.os_status.includes('DECEASED') ? 'deceased' : 'alive at last follow-up';
  if (n.os_months === null) return `Follow-up not recorded, ${status}`;
  return `${n.os_months.toFixed(0)} months overall survival, ${status}`;
}

export function buildSimilarCases(c: StudyCase): SimilarCase[] {
  const neighbors = c.similar_cases ?? [];
  return neighbors.map((n) => {
    const matched = new Set(n.matched_fields);
    const criteria = FIELD_ORDER.filter((f) => f in n.features)
      .map((f) => ({ label: criterionLabel(f, n.features[f]), matched: matched.has(f) }))
      .sort((a, b) => Number(b.matched) - Number(a.matched));

    return {
      caseId: `Registry case ${n.patient_id}`,
      isCounterfactual: Boolean(n.is_counterfactual),
      matchScore: n.match_percent,
      matchCriteria: criteria,
      presentation: presentation(n),
      treatmentUsed: getAssessmentTreatmentLabel(n.regime),
      outcome: outcomeText(n),
      source: 'MSK CHORD — training cohort',
    };
  });
}
