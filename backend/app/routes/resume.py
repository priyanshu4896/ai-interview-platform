from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.database import resumes_collection
from app.models.resume import create_resume_document
from app.schemas.resume_schema import ResumeResponse
from app.services.ai_service import analyze_resume_text
from app.services.resume_service import extract_resume_text, validate_resume_text
from app.utils.security import get_current_user_id


router = APIRouter(prefix="/resumes", tags=["Resumes"])


def serialize_resume(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "filename": document["filename"],
        "analysis": document["analysis"],
        "created_at": document["created_at"],
    }


@router.post("/analyze", response_model=ResumeResponse, status_code=201)
async def analyze_resume(
    file: UploadFile | None = File(default=None),
    resume_text: str | None = Form(default=None),
    user_id: str = Depends(get_current_user_id),
):
    pasted_text = (resume_text or "").strip()
    if pasted_text:
        extracted_text = validate_resume_text(pasted_text)
        filename = "pasted-resume.txt"
    elif file is not None:
        extracted_text = await extract_resume_text(file)
        filename = file.filename or "resume.pdf"
    else:
        raise HTTPException(
            status_code=400,
            detail="Upload a PDF or paste at least 300 characters of resume text.",
        )

    analysis = analyze_resume_text(extracted_text)
    document = create_resume_document(
        user_id=user_id,
        filename=filename,
        extracted_text=extracted_text,
        analysis=analysis.model_dump(),
    )
    result = resumes_collection.insert_one(document)
    document["_id"] = result.inserted_id
    return serialize_resume(document)


@router.get("", response_model=list[ResumeResponse])
def resume_history(user_id: str = Depends(get_current_user_id)):
    documents = resumes_collection.find({"user_id": user_id}).sort("created_at", -1).limit(50)
    return [serialize_resume(document) for document in documents]
