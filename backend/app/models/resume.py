from datetime import datetime, timezone
from typing import Any


def create_resume_document(
    user_id: str,
    filename: str,
    extracted_text: str,
    analysis: dict[str, Any],
) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "filename": filename,
        "extracted_text": extracted_text,
        "analysis": analysis,
        "created_at": datetime.now(timezone.utc),
    }
