import pytest
from app.services.validator import validate_consistency

def test_validate_consistency_match():
    docs = [
        {"documentId": "1", "documentType": "AADHAAR", "fields": {"name": "John Doe", "dateOfBirth": "01/01/1990"}},
        {"documentId": "2", "documentType": "PAN", "fields": {"name": "John Doe", "dateOfBirth": "01/01/1990"}},
    ]
    result = validate_consistency(docs)
    assert result["isConsistent"] is True
    assert len(result["anomalies"]) == 0

def test_validate_consistency_name_mismatch():
    docs = [
        {"documentId": "1", "documentType": "AADHAAR", "fields": {"name": "John Doe", "dateOfBirth": "01/01/1990"}},
        {"documentId": "2", "documentType": "PAN", "fields": {"name": "Johnny Doe", "dateOfBirth": "01/01/1990"}},
    ]
    result = validate_consistency(docs)
    assert result["isConsistent"] is False
    assert len(result["anomalies"]) == 1
    assert result["anomalies"][0]["type"] == "NAME_MISMATCH"

def test_validate_consistency_dob_mismatch():
    docs = [
        {"documentId": "1", "documentType": "AADHAAR", "fields": {"name": "John Doe", "dateOfBirth": "01/01/1990"}},
        {"documentId": "2", "documentType": "PAN", "fields": {"name": "John Doe", "dateOfBirth": "02/02/1991"}},
    ]
    result = validate_consistency(docs)
    assert result["isConsistent"] is False
    assert len(result["anomalies"]) == 1
    assert result["anomalies"][0]["type"] == "DOB_MISMATCH"
