/**
 * Das Stadium, das im Entscheidungsmoment bekannt war.
 *
 * Warum diese Tabelle nötig ist: `clinical.stage.pathological_group` stammt aus
 * `data_clinical_sample.txt` und ist das Stadium NACH der Operation. Bei den
 * Fällen A und D gab es vor Beginn der Erstlinie überhaupt keine Operation —
 * dort steht "0", also ypT0 (komplette Remission nach neoadjuvanter Therapie).
 * Das ist ein Behandlungsergebnis und darf vor der Entscheidung nicht sichtbar
 * sein; angezeigt wurde sonst "Stage 0" neben einer Chemotherapie-Empfehlung.
 *
 * Das Tumorregister führt in `data_timeline_diagnosis.txt` ein eigenes
 * klinisches Stadium bei Diagnosestellung (Spalte CLINICAL_GROUP). Die Pipeline
 * liest es bislang nicht aus — sie holt `clinical_group` aus der Sample-Datei,
 * wo es für alle vier Fälle leer ist. Bis die Pipeline neu läuft, steht der
 * Registerwert hier.
 *
 * `source` unterscheidet, woher der Wert kommt:
 *   'registry'      — CLINICAL_GROUP des Tumorregisters, vor Therapiebeginn
 *   'reconstructed' — Register hat 99 ("nicht klassifiziert") vergeben; das
 *                     Stadium ist aus den datierten Befunden abgeleitet.
 *                     Gehört im Provenienz-Artefakt in die Spalte "erfunden".
 */

export interface StageAtDecision {
  /** Anzeigetext ohne führendes "Stage". */
  group: string;
  source: 'registry' | 'reconstructed';
  /** Belegkette — im Code dokumentiert, nicht im UI sichtbar. */
  basis: string;
}

export const STAGE_AT_DECISION: Record<string, StageAtDecision> = {
  // A — 40 J., HR+/HER2+, IDC C50.4, 0 Operationen vor Erstlinie (primär systemisch)
  'P-0039112': {
    group: 'IIB',
    source: 'reconstructed',
    basis:
      'Register: CLINICAL_GROUP 99, SUMMARY "Regional to lymph nodes". MRT 27 Tage vor ' +
      'Therapiestart dokumentiert Lymphknoten in einer Region. Keine Fern­metastasen ' +
      '(nur OTHER gesetzt). N1 belegt, T2 gesetzt — typische Konstellation für eine ' +
      'neoadjuvant behandelte HER2-positive Patientin.',
  },

  // B — 63 J., HR+/HER2−, IDC C50.2, 2 Operationen vor Erstlinie
  'P-0011019': {
    group: '1A',
    source: 'registry',
    basis: 'Register: CLINICAL_GROUP 1A und PATH_GROUP 1A bei Diagnose, SUMMARY "Localized".',
  },

  // C — 50 J., HR+/HER2−, IDC C50.4, 1 Operation vor Erstlinie
  'P-0050258': {
    group: '1A',
    source: 'registry',
    basis:
      'Register: CLINICAL_GROUP 1A bei Diagnose, SUMMARY "Localized". Wurde bisher nicht ' +
      'angezeigt, weil die Pipeline clinical_group aus der Sample-Datei liest (dort leer).',
  },

  // D — 44 J., HR+/HER2+, IDC C50.2, 0 Operationen vor Erstlinie (primär systemisch)
  'P-0068618': {
    group: 'IIIA',
    source: 'reconstructed',
    basis:
      'Register: CLINICAL_GROUP 99, SUMMARY "Localized" — durch die weitere Abklärung ' +
      'überholt: PET 15 Tage vor Therapiestart zeigt Lymphknoten (Region HEAD), MRT zwei ' +
      'Tage später weitere (Region OTHER). Zwei Nodalregionen vor der Entscheidung ' +
      'dokumentiert, keine Fernmetastasen. N2 abgeleitet, T2 gesetzt. Die vorsichtige ' +
      'Lesart: wäre HEAD als supraklavikulär gesichert, wäre es N3 und Stadium IIIC.',
  },
};
