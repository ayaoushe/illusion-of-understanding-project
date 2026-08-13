import type { StudyCase } from '../types';

/**
 * Lädt die Studienfälle (A–D) aus der statischen Datei
 * `frontend/public/study_cases.json`, die aus dem ML-Modell (predictions.json)
 * generiert wurde.
 *
 * BASE_URL berücksichtigt den Vite-`base`-Pfad, damit der Fetch auch auf
 * GitHub Pages funktioniert (Unterordner-Deployment).
 */
let cache: StudyCase[] | null = null;

export async function fetchCases(): Promise<StudyCase[]> {
  if (cache) return cache;

  const url = `${import.meta.env.BASE_URL}study_cases.json`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Konnte study_cases.json nicht laden (HTTP ${res.status})`);
  }

  cache = (await res.json()) as StudyCase[];
  return cache;
}

/** Einen einzelnen Fall per Patienten-ID laden. */
export async function fetchCase(patientId: string): Promise<StudyCase | undefined> {
  const cases = await fetchCases();
  return cases.find((c) => c.patient_id === patientId);
}

/**
 * Alle Regime eines Falls, absteigend nach Modell-Wahrscheinlichkeit.
 *
 * Die Pipeline schreibt `probabilities` bereits sortiert (ml/pipeline.py),
 * wir sortieren hier trotzdem explizit — die Key-Reihenfolge eines JSON-
 * Objekts ist nichts, worauf man sich verlassen sollte.
 */
export function rankedRegimes(c: StudyCase): Array<{ id: string; probability: number }> {
  if (!c.probabilities) return [];
  return Object.entries(c.probabilities)
    .map(([id, probability]) => ({ id, probability }))
    .sort((a, b) => b.probability - a.probability);
}
