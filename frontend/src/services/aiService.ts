import type { HumanAssessment, AiEvidenceSynthesis } from '../types';
import { mockAiEvidence, mockTreatmentOptions } from '../data/mockData';

/**
 * Placeholder AI service for future ML/backend integration.
 * Currently returns static mock evidence synthesis.
 */
export async function fetchEvidenceSynthesis(
  _patientId: string,
  assessment: HumanAssessment,
): Promise<AiEvidenceSynthesis> {
  await delay(300);

  const selectedOption = mockTreatmentOptions.find((t) => t.id === assessment.selectedTreatment);

  return {
    ...mockAiEvidence,
    evidenceFor: [
      ...mockAiEvidence.evidenceFor,
      ...(selectedOption
        ? [{ text: `Your assessment (${selectedOption.name}) aligns with molecular profile evidence`, source: 'Assessment alignment' }]
        : []),
    ],
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
