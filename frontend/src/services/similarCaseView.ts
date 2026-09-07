import type { SimilarCase, SimilarNeighbor, StudyCase } from '../types';
import { getAssessmentTreatmentLabel } from '../data/mockData';

/**
 * Übersetzt die vom Modell gefundenen Nachbarfälle (RF-Proximity, siehe
 * ml/pipeline.py → build_similar_cases) in die Darstellung von Step 5.
 *
 * Die Nachbarn stammen aus dem Trainingsset: abgeschlossene Registerfälle,
 * deren Verlauf bekannt ist. Ihr Outcome darf gezeigt werden — das Outcome der
 * Indexpatientin selbst nicht, es wird hier bewusst nirgends gelesen.
 *
 * WICHTIG: Die Pipeline kennt zur Build-Zeit nur die AI-Empfehlung
 * (c.prediction), nicht die tatsächliche Arzt-Wahl — die trifft der Arzt erst
 * live in Step 2 (HumanAssessment → assessment.selectedTreatment). Deshalb
 * liefert c.similar_cases nur noch einen nach Regime gruppierten Pool
 * (Top 2 Nachbarn je vorkommendem Regime) plus die Referenzkarte für den
 * aktuellen Fall. Die eigentliche Auswahl von genau 5 Karten — aktueller Fall,
 * "supports AI", "supports doctor", 2x "supports neither" — passiert erst
 * hier, sobald die Arzt-Wahl bekannt ist.
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

type CardRelation = 'current' | 'supporting_ai' | 'supporting_doctor' | 'not_supporting';

/** Human-readable label + short explanation shown on the card badge, per assigned relation. */
const RELATION_INFO: Record<CardRelation, { label: string; description: string }> = {
  current: {
    label: 'Current patient',
    description: 'The patient under review shown for reference.',
  },
  supporting_ai: {
    label: 'Same treatment as AI recommendation',
    description: 'This registry case received the same regimen the model currently recommends.',
  },
  supporting_doctor: {
    label: "Same treatment as your choice",
    description: "This registry case received the same regimen the treating doctor actually chose.",
  },
  not_supporting: {
    label: 'Different treatment from both',
    description: "This registry case's regimen matches neither the AI recommendation nor the doctor's choice.",
  },
};

/** Converts one raw feature value into the human-readable chip label shown per criterion. */

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

/** Short line of a neighbor case for the card header. */

function presentation(n: SimilarNeighbor): string {
  const f = n.features;
  const age = f.CURRENT_AGE_DEID === null ? '—' : Math.round(Number(f.CURRENT_AGE_DEID));
  const hr = String(f.HR ?? '').toLowerCase() === 'yes' ? 'HR+' : 'HR−';
  const her2 = String(f.HER2 ?? '').toLowerCase() === 'yes' ? 'HER2+' : 'HER2−';
  const nodes = String(f.LYMPH_NODES ?? '').toLowerCase() === 'yes' ? 'nodal involvement' : 'node negative';
  return `Female, ${age}y, ${hr}/${her2}, ${f.STAGE_HIGHEST_RECORDED ?? '—'}, ${nodes}`;
}

/** Formats a neighbor's real registry outcome */
function outcomeText(n: SimilarNeighbor): string {
  if (n.relation === 'current' || n.os_status === null) return 'Not yet known';
  const status = n.os_status.includes('DECEASED') ? 'deceased' : 'alive at last follow-up';
  if (n.os_months === null) return `Follow-up not recorded, ${status}`;
  return `${n.os_months.toFixed(0)} months overall survival, ${status}`;
}

/** Best (highest match_percent) pool entry carrying `regime`, excluding already-used patients. */
function bestMatchForRegime(
  pool: SimilarNeighbor[],
  regime: string | null,
  excludedIds: Set<string>,
): SimilarNeighbor | null {
  if (!regime) return null;
  let best: SimilarNeighbor | null = null;
  for (const n of pool) {
    if (n.regime !== regime || excludedIds.has(n.patient_id)) continue;
    if (!best || (n.match_percent ?? 0) > (best.match_percent ?? 0)) best = n;
  }
  return best;
}

/**
 * Builds the 5 Similar Cases cards: the current patient (reference), the best
 * registry match supporting the AI's top-1 recommendation, the best match
 * supporting the doctor's actual chosen treatment, and the 2 best matches
 * supporting neither.
 *
 * @param c StudyCase as returned by the backend.
 * @param doctorRegime The doctor's chosen treatment from Step 2
 *   (assessment.selectedTreatment) — unknown to the backend at build time,
 *   so it must be passed in here once available.
 */
export function buildSimilarCases(c: StudyCase, doctorRegime: string | null = null): SimilarCase[] {
  const neighbors = c.similar_cases ?? [];
  const current = neighbors.find((n) => n.relation === 'current') ?? null;
  const pool = neighbors.filter((n) => n.relation !== 'current');
  const aiRegime = c.prediction ?? null;

  const usedIds = new Set<string>();

  let aiCandidate = bestMatchForRegime(pool, aiRegime, usedIds);
  if (aiCandidate) usedIds.add(aiCandidate.patient_id);

  let doctorCandidate = bestMatchForRegime(pool, doctorRegime, usedIds);
  if (doctorCandidate) usedIds.add(doctorCandidate.patient_id);

  // Fallback, falls im Trainingsset kein Nachbar mit exakt diesem Regime existiert
  // (z. B. eine Behandlungsoption, die in der Kohorte nie vorkam): nächstbester
  // noch unbenutzter Match, statt die Karte leer zu lassen.
  if (!aiCandidate) {
    aiCandidate = pool.find((n) => !usedIds.has(n.patient_id)) ?? null;
    if (aiCandidate) usedIds.add(aiCandidate.patient_id);
  }
  if (!doctorCandidate) {
    doctorCandidate = pool.find((n) => !usedIds.has(n.patient_id)) ?? null;
    if (doctorCandidate) usedIds.add(doctorCandidate.patient_id);
  }

  const notSupporting = pool
    .filter((n) => !usedIds.has(n.patient_id) && n.regime !== aiRegime && n.regime !== doctorRegime)
    .sort((a, b) => (b.match_percent ?? 0) - (a.match_percent ?? 0))
    .slice(0, 2);
  notSupporting.forEach((n) => usedIds.add(n.patient_id));
  if (notSupporting.length < 2) {
    for (const n of pool) {
      if (notSupporting.length >= 2) break;
      if (usedIds.has(n.patient_id)) continue;
      notSupporting.push(n);
      usedIds.add(n.patient_id);
    }
  }

  const selected: { neighbor: SimilarNeighbor; relation: CardRelation }[] = [];
  if (current) selected.push({ neighbor: current, relation: 'current' });
  if (aiCandidate) selected.push({ neighbor: aiCandidate, relation: 'supporting_ai' });
  if (doctorCandidate) selected.push({ neighbor: doctorCandidate, relation: 'supporting_doctor' });
  notSupporting.forEach((n) => selected.push({ neighbor: n, relation: 'not_supporting' }));

  return selected.map(({ neighbor: n, relation }) => {
    const matched = new Set(n.matched_fields);
    const isCurrent = relation === 'current';
    const criteria = FIELD_ORDER.filter((f) => f in n.features).map((f) => ({
      label: criterionLabel(f, n.features[f]),
      
      matched: isCurrent ? true : matched.has(f),
    }));
    if (!isCurrent) {
      criteria.sort((a, b) => Number(b.matched) - Number(a.matched));
    }

    return {
      caseId: isCurrent ? 'Current patient' : `Patient Case ${n.patient_id}`,
      relation,
      relationLabel: RELATION_INFO[relation].label,
      relationDescription: RELATION_INFO[relation].description,
      matchScore: n.match_percent,
      matchCriteria: criteria,
      presentation: presentation(n),
      treatmentUsed: isCurrent || !n.regime ? 'Not yet decided' : getAssessmentTreatmentLabel(n.regime),
      outcome: outcomeText(n),
      source: 'MSK CHORD — training cohort',
    };
  });
}