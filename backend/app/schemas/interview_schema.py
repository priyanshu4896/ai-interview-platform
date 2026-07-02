from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


InterviewCategory = Literal["HR", "Python", "JavaScript", "React", "Node.js", "MongoDB"]


class InterviewStartRequest(BaseModel):
    category: InterviewCategory
    question_count: int = Field(default=5, ge=3, le=10)


class AnswerRequest(BaseModel):
    answer: str = Field(min_length=1, max_length=8000)


class AnswerEvaluation(BaseModel):
    score: float = Field(ge=0, le=10)
    feedback: str
    better_answer: str
    communication_feedback: str


class InterviewQuestion(BaseModel):
    question_number: int
    question: str
    answer: str | None = None
    evaluation: AnswerEvaluation | None = None


class InterviewResponse(BaseModel):
    id: str
    category: str
    question_count: int
    status: str
    current_question_index: int
    questions: list[InterviewQuestion]
    average_score: float
    created_at: datetime
    completed_at: datetime | None = None


class StartInterviewResponse(BaseModel):
    interview: InterviewResponse
    current_question: str


class SubmitAnswerResponse(BaseModel):
    evaluation: AnswerEvaluation
    interview: InterviewResponse
    next_question: str | None = None
    completed: bool
