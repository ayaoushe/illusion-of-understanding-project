import type { ReactNode } from 'react';
import { PatientOverview } from './steps/PatientOverview';
import { HumanAssessment } from './steps/HumanAssessment';
import { EvidenceReview } from './steps/EvidenceReview';
import { TreatmentComparison } from './steps/TreatmentComparison';
import { SimilarCases } from './steps/SimilarCases';
import { DecisionFactors } from './steps/DecisionFactors';
import { FinalReflection } from './steps/FinalReflection';

interface StepContentProps {
  step: string;
  patient: any;
  assessment: any;
  evidence: any;
  treatments: any[];
  similarCases: any[];
  factors: any[];
  reflection: any;
}

export function StepContent({ step, patient, assessment, evidence, treatments, similarCases, factors, reflection }: StepContentProps) {
  const commonProps = { patient, assessment, evidence, treatments, similarCases, factors, reflection };

  const pages: Record<string, ReactNode> = {
    'Patient Overview': <PatientOverview patient={patient} />, 
    'Human Assessment': <HumanAssessment assessment={assessment} patient={patient} />, 
    'Evidence Review': <EvidenceReview evidence={evidence} />, 
    'Treatment Comparison': <TreatmentComparison treatments={treatments} />, 
    'Similar Cases': <SimilarCases similarCases={similarCases} />, 
    'Decision Factors': <DecisionFactors factors={factors} />, 
    'Final Reflection': <FinalReflection reflection={reflection} />,
  };

  return <div className="step-panel">{pages[step] ?? null}</div>;
}
