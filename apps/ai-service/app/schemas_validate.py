from typing import List, Dict, Any
from pydantic import BaseModel

class ValidateRequest(BaseModel):
    documents: List[Dict[str, Any]]

class Anomaly(BaseModel):
    type: str
    description: str
    documents: List[str]

class ValidateResponse(BaseModel):
    isConsistent: bool
    anomalies: List[Anomaly]
