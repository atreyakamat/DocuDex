from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "healthy", "service": "docudex-ai", "timestamp": datetime.utcnow().isoformat()}
