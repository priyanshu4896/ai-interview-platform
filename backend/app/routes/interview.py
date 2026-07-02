from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import interviews_collection
from app.models.interview import create_interview_document
from app.schemas.interview_schema import (
    AnswerRequest,
    InterviewResponse,
    InterviewStartRequest,
    StartInterviewResponse,
    SubmitAnswerResponse,
)
from app.services.ai_service import evaluate_answer, generate_question
from app.utils.security import get_current_user_id


router = APIRouter(prefix="/interviews", tags=["Interviews"])


def serialize_interview(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "category": document["category"],
        "question_count": document["question_count"],
        "status": document["status"],
        "current_question_index": document["current_question_index"],
        "questions": document["questions"],
        "average_score": document.get("average_score", 0),
        "created_at": document["created_at"],
        "completed_at": document.get("completed_at"),
    }


def owned_interview(interview_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(interview_id):
        raise HTTPException(status_code=404, detail="Interview not found")
    interview = interviews_collection.find_one({"_id": ObjectId(interview_id), "user_id": user_id})
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


@router.post("/start", response_model=StartInterviewResponse, status_code=201)
def start_interview(payload: InterviewStartRequest, user_id: str = Depends(get_current_user_id)):
    document = create_interview_document(user_id, payload.category, payload.question_count)
    question = generate_question(payload.category, 1, [])
    document["questions"].append({"question_number": 1, "question": question, "answer": None, "evaluation": None})
    result = interviews_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return {"interview": serialize_interview(document), "current_question": question}


@router.post("/{interview_id}/answer", response_model=SubmitAnswerResponse)
def submit_answer(
    interview_id: str,
    payload: AnswerRequest,
    user_id: str = Depends(get_current_user_id),
):
    interview = owned_interview(interview_id, user_id)
    if interview["status"] == "completed":
        raise HTTPException(status_code=409, detail="This interview is already complete")

    index = interview["current_question_index"]
    question_item = interview["questions"][index]
    evaluation = evaluate_answer(interview["category"], question_item["question"], payload.answer)
    interview["questions"][index]["answer"] = payload.answer.strip()
    interview["questions"][index]["evaluation"] = evaluation.model_dump()
    next_index = index + 1
    completed = next_index >= interview["question_count"]
    next_question = None

    if completed:
        scores = [item["evaluation"]["score"] for item in interview["questions"] if item.get("evaluation")]
        interview["status"] = "completed"
        interview["average_score"] = round(sum(scores) / len(scores), 1)
        interview["completed_at"] = datetime.now(timezone.utc)
        interview["current_question_index"] = next_index
    else:
        next_question = generate_question(
            interview["category"],
            next_index + 1,
            [item["question"] for item in interview["questions"]],
        )
        interview["questions"].append(
            {"question_number": next_index + 1, "question": next_question, "answer": None, "evaluation": None}
        )
        interview["current_question_index"] = next_index

    interview["updated_at"] = datetime.now(timezone.utc)
    interviews_collection.replace_one({"_id": interview["_id"]}, interview)
    return {
        "evaluation": evaluation,
        "interview": serialize_interview(interview),
        "next_question": next_question,
        "completed": completed,
    }


@router.get("", response_model=list[InterviewResponse])
def interview_history(user_id: str = Depends(get_current_user_id)):
    documents = interviews_collection.find({"user_id": user_id}).sort("created_at", -1).limit(100)
    return [serialize_interview(document) for document in documents]


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(interview_id: str, user_id: str = Depends(get_current_user_id)):
    return serialize_interview(owned_interview(interview_id, user_id))
