import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, badge, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        {badge && <span className="page-badge">{badge}</span>}
        <h2>{title}</h2>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}
