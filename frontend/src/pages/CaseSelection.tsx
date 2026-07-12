import { useEffect, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchCases } from '../services/caseService';
import { STUDY_CASES, STUDY_LABELS } from '../config/studyCases';
import type { StudyCase } from '../types';

export function CaseSelection() {
  const { selectPatient } = useWorkflow();
  const [cases, setCases] = useState<StudyCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCases()
      .then(setCases)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  // Fälle in der definierten Studien-Reihenfolge A–D anzeigen.
  const ordered = cases
    ? STUDY_CASES.map((id) => cases.find((c) => c.patient_id === id)).filter(
        (c): c is StudyCase => Boolean(c),
      )
    : [];

  return (
    <div className="case-selection">
      <div className="case-selection-inner">
        <header className="case-selection-header">
          <h1>Patient auswählen</h1>
          <p className="muted">
            Bitte wählen Sie einen der vier Fälle aus, um mit der Fallbearbeitung zu beginnen.
          </p>
        </header>

        {error && <p className="case-selection-error">Fehler beim Laden der Fälle: {error}</p>}
        {!cases && !error && <p className="muted">Fälle werden geladen…</p>}

        <div className="case-grid">
          {ordered.map((c) => {
            const label = STUDY_LABELS[c.patient_id] ?? '?';
            return (
              <button
                key={c.patient_id}
                type="button"
                className="case-card"
                onClick={() => selectPatient(c.patient_id)}
              >
                <div className="case-card-badge">Fall {label}</div>
                <div className="case-card-id">{c.patient_id}</div>
                <div className="case-card-prediction">
                  <span className="muted">Modell-Empfehlung</span>
                  <strong>{c.prediction}</strong>
                  <span className="case-card-confidence">{c.confidence_percent}% Konfidenz</span>
                </div>
                <span className="case-card-cta">Auswählen →</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
