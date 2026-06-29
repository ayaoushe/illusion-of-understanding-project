import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchCases, postPredict } from "../api/client";
import { SHOW_NUDGE } from "../config";
import type {
  CaseRecord,
  PatientPayload,
  PredictResponse,
  StepId,
  UserDecision,
} from "../api/types";
import type { ChatMessage } from "../types";

const defaultPatient: PatientPayload = {
  age: 55,
  stage: "III",
  prior_treatment: "No",
  tumor_size: 3.5,
  symptom_severity: "Moderate",
};

interface SessionContextValue {
  step: StepId;
  setStep: (s: StepId) => void;
  patient: PatientPayload;
  setPatient: (p: Partial<PatientPayload>) => void;
  userDecision: UserDecision | null;
  prediction: PredictResponse | null;
  submitAssessment: (decision: UserDecision) => Promise<void>;
  predictError: string | null;
  uncertaintyAcknowledged: boolean;
  setUncertaintyAcknowledged: (v: boolean) => void;
  nudgeDismissed: boolean;
  setNudgeDismissed: (v: boolean) => void;
  userConfidence: number;
  setUserConfidence: (n: number) => void;
  reflection1: string;
  setReflection1: (s: string) => void;
  reflection2: string;
  setReflection2: (s: string) => void;
  reflection3: string;
  setReflection3: (s: string) => void;
  showComparison: boolean;
  setShowComparison: (v: boolean) => void;
  chatMessages: ChatMessage[];
  appendChatMessage: (m: ChatMessage) => void;
  canAccessPostPredictSteps: boolean;
  canAccessReflection: boolean;
  cases: CaseRecord[];
  activeCaseId: string | null;
  activeCase: CaseRecord | null;
  setActiveCase: (patientId: string) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<StepId>("patient");
  const [patient, setPatientState] = useState<PatientPayload>({ ...defaultPatient });
  const [userDecision, setUserDecision] = useState<UserDecision | null>(null);
  const [prediction, setPrediction] = useState<PredictResponse | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [uncertaintyAcknowledged, setUncertaintyAcknowledged] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  const [userConfidence, setUserConfidence] = useState(70);
  const [reflection1, setReflection1] = useState("");
  const [reflection2, setReflection2] = useState("");
  const [reflection3, setReflection3] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await fetchCases();
        if (cancelled) return;
        setCases(loaded);
        if (loaded.length > 0) setActiveCaseId(loaded[0].patient_id);
      } catch (e) {
        console.error("Failed to load cases", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCase = useMemo(
    () => cases.find((c) => c.patient_id === activeCaseId) ?? null,
    [cases, activeCaseId]
  );

  const setActiveCase = useCallback((patientId: string) => {
    setActiveCaseId(patientId);
    // Restart the Assessment-First flow cleanly so nothing from the previous case lingers.
    setUserDecision(null);
    setPrediction(null);
    setPredictError(null);
    setUncertaintyAcknowledged(false);
    setNudgeDismissed(false);
    setUserConfidence(70);
    setReflection1("");
    setReflection2("");
    setReflection3("");
    setShowComparison(false);
    setChatMessages([]);
    setStep("patient");
  }, []);

  const setPatient = useCallback((p: Partial<PatientPayload>) => {
    setPatientState((prev) => ({ ...prev, ...p }));
  }, []);

  const submitAssessment = useCallback(async (decision: UserDecision) => {
    setPredictError(null);
    setUserDecision(decision);
    setNudgeDismissed(false);
    setUncertaintyAcknowledged(false);
    try {
      const pred = await postPredict(patient, decision);
      setPrediction(pred);
      setChatMessages([]);
      if (!pred.requires_uncertainty_acknowledgment) {
        setUncertaintyAcknowledged(true);
      }
      setStep("results");
    } catch (e) {
      setPredictError(e instanceof Error ? e.message : "Prediction failed");
      throw e;
    }
  }, [patient]);

  const appendChatMessage = useCallback((m: ChatMessage) => {
    setChatMessages((prev) => [...prev, m]);
  }, []);

  const canAccessPostPredictSteps = prediction !== null;
  const canAccessReflection =
    prediction !== null &&
    (!SHOW_NUDGE || !prediction.requires_uncertainty_acknowledgment || uncertaintyAcknowledged);

  const value = useMemo(
    () => ({
      step,
      setStep,
      patient,
      setPatient,
      userDecision,
      prediction,
      submitAssessment,
      predictError,
      uncertaintyAcknowledged,
      setUncertaintyAcknowledged,
      nudgeDismissed,
      setNudgeDismissed,
      userConfidence,
      setUserConfidence,
      reflection1,
      setReflection1,
      reflection2,
      setReflection2,
      reflection3,
      setReflection3,
      showComparison,
      setShowComparison,
      chatMessages,
      appendChatMessage,
      canAccessPostPredictSteps,
      canAccessReflection,
      cases,
      activeCaseId,
      activeCase,
      setActiveCase,
    }),
    [
      step,
      patient,
      userDecision,
      prediction,
      submitAssessment,
      predictError,
      uncertaintyAcknowledged,
      nudgeDismissed,
      userConfidence,
      reflection1,
      reflection2,
      reflection3,
      showComparison,
      chatMessages,
      appendChatMessage,
      canAccessPostPredictSteps,
      canAccessReflection,
      cases,
      activeCaseId,
      activeCase,
      setActiveCase,
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}
