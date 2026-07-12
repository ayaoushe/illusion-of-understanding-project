import { useEffect } from 'react';
import { mockWhatWouldChange } from '../data/mockData';
import { useWorkflow } from '../context/WorkflowContext';
import { PageHeader } from '../components/layout/PageHeader';
import { StepFooter } from '../components/layout/StepFooter';

export function DecisionFactors() {
  const { recordInteraction } = useWorkflow();

  useEffect(() => {
    recordInteraction({ type: 'decision_factors_view' });
  }, [recordInteraction]);

  const groups = [
    {
      title: 'Clinical Status Changes',
      color: 'red',
      icon: '✗',
      description: 'Worsening clinical status would shift toward less intensive therapy',
      items: mockWhatWouldChange.filter(f => ['Performance Status', 'Disease Status', 'Toxicity'].includes(f.category)),
    },
    {
      title: 'Comorbidity / Risk Changes',
      color: 'yellow',
      icon: '⚠',
      description: 'New or worsening comorbidities may contraindicate certain options',
      items: mockWhatWouldChange.filter(f => ['Comorbidity', 'Missing Data'].includes(f.category)),
    },
    {
      title: 'Patient Preference Changes',
      color: 'blue',
      icon: '→',
      description: 'Shifting priorities would affect treatment intensity',
      items: mockWhatWouldChange.filter(f => f.category === 'Patient Preference'),
    },
    {
      title: 'Molecular / Lab Changes',
      color: 'green',
      icon: '✓',
      description: 'Different biomarkers would change targeted therapy selection',
      items: mockWhatWouldChange.filter(f => f.category === 'Molecular'),
    },
  ];

  return (
    <div className="page">
      <PageHeader title="What Would Change the Decision?" badge="Step 6" />

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Clinical factors that could shift the final treatment decision.
      </p>

      <div className="decision-boundaries-grid">
        {groups.map((group) => (
          <div key={group.title} className={`card boundary-card color-${group.color}`}>
            <div className="boundary-header">
              <div className="boundary-icon">{group.icon}</div>
              <div>
                <h4>{group.title}</h4>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{group.description}</p>
              </div>
            </div>
            <div className="boundary-factors">
              {group.items.map((f, i) => (
                <div key={f.factor} className="boundary-factor">
                  <strong>{f.factor}</strong>
                  <p>{f.description}</p>
                  <span className="boundary-arrow">→ {f.trigger}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <StepFooter nextLabel="Final Reflection" />
    </div>
  );
}