import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchCases } from '../services/caseService';
import { STUDY_CASES, STUDY_LABELS, STUDY_NAMES } from '../config/studyCases';
import type { StudyCase } from '../types';

export function CaseSelection() {
  const { selectPatient } = useWorkflow();
  const [cases, setCases] = useState<StudyCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCases()
      .then(setCases)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  // Fälle in der definierten Studien-Reihenfolge A–D.
  const ordered = useMemo(
    () =>
      cases
        ? STUDY_CASES.map((id) => cases.find((c) => c.patient_id === id)).filter(
            (c): c is StudyCase => Boolean(c),
          )
        : [],
    [cases],
  );

  // Suche filtert nach Name, Patienten-ID und Fall-Label (A–D).
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ordered;
    return ordered.filter((c) => {
      const label = (STUDY_LABELS[c.patient_id] ?? '').toLowerCase();
      const name = (STUDY_NAMES[c.patient_id] ?? '').toLowerCase();
      return (
        name.includes(q) ||
        c.patient_id.toLowerCase().includes(q) ||
        label === q ||
        `fall ${label}`.includes(q)
      );
    });
  }, [ordered, query]);

  // Dropdown schließen, wenn außerhalb geklickt wird.
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function choose(c: StudyCase) {
    selectPatient(c.patient_id);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = filtered[highlight];
      if (c) choose(c);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="case-selection">
      <div className="case-selection-inner">
        <header className="case-selection-header">
          <h1>Patient auswählen</h1>
          <p className="muted">
            Bitte wählen Sie einen Fall aus, um mit der Bearbeitung zu beginnen.
          </p>
        </header>

        {error && <p className="case-selection-error">Fehler beim Laden der Fälle: {error}</p>}
        {!cases && !error && <p className="muted">Fälle werden geladen…</p>}

        {cases && (
          <div className="case-combobox" ref={rootRef}>
            <input
              type="text"
              className="case-combobox-input"
              placeholder="Patient suchen"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setHighlight(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              role="combobox"
              aria-expanded={open}
              aria-controls="case-listbox"
              aria-autocomplete="list"
            />

            {open && (
              <ul className="case-listbox" id="case-listbox" role="listbox">
                {filtered.length === 0 && <li className="case-option-empty">Kein Treffer</li>}
                {filtered.map((c, i) => {
                  const name = STUDY_NAMES[c.patient_id] ?? `Fall ${STUDY_LABELS[c.patient_id] ?? '?'}`;
                  return (
                    <li
                      key={c.patient_id}
                      role="option"
                      aria-selected={i === highlight}
                      className={`case-option${i === highlight ? ' is-highlighted' : ''}`}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={(e) => {
                        // mousedown statt click, damit der Input-Blur nicht vorher schließt
                        e.preventDefault();
                        choose(c);
                      }}
                    >
                      <span className="case-option-name">{name}</span>
                      <span className="case-option-id">{c.patient_id}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
