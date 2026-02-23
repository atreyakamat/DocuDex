"""
Rule-based document classifier.
Uses keyword matching to determine DocumentType and Category.
"""
import re
from app.schemas import ClassificationResult

# Map of (DocumentType, Category) → list of keyword patterns
_RULES: list[tuple[str, str, list[str]]] = [
    ("AADHAAR", "ID", [r"aadhaar", r"uid\b", r"unique identification", r"uidai"]),
    ("PAN", "ID", [r"\bpan\b", r"permanent account number", r"income.?tax.?department"]),
    ("PASSPORT", "ID", [r"passport", r"republic of india", r"place of birth", r"nationality"]),
    ("DRIVING_LICENSE", "ID", [r"driving licen[sc]e", r"dl no", r"transport authority"]),
    ("VOTER_ID", "ID", [r"voter", r"election commission", r"epic"]),
    ("BIRTH_CERTIFICATE", "ID", [r"birth certificate", r"date of birth", r"place of birth", r"municipal"]),
    ("BANK_STATEMENT", "FINANCIAL", [r"bank statement", r"account statement", r"opening balance", r"closing balance"]),
    ("ITR", "FINANCIAL", [r"income.?tax return", r"itr", r"assessment year", r"gross total income"]),
    ("SALARY_SLIP", "FINANCIAL", [r"salary slip", r"pay slip", r"payslip", r"basic pay", r"net salary"]),
    ("PROPERTY_DEED", "PROPERTY", [r"sale deed", r"property deed", r"conveyance", r"sub.?registrar"]),
    ("DEGREE_CERTIFICATE", "EDUCATIONAL", [r"degree certificate", r"bachelor", r"master of", r"university"]),
    ("MEDICAL_REPORT", "MEDICAL", [r"medical report", r"prescription", r"diagnosis", r"patient name"]),
]


def classify_document(raw_text: str, filename: str) -> ClassificationResult:
    """
    Classify a document from its OCR text and filename.
    Returns a ClassificationResult.
    """
    combined = (raw_text + " " + filename).lower()

    best_type = "OTHER"
    best_category = "OTHER"
    best_score = 0

    for doc_type, category, patterns in _RULES:
        score = sum(1 for p in patterns if re.search(p, combined))
        if score > best_score:
            best_score = score
            best_type = doc_type
            best_category = category

    confidence = min(0.5 + best_score * 0.15, 0.95) if best_score > 0 else 0.3

    suggested = _suggest_name(best_type, combined)

    return ClassificationResult(
        documentType=best_type,
        category=best_category,
        confidence=round(confidence, 2),
        suggestedName=suggested,
    )


def _suggest_name(doc_type: str, text: str) -> str | None:
    """Generate a suggested document name."""
    year_match = re.search(r"\b(20\d{2})\b", text)
    year = year_match.group(1) if year_match else None
    base = doc_type.replace("_", " ").title()
    return f"{base} {year}" if year else base
