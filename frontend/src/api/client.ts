import type {
  AnalyzeResponse,
  PatientPayload,
  PredictResponse,
  ScenarioResponse,
  UserDecision,
} from "./types";

const defaultBase = "http://127.0.0.1:8010";

export function getApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return "";
  return defaultBase;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function postPredict(patient: PatientPayload, user_decision: UserDecision) {
  return post<PredictResponse>("/predict", { patient, user_decision });
}

export function postAnalyze(patient: PatientPayload) {
  return post<AnalyzeResponse>("/analyze", { patient });
}

export function postScenario(
  patient: PatientPayload,
  variable: "tumor_size" | "age" | "stage",
  value: number | string
) {
  return post<ScenarioResponse>("/scenario", { patient, variable, value });
}

export function postChat(message: string, patient: PatientPayload | null) {
  return post<{ reply: string }>("/chat", { message, patient });
}
