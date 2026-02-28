"""
Document summarizer — generates a concise human-readable summary from OCR text.

Uses extractive summarization: picks the most informative sentences / key facts
from the raw OCR output and combines them into a short paragraph.
"""
import re
from typing import Optional


# Key phrases that signal high-value information lines
_IMPORTANT_PATTERNS = [
    r"name\s*:", r"date of birth", r"dob\b", r"valid", r"expiry", r"valid till",
    r"account\s*(no|number)", r"pan\b", r"aadhaar", r"passport\s*no",
    r"license\s*no", r"dl\s*no", r"voter\s*id", r"epic",
    r"assessment\s*year", r"net\s*(salary|pay)", r"gross\s*total",
    r"place of (birth|issue)", r"date of issue", r"issuing authority",
    r"employer", r"organization", r"university", r"board",
    r"registration\s*no", r"certificate", r"address", r"father",
    r"mother", r"guardian", r"spouse", r"gender", r"male|female",
    r"nationality", r"blood\s*group", r"amount", r"total",
    r"ifsc", r"branch",
]

# Compiled patterns for speed
_COMPILED = [re.compile(p, re.IGNORECASE) for p in _IMPORTANT_PATTERNS]

# Document type → friendly label
_TYPE_LABELS = {
    "AADHAAR": "Aadhaar Card",
    "PAN": "PAN Card",
    "PASSPORT": "Passport",
    "DRIVING_LICENSE": "Driving License",
    "VOTER_ID": "Voter ID Card",
    "BIRTH_CERTIFICATE": "Birth Certificate",
    "BANK_STATEMENT": "Bank Statement",
    "ITR": "Income Tax Return",
    "SALARY_SLIP": "Salary Slip",
    "PROPERTY_DEED": "Property Deed / Sale Deed",
    "DEGREE_CERTIFICATE": "Degree / Education Certificate",
    "MEDICAL_REPORT": "Medical Report",
    "OTHER": "Document",
}


def generate_summary(
    raw_text: str,
    doc_type: str,
    extracted_fields: dict,
    confidence: float,
) -> Optional[str]:
    """
    Build a concise 2-4 sentence summary of the document.

    Strategy:
      1. Start with a classification sentence.
      2. Enumerate the most important extracted fields.
      3. Mention any key dates (issue / expiry).
      4. Optionally surface notable content from the OCR text.
    """
    if not raw_text and not extracted_fields:
        return None

    parts: list[str] = []

    # ── 1. Classification line ───────────────────────────
    label = _TYPE_LABELS.get(doc_type, doc_type.replace("_", " ").title())
    conf_pct = round(confidence * 100)
    parts.append(
        f"This document has been identified as a **{label}** "
        f"(confidence {conf_pct}%)."
    )

    # ── 2. Key extracted fields ──────────────────────────
    field_sentences: list[str] = []
    name = (
        extracted_fields.get("name")
        or extracted_fields.get("holderName")
    )
    if name:
        field_sentences.append(f"the holder name is **{name}**")

    doc_number = (
        extracted_fields.get("panNumber")
        or extracted_fields.get("aadhaarNumber")
        or extracted_fields.get("passportNumber")
        or extracted_fields.get("dlNumber")
        or extracted_fields.get("epicNumber")
        or extracted_fields.get("accountNumber")
        or extracted_fields.get("documentNumber")
    )
    if doc_number:
        field_sentences.append(f"document number **{doc_number}**")

    dob = extracted_fields.get("dateOfBirth")
    if dob:
        field_sentences.append(f"date of birth **{dob}**")

    if field_sentences:
        parts.append("Key details: " + ", ".join(field_sentences) + ".")

    # ── 3. Dates ─────────────────────────────────────────
    issue = extracted_fields.get("issueDate")
    expiry = extracted_fields.get("expiryDate")
    if issue and expiry:
        parts.append(f"Issued on {issue}, valid until {expiry}.")
    elif expiry:
        parts.append(f"Expires on {expiry}.")
    elif issue:
        parts.append(f"Issued on {issue}.")

    # ── 4. Additional detail from OCR text ───────────────
    extra = _extract_notable_lines(raw_text, max_lines=2)
    if extra:
        parts.append("Additional info: " + "; ".join(extra) + ".")

    # ── 5. Short OCR snippet for context ─────────────────
    if raw_text and len(parts) < 3:
        snippet = raw_text[:200].strip()
        if snippet:
            parts.append(f'OCR excerpt: "{snippet}…"')

    return " ".join(parts) if parts else None


def _extract_notable_lines(text: str, max_lines: int = 2) -> list[str]:
    """Pick the most informative short fragments from the OCR text."""
    if not text:
        return []

    # Split into pseudo-lines (newlines or long whitespace gaps)
    lines = re.split(r"[\n\r]+|\s{3,}", text)
    scored: list[tuple[int, str]] = []

    for raw in lines:
        line = raw.strip()
        if len(line) < 5 or len(line) > 120:
            continue
        score = sum(1 for pat in _COMPILED if pat.search(line))
        if score > 0:
            scored.append((score, line))

    scored.sort(key=lambda x: -x[0])
    seen: set[str] = set()
    result: list[str] = []
    for _, line in scored:
        normalised = line.lower()
        if normalised not in seen:
            seen.add(normalised)
            result.append(line)
        if len(result) >= max_lines:
            break

    return result
