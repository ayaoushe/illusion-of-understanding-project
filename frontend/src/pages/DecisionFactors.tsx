import { useEffect } from 'react';
import { mockWhatWouldChange, mockDecisionFactors } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { DecisionFactorCard } from '../components/cards/DecisionFactorCard';

export function DecisionFactors() {
  const { recordInteraction } = useWorkflow();

  useEffect(() => {
    recordInteraction({ type: 'decision_factors_view' });
  }, [recordInteraction]);

  return (
    <div className="page">
      <PageHeader
        title="Decision Factors"
        subtitle="What would need to change — and which factors currently drive the decision?"
        badge="Step 6"
      />

      <section className="section-block">
        <h3>What Would Need To Change</h3>
        <p className="section-desc muted">
          Clinical decision boundaries — factors that would alter the treatment approach.
        </p>
        <div className="decision-factors-grid">
          {mockWhatWouldChange.map((f) => (
            <DecisionFactorCard key={f.factor} factor={f} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h3>Key Reasoning Factors</h3>
        <div className="factors-impact-grid">
          {mockDecisionFactors.map((f) => (
            <div key={f.category} className="factor-card">
              <h4>{f.category}</h4>
              <p>{f.description}</p>
              <span className="impact-level">Impact: {f.impact}</span>
            </div>
          ))}
        </div>
      </section>

      <StepFooter nextLabel="Final Reflection" />
    </div>
  );
}
