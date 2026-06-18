"""
Heuristic bias inference from interaction telemetry (simulated research instrument).

Not diagnostic of individuals — surfaces plausible cognitive-risk patterns for HCI study.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class InteractionTelemetry(BaseModel):
    """Aggregated client-side behavioral signals."""

    predict_submitted_at_ms: float | None = None
    results_first_paint_at_ms: float | None = None
    ms_results_to_first_explanation_enter: float | None = None
    ms_results_to_first_scenario_enter: float | None = None
    explanation_step_visit_count: int = 0
    explanation_accordion_total_opens: int = 0
    feature_open_counts: dict[str, int] = Field(default_factory=dict)
    scenario_deviation_events: int = 0
    visited_explanation_step: bool = False
    visited_scenario_step: bool = False
    chat_user_turns: int = 0
    user_decision: str = ""
    ai_success_percent: int = 0
    ai_recommend_treat: bool = False
    user_aligned_with_ai: bool | None = None


class BiasAnalysisResult(BaseModel):
    bias_warnings: list[str]
    exploration_depth: Literal["shallow", "moderate", "deep"]
    critical_thinking_score: int = Field(ge=0, le=100)
    rationale: list[str]


def _depth(t: InteractionTelemetry) -> Literal["shallow", "moderate", "deep"]:
    score = 0
    if t.visited_explanation_step:
        score += 2
    if t.explanation_accordion_total_opens >= 3:
        score += 1
    if t.visited_scenario_step:
        score += 1
    if t.scenario_deviation_events >= 2:
        score += 1
    if t.chat_user_turns >= 2:
        score += 1
    if score <= 1:
        return "shallow"
    if score <= 3:
        return "moderate"
    return "deep"


def analyze_telemetry(t: InteractionTelemetry) -> BiasAnalysisResult:
    warnings: list[str] = []
    rationale: list[str] = []
    score = 72

    # Automation / complacency: skipped structured exploration
    if not t.visited_explanation_step and not t.visited_scenario_step:
        warnings.append(
            "Possible automation bias or complacency: neither explanations nor "
            "scenarios were opened before reflection."
        )
        rationale.append("No explanation or scenario step visits recorded.")
        score -= 22
    elif not t.visited_explanation_step:
        warnings.append(
            "You did not open the explanation view — risk of accepting numeric output "
            "without inspecting contributing factors."
        )
        rationale.append("Explanation step not visited.")
        score -= 12
    elif not t.visited_scenario_step:
        warnings.append(
            "No scenario exploration recorded — sensitivity to assumptions was not stress-tested."
        )
        rationale.append("Scenario step not visited.")
        score -= 8

    # Fast pivot to deep explanation content without breadth
    if t.explanation_step_visit_count > 0 and t.explanation_accordion_total_opens <= 1:
        warnings.append(
            "Possible narrow focus: few explanation panels were opened relative to visit count."
        )
        rationale.append("Low accordion engagement on explanation step.")
        score -= 6

    # Single-feature fixation
    if t.feature_open_counts:
        total = sum(t.feature_open_counts.values()) or 1
        mx = max(t.feature_open_counts.values())
        if total >= 4 and mx / total >= 0.85:
            dominant = next(k for k, v in t.feature_open_counts.items() if v == mx)
            warnings.append(
                f"Heavy focus on “{dominant}” in explanations — consider whether other "
                "factors (symptoms, prior treatment, stage) deserve equal scrutiny."
            )
            rationale.append("Feature open distribution skewed to one factor.")
            score -= 10

    # Very fast path from results to first structured exploration
    if t.ms_results_to_first_explanation_enter is not None and t.ms_results_to_first_explanation_enter < 2500:
        if t.explanation_accordion_total_opens < 2:
            warnings.append(
                "You reached explanations very quickly with little engagement — "
                "possible shallow processing or automation bias."
            )
            rationale.append("Short dwell before substantive explanation interaction.")
            score -= 8

    # Confirmation bias heuristic: user agrees with AI under tension
    if t.user_aligned_with_ai is True and t.ai_success_percent < 48:
        warnings.append(
            "Your decision aligned with a “treat”-leaning stance while the model estimates "
            "low success — pause to justify why clinical factors outweigh the score."
        )
        rationale.append("User–model agreement under low predicted success.")
        score -= 12

    # Reward dialogic engagement
    if t.chat_user_turns >= 3:
        score = min(100, score + 8)
        rationale.append("Multiple reflective chat turns recorded (+).")

    if t.scenario_deviation_events >= 3:
        score = min(100, score + 6)
        rationale.append("Repeated scenario probing recorded (+).")

    depth = _depth(t)
    if depth == "deep":
        score = min(100, score + 10)
    elif depth == "shallow":
        score = max(0, score - 5)

    score = max(0, min(100, score))
    if not warnings:
        warnings.append(
            "No strong bias heuristics fired — still treat scores as exploratory, not diagnostic."
        )

    return BiasAnalysisResult(
        bias_warnings=warnings,
        exploration_depth=depth,
        critical_thinking_score=score,
        rationale=rationale or ["Telemetry within nominal exploratory range."],
    )
