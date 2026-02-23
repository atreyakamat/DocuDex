"""
OCR service — wraps pytesseract for image-based documents.
Falls back gracefully if tesseract is not installed.
"""
import io
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

try:
    from PIL import Image
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract / Pillow not available – OCR will return empty text")


def extract_text(contents: bytes, content_type: str) -> Tuple[str, float]:
    """
    Extract raw text from document bytes.
    Returns (raw_text, confidence_0_to_1).
    """
    if not TESSERACT_AVAILABLE:
        return "", 0.0

    if content_type == "application/pdf":
        # Basic PDF text extraction without heavy deps
        try:
            text = _extract_pdf_text(contents)
            return text, 0.85
        except Exception as exc:
            logger.error("PDF extraction failed: %s", exc)
            return "", 0.0

    # Image path
    try:
        img = Image.open(io.BytesIO(contents))
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
        words = [w for w, c in zip(data["text"], data["conf"]) if int(c) > 0 and w.strip()]
        confs = [int(c) for c in data["conf"] if int(c) > 0]
        raw_text = " ".join(words)
        avg_conf = (sum(confs) / len(confs) / 100) if confs else 0.0
        return raw_text, round(avg_conf, 2)
    except Exception as exc:
        logger.error("OCR failed: %s", exc)
        return "", 0.0


def _extract_pdf_text(contents: bytes) -> str:
    """Minimal PDF text extraction without pdfminer dependency."""
    try:
        text = contents.decode("latin-1", errors="ignore")
        import re
        # Extract readable strings from PDF stream
        strings = re.findall(r"\(([^)]{3,})\)", text)
        return " ".join(strings[:200])
    except Exception:
        return ""
