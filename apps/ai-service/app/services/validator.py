from typing import List, Dict, Any

def validate_consistency(documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Cross-references multiple extracted documents to find anomalies (e.g. name or DOB mismatch).
    Expects a list of dictionaries, where each dictionary represents extracted fields of a document.
    """
    anomalies = []
    
    names_seen = {}
    dobs_seen = {}

    for doc in documents:
        doc_id = doc.get("documentId", "unknown")
        fields = doc.get("fields", {})
        doc_type = doc.get("documentType", "unknown")

        name = fields.get("name") or fields.get("holderName")
        if name:
            name_val = name.get("value", name) if isinstance(name, dict) else name
            name_val = name_val.lower().strip()
            
            if names_seen and name_val not in names_seen.values():
                anomalies.append({
                    "type": "NAME_MISMATCH",
                    "description": f"Name mismatch detected in {doc_type} ({name_val}).",
                    "documents": [doc_id] + list(names_seen.keys())
                })
            names_seen[doc_id] = name_val

        dob = fields.get("dateOfBirth") or fields.get("dob")
        if dob:
            dob_val = dob.get("value", dob) if isinstance(dob, dict) else dob
            if dobs_seen and dob_val not in dobs_seen.values():
                anomalies.append({
                    "type": "DOB_MISMATCH",
                    "description": f"Date of Birth mismatch detected in {doc_type} ({dob_val}).",
                    "documents": [doc_id] + list(dobs_seen.keys())
                })
            dobs_seen[doc_id] = dob_val

    return {
        "isConsistent": len(anomalies) == 0,
        "anomalies": anomalies
    }
