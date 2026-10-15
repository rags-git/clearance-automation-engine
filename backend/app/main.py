from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.routers import auth, clearance, grievance, admin, certificate


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create DB tables if not existing
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Workflow-driven digital clearance platform implementing Chain of Responsibility pattern, multi-department verification gates, SLA-based grievance tracking, and cryptographic certificate issuance.",
    version="1.0.0",
    lifespan=lifespan
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all during development and demonstration
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(clearance.router, prefix=settings.API_V1_STR)
app.include_router(grievance.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(certificate.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "api_v1": settings.API_V1_STR
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "architecture": "Chain of Responsibility Pattern with Parallel & Sequential Verification Gates",
        "version": "1.0.0"
    }
