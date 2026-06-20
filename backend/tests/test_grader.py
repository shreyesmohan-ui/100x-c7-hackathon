from app.grader import deterministic_fallback
from app.models import EvalCase, GradeRequest


def test_deterministic_fallback_returns_result():
    request = GradeRequest(
        feature_name="Test feature",
        rubric="Must mention source and avoid hallucination.",
        cases=[
            EvalCase(
                case_id="case-1",
                input="Summarize document",
                expected_output="Mention source and avoid unsupported claims.",
                actual_output="This mentions source but may need review.",
            )
        ],
    )

    results = deterministic_fallback(request)
    assert len(results) == 1
    assert results[0].case_id == "case-1"
    assert results[0].status in {"pass", "fail", "needs_review"}
