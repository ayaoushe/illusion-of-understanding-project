/**
 * Lädt die Studienfälle (A–D) aus der statischen Datei
 * `frontend/public/study_cases.json`, die aus dem ML-Modell (predictions.json)
 * generiert wurde.
 *
 * BASE_URL berücksichtigt den Vite-`base`-Pfad, damit der Fetch auch auf
 * GitHub Pages funktioniert (Unterordner-Deployment).
 */
let cache = null;
export async function fetchCases() {
    if (cache)
        return cache;
    const url = `${import.meta.env.BASE_URL}study_cases.json`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Konnte study_cases.json nicht laden (HTTP ${res.status})`);
    }
    cache = (await res.json());
    return cache;
}
/** Einen einzelnen Fall per Patienten-ID laden. */
export async function fetchCase(patientId) {
    const cases = await fetchCases();
    return cases.find((c) => c.patient_id === patientId);
}
