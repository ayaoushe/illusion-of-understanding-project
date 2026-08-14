import type { HumanAssessment, AiEvidenceSynthesis } from '../types';
import { fetchCase } from './caseService';
import { buildTreatmentEvidence } from './treatmentEvidence';

/**
 * Evidenz zur Therapiewahl des Arztes.
 *
 * Erzeugt aus den echten Falldaten (services/treatmentEvidence.ts). Ein
 * optionaler API-Endpunkt darf sie überschreiben; die frühere NSCLC-Mock-
 * Evidenz ist entfernt.
 */
export async function fetchEvidenceSynthesis(
  patientId: string,
  assessment: HumanAssessment,
): Promise<AiEvidenceSynthesis> {
  await delay(300);

  const treatmentId = assessment.selectedTreatment;
  const apiEvidence = await fetchFromApi(treatmentId, patientId);
  if (apiEvidence) return apiEvidence;

  const studyCase = await fetchCase(patientId).catch(() => undefined);
  if (studyCase && treatmentId) {
    return buildTreatmentEvidence(studyCase, treatmentId);
  }

  return emptyEvidence(treatmentId);
}

/** Optionaler Backend-Endpunkt; ohne VITE_API_BASE_URL wird er übersprungen. */
async function fetchFromApi(treatmentId: string, patientId: string): Promise<AiEvidenceSynthesis | null> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl || !treatmentId) return null;

  try {
    const response = await fetch(
      `${apiBaseUrl}/evidence?treatmentId=${encodeURIComponent(treatmentId)}&patientId=${encodeURIComponent(patientId)}`,
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as Partial<AiEvidenceSynthesis>;
    return { ...emptyEvidence(treatmentId), ...payload };
  } catch {
    return null;
  }
}

/** Wenn weder Fall noch API vorliegen: leeres Gerüst statt erfundener Inhalte. */
function emptyEvidence(treatmentId: string): AiEvidenceSynthesis {
  return {
    title: 'AI Evidence Synthesis',
    disclaimer:
      'Decision support only — not a treatment recommendation. All outputs require clinician verification.',
    uncertaintyLevel: 'high',
    uncertaintySummary: 'No case data available',
    uncertaintyDescription: treatmentId
      ? 'Evidence for this choice could not be assembled because the case data failed to load.'
      : 'No treatment was selected in the initial assessment.',
    evidenceFor: [],
    evidenceAgainst: [],
    missingData: [],
    riskFlags: [],
    publishedCohorts: [],
    sources: [],
    keyReasoningFactors: [],
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
