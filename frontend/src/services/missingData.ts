/**
 * Fehlende Daten — eine Quelle für die Patientenübersicht (Step 1) und den
 * Evidenz-Tab (Step 3). Beide zeigten bisher unterschiedliche Listen, was für
 * dieselbe Patientin nicht zusammenpasst.
 *
 * Was hier steht, fehlt wirklich: der MSK-CHORD-Export enthält weder LVEF noch
 * Menopausenstatus, Ki-67 oder einen ECOG vor Therapiebeginn.
 */

export interface MissingDataItem {
  item: string;
  whyMatters: string;
  impact: string;
  urgency: 'high' | 'medium' | 'low';
}

export interface MissingDataFacts {
  hr: boolean;
  her2: boolean;
  nodes: boolean;
  hasEcog: boolean;
  /** Erfordert das gewählte Regime eine kardiale Ausgangsmessung? */
  cardiotoxicChoice?: boolean;
  /** Ist die gewählte Therapie endokrin? Dann wiegt der Menopausenstatus schwerer. */
  endocrineChoice?: boolean;
}

export function buildMissingData(f: MissingDataFacts): MissingDataItem[] {
  const items: MissingDataItem[] = [];

  if (f.her2 || f.cardiotoxicChoice) {
    items.push({
      item: 'Baseline LVEF not documented',
      whyMatters: 'Required before anthracyclines and HER2-directed therapy',
      impact: 'Cardiotoxic regimens cannot be started safely without it',
      urgency: 'high',
    });
  }

  items.push({
    item: 'Menopausal status not recorded',
    whyMatters: 'Aromatase inhibitors and ovarian suppression depend on it',
    impact: f.endocrineChoice
      ? 'The chosen endocrine regimen may not be applicable'
      : 'Narrows the endocrine options that can be considered',
    urgency: f.endocrineChoice || f.hr ? 'high' : 'medium',
  });

  if (!f.hasEcog) {
    items.push({
      item: 'No ECOG performance status before treatment start',
      whyMatters: 'Baseline fitness determines what intensity is tolerable',
      impact: 'Tolerability of systemic therapy cannot be assessed',
      urgency: 'high',
    });
  }

  items.push({
    item: 'Ki-67 proliferation index not available',
    whyMatters: 'Informs how much benefit chemotherapy is likely to add',
    impact: 'Uncertainty in the chemotherapy indication',
    urgency: 'medium',
  });

  if (f.hr && !f.her2) {
    items.push({
      item: 'Genomic recurrence score outstanding (Oncotype/MammaPrint)',
      whyMatters: 'Separates patients who need chemotherapy from those who do not',
      impact: 'Chemotherapy benefit remains unquantified',
      urgency: 'medium',
    });
  }

  if (f.nodes) {
    items.push({
      item: 'Axillary staging not finalised (sentinel vs. dissection)',
      whyMatters: 'Extent of nodal involvement guides local therapy',
      impact: 'Surgical and radiation planning stays open',
      urgency: 'medium',
    });
  }

  return items;
}
