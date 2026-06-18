import { mockTreatmentOptions, getAssessmentTreatmentLabel } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { TreatmentOptionCard } from '../components/cards/TreatmentOptionCard';

export function TreatmentComparison() {
  const { assessment, recordInteraction } = useWorkflow();

  return (
    <div className="page">
      <PageHeader
        title="Treatment Options Comparison"
        subtitle="Compare all viable options critically. No single option should dominate the decision."
        badge="Step 4"
      />

      <div className="comparison-notice card">
        <p>
          Each option is presented with equal visual weight for critical comparison.
          {assessment && (
            <span> Your initial selection: <strong>{getAssessmentTreatmentLabel(assessment.selectedTreatment)}</strong></span>
          )}
        </p>
      </div>

      <div className="treatment-comparison-grid">
        {mockTreatmentOptions.map((opt) => (
          <TreatmentOptionCard
            key={opt.id}
            option={opt}
            selected={assessment?.selectedTreatment === opt.id}
            onView={() => recordInteraction({ type: 'treatment_view', payload: opt.id })}
          />
        ))}
      </div>

      <StepFooter />
    </div>
  );
}
