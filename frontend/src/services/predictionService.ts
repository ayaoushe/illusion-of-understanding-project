import type { StudyCase } from "../types";

export interface Recommendation {
  id: string;
  name: string;
  probability: number;
  shap: {
    feature: string;
    value: number;
  }[];
}

export interface TreatmentPrediction {
  recommendations: Recommendation[];
}

const API_URL = "http://localhost:8000";

export async function fetchTreatmentRecommendations(
  patient: StudyCase
): Promise<TreatmentPrediction> {
  const response = await fetch(`${API_URL}/treatment-recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      patient,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to load treatment recommendations.");
  }

  return response.json();
}