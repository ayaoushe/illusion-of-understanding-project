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
