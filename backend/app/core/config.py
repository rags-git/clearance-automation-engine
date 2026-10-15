import os


class Settings:
    PROJECT_NAME: str = "PEC Academic Grievance, No-Dues & Clearance Automation Engine"
    INSTITUTION_NAME: str = "Punjab Engineering College (Deemed to be University), Chandigarh"
    INSTITUTION_SHORT: str = "PEC Chandigarh"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "pec-chandigarh-secret-academic-clearance-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./clearance_engine.db")
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]


settings = Settings()
