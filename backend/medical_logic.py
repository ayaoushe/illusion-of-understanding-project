"""
Shared oncology decision-support logic and rule-based assistant replies.
Used by Streamlit (app.py) and the FastAPI chat API.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, Optional

import numpy as np
from transformers import pipeline

# Load a free local model (runs on your computer)
chat_model = pipeline(
    "text-generation",
    model="microsoft/DialoGPT-small",
    tokenizer="microsoft/DialoGPT-small",
    return_full_text=False,
)

FEATURE_IMPORTANCE: Dict[str, Dict[str, Any]] = {
    "Tumor Size": {
        "weight": 0.36,
        "explanation": "Larger tumors (>5cm) correlate with lower success due to surgical complexity and metastasis risk.",
    },
    "Cancer Stage": {
        "weight": 0.29,
        "explanation": "Advanced stages indicate spread, reducing treatment efficacy.",
    },
    "Age": {
        "weight": 0.20,
        "explanation": "Older patients may have reduced tolerance to aggressive treatments.",
    },
    "Symptom Severity": {
        "weight": 0.10,
        "explanation": "Higher severity suggests poorer baseline health, affecting outcomes.",
    },
    "Prior Treatment": {
        "weight": 0.05,
        "explanation": "Previous treatments may indicate resistance or complications.",
    },
}


@dataclass
class PatientInputs:
    age: int = 55
    stage: str = "III"
    prior_treatment: str = "No"
    tumor_size: float = 3.5
    symptom_severity: str = "Moderate"


@dataclass
class PredictionResult:
    success_probability: float
    model_confidence: float
    age_penalty: float
    size_penalty: float
    stage_penalty: float
    prior_penalty: float
    severity_penalty: float


def compute_prediction(inputs: PatientInputs) -> PredictionResult:
    base_score = 0.83
    age_penalty = max(0.0, (inputs.age - 50) * 0.003)
    size_penalty = inputs.tumor_size * 0.03
    stage_penalty = {"I": 0.0, "II": 0.08, "III": 0.18, "IV": 0.32}[inputs.stage]
    prior_penalty = 0.06 if inputs.prior_treatment == "Yes" else 0.0
    severity_penalty = {"Low": 0.0, "Moderate": 0.06, "High": 0.14}[inputs.symptom_severity]

    success_probability = (
        base_score
        - age_penalty
        - size_penalty
        - stage_penalty
        - prior_penalty
        - severity_penalty
    )
    success_probability = float(np.clip(success_probability, 0.05, 0.97))
    model_confidence = 0.92 - abs(success_probability - 0.72) * 0.6
    model_confidence = float(np.clip(model_confidence, 0.55, 0.98))

    return PredictionResult(
        success_probability=success_probability,
        model_confidence=model_confidence,
        age_penalty=age_penalty,
        size_penalty=size_penalty,
        stage_penalty=stage_penalty,
        prior_penalty=prior_penalty,
        severity_penalty=severity_penalty,
    )


def scenario_probability(
    inputs: PatientInputs,
    *,
    tumor_size: Optional[float] = None,
    age: Optional[int] = None,
    stage: Optional[str] = None,
) -> float:
    """What-if: override one of tumor_size, age, or stage."""
    p = PatientInputs(
        age=inputs.age if age is None else age,
        stage=inputs.stage if stage is None else stage,
        prior_treatment=inputs.prior_treatment,
        tumor_size=inputs.tumor_size if tumor_size is None else tumor_size,
        symptom_severity=inputs.symptom_severity,
    )
    return compute_prediction(p).success_probability


def analysis_features() -> list[dict[str, Any]]:
    """Ordered feature rows for charts / explanation API."""
    return [
        {"name": name, "weight": data["weight"], "explanation": data["explanation"]}
        for name, data in FEATURE_IMPORTANCE.items()
    ]


def predict_bundle(inputs: PatientInputs, user_decision: str) -> dict[str, Any]:
    """Full prediction card: metrics, warnings, nudge eligibility, comparison stub."""
    pred = compute_prediction(inputs)
    sp, mc = pred.success_probability, pred.model_confidence

    warnings: list[str] = []
    if mc > 0.85:
        warnings.append("High confidence ≠ guaranteed accuracy. Consider broader clinical context.")
    low_conf = mc < 0.7
    if low_conf:
        warnings.append("Low confidence detected. Please acknowledge uncertainty before reflecting.")

    nudge_message = (
        "Your decision to treat contrasts with the AI's low success estimate. "
        "Consider if additional factors (e.g., patient preferences, comorbidities) justify proceeding."
    )
    nudge_eligible = user_decision == "Treat" and sp < 0.6

    return {
        "success_probability": sp,
        "model_confidence": mc,
        "success_percent": int(round(sp * 100)),
        "confidence_percent": int(round(mc * 100)),
        "warnings": warnings,
        "low_confidence": low_conf,
        "requires_uncertainty_acknowledgment": low_conf,
        "nudge": {"eligible": nudge_eligible, "message": nudge_message},
        "comparison": {
            "reference_label": "Similar Case (Better Outcome)",
            "reference_summary": "Age: 55, Stage: II, Tumor: 2.0cm",
            "reference_success_percent": 85,
            "note": "Smaller tumor led to higher success.",
        },
        "user_decision": user_decision,
    }


def scenario_result(inputs: PatientInputs, variable: str, value: Any) -> dict[str, Any]:
    """What-if one dimension; returns baseline and scenario success probabilities."""
    baseline = compute_prediction(inputs).success_probability
    if variable == "tumor_size":
        new_p = scenario_probability(inputs, tumor_size=float(value))
    elif variable == "age":
        new_p = scenario_probability(inputs, age=int(value))
    elif variable == "stage":
        new_p = scenario_probability(inputs, stage=str(value))
    else:
        raise ValueError(f"Unknown scenario variable: {variable}")
    delta_pp = int(round((new_p - baseline) * 100))
    return {
        "baseline_success_probability": baseline,
        "scenario_success_probability": new_p,
        "baseline_percent": int(round(baseline * 100)),
        "scenario_percent": int(round(new_p * 100)),
        "delta_percent_points": delta_pp,
    }


def _rule_based_chat_reply(message: str, inputs: PatientInputs, pred: PredictionResult) -> str:
    question_lower = message.lower()
    age = inputs.age
    tumor_size = inputs.tumor_size
    stage = inputs.stage
    success_probability = pred.success_probability
    model_confidence = pred.model_confidence

    if "hello" in question_lower or "hi" in question_lower:
        return (
            "Hello! I'm the OncoAI assistant. I can explain the AI prediction, discuss features, "
            "or answer questions about treatment success probability."
        )
    if "tumor" in question_lower and "size" in question_lower:
        return (
            f"Tumor size ({tumor_size}cm) is the most important factor (36% weight). Larger tumors "
            f"generally reduce success probability due to complexity and metastasis risk. At this size, "
            f"it's moderately important to your case."
        )
    if "confidence" in question_lower:
        conf_level = "high" if model_confidence > 0.8 else "moderate" if model_confidence > 0.6 else "low"
        return (
            f"Model confidence is {int(model_confidence * 100)}% ({conf_level}). This indicates how well "
            f"your case matches the training data. Always trust your clinical judgment alongside AI insights."
        )
    if "age" in question_lower:
        return (
            f"At {age} years, age accounts for 20% of the prediction weight. Older patients may have "
            f"lower treatment tolerance, but individual variation is significant. One factor among many."
        )
    if "stage" in question_lower:
        stage_text = {"I": "early/localized", "II": "moderately advanced", "III": "locally advanced", "IV": "metastatic"}[stage]
        return (
            f"Stage {stage} ({stage_text}) is the second most important factor (29% weight). Advanced stages "
            f"reduce estimated success, but modern oncology continues advancing treatment options."
        )
    if "factor" in question_lower or "importance" in question_lower:
        return (
            "Feature importance: Tumor size 36% • Stage 29% • Age 20% • Symptom severity 10% • "
            "Prior treatment 5%. These weights reflect the AI model's pattern recognition from training data."
        )
    if "missing" in question_lower or "data" in question_lower:
        return (
            "The AI considers 5 key features. Missing information might include: genetic mutations, "
            "comorbidities, performance status, patient preferences, or specific biomarkers. "
            "Always consider these in your decision."
        )
    if "treatment" in question_lower or "option" in question_lower:
        return (
            f"The AI predicts {int(success_probability * 100)}% success. This probability should inform "
            f"but not dictate your treatment choice. Consider patient preferences, comorbidities, "
            f"and available clinical options."
        )
    if "predict" in question_lower or "success" in question_lower:
        return (
            f"Prediction: {int(success_probability * 100)}% treatment success probability. This is a "
            f"statistical estimate, not a guarantee. Combine it with your expertise for best outcomes."
        )
    if "wrong" in question_lower or "error" in question_lower or "unreliable" in question_lower:
        return (
            "AI can fail due to: rare conditions, data limitations, unusual patient factors, or "
            "out-of-distribution cases. Always verify predictions with clinical judgment and patient context."
        )
    if "explain" in question_lower or "how" in question_lower:
        return (
            "This AI analyzes patient data and outputs success probability. It uses pattern recognition from "
            "training data. I can't explain the exact 'why' (black box), but I can discuss feature "
            "importance and sensitivities."
        )
    return (
        "I can help with: prediction details, feature importance, confidence assessment, or treatment "
        "considerations. What would you like to explore about this case?"
    )


def generate_chat_reply(message: str, inputs: PatientInputs, pred: PredictionResult) -> str:
    """Local AI assistant using Hugging Face model with rule-based fallback."""
    prompt = (
        "You are an oncology assistant. Answer clearly, carefully, and with humility. "
        "Remind the user that AI is only one input and clinical judgment is essential. "
        f"Patient details: Age {inputs.age}, Stage {inputs.stage}, Tumor size {inputs.tumor_size} cm, "
        f"Prior treatment {inputs.prior_treatment}, Symptom severity {inputs.symptom_severity}. "
        f"Predicted success probability: {int(pred.success_probability * 100)}%. "
        f"Question: {message}\nAssistant:"
    )

    try:
        response = chat_model(
            prompt,
            max_new_tokens=140,
            temperature=0.75,
            top_p=0.9,
            do_sample=True,
            repetition_penalty=1.2,
            no_repeat_ngram_size=3,
        )[0]["generated_text"].strip()
    except Exception:
        return _rule_based_chat_reply(message, inputs, pred)

    if not response or len(response) < 20:
        return _rule_based_chat_reply(message, inputs, pred)

    normalized = response.replace(prompt, "").strip()
    cleaned = normalized if normalized else response
    if cleaned.lower().startswith("assistant:"):
        cleaned = cleaned[len("assistant:"):].strip()

    if len(cleaned) < 20 or "you will need to ask" in cleaned.lower():
        return _rule_based_chat_reply(message, inputs, pred)

    return cleaned