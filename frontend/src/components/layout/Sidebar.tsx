import { useEffect, useMemo, useRef, useState } from 'react';
import { getPatientProfile } from '../../data/mockData';
import { useWorkflow } from '../../context/WorkflowContext';
import { StepNavigation } from './StepNavigation';
import { fetchCases } from '../../services/caseService';
import { STUDY_CASES, STUDY_LABELS, STUDY_NAMES, mrnFromId } from '../../config/studyCases';
import type { StudyCase } from '../../types';

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-dialog change-patient-modal" onClick={(event) => event.stopPropagation()}>
        <div className="change-patient-modal-icon" aria-hidden="true">ID</div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="change-patient-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Switch case
          </button>
        </div>
      </div>
    </div>
  );
}

//Left Sidebar for navigation and case selection
export function Sidebar() {
  const {
    steps,
    currentStep,
    canAccessStep,
    goToStep,
    selectedPatientId,
    selectedPatient,
    changePatient,
    assessmentComplete,
  } = useWorkflow();

  const patient = selectedPatient;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCaseMenuOpen, setIsCaseMenuOpen] = useState(false);
  const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);
  const [cases, setCases] = useState<StudyCase[] | null>(null);
  const caseSelectorRef = useRef<HTMLDivElement | null>(null);

  //Case list for the switching dropdown and case selection
  useEffect(() => {
    fetchCases()
      .then(setCases)
      .catch(() => setCases([]));
  }, []);

  //Order Cases from A-B
  const orderedCases = useMemo(
    () =>
      cases
        ? STUDY_CASES.map((id) => cases.find((c) => c.patient_id === id)).filter(
            (c): c is StudyCase => Boolean(c),
          )
        : [],
    [cases],
  );

  useEffect(() => {
    if (!isCaseMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!caseSelectorRef.current?.contains(event.target as Node)) {
        setIsCaseMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isCaseMenuOpen]);

  //If case is switched the workflow resets
  const handlePatientSelect = (nextPatientId: string) => {
    if (!nextPatientId || nextPatientId === selectedPatientId) return;
    setIsCaseMenuOpen(false);
    const hasWorkflowProgress = assessmentComplete || currentStep !== 'overview';
    if (hasWorkflowProgress) {
      setPendingPatientId(nextPatientId);
      setShowConfirm(true);
    } else {
      changePatient(nextPatientId);
    }
  };

  const confirmChange = () => {
    if (pendingPatientId) changePatient(pendingPatientId);
    setPendingPatientId(null);
    setShowConfirm(false);
  };

  const selectedCaseLabel = selectedPatientId ? STUDY_LABELS[selectedPatientId] ?? '?' : '?';
  const selectedCaseTitle = patient ? `Case ${selectedCaseLabel} \u00b7 ${patient.name}` : 'Select case';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>OncoCDSS</h1>
        <p>Clinical Decision Support</p>
      </div>

      <div className="sidebar-patient">
        <div className="sidebar-patient-meta">
          <span className="sidebar-patient-label">CURRENT CASE</span>
          <div className="sidebar-case-selector" ref={caseSelectorRef}>
            <button
              type="button"
              className={`sidebar-case-trigger${isCaseMenuOpen ? ' is-open' : ''}`}
              onClick={() => setIsCaseMenuOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={isCaseMenuOpen}
            >
              <span>{selectedCaseTitle}</span>
              <span className="sidebar-case-chevron" aria-hidden="true">v</span>
            </button>
            {isCaseMenuOpen && (
              <div className="sidebar-case-menu" role="listbox" aria-label="Select patient case">
                {orderedCases.map((c) => {
                  const optionPatient = getPatientProfile(c.patient_id);
                  const label = STUDY_LABELS[c.patient_id] ?? '?';
                  const isSelected = c.patient_id === selectedPatientId;
                  return (
                    <button
                      key={c.patient_id}
                      type="button"
                      className={`sidebar-case-option${isSelected ? ' is-selected' : ''}`}
                      onClick={() => handlePatientSelect(c.patient_id)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="sidebar-case-option-main">
                        Case {label} {'\u00b7'} {STUDY_NAMES[c.patient_id] ?? optionPatient.name}
                      </span>
                      <span className="sidebar-case-option-meta">MRN {mrnFromId(c.patient_id)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {patient && (
            <>
              <span className="sidebar-patient-mrn">MRN {patient.mrn}</span>
            
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Switch Case?"
          message="Switching the case will reset the current workflow progress. Continue?"
          onConfirm={confirmChange}
          onCancel={() => {
            setPendingPatientId(null);
            setShowConfirm(false);
          }}
        />
      )}

      <StepNavigation
        steps={steps}
        currentStep={currentStep}
        canAccessStep={canAccessStep}
        onStepClick={goToStep}
      />

      <div className="sidebar-footer">
        <p className="sidebar-research-note">
          Research prototype exploring how explanations influence clinical decision-making.
        </p>
      </div>
    </aside>
  );
}
