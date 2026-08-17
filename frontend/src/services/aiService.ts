/**
 * Liefert die AI Evidence Synthesis (Step 3) zur Therapiewahl des Arztes.
 *
 * WICHTIG — `mockTreatmentEvidenceById` ist trotz des Namens KEIN toter
 * Mock-Code, sondern die produktive Evidenzquelle dieser Anwendung. Dort
 * liegen die zehn Regime-Profile mit Evidence For/Against, Risk Flags,
 * Missing Data, Published Cohorts und Quellen. Nicht loeschen.
 *
 * Was daran fallbezogen ist und was nicht:
 *
 *   pro REGIME      alles aus dem Profil - Evidenztexte, Risk Flags, Kohorten,
 *                   Quellen. Fuer alle vier Patientinnen identisch.
 *   pro PATIENTIN   nur die Modellwahrscheinlichkeit, die
 *                   buildModelPredictionEvidence() aus study_cases.json liest.
 *
 * Wer den Fallbezug erweitern will, setzt dort an - nicht in den Profilen.
 *
 * Reihenfolge: liegt VITE_API_BASE_URL vor, wird der Backend-Endpunkt gefragt
 * und seine Antwort ueber das Profil gelegt; ohne die Variable laeuft alles
 * rein im Frontend. Faellt der Endpunkt aus, greift ebenfalls das Profil.
 */
import type { HumanAssessment, AiEvidenceSynthesis, EvidenceItem } from '../types';
import { mockTreatmentEvidenceById } from '../data/mockData';
import { fetchCase, rankedRegimes } from './caseService';

/** Fallback, wenn im Assessment nichts ausgewaehlt wurde. */
const DEFAULT_TREATMENT_ID = 'CYCLOPHOSPHAMIDE + DOXORUBICIN';

/** Wird nach Abschluss des Assessments aufgerufen (Step 2 -> Step 3). */
export async function fetchEvidenceSynthesis(
  patientId: string,
  assessment: HumanAssessment,
): Promise<AiEvidenceSynthesis> {
  await delay(300);

  const treatmentId = assessment.selectedTreatment || DEFAULT_TREATMENT_ID;
  return getEvidenceForTreatment(treatmentId, patientId);
}

export async function getEvidenceForTreatment(treatmentId: string, patientId: string): Promise<AiEvidenceSynthesis> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/evidence?treatmentId=${encodeURIComponent(treatmentId)}&patientId=${encodeURIComponent(patientId)}`);
      if (response.ok) {
        const payload = await response.json();
        return normalizeEvidence(payload, treatmentId, patientId);
      }
    } catch {
      // Fall back to the hardcoded treatment profile below.
    }
  }

  return normalizeEvidence(mockTreatmentEvidenceById[treatmentId] ?? mockTreatmentEvidenceById[DEFAULT_TREATMENT_ID], treatmentId, patientId);
}

/**
 * Builds a model-confidence evidence line for the treatment ACTUALLY passed in,
 * not the model's top-ranked pick. If the selected treatment is the top-ranked
 * option, it reads as supporting evidence; otherwise it's surfaced as a caution
 * (lower model confidence than the top alternative), so the synthesis never
 * silently reports the wrong regime's confidence.
 */
async function buildModelPredictionEvidence(
  patientId: string,
  treatmentId: string,
): Promise<{
  evidenceFor: EvidenceItem[];
  evidenceAgainst: EvidenceItem[];
}> {
  const studyCase = await fetchCase(patientId);

  if (!studyCase) {
    return {
      evidenceFor: [],
      evidenceAgainst: [],
    };
  }
//Get all treatments for the patient
  const ranked = rankedRegimes(studyCase);

//Find probability for the treatment that was selected
  const selected = ranked.find(({ id }) => id === treatmentId);

  if (!selected) {
    return {
      evidenceFor: [],
      evidenceAgainst: [],
    };
  }

  const rank = ranked.findIndex(({ id }) => id === treatmentId) + 1;
  const percent = Math.round(selected.probability * 100);

  const evidence: EvidenceItem = {
    text: `Model confidence for this regimen is ${percent}% (rank ${rank} of ${ranked.length})`,
    source: 'Patient context',
  };

  if (rank <= 3) {
    return {
      evidenceFor: [evidence],
      evidenceAgainst: [],
    };
  }

  return {
    evidenceFor: [],
    evidenceAgainst: [evidence],
  };
}

async function normalizeEvidence(
  payload: Partial<AiEvidenceSynthesis> | undefined,
  treatmentId: string,
  patientId: string,
): Promise<AiEvidenceSynthesis> {
  const fallback =
    mockTreatmentEvidenceById[treatmentId] ??
    mockTreatmentEvidenceById[DEFAULT_TREATMENT_ID];

  const baseEvidenceFor =
    payload?.evidenceFor ?? fallback.evidenceFor;

  const baseEvidenceAgainst =
    payload?.evidenceAgainst ?? fallback.evidenceAgainst;


  // Get treatment probability/ranking directly from study_cases.json.
  const modelEvidence =
    await buildModelPredictionEvidence(
      patientId,
      treatmentId,
    );

  return {
    ...fallback,
    ...payload,

    uncertaintyLevel:
      payload?.uncertaintyLevel ??
      fallback.uncertaintyLevel,

    uncertaintySummary:
      payload?.uncertaintySummary ??
      fallback.uncertaintySummary,

    uncertaintyDescription:
      payload?.uncertaintyDescription ??
      fallback.uncertaintyDescription,

    evidenceFor: [
      ...baseEvidenceFor,
      ...modelEvidence.evidenceFor,
    ],

    evidenceAgainst: [
      ...baseEvidenceAgainst,
      ...modelEvidence.evidenceAgainst,
    ],

    missingData:
      payload?.missingData ??
      fallback.missingData,

    riskFlags:
      payload?.riskFlags ??
      fallback.riskFlags,

    publishedCohorts:
      payload?.publishedCohorts ??
      fallback.publishedCohorts,

    sources:
      payload?.sources ??
      fallback.sources,

    keyReasoningFactors:
      payload?.keyReasoningFactors ??
      fallback.keyReasoningFactors,
  };
}

export async function fetchReflectiveAnswer(
  promptId: string,
  _context: { assessment: HumanAssessment },
): Promise<string> {
  await delay(200);

  const responses: Record<string, string> = {
    why: 'Hormone-receptor and HER2 status are among the strongest predictors of regimen benefit in breast cancer. Combined with disease stage and nodal involvement, the evidence cluster supports the selected pathway — but this depends on confirming baseline cardiac function and menopausal status.',
    'why-not': 'Node-positive disease has historically justified more intensive combination chemotherapy. Incomplete cardiac and bone-health workup introduce uncertainty. A different regimen could be justified if cardiac clearance is not obtained or if the patient prioritizes a lower-toxicity path.',
    uncertainty: 'Missing baseline LVEF, unconfirmed menopausal status, and moderate patient-similarity scores increase uncertainty. The molecular evidence (HR/HER2 status) is strong, but the whole-patient picture is incomplete.',
    contradicts: 'Node-positive, higher-stage disease suggests some clinicians would favor a more intensive chemotherapy backbone. Trial data for CDK4/6 or HER2-targeted combinations is strongest in the advanced setting — creating some tension when applied earlier.',
    change: 'If cardiac function is reduced, menopausal status is clarified, or genetic testing (BRCA1/2) returns positive, the risk-benefit balance could shift toward a different regimen. A change in patient preference toward lower toxicity would also alter the decision.',
  };

  return responses[promptId] ?? 'Consider what clinical factors most influence your confidence in this decision.';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}