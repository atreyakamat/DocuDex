import time
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import AIProcessingResult
from app.services.ocr import extract_text
from app.services.classifier import classify_document
from app.services.extractor import extract_fields

router = APIRouter()


@router.post("", response_model=AIProcessingResult)
async def process_document(file: UploadFile = File(...)):
    """
    Accept a document file, perform OCR → classification → field extraction.
    Returns a structured AIProcessingResult.
    """
    allowed_types = {"application/pdf", "image/jpeg", "image/png", "image/tiff", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    start = time.time()
    contents = await file.read()

    # 1. OCR
    raw_text, ocr_confidence = extract_text(contents, file.content_type or "")

    # 2. Classify
    classification = classify_document(raw_text, file.filename or "")

    # 3. Extract fields
    extraction = extract_fields(raw_text, classification.documentType, ocr_confidence)

    elapsed_ms = int((time.time() - start) * 1000)

    return AIProcessingResult(
        classification=classification,
        extraction=extraction,
        processingTimeMs=elapsed_ms,
    )
