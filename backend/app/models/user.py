from datetime import datetime, timezone
from typing import Any


def create_user_document(name: str, email: str, hashed_password: str) -> dict[str, Any]:
    now = datetime.now(timezone.utc)
    return {
        "name": name.strip(),
        "email": email.lower().strip(),
        "hashed_password": hashed_password,
        "created_at": now,
        "updated_at": now,
    }
