import os
from dataclasses import dataclass


@dataclass
class Config:
    # Admin API (Edge Function gateway)
    admin_api_url: str
    admin_api_secret: str

    # Claude API
    claude_api_key: str
    claude_model: str = "claude-sonnet-4-20250514"

    # Processing
    quality_threshold: float = 0.80
    max_retries: int = 3

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            admin_api_url=os.environ["ADMIN_API_URL"],
            admin_api_secret=os.environ["ADMIN_API_SECRET"],
            claude_api_key=os.environ["CLAUDE_API_KEY"],
            claude_model=os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-20250514"),
            quality_threshold=float(os.environ.get("QUALITY_THRESHOLD", "0.80")),
            max_retries=int(os.environ.get("MAX_RETRIES", "3")),
        )


# Load config from environment - will raise if required vars missing
# Wrapped in try/except to allow importing module without env vars set
try:
    config = Config.from_env()
except KeyError:
    config = None  # Config will be None until env vars are set
