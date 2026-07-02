from datetime import datetime, timezone

from bson import ObjectId
from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.database import users_collection
from app.models.user import create_user_document
from app.schemas.auth_schema import LoginRequest, RegisterRequest
from app.utils.security import create_access_token, hash_password, verify_password


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "created_at": user["created_at"],
    }


def register_user(payload: RegisterRequest) -> dict:
    document = create_user_document(
        name=payload.name,
        email=str(payload.email),
        hashed_password=hash_password(payload.password),
    )
    try:
        result = users_collection.insert_one(document)
    except DuplicateKeyError as error:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from error

    document["_id"] = result.inserted_id
    return {
        "access_token": create_access_token(str(result.inserted_id)),
        "token_type": "bearer",
        "user": serialize_user(document),
    }


def login_user(payload: LoginRequest) -> dict:
    user = users_collection.find_one({"email": str(payload.email).lower().strip()})
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    return {
        "access_token": create_access_token(str(user["_id"])),
        "token_type": "bearer",
        "user": serialize_user(user),
    }


def get_user(user_id: str) -> dict:
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid user")
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_user(user)


def update_user_name(user_id: str, name: str) -> dict:
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"name": name.strip(), "updated_at": datetime.now(timezone.utc)}},
    )
    return get_user(user_id)
