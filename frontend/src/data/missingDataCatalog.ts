/**
 * Die offenen Datenpunkte — eine Quelle für Step 1 und Step 3.
 *
 * Vorher stand die Liste zweimal im Code: Step 3 hatte sie fest verdrahtet in
 * EvidenceReview.tsx, Step 1 baute in patientView.ts eine eigene, die nach
 * Rezeptorstatus und Nodalbefund gefiltert war. Beide Bildschirme zeigten
 * derselben Patientin daher unterschiedlich viele Lücken — bei den Fällen B und
 * C zwei gegenüber vier. Das ist zusammengeführt: hier steht die Liste, beide
 * Schritte lesen sie.
 *
 * Alle vier Punkte fehlen im Datensatz tatsächlich — MSK CHORD enthält weder
 * LVEF noch Menopausenstatus, Knochendichte oder BRCA-Keimbahnbefund.
 *
 * Die Liste ist bewusst NICHT fallabhängig: jede Patientin sieht dieselben vier
 * Punkte. Wer sie wieder filtern will, tut das an einer Stelle — der Kommentar
 * unten nennt die medizinischen Kriterien, die dafür sprächen.
 *
 * Fachlich enger gefasst wäre:
 *   LVEF  nur bei HER2-positiver Erkrankung oder geplanter Anthrazyklingabe;
 *         bei rein endokriner Therapie fordert das niemand.
 *   DEXA  nur bei Aromatasehemmer oder Ovarsuppression.
 *   BRCA  vor allem bei triple-negativer Erkrankung, jungem Alter oder
 *         familiärer Belastung.
 */

export interface MissingDataItem {
  item: string;
  whyMatters: string;
  impact: string;
  urgency: 'high' | 'medium' | 'low';
}

export const MISSING_DATA_ITEMS: MissingDataItem[] = [
  {
    item: 'Baseline LVEF / echocardiogram not yet obtained',
    whyMatters: 'Required before starting anthracycline or HER2-targeted (trastuzumab/pertuzumab) regimens',
    impact: 'Limits confidence in cardiotoxic treatment options',
    urgency: 'high',
  },
  {
    item: 'Menopausal status not formally confirmed',
    whyMatters: 'Determines whether an aromatase inhibitor or ovarian suppression is appropriate',
    impact: 'Affects choice between endocrine therapy options',
    urgency: 'high',
  },
  {
    item: 'Baseline bone density (DEXA) not assessed',
    whyMatters: 'Aromatase inhibitors and ovarian suppression accelerate bone loss',
    impact: 'Affects monitoring and bone-protective therapy planning',
    urgency: 'medium',
  },
  {
    item: 'Germline BRCA1/2 testing not yet performed',
    whyMatters: 'Can affect chemotherapy sensitivity and future risk-reduction counseling',
    impact: 'Uncertainty in long-term treatment and surveillance planning',
    urgency: 'medium',
  },
];

/** Kurzform für die Karte in Step 1. */
export const MISSING_DATA_LABELS: string[] = MISSING_DATA_ITEMS.map((m) => m.item);
