"""
OncoAI FastAPI: full REST surface for the React decision-support app.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Literal, Optional, Union

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.medical_logic import (
    PatientInputs,
    analysis_features,
    compute_prediction,
    generate_chat_reply,
    predict_bundle,
    scenario_result,
)

app = FastAPI(title="OncoAI API", version="2.0.0")

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ML_CASES_PATHS = [
    PROJECT_ROOT / "frontend" / "public" / "study_cases.json",
    PROJECT_ROOT / "data" / "derived" / "predictions.json",
]


def _load_ml_cases() -> list[dict[str, Any]]:
    for path in ML_CASES_PATHS:
        if not path.exists():
            continue
        try:
            with path.open("r", encoding="utf-8") as handle:
                payload = json.load(handle)
            if isinstance(payload, list):
                return [item for item in payload if isinstance(item, dict)]
        except (json.JSONDecodeError, OSError):
            continue
    return []


ML_CASE_CACHE: list[dict[str, Any]] | None = None


def _get_ml_case(patient: Any) -> dict[str, Any] | None:
    global ML_CASE_CACHE
    if ML_CASE_CACHE is None:
        ML_CASE_CACHE = _load_ml_cases()

    if isinstance(patient, dict):
        if isinstance(patient.get("options"), list) and patient.get("options"):
            return patient

        patient_id = patient.get("patient_id")
        if patient_id:
            for case in ML_CASE_CACHE:
                if case.get("patient_id") == patient_id:
                    return case

    return None


def _probability_percent(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, (int, float)):
        if 0 <= float(value) <= 1:
            return int(round(float(value) * 100))
        return int(round(float(value)))
    return 0


def _build_recommendations_from_ml_case(case: dict[str, Any]) -> list[dict[str, Any]]:
    options = case.get("options") or []
    recommendations: list[dict[str, Any]] = []

    for index, option in enumerate(options[:3], start=1):
        if not isinstance(option, dict):
            continue
        features = option.get("features") or []
        shap = []
        for feature in features:
            if isinstance(feature, dict):
                shap.append(
                    {
                        "feature": str(feature.get("name", "Unknown")),
                        "value": float(feature.get("weight", 0.0) or 0.0),
                    }
                )

        recommendations.append(
            {
                "id": f"option-{index}",
                "name": str(option.get("regime") or option.get("name") or f"Option {index}"),
                "probability": _probability_percent(option.get("probability")),
                "shap": shap,
            }
        )

    return recommendations

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientPayload(BaseModel):
    age: int = Field(55, ge=18, le=100)
    stage: str = "III"
    prior_treatment: str = "No"
    tumor_size: float = Field(3.5, ge=0.5, le=15.0)
    symptom_severity: str = "Moderate"


def _to_inputs(p: PatientPayload) -> PatientInputs:
    return PatientInputs(
        age=p.age,
        stage=p.stage,
        prior_treatment=p.prior_treatment,
        tumor_size=p.tumor_size,
        symptom_severity=p.symptom_severity,
    )


class PredictRequest(BaseModel):
    patient: PatientPayload
    user_decision: Literal["Treat", "Not Treat", "Unsure"]


class PredictResponse(BaseModel):
    success_probability: float
    model_confidence: float
    success_percent: int
    confidence_percent: int
    warnings: list[str]
    low_confidence: bool
    requires_uncertainty_acknowledgment: bool
    nudge: dict[str, Any]
    comparison: dict[str, Any]
    user_decision: str


class AnalyzeRequest(BaseModel):
    patient: PatientPayload


class FeatureRow(BaseModel):
    name: str
    weight: float
    explanation: str


class AnalyzeResponse(BaseModel):
    features: list[FeatureRow]


class ScenarioRequest(BaseModel):
    patient: PatientPayload
    variable: Literal["tumor_size", "age", "stage"]
    value: Union[float, int, str]


class ScenarioResponse(BaseModel):
    baseline_success_probability: float
    scenario_success_probability: float
    baseline_percent: int
    scenario_percent: int
    delta_percent_points: int


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    patient: Optional[PatientPayload] = None


class ChatResponse(BaseModel):
    reply: str


class TreatmentRecommendation(BaseModel):
    id: str
    name: str
    probability: int
    shap: list[dict[str, Any]]


class TreatmentRecommendationResponse(BaseModel):
    recommendations: list[TreatmentRecommendation]   


class TreatmentRecommendationRequest(BaseModel):
    patient: dict[str, Any]





@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(body: PredictRequest):
    inputs = _to_inputs(body.patient)
    data = predict_bundle(inputs, body.user_decision)
    return PredictResponse(**data)


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest):
    _ = _to_inputs(body.patient)  # reserved for future patient-specific explanations
    rows = analysis_features()
    return AnalyzeResponse(features=[FeatureRow(**r) for r in rows])


@app.post("/scenario", response_model=ScenarioResponse)
def scenario(body: ScenarioRequest):
    inputs = _to_inputs(body.patient)
    try:
        data = scenario_result(inputs, body.variable, body.value)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return ScenarioResponse(**data)


@app.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    if body.patient:
        p = _to_inputs(body.patient)
    else:
        p = PatientInputs()
    pred = compute_prediction(p)
    reply = generate_chat_reply(body.message.strip(), p, pred)
    return ChatResponse(reply=reply)


@app.post(
    "/treatment-recommendations",
    response_model=TreatmentRecommendationResponse
)
def treatment_recommendations(body: TreatmentRecommendationRequest):
    ml_case = _get_ml_case(body.patient)
    if not ml_case:
        return {"recommendations": []}

    recommendations = _build_recommendations_from_ml_case(ml_case)
    return {"recommendations": recommendations}




