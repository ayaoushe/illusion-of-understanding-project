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




