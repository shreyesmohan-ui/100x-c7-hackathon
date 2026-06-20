from typing import Literal

from pydantic import BaseModel, Field


Status = Literal["pass", "fail", "needs_review"]


class EvalCase(BaseModel):
    case_id: str
    title: str | None = None
    input: str = Field(min_length=1)
    expected_output: str = Field(min_length=1)
    actual_output: str = Field(min_length=1)


class GradeRequest(BaseModel):
    feature_name: str = Field(min_length=1)
    feature_description: str | None = None
    rubric: str = Field(min_length=1)
    cases: list[EvalCase] = Field(min_length=1, max_length=20)


class GradeResult(BaseModel):
    case_id: str
    status: Status
    score: float = Field(ge=0, le=1)
    reason: str = Field(min_length=1)
    missing_requirements: list[str] = Field(default_factory=list)
    suggested_fix: str | None = None
    is_unknown_failure: bool = False


class GradeResponse(BaseModel):
    provider: str
    model: str
    results: list[GradeResult]


class UserInfo(BaseModel):
    id: str
    email: str | None = None
