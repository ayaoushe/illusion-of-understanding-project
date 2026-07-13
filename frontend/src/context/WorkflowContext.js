import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { WORKFLOW_STEPS } from '../data/mockData';
import { initialTelemetry, detectBiasWarnings, trackInteraction } from '../services/interactionService';
import { fetchEvidenceSynthesis } from '../services/aiService';
const WorkflowContext = createContext(null);
const GATED_STEPS = ['evidence', 'treatment', 'similar', 'decision', 'reflection'];
export function WorkflowProvider({ children }) {
    const [currentStep, setCurrentStep] = useState('overview');
    const [assessment, setAssessment] = useState(null);
    const [evidence, setEvidence] = useState(null);
    const [evidenceLoading, setEvidenceLoading] = useState(false);
    const [reflection, setReflection] = useState(null);
    const [telemetry, setTelemetry] = useState(initialTelemetry);
    const assessmentComplete = assessment !== null;
    const canAccessStep = useCallback((stepId) => {
        if (!GATED_STEPS.includes(stepId))
            return true;
        return assessmentComplete;
    }, [assessmentComplete]);
    const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.id === currentStep);
    const goToStep = useCallback((stepId) => {
        if (canAccessStep(stepId))
            setCurrentStep(stepId);
    }, [canAccessStep]);
    const goNext = useCallback(() => {
        const next = WORKFLOW_STEPS[currentIndex + 1];
        if (next && canAccessStep(next.id))
            setCurrentStep(next.id);
    }, [currentIndex, canAccessStep]);
    const goPrevious = useCallback(() => {
        const prev = WORKFLOW_STEPS[currentIndex - 1];
        if (prev)
            setCurrentStep(prev.id);
    }, [currentIndex]);
    const startAssessment = useCallback(() => {
        setTelemetry((t) => ({ ...t, assessmentStartTime: Date.now() }));
    }, []);
    const submitAssessment = useCallback(async (data) => {
        const completed = { ...data, completedAt: new Date().toISOString() };
        setAssessment(completed);
        setTelemetry((t) => ({ ...t, assessmentSubmitTime: Date.now() }));
        setEvidenceLoading(true);
        try {
            const synthesis = await fetchEvidenceSynthesis('4821-7734', completed);
            setEvidence(synthesis);
        }
        finally {
            setEvidenceLoading(false);
        }
        setCurrentStep('evidence');
    }, []);
    const submitReflection = useCallback((data) => {
        setReflection(data);
    }, []);
    const recordInteraction = useCallback((event) => {
        setTelemetry((t) => trackInteraction(t, event));
    }, []);
    const selectPatient = useCallback((patientId) => {
        setTelemetry((t) => ({ ...t, evidenceInteractions: [...t.evidenceInteractions, `selected:${patientId}`] }));
    }, []);
    const biasWarnings = useMemo(() => detectBiasWarnings(telemetry), [telemetry]);
    const value = {
        currentStep,
        steps: WORKFLOW_STEPS,
        assessment,
        assessmentComplete,
        evidence,
        evidenceLoading,
        reflection,
        telemetry,
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
    };
    return _jsx(WorkflowContext.Provider, { value: value, children: children });
}
export function useWorkflow() {
    const ctx = useContext(WorkflowContext);
    if (!ctx)
        throw new Error('useWorkflow must be used within WorkflowProvider');
    return ctx;
}
