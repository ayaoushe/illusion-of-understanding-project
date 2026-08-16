// Die 4 Fälle, die im Experiment gezeigt werden (Reihenfolge A–D).
export const STUDY_CASES = [
  'P-0039112', // A
  'P-0011019', // B
  'P-0050258', // C
  'P-0068618', // D
] as const;

export type StudyLabel = 'A' | 'B' | 'C' | 'D';

// Zuordnung Patienten-ID -> Studien-Label (A–D).
export const STUDY_LABELS: Record<string, StudyLabel> = {
  'P-0039112': 'A',
  'P-0011019': 'B',
  'P-0050258': 'C',
  'P-0068618': 'D',
};

// Beispiel-Namen (fiktiv) für die Anzeige – die Rohdaten sind anonymisiert.
export const STUDY_NAMES: Record<string, string> = {
  'P-0039112': 'Anna Seeler',
  'P-0011019': 'Bianca Stefen',
  'P-0050258': 'Clara Campista',
  'P-0068618': 'Diana Ernst',
};

// Medical Record Number (Krankenakten-Nr.) – deterministisch aus der ID abgeleitet.
export function mrnFromId(patientId: string): string {
  const digits = patientId.replace(/\D/g, '');
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}
