// Feature flags for the static demo slice.
// Everything legacy/backend-driven is hidden behind these — flip back to true to restore.

// Old PredictResponse success-% card + comparative-analysis block in ResultsDashboard.
export const SHOW_LEGACY = false;

// Critical-thinking nudge + uncertainty-acknowledgment gate (dormant: not in current strategy).
export const SHOW_NUDGE = false;

// ExplanationPanel fallback that calls the /analyze backend. Off: render from activeCase only.
export const USE_BACKEND_ANALYZE = false;

// Static demo mode: hide Scenario explorer + Chat panel (no live backend for those).
export const DEMO_MODE = true;
