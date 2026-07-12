import type { InteractionTelemetry } from '../types';

export interface BiasWarning {
  id: string;
  message: string;
  severity: 'subtle' | 'moderate';
}

/**
 * Lightweight bias detection based on interaction patterns.
 * Placeholder for future integration with backend bias_engine.py.
 */
export function detectBiasWarnings(telemetry: InteractionTelemetry): BiasWarning[] {
  const warnings: BiasWarning[] = [];

  if (telemetry.assessmentStartTime && telemetry.assessmentSubmitTime) {
    const durationSec = (telemetry.assessmentSubmitTime - telemetry.assessmentStartTime) / 1000;
    if (durationSec < 30) {
      warnings.push({
        id: 'fast-assessment',
        message: 'You completed your initial assessment very quickly. Consider whether all patient factors were weighed.',
        severity: 'subtle',
      });
    }
  }

  if (telemetry.evidenceInteractions.length === 0 && telemetry.explanationPromptsUsed === 0) {
    warnings.push({
      id: 'no-exploration',
      message: 'Consider reviewing contradictory evidence before finalizing your decision.',
      severity: 'subtle',
    });
  }

  if (!telemetry.similarCasesViewed) {
    warnings.push({
      id: 'no-similar-cases',
      message: 'Similar cases were not reviewed. Outcome data may inform your confidence.',
      severity: 'subtle',
    });
  }

  if (telemetry.explanationPromptsUsed < 2) {
    warnings.push({
      id: 'limited-exploration',
      message: 'Further exploration of evidence may improve decision confidence.',
      severity: 'subtle',
    });
  }

  return warnings;
}

export function trackInteraction(
  telemetry: InteractionTelemetry,
  event: { type: string; payload?: string },
): InteractionTelemetry {
  const updated = { ...telemetry };

  switch (event.type) {
    case 'evidence_prompt':
      updated.explanationPromptsUsed += 1;
      if (event.payload) updated.evidenceInteractions.push(event.payload);
      break;
    case 'treatment_view':
      if (event.payload && !updated.treatmentCardsViewed.includes(event.payload)) {
        updated.treatmentCardsViewed.push(event.payload);
      }
      break;
    case 'similar_cases_view':
      updated.similarCasesViewed = true;
      break;
    case 'decision_factors_view':
      updated.decisionFactorsViewed = true;
      break;
    default:
      break;
  }

  return updated;
}

export const initialTelemetry: InteractionTelemetry = {
  assessmentStartTime: null,
  assessmentSubmitTime: null,
  evidenceInteractions: [],
  treatmentCardsViewed: [],
  similarCasesViewed: false,
  decisionFactorsViewed: false,
  explanationPromptsUsed: 0,
  warningsShown: [],
};
