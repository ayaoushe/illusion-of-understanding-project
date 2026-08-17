//Footer for page navigation 

import { useEffect, useCallback } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';
import { WORKFLOW_STEPS } from '../../data/mockData';

interface StepFooterProps {
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextReady?: boolean;
  showPrevious?: boolean;
}

export function StepFooter({
  onNext,
  nextLabel = 'Continue',
  nextDisabled = false,
  nextReady = false,
  showPrevious = true,
}: StepFooterProps) {
  const { currentStep, goPrevious, goNext } = useWorkflow();
  const stepIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  const handleNext = onNext ?? goNext;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.tagName === 'SELECT') return;
        e.preventDefault();
        if (!nextDisabled) handleNext();
      }
    },
    [handleNext, nextDisabled],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <nav className="sticky-nav">
      {showPrevious && stepIndex > 0 ? (
        <button type="button" className="btn btn-secondary" onClick={goPrevious}>
          ← Previous
        </button>
      ) : (
        <span />
      )}
      <span className="sticky-nav-indicator">
        Step {stepIndex + 1} of {WORKFLOW_STEPS.length}
      </span>
      <button
        type="button"
        className={`btn btn-primary ${nextReady ? 'btn-ready' : ''}`}
        onClick={handleNext}
        disabled={nextDisabled}
      >
        {nextLabel} →
      </button>
    </nav>
  );
}