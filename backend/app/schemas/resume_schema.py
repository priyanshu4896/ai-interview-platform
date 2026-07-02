from datetime import datetime

from pydantic import BaseModel, Field


class ResumeAnalysis(BaseModel):
    ats_score: int = Field(ge=0, le=100)
    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    improved_summary: str


class ResumeResponse(BaseModel):
    id: str
    filename: str
    analysis: ResumeAnalysis
    created_at: datetime
