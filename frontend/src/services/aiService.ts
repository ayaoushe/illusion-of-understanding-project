import type { HumanAssessment, AiEvidenceSynthesis } from '../types';
import { mockTreatmentEvidenceById } from '../data/mockData';

/**
 * Lightweight evidence service that prefers an API endpoint when available,
 * but falls back to treatment-specific mock evidence for buildable demos.
 */
export async function fetchEvidenceSynthesis(
  patientId: string,
  assessment: HumanAssessment,
): Promise<AiEvidenceSynthesis> {
  await delay(300);

  const treatmentId = assessment.selectedTreatment || 'osimertinib';
  const evidence = await getEvidenceForTreatment(treatmentId, patientId);

  return {
    ...evidence,
    evidenceFor: [
      ...evidence.evidenceFor,
      ...(assessment.selectedTreatment
        ? [{ text: `Assessment selected ${assessment.selectedTreatment} as the lead treatment pathway.`, source: 'Assessment alignment' }]
        : []),
    ],
  };
}

export async function getEvidenceForTreatment(treatmentId: string, patientId: string): Promise<AiEvidenceSynthesis> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (apiBaseUrl) {
    try {
      const response = await fetch(`${apiBaseUrl}/evidence?treatmentId=${encodeURIComponent(treatmentId)}&patientId=${encodeURIComponent(patientId)}`);
      if (response.ok) {
        const payload = await response.json();
        return normalizeEvidence(payload, treatmentId);
      }
    } catch {
      // Fall back to the hardcoded treatment profile below.
    }
  }

  return normalizeEvidence(mockTreatmentEvidenceById[treatmentId] ?? mockTreatmentEvidenceById.osimertinib, treatmentId);
}

function normalizeEvidence(payload: Partial<AiEvidenceSynthesis> | undefined, treatmentId: string): AiEvidenceSynthesis {
  const fallback = mockTreatmentEvidenceById[treatmentId] ?? mockTreatmentEvidenceById.osimertinib;

  return {
    ...fallback,
    ...payload,
    uncertaintyLevel: payload?.uncertaintyLevel ?? fallback.uncertaintyLevel,
    uncertaintySummary: payload?.uncertaintySummary ?? fallback.uncertaintySummary,
    uncertaintyDescription: payload?.uncertaintyDescription ?? fallback.uncertaintyDescription,
    evidenceFor: payload?.evidenceFor ?? fallback.evidenceFor,
    evidenceAgainst: payload?.evidenceAgainst ?? fallback.evidenceAgainst,
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
    why: 'The EGFR Exon 19 deletion is one of the strongest predictors of TKI response. Combined with controlled comorbidities and patient preference for outpatient care, the evidence cluster supports targeted therapy — but this depends on assumptions about surgical candidacy.',
    'why-not': 'Stage IIIB historically benefited from concurrent chemoradiation. Elevated LDH and incomplete cardiac workup introduce uncertainty. A more aggressive approach could be justified if the patient prioritizes maximum tumor control over convenience.',
    uncertainty: 'Missing LVEF, unassessed surgical candidacy, and moderate patient-similarity scores increase uncertainty. The molecular evidence is strong, but the whole-patient picture is incomplete.',
    contradicts: 'Elevated LDH suggests higher tumor burden, which some clinicians would address with multimodal therapy. The PACIFIC trial data supports chemoradiation + durvalumab for Stage III — creating tension with TKI-first approach.',
    change: 'If ECOG worsens, BP becomes uncontrolled, or LVEF is reduced, the risk-benefit balance shifts away from intensive regimens. A change in patient preference toward QoL would also alter the decision.',
  };

  return responses[promptId] ?? 'Consider what clinical factors most influence your confidence in this decision.';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
