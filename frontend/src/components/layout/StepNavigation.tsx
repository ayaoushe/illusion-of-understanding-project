import type { WorkflowStep, WorkflowStepId } from '../../types';

interface StepNavigationProps {
  steps: WorkflowStep[];
  currentStep: WorkflowStepId;
  canAccessStep: (stepId: WorkflowStepId) => boolean;
  onStepClick: (stepId: WorkflowStepId) => void;
}

export function StepNavigation({ steps, currentStep, canAccessStep, onStepClick }: StepNavigationProps) {
  return (
    <nav className="step-nav" aria-label="Workflow steps">
      {steps.map((step) => {
        const isActive = step.id === currentStep;
        const isLocked = !canAccessStep(step.id);
        const isComplete = steps.findIndex((s) => s.id === currentStep) > step.number - 1;

        return (
          <button
            key={step.id}
            type="button"
            className={`step-nav-item ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''} ${isComplete ? 'complete' : ''}`}
            onClick={() => onStepClick(step.id)}
            disabled={isLocked}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="step-number">{isComplete && !isActive ? '✓' : step.number}</span>
            <span className="step-label">{step.shortLabel}</span>
            {isLocked && <span className="step-lock">🔒</span>}
          </button>
        );
      })}
    </nav>
  );
}
