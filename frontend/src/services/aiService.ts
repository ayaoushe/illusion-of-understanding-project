import type { HumanAssessment, AiEvidenceSynthesis, EvidenceItem } from '../types';
import { mockTreatmentEvidenceById, patientEvidenceOverrides, patientModelPredictions } from '../data/mockData';

const DEFAULT_TREATMENT_ID = 'CYCLOPHOSPHAMIDE + DOXORUBICIN';

/**
 * Lightweight evidence service that prefers an API endpoint when available,
 * but falls back to treatment-specific mock evidence for buildable demos.
 * 
 * This gets called after the Assessment is completed, and returns the AI Evidence Synthesis for the selected treatment and patient.
 * 
 * 
 * 
 */
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
function buildModelPredictionEvidence(patientId: string, treatmentId: string): { evidenceFor: EvidenceItem[]; evidenceAgainst: EvidenceItem[] } {
  const prediction = patientModelPredictions[patientId];
  const probability = prediction?.probabilities[treatmentId];
  if (!prediction || probability == null) {
    return { evidenceFor: [], evidenceAgainst: [] };
  }

  const ranked = Object.entries(prediction.probabilities).sort((a, b) => b[1] - a[1]);
  const rank = ranked.findIndex(([id]) => id === treatmentId) + 1;
  const percent = Math.round(probability * 100);

  if (rank > 0 && rank < 4) {
    return {
      evidenceFor: [
        { text: `Model confidence for this regimen is ${percent}% (rank ${rank} of ${ranked.length})`, source: 'Patient context' },
      ],
      evidenceAgainst: [],
    };
  }

  const [topId, topProbability] = ranked[0];
  const topPercent = Math.round(topProbability * 100);
  return {
    evidenceFor: [],
    evidenceAgainst: [
      { text: `Model confidence for this regimen is ${percent}% (rank ${rank} of ${ranked.length})`, source: 'Patient context' },
    ],
  };
}

function normalizeEvidence(payload: Partial<AiEvidenceSynthesis> | undefined, treatmentId: string, patientId: string): AiEvidenceSynthesis {
  const fallback = mockTreatmentEvidenceById[treatmentId] ?? mockTreatmentEvidenceById[DEFAULT_TREATMENT_ID];

  const baseEvidenceFor = payload?.evidenceFor ?? fallback.evidenceFor;
  const baseEvidenceAgainst = payload?.evidenceAgainst ?? fallback.evidenceAgainst;

  const caseNotes = patientEvidenceOverrides[patientId];
  const modelEvidence = buildModelPredictionEvidence(patientId, treatmentId);

  return {
    ...fallback,
    ...payload,
    uncertaintyLevel: payload?.uncertaintyLevel ?? fallback.uncertaintyLevel,
    uncertaintySummary: payload?.uncertaintySummary ?? fallback.uncertaintySummary,
    uncertaintyDescription: payload?.uncertaintyDescription ?? fallback.uncertaintyDescription,
    evidenceFor: [...baseEvidenceFor, ...(caseNotes?.evidenceFor ?? []), ...modelEvidence.evidenceFor],
    evidenceAgainst: [...baseEvidenceAgainst, ...(caseNotes?.evidenceAgainst ?? []), ...modelEvidence.evidenceAgainst],
    missingData: payload?.missingData ?? fallback.missingData,
    riskFlags: payload?.riskFlags ?? fallback.riskFlags,
    publishedCohorts: payload?.publishedCohorts ?? fallback.publishedCohorts,
    sources: payload?.sources ?? fallback.sources,
    keyReasoningFactors: payload?.keyReasoningFactors ?? fallback.keyReasoningFactors,
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