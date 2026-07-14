import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type {
  WorkflowStepId,
  HumanAssessment,
  FinalReflection,
  InteractionTelemetry,
  AiEvidenceSynthesis,
  Patient,
} from '../types';
import { WORKFLOW_STEPS, getPatientProfile } from '../data/mockData';
import { initialTelemetry, detectBiasWarnings, trackInteraction } from '../services/interactionService';
import { fetchEvidenceSynthesis } from '../services/aiService';
import { STUDY_CASES } from '../config/studyCases';

interface WorkflowContextValue {
  currentStep: WorkflowStepId;
  steps: typeof WORKFLOW_STEPS;
  assessment: HumanAssessment | null;
  assessmentComplete: boolean;
  evidence: AiEvidenceSynthesis | null;
  evidenceLoading: boolean;
  reflection: FinalReflection | null;
  telemetry: InteractionTelemetry;
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  biasWarnings: ReturnType<typeof detectBiasWarnings>;
  canAccessStep: (stepId: WorkflowStepId) => boolean;
  goToStep: (stepId: WorkflowStepId) => void;
  goNext: () => void;
  goPrevious: () => void;
  submitAssessment: (data: HumanAssessment) => Promise<void>;
  submitReflection: (data: FinalReflection) => void;
  recordInteraction: (event: { type: string; payload?: string }) => void;
  startAssessment: () => void;
  selectPatient: (patientId: string) => void;
  changePatient: (newPatientId: string, confirmFn?: () => boolean) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

const GATED_STEPS: WorkflowStepId[] = ['evidence', 'treatment', 'similar', 'reflection'];

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<WorkflowStepId>('overview');
  const [assessment, setAssessment] = useState<HumanAssessment | null>(null);
  const [evidence, setEvidence] = useState<AiEvidenceSynthesis | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [reflection, setReflection] = useState<FinalReflection | null>(null);
  const [telemetry, setTelemetry] = useState<InteractionTelemetry>(initialTelemetry);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(STUDY_CASES[0]);

  const assessmentComplete = assessment !== null;
  const selectedPatient = useMemo(() => getPatientProfile(selectedPatientId), [selectedPatientId]);

  const canAccessStep = useCallback(
    (stepId: WorkflowStepId) => {
      if (!GATED_STEPS.includes(stepId)) return true;
      return assessmentComplete;
    },
    [assessmentComplete],
  );

  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);

  const goToStep = useCallback(
    (stepId: WorkflowStepId) => {
      if (canAccessStep(stepId)) setCurrentStep(stepId);
    },
    [canAccessStep],
  );

  const goNext = useCallback(() => {
    const next = WORKFLOW_STEPS[currentIndex + 1];
    if (next && canAccessStep(next.id)) setCurrentStep(next.id);
  }, [currentIndex, canAccessStep]);

  const goPrevious = useCallback(() => {
    const prev = WORKFLOW_STEPS[currentIndex - 1];
    if (prev) setCurrentStep(prev.id);
  }, [currentIndex]);

  const startAssessment = useCallback(() => {
    setTelemetry((t) => ({ ...t, assessmentStartTime: Date.now() }));
  }, []);

  const submitAssessment = useCallback(async (data: HumanAssessment) => {
    const completed: HumanAssessment = { ...data, completedAt: new Date().toISOString() };
    const patientId = selectedPatientId ?? '4821-7734';
    setAssessment(completed);
    setTelemetry((t) => ({ ...t, assessmentSubmitTime: Date.now() }));
    setEvidenceLoading(true);
    try {
      const synthesis = await fetchEvidenceSynthesis(patientId, completed);
      setEvidence(synthesis);
    } finally {
      setEvidenceLoading(false);
    }
    setCurrentStep('evidence');
  }, [selectedPatientId]);

  const submitReflection = useCallback((data: FinalReflection) => {
    setReflection(data);
  }, []);

  const recordInteraction = useCallback((event: { type: string; payload?: string }) => {
    setTelemetry((t) => trackInteraction(t, event));
  }, []);

  const selectPatient = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentStep('overview');
    setTelemetry((t) => ({ ...t, evidenceInteractions: [...t.evidenceInteractions, `selected:${patientId}`] }));
  }, []);

  const changePatient = useCallback((newPatientId: string, confirmFn?: () => boolean) => {
    const shouldProceed = confirmFn ? confirmFn() : true;
    if (shouldProceed) {
      setSelectedPatientId(newPatientId);
      setAssessment(null);
      setEvidence(null);
      setReflection(null);
      setTelemetry(initialTelemetry);
      setCurrentStep('overview');
    }
  }, []);

  const biasWarnings = useMemo(() => detectBiasWarnings(telemetry), [telemetry]);

  const value: WorkflowContextValue = {
    currentStep,
    steps: WORKFLOW_STEPS,
    assessment,
    assessmentComplete,
    evidence,
    evidenceLoading,
    reflection,
    telemetry,
    selectedPatientId,
    selectedPatient,
    biasWarnings,
    canAccessStep,
    goToStep,
    goNext,
    goPrevious,
    submitAssessment,
    submitReflection,
    recordInteraction,
    startAssessment,
    selectPatient,
    changePatient,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
