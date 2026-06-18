import { useEffect } from 'react';
import { mockSimilarCases } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';
import { SimilarCaseCard } from '../components/cards/SimilarCaseCard';

export function SimilarCases() {
  const { recordInteraction } = useWorkflow();

  useEffect(() => {
    recordInteraction({ type: 'similar_cases_view' });
  }, [recordInteraction]);

  return (
    <div className="page">
      <PageHeader
        title="Similar & Rare Cases"
        subtitle="Cases matched on clinically meaningful criteria — not decorative similarity."
        badge="Step 5"
      />

      <div className="cases-notice card">
        <p>
          Similar cases support decision-making when guidelines are limited or patient factors create uncertainty.
          Match criteria show why each case is relevant.
        </p>
      </div>

      <div className="similar-cases-grid">
        {mockSimilarCases.map((c) => (
          <SimilarCaseCard key={c.caseId} caseData={c} />
        ))}
      </div>

      <StepFooter />
    </div>
  );
}
