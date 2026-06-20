import httpx
from openai import OpenAI

from app.config import settings
from app.grader import build_eval_prompt, deterministic_fallback, parse_grade_json
from app.models import GradeRequest, GradeResponse


class ProviderError(Exception):
    pass


def _chat_messages(prompt: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": "You are a strict AI evaluator. Return valid JSON only.",
        },
        {"role": "user", "content": prompt},
    ]


def call_openai_compatible(
    *,
    base_url: str,
    api_key: str,
    model: str,
    payload: GradeRequest,
    provider_name: str,
) -> GradeResponse:
    if not api_key:
        raise ProviderError(f"{provider_name} API key missing")

    prompt = build_eval_prompt(payload)
    client = OpenAI(base_url=base_url, api_key=api_key)

    completion = client.chat.completions.create(
        model=model,
        temperature=0.1,
        messages=_chat_messages(prompt),
    )

    content = completion.choices[0].message.content or ""
    return GradeResponse(provider=provider_name, model=model, results=parse_grade_json(content))


def call_groq(payload: GradeRequest) -> GradeResponse:
    return call_openai_compatible(
        base_url="https://api.groq.com/openai/v1",
        api_key=settings.groq_api_key,
        model=settings.groq_model,
        payload=payload,
        provider_name="groq",
    )


def call_huggingface(payload: GradeRequest) -> GradeResponse:
    return call_openai_compatible(
        base_url=settings.hf_base_url,
        api_key=settings.hf_token,
        model=settings.hf_model,
        payload=payload,
        provider_name="huggingface",
    )


async def call_ollama(payload: GradeRequest) -> GradeResponse:
    if not settings.ollama_base_url:
        raise ProviderError("Ollama base URL missing")

    prompt = build_eval_prompt(payload)

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            f"{settings.ollama_base_url.rstrip('/')}/api/chat",
            json={
                "model": settings.ollama_model,
                "messages": _chat_messages(prompt),
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.1},
            },
        )

    if response.status_code >= 400:
        raise ProviderError(f"Ollama error: {response.text[:500]}")

    content = response.json()["message"]["content"]
    return GradeResponse(provider="ollama", model=settings.ollama_model, results=parse_grade_json(content))


def call_fallback(payload: GradeRequest) -> GradeResponse:
    return GradeResponse(
        provider="fallback",
        model="keyword-overlap",
        results=deterministic_fallback(payload),
    )


async def grade_with_best_available_provider(payload: GradeRequest) -> GradeResponse:
    errors: list[str] = []

    for provider in settings.provider_order:
        try:
            if provider == "groq":
                return call_groq(payload)
            if provider in {"huggingface", "hf"}:
                return call_huggingface(payload)
            if provider == "ollama":
                return await call_ollama(payload)
            if provider == "fallback":
                return call_fallback(payload)
        except Exception as exc:
            errors.append(f"{provider}: {exc}")

    fallback = call_fallback(payload)
    fallback.results[0].reason = f"All model providers failed. Fallback used. Errors: {' | '.join(errors)[:700]}"
    return fallback
