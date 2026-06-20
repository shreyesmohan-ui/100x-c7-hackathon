import json
import re
from collections import Counter

from app.models import GradeRequest, GradeResult


def build_eval_prompt(payload: GradeRequest) -> str:
    cases_json = [case.model_dump() for case in payload.cases]

    return f'''
You are Eval Co-pilot, a strict evaluator for AI features.

Mission:
Grade each actual output against the human-written expected output and rubric.
This tool exists to find failures before shipping, so do not be generous.

Feature name:
{payload.feature_name}

Feature description:
{payload.feature_description or "Not provided"}

Rubric:
{payload.rubric}

Cases:
{json.dumps(cases_json, ensure_ascii=False, indent=2)}

Return ONLY valid JSON in this exact shape:
{{
  "results": [
    {{
      "case_id": "same case_id from input",
      "status": "pass | fail | needs_review",
      "score": 0.0,
      "reason": "specific explanation comparing expected vs actual",
      "missing_requirements": ["specific missing requirement 1"],
      "suggested_fix": "specific change to prompt, guardrail, retrieval, schema, model, or output constraint",
      "is_unknown_failure": true
    }}
  ]
}}

Grading rules:
- PASS only when the actual output satisfies the expected output and rubric.
- FAIL if the output is plausible but misses a critical requirement.
- FAIL if the output invents facts, overclaims, ignores format, or is unsafe to ship.
- NEEDS_REVIEW only if the case is genuinely ambiguous.
- score should be 0 to 1.
- missing_requirements must be concrete.
- suggested_fix must be actionable, not generic.
'''.strip()


def extract_json_object(text: str) -> dict:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def parse_grade_json(text: str) -> list[GradeResult]:
    data = extract_json_object(text)
    results = data["results"] if isinstance(data, dict) else data
    return [GradeResult(**item) for item in results]


def tokenize(value: str) -> list[str]:
    return re.findall(r"[a-zA-Z0-9]+", value.lower())


def deterministic_fallback(payload: GradeRequest) -> list[GradeResult]:
    output: list[GradeResult] = []

    for case in payload.cases:
        expected_tokens = tokenize(case.expected_output)
        actual_tokens = tokenize(case.actual_output)

        if not expected_tokens or not actual_tokens:
            score = 0.0
        else:
            expected_counts = Counter(expected_tokens)
            actual_counts = Counter(actual_tokens)
            overlap = sum((expected_counts & actual_counts).values())
            score = overlap / max(len(expected_tokens), 1)

        if score >= 0.60:
            status = "needs_review"
            reason = "Keyword fallback sees decent overlap, but semantic judgment is needed before calling this a pass."
            missing = []
        elif score >= 0.35:
            status = "needs_review"
            reason = "Keyword fallback sees partial overlap; the output may be incomplete."
            missing = ["Manual check needed: expected-answer coverage may be incomplete."]
        else:
            status = "fail"
            reason = "Keyword fallback sees weak coverage of the expected answer."
            missing = ["Actual output does not cover enough expected-answer terms."]

        output.append(
            GradeResult(
                case_id=case.case_id,
                status=status,
                score=round(float(min(max(score, 0.0), 1.0)), 2),
                reason=reason,
                missing_requirements=missing,
                suggested_fix="Use Groq/Hugging Face/Ollama for semantic grading, or make the expected output more checklist-like.",
                is_unknown_failure=status == "fail",
            )
        )

    return output
