import { useEffect } from 'react';
import { useWorkflow } from '../../context/WorkflowContext';

interface StickyNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
}

export function StickyNavigation({ onNext, onPrevious, canProceed = true }: StickyNavigationProps) {
  const { currentStep } = useWorkflow();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (canProceed && onNext) {
          onNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canProceed, onNext]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1rem',
      zIndex: 1000,
    }}>
      {onPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: '#ffffff',
            color: '#64748b',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          ← Previous
        </button>
      )}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            background: canProceed ? '#3b82f6' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            opacity: canProceed ? 1 : 0.6,
          }}
        >
          Next →
        </button>
      )}
    </div>
  );
}
