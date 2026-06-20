from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    frontend_origin: str = "http://localhost:5173"

    supabase_url: str = ""
    supabase_anon_key: str = ""

    ai_provider_order: str = "groq,huggingface,ollama,fallback"

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    hf_token: str = ""
    hf_model: str = "moonshotai/Kimi-K2-Instruct-0905"
    hf_base_url: str = "https://router.huggingface.co/v1"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.1"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def provider_order(self) -> list[str]:
        return [p.strip().lower() for p in self.ai_provider_order.split(",") if p.strip()]


settings = Settings()
