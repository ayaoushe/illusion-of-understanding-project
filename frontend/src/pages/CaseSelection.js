import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { fetchCases } from '../services/caseService';
import { STUDY_CASES, STUDY_LABELS, STUDY_NAMES, mrnFromId } from '../config/studyCases';
export function CaseSelection() {
    const { selectPatient } = useWorkflow();
    const [cases, setCases] = useState(null);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [highlight, setHighlight] = useState(0);
    const rootRef = useRef(null);
    useEffect(() => {
        fetchCases()
            .then(setCases)
            .catch((e) => setError(e instanceof Error ? e.message : String(e)));
    }, []);
    // Fälle in der definierten Studien-Reihenfolge A–D.
    const ordered = useMemo(() => cases
        ? STUDY_CASES.map((id) => cases.find((c) => c.patient_id === id)).filter((c) => Boolean(c))
        : [], [cases]);
    // Suche filtert nach Name, Patienten-ID und Fall-Label (A–D).
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return ordered;
        return ordered.filter((c) => {
            const label = (STUDY_LABELS[c.patient_id] ?? '').toLowerCase();
            const name = (STUDY_NAMES[c.patient_id] ?? '').toLowerCase();
            const mrn = mrnFromId(c.patient_id).toLowerCase();
            return (name.includes(q) ||
                mrn.includes(q) ||
                c.patient_id.toLowerCase().includes(q) ||
                label === q ||
                `fall ${label}`.includes(q));
        });
    }, [ordered, query]);
    // Dropdown schließen, wenn außerhalb geklickt wird.
    useEffect(() => {
        function onClickOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);
    function choose(c) {
        selectPatient(c.patient_id);
    }
    function onKeyDown(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            const c = filtered[highlight];
            if (c)
                choose(c);
        }
        else if (e.key === 'Escape') {
            setOpen(false);
        }
    }
    return (_jsx("div", { className: "case-selection", children: _jsxs("div", { className: "case-selection-inner", children: [_jsxs("header", { className: "case-selection-header", children: [_jsx("h1", { children: "Select Patient" }), _jsx("p", { className: "muted", children: "Please choose a patient to begin." })] }), error && _jsxs("p", { className: "case-selection-error", children: ["Fehler beim Laden der F\u00E4lle: ", error] }), !cases && !error && _jsx("p", { className: "muted", children: "F\u00E4lle werden geladen\u2026" }), cases && (_jsxs("div", { className: "case-combobox", ref: rootRef, children: [_jsx("input", { type: "text", className: "case-combobox-input", placeholder: "Search Patient", value: query, onChange: (e) => {
                                setQuery(e.target.value);
                                setOpen(true);
                                setHighlight(0);
                            }, onFocus: () => setOpen(true), onKeyDown: onKeyDown, role: "combobox", "aria-expanded": open, "aria-controls": "case-listbox", "aria-autocomplete": "list" }), open && (_jsxs("ul", { className: "case-listbox", id: "case-listbox", role: "listbox", children: [filtered.length === 0 && _jsx("li", { className: "case-option-empty", children: "Kein Treffer" }), filtered.map((c, i) => {
                                    const name = STUDY_NAMES[c.patient_id] ?? `Fall ${STUDY_LABELS[c.patient_id] ?? '?'}`;
                                    return (_jsxs("li", { role: "option", "aria-selected": i === highlight, className: `case-option${i === highlight ? ' is-highlighted' : ''}`, onMouseEnter: () => setHighlight(i), onMouseDown: (e) => {
                                            // mousedown statt click, damit der Input-Blur nicht vorher schließt
                                            e.preventDefault();
                                            choose(c);
                                        }, children: [_jsx("span", { className: "case-option-name", children: name }), _jsxs("span", { className: "case-option-id", children: ["MRN ", mrnFromId(c.patient_id)] })] }, c.patient_id));
                                })] }))] }))] }) }));
}
