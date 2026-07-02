from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.database import Database

from app.config import settings


client: MongoClient = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000)
database: Database = client[settings.mongo_db_name]

users_collection = database["users"]
interviews_collection = database["interviews"]
resumes_collection = database["resumes"]


def create_indexes() -> None:
    """Create the indexes used by authentication and history queries."""

    users_collection.create_index([("email", ASCENDING)], unique=True)
    interviews_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])
    resumes_collection.create_index([("user_id", ASCENDING), ("created_at", DESCENDING)])


def check_database_connection() -> None:
    client.admin.command("ping")


def close_database_connection() -> None:
    client.close()
