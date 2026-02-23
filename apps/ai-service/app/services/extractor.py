"""
Field extractor — pulls structured fields from OCR text based on document type.
"""
import re
from typing import Any, Dict, Optional, Tuple
from app.schemas import ExtractionResult


def extract_fields(raw_text: str, doc_type: str, ocr_confidence: float) -> ExtractionResult:
    """
    Extract structured fields from raw OCR text given a document type.
    Returns an ExtractionResult.
    """
    fields: Dict[str, Any] = {}

    extractors: Dict[str, Any] = {
        "AADHAAR": _extract_aadhaar,
        "PAN": _extract_pan,
        "PASSPORT": _extract_passport,
        "DRIVING_LICENSE": _extract_dl,
        "VOTER_ID": _extract_voter,
        "BANK_STATEMENT": _extract_bank,
        "ITR": _extract_itr,
        "SALARY_SLIP": _extract_salary,
    }

    fn = extractors.get(doc_type)
    if fn:
        fields = fn(raw_text)

    # Add expiry date extraction for all types
    expiry = _find_expiry(raw_text)
    if expiry and "expiryDate" not in fields:
        fields["expiryDate"] = expiry

    return ExtractionResult(
        fields=fields,
        rawText=raw_text[:500] if raw_text else None,
        confidence=round(ocr_confidence * 0.9, 2),
    )


# ─── Per-type extractors ──────────────────────────────────

def _extract_aadhaar(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    uid = re.search(r"\b(\d{4}\s?\d{4}\s?\d{4})\b", text)
    if uid:
        fields["aadhaarNumber"] = uid.group(1).replace(" ", "")
    dob = _find_dob(text)
    if dob:
        fields["dateOfBirth"] = dob
    name = _find_name(text)
    if name:
        fields["name"] = name
    return fields


def _extract_pan(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    pan = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", text)
    if pan:
        fields["panNumber"] = pan.group(1)
    name = _find_name(text)
    if name:
        fields["name"] = name
    dob = _find_dob(text)
    if dob:
        fields["dateOfBirth"] = dob
    return fields


def _extract_passport(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    passport_no = re.search(r"\b([A-Z][0-9]{7})\b", text)
    if passport_no:
        fields["passportNumber"] = passport_no.group(1)
    dob = _find_dob(text)
    if dob:
        fields["dateOfBirth"] = dob
    expiry = _find_expiry(text)
    if expiry:
        fields["expiryDate"] = expiry
    name = _find_name(text)
    if name:
        fields["name"] = name
    return fields


def _extract_dl(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    dl = re.search(r"\b([A-Z]{2}[0-9]{2}\s?[0-9]{11})\b", text)
    if dl:
        fields["dlNumber"] = dl.group(1).replace(" ", "")
    expiry = _find_expiry(text)
    if expiry:
        fields["expiryDate"] = expiry
    name = _find_name(text)
    if name:
        fields["name"] = name
    return fields


def _extract_voter(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    epic = re.search(r"\b([A-Z]{3}[0-9]{7})\b", text)
    if epic:
        fields["epicNumber"] = epic.group(1)
    name = _find_name(text)
    if name:
        fields["name"] = name
    return fields


def _extract_bank(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    acc = re.search(r"account\s*(?:no|number)[:\s]+(\d{9,18})", text, re.IGNORECASE)
    if acc:
        fields["accountNumber"] = acc.group(1)
    ifsc = re.search(r"\b([A-Z]{4}0[A-Z0-9]{6})\b", text)
    if ifsc:
        fields["ifscCode"] = ifsc.group(1)
    return fields


def _extract_itr(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    ay = re.search(r"assessment\s+year[:\s]+(20\d{2}-\d{2})", text, re.IGNORECASE)
    if ay:
        fields["assessmentYear"] = ay.group(1)
    pan = re.search(r"\b([A-Z]{5}[0-9]{4}[A-Z])\b", text)
    if pan:
        fields["panNumber"] = pan.group(1)
    return fields


def _extract_salary(text: str) -> Dict[str, Any]:
    fields: Dict[str, Any] = {}
    net = re.search(r"net\s*(?:salary|pay)[:\s₹]*([\d,]+)", text, re.IGNORECASE)
    if net:
        fields["netSalary"] = net.group(1).replace(",", "")
    month = re.search(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b", text, re.IGNORECASE)
    if month:
        fields["month"] = month.group(1).capitalize()
    return fields


# ─── Helpers ─────────────────────────────────────────────

def _find_dob(text: str) -> Optional[str]:
    m = re.search(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b", text)
    return m.group(1) if m else None


def _find_expiry(text: str) -> Optional[str]:
    m = re.search(r"(?:expiry|valid till|valid upto|date of expiry)[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{4})", text, re.IGNORECASE)
    return m.group(1) if m else None


def _find_name(text: str) -> Optional[str]:
    m = re.search(r"(?:name|s/o|d/o|w/o)[:\s]+([A-Z][a-z]+(?: [A-Z][a-z]+){1,3})", text)
    return m.group(1) if m else None
