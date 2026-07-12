interface BiasWarningBannerProps {
  warnings: Array<{ id: string; message: string; severity: string }>;
}

export function BiasWarningBanner({ warnings }: BiasWarningBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="bias-warnings">
      {warnings.map((w) => (
        <div key={w.id} className="bias-warning">
          <span className="bias-icon">💡</span>
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
