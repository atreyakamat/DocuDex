from fastapi import APIRouter
from app.schemas_validate import ValidateRequest, ValidateResponse
from app.services.validator import validate_consistency

router = APIRouter()

@router.post("", response_model=ValidateResponse)
async def validate_documents(request: ValidateRequest):
    """
    Accept a list of extracted document fields and validate cross-document consistency.
    """
    result = validate_consistency(request.documents)
    return ValidateResponse(**result)
