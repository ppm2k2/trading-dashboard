from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Trading Terminal API"
    debug_mode: bool = True
    DATA_PROVIDER: str = "mock"
    ALPACA_API_KEY: str = ""
    ALPACA_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()