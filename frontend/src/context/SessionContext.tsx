import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { postPredict } from "../api/client";
import type { PatientPayload, PredictResponse, StepId, UserDecision } from "../api/types";
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
    (!prediction.requires_uncertainty_acknowledgment || uncertaintyAcknowledged);

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
    ]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession outside SessionProvider");
  return ctx;
}
