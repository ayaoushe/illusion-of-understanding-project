import type { Dispatch, SetStateAction } from 'react';

interface SidebarProps {
  steps: readonly string[];
  activeStep: string;
  onStepChange: Dispatch<SetStateAction<string>>;
}

export function Sidebar({ steps, activeStep, onStepChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-icon">⛏︎</div>
        <div>
          <p className="brand-label">Clinical Navigator</p>
          <p className="brand-note">Stepwise decision support</p>
        </div>
      </div>
      <nav className="step-list">
        {steps.map((step) => {
          const active = step === activeStep;
          return (
            <button
              key={step}
              type="button"
              className={`step-button ${active ? 'active' : ''}`}
              onClick={() => onStepChange(step)}
            >
              <span className="step-index">{steps.indexOf(step) + 1}</span>
              <span>{step}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
