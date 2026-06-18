/** Client-side signals aggregated for `/reflect/analyze` (bias heuristics). */

export interface InteractionTelemetryPayload {
  predict_submitted_at_ms: number | null;
  results_first_paint_at_ms: number | null;
  ms_results_to_first_explanation_enter: number | null;
  ms_results_to_first_scenario_enter: number | null;
  explanation_step_visit_count: number;
  explanation_accordion_total_opens: number;
  feature_open_counts: Record<string, number>;
  scenario_deviation_events: number;
  visited_explanation_step: boolean;
  visited_scenario_step: boolean;
  chat_user_turns: number;
  user_decision: string;
  ai_success_percent: number;
  ai_recommend_treat: boolean;
  user_aligned_with_ai: boolean | null;
}

export interface BiasAnalysisResponse {
  bias_warnings: string[];
  exploration_depth: "shallow" | "moderate" | "deep";
  critical_thinking_score: number;
  rationale: string[];
}

export function createEmptyTelemetryPayload(): InteractionTelemetryPayload {
  return {
    predict_submitted_at_ms: null,
    results_first_paint_at_ms: null,
    ms_results_to_first_explanation_enter: null,
    ms_results_to_first_scenario_enter: null,
    explanation_step_visit_count: 0,
    explanation_accordion_total_opens: 0,
    feature_open_counts: {},
    scenario_deviation_events: 0,
    visited_explanation_step: false,
    visited_scenario_step: false,
    chat_user_turns: 0,
    user_decision: "",
    ai_success_percent: 0,
    ai_recommend_treat: false,
    user_aligned_with_ai: null,
  };
}
