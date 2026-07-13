// Die 4 Fälle, die im Experiment gezeigt werden (Reihenfolge A–D).
export const STUDY_CASES = [
  'P-0001568', // A
  'P-0000081', // B
  'P-0002566', // C
  'P-0001862', // D
] as const;

export type StudyLabel = 'A' | 'B' | 'C' | 'D';

// Zuordnung Patienten-ID -> Studien-Label (A–D).
export const STUDY_LABELS: Record<string, StudyLabel> = {
  'P-0001568': 'A',
  'P-0000081': 'B',
  'P-0002566': 'C',
  'P-0001862': 'D',
};

// Beispiel-Namen (fiktiv) für die Anzeige – die Rohdaten sind anonymisiert.
export const STUDY_NAMES: Record<string, string> = {
  'P-0001568': 'Anna Seeler',
  'P-0000081': 'Bianca Stefen',
  'P-0002566': 'Clara Campista',
  'P-0001862': 'Diana Ernst',
};

// Medical Record Number (Krankenakten-Nr.) – deterministisch aus der ID abgeleitet.
export function mrnFromId(patientId: string): string {
  const digits = patientId.replace(/\D/g, '');
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}
