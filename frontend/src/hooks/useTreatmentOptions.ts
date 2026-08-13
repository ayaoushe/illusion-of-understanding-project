import { useEffect, useState } from 'react';
import { fetchCase, rankedRegimes } from '../services/caseService';
import { assessmentTreatmentOptions } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';

export interface TreatmentOptionEntry {
  id: string;
  label: string;
  category: string;
  /** Modell-Wahrscheinlichkeit; null, solange der Fall nicht geladen ist */
  probability: number | null;
}

const CATALOG = new Map(assessmentTreatmentOptions.map((o) => [o.id as string, o]));

/** Fallback: Katalogreihenfolge ohne Wahrscheinlichkeiten. */
const CATALOG_ORDER: TreatmentOptionEntry[] = assessmentTreatmentOptions.map((o) => ({
  id: o.id,
  label: o.label,
  category: o.category,
  probability: null,
}));

/**
 * Die Treatment-Optionen des aktuell gewählten Patienten, absteigend sortiert
 * nach der Empfehlung des ML-Modells (`probabilities` aus study_cases.json).
 *
 * Fällt auf die Katalogreihenfolge zurück, solange kein Fall geladen ist oder
 * der Fall keine Wahrscheinlichkeiten mitbringt.
 */
export function useTreatmentOptions(): TreatmentOptionEntry[] {
  const { selectedPatientId } = useWorkflow();
  const [options, setOptions] = useState<TreatmentOptionEntry[]>(CATALOG_ORDER);

  useEffect(() => {
    if (!selectedPatientId) {
      setOptions(CATALOG_ORDER);
      return;
    }
    let cancelled = false;
    fetchCase(selectedPatientId)
      .then((c) => {
        if (cancelled || !c) return;
        const ranked = rankedRegimes(c);
        if (!ranked.length) return;
        setOptions(
          ranked.map(({ id, probability }) => ({
            id,
            label: CATALOG.get(id)?.label ?? id,
            category: CATALOG.get(id)?.category ?? 'Unbekanntes Regime',
            probability,
          })),
        );
      })
      .catch(() => {
        /* Fallback bleibt die Katalogreihenfolge */
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  return options;
}
