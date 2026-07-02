from datetime import datetime, timezone
from typing import Any


def create_interview_document(user_id: str, category: str, question_count: int) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "user_id": user_id,
        "category": category,
        "question_count": question_count,
        "status": "in_progress",
        "current_question_index": 0,
        "questions": [],
        "average_score": 0.0,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
    }
