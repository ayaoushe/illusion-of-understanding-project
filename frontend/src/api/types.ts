export type UserDecision = "Treat" | "Not Treat" | "Unsure";

export type StepId =
  | "patient"
  | "assessment"
  | "results"
  | "explanation"
  | "scenario"
  | "reflection";

export interface PatientPayload {
  age: number;
  stage: string;
  prior_treatment: string;
  tumor_size: number;
  symptom_severity: string;
}

export interface PredictResponse {
  success_probability: number;
  model_confidence: number;
  success_percent: number;
  confidence_percent: number;
  warnings: string[];
  low_confidence: boolean;
  requires_uncertainty_acknowledgment: boolean;
  nudge: { eligible: boolean; message: string };
  comparison: {
    reference_label: string;
    reference_summary: string;
    reference_success_percent: number;
    note: string;
  };
  user_decision: string;
}

export interface FeatureRow {
  name: string;
  weight: number;
  explanation: string;
  value?: string;
}

export interface RegimeOption {
  regime: string;
  rank: number;
  probability: number;
  features: FeatureRow[];
}

export interface CaseRecord {
  patient_id: string;
  prediction: string;
  confidence_percent: number;
  probabilities: Record<string, number>;
  options: RegimeOption[];
}

export interface AnalyzeResponse {
  features: FeatureRow[];
}

export interface ScenarioResponse {
  baseline_success_probability: number;
  scenario_success_probability: number;
  baseline_percent: number;
  scenario_percent: number;
  delta_percent_points: number;
}
