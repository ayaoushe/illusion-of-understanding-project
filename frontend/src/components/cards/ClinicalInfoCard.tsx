// Card Design for Patient Overview, to display clinical information such as diagnosis, performance status, and key lab values.

import type { ReactNode } from 'react';

interface ClinicalInfoCardProps {
  title: string;
  variant?: 'default' | 'highlight' | 'warning' | 'info';
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function ClinicalInfoCard({
  title,
  variant = 'default',
  children,
  collapsible = false,
  defaultOpen = true,
}: ClinicalInfoCardProps) {
  if (collapsible) {
    return (
      <details className={`card clinical-info-card variant-${variant}`} open={defaultOpen}>
        <summary className="clinical-info-summary">
          <h4>{title}</h4>
        </summary>
        <div className="clinical-info-body">{children}</div>
      </details>
    );
  }

  return (
    <div className={`card clinical-info-card variant-${variant}`}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
