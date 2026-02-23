from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import health, process

app = FastAPI(
    title="DocuDex AI Service",
    description="AI-powered document classification and extraction",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(process.router, prefix="/process", tags=["Processing"])
