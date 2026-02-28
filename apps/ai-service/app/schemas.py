from pydantic import BaseModel
from typing import Optional, Dict, Any
from enum import Enum


class DocumentCategory(str, Enum):
    ID = "ID"
    FINANCIAL = "FINANCIAL"
    LEGAL = "LEGAL"
    EDUCATIONAL = "EDUCATIONAL"
    PROPERTY = "PROPERTY"
    MEDICAL = "MEDICAL"
    OTHER = "OTHER"


class DocumentType(str, Enum):
    AADHAAR = "AADHAAR"
    PAN = "PAN"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    VOTER_ID = "VOTER_ID"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    BANK_STATEMENT = "BANK_STATEMENT"
    ITR = "ITR"
    SALARY_SLIP = "SALARY_SLIP"
    PROPERTY_DEED = "PROPERTY_DEED"
    DEGREE_CERTIFICATE = "DEGREE_CERTIFICATE"
    MEDICAL_REPORT = "MEDICAL_REPORT"
    OTHER = "OTHER"


class ClassificationResult(BaseModel):
    documentType: str
    category: str
    confidence: float
    suggestedName: Optional[str] = None


class ExtractionResult(BaseModel):
    fields: Dict[str, Any] = {}
    rawText: Optional[str] = None
    confidence: float


class AIProcessingResult(BaseModel):
    classification: ClassificationResult
    extraction: ExtractionResult
    summary: Optional[str] = None
    processingTimeMs: int
