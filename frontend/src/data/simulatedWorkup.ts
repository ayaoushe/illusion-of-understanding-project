/**
 * Simulierte Staging-Diagnostik — NUR für Patientin A (P-0001568).
 *
 * Warum überhaupt simuliert: MSK CHORD leitet die Zeitleiste der Tumor-
 * lokalisationen aus Radiologiebefunden per NLP ab und legt nur dann eine Zeile
 * an, wenn in einem Befund eine Tumorlokalisation genannt wird. Routine-
 * bildgebung (Mammographie, Sonographie, Staging-CT ohne Befund) taucht dort
 * gar nicht auf. Für P-0001568 beginnt die dokumentierte Reihe erst ~2 180 Tage
 * NACH Beginn der Erstlinie — das ist ihr späteres Rezidiv und darf im
 * Entscheidungsmoment nicht sichtbar sein. Vor Therapiestart bleibt die Karte
 * daher echt leer.
 *
 * Die folgenden Einträge sind erfunden, aber an ihre echten Registerdaten
 * gebunden: pathologisches Stadium 2A, IDC, C50.8 (überlappende Läsion der
 * Brust), HR+/HER2+, Lymphknoten befallen, 2 Operationen und 0 Bestrahlungen
 * vor Erstlinienbeginn, Diagnose 84 Tage vor Therapiestart, kein Fernbefall
 * (metastatic_site = "Not Applicable").
 *
 * Sie sind in der UI als "simulated" gekennzeichnet und gehören ins
 * Provenienz-Artefakt in die Spalte "erfunden".
 */

export interface SimulatedImagingEntry {
  /** Tage vor Beginn der Erstlinientherapie. */
  daysBefore: number;
  type: string;
  findings: string;
}

export interface SimulatedWorkup {
  /** Lokalisationen für "Documented Tumor Sites". */
  sites: string[];
  imaging: SimulatedImagingEntry[];
}

export const SIMULATED_WORKUP: Record<string, SimulatedWorkup> = {
  'P-0001568': {
    sites: ['Breast — overlapping lesion, left (primary)', 'Axillary lymph nodes, ipsilateral'],
    imaging: [
      {
        daysBefore: 88,
        type: 'Mammography + breast ultrasound — diagnostic',
        findings:
          'Spiculated mass crossing the quadrant boundary of the left breast, ~2.4 cm. One morphologically suspicious ipsilateral axillary node. Core biopsy of breast and node recommended.',
      },
      {
        daysBefore: 70,
        type: 'Breast MRI — preoperative extent',
        findings:
          'Single index lesion, 2.6 cm, no additional ipsilateral or contralateral foci. One enhancing level-I axillary node.',
      },
      {
        daysBefore: 62,
        type: 'CT chest / abdomen / pelvis — staging',
        findings:
          'No evidence of distant metastatic disease. Liver, lungs and skeleton unremarkable.',
      },
    ],
  },
};
