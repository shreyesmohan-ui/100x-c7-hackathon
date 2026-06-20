from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import GradeRequest, GradeResponse
from app.providers import grade_with_best_available_provider
from app.security import verify_supabase_bearer_token

app = FastAPI(
    title="Eval Co-pilot API",
    version="1.0.0",
    description="Protected grading API for AI golden-set evaluation.",
)

allowed_origins = {
    settings.frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}
allowed_origins = [origin for origin in allowed_origins if origin]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {
        "ok": True,
        "app_env": settings.app_env,
        "providers": settings.provider_order,
    }


@app.post("/api/grade", response_model=GradeResponse)
async def grade(payload: GradeRequest, authorization: str | None = Header(default=None)):
    await verify_supabase_bearer_token(authorization)
    return await grade_with_best_available_provider(payload)
