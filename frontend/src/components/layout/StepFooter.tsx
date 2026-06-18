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

  return (
    <footer className="step-footer">
      {showPrevious && stepIndex > 0 ? (
        <button type="button" className="btn btn-secondary" onClick={goPrevious}>
          ← Previous
        </button>
      ) : (
        <span />
      )}
      <span className="step-footer-indicator">
        Step {stepIndex + 1} of {WORKFLOW_STEPS.length}
      </span>
      <button
        type="button"
        className={`btn btn-primary ${nextReady ? 'btn-ready' : ''}`}
        onClick={onNext ?? goNext}
        disabled={nextDisabled}
      >
        {nextLabel} →
      </button>
    </footer>
  );
}
