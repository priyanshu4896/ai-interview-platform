from fastapi import HTTPException
from openai import APIConnectionError, AuthenticationError, OpenAI, RateLimitError
from pydantic import BaseModel, Field

from app.config import settings
from app.schemas.interview_schema import AnswerEvaluation
from app.schemas.resume_schema import ResumeAnalysis


client = None if settings.use_mock_ai else OpenAI(api_key=settings.openai_api_key)


MOCK_QUESTIONS = {
    "HR": [
        "Tell me about a challenging situation at work and how you handled it.",
        "Describe a time you received difficult feedback. What did you do with it?",
        "How do you prioritize when several important deadlines compete for your attention?",
        "Tell me about a disagreement with a teammate and how you resolved it.",
        "Why are you interested in this role, and what would you contribute to the team?",
    ],
    "Python": [
        "What is the difference between a list and a tuple in Python, and when would you use each?",
        "Explain Python decorators and give a practical use case.",
        "How does exception handling work in Python, and what are some good practices?",
        "What are generators, and why can they be more memory-efficient than lists?",
        "How would you diagnose and improve the performance of a slow Python function?",
    ],
    "JavaScript": [
        "Explain the difference between var, let, and const in JavaScript.",
        "How does the JavaScript event loop handle promises and timers?",
        "What is a closure, and where would you use one in a real application?",
        "Explain the difference between == and === and why it matters.",
        "How do async and await improve asynchronous JavaScript code?",
    ],
    "React": [
        "What causes a React component to re-render, and how can unnecessary renders be reduced?",
        "Explain the purpose of useEffect and a common mistake involving its dependency array.",
        "When would you use Context instead of passing props through several components?",
        "What is the difference between controlled and uncontrolled form inputs in React?",
        "How would you structure loading, success, and error states for an API request in React?",
    ],
    "Node.js": [
        "How does the Node.js event loop support many concurrent requests?",
        "How would you design consistent error handling for an Express API?",
        "What is middleware in Node.js, and what are some practical examples?",
        "How should secrets and environment-specific configuration be managed in a Node.js service?",
        "How would you investigate a Node.js API that becomes slow under load?",
    ],
    "MongoDB": [
        "When would you embed related data in a MongoDB document instead of referencing it?",
        "What are MongoDB indexes, and what trade-offs do they introduce?",
        "How would you model a user's interview history in MongoDB?",
        "Explain the purpose of an aggregation pipeline and give a practical example.",
        "How do you prevent duplicate records when multiple requests arrive concurrently?",
    ],
}


MOCK_BETTER_ANSWERS = {
    "HR": (
        "I would answer with the STAR structure: briefly describe the situation and my responsibility, "
        "explain the specific actions I took, and finish with a measurable result and what I learned."
    ),
    "Python": (
        "I would define the concept clearly, explain the relevant Python behavior and trade-offs, then "
        "show a small practical example and mention when I would choose an alternative."
    ),
    "JavaScript": (
        "I would explain the language behavior step by step, include a concise code example, and connect "
        "it to a production concern such as scope, asynchronous execution, or maintainability."
    ),
    "React": (
        "I would explain how the feature affects component state and rendering, show a focused hook or "
        "component example, and mention dependencies, cleanup, and performance where relevant."
    ),
    "Node.js": (
        "I would describe how the Node.js runtime handles the scenario, outline a production-ready "
        "implementation, and cover error handling, observability, security, and scalability."
    ),
    "MongoDB": (
        "I would start from the application's access patterns, propose a document model, explain the "
        "indexes it needs, and discuss consistency, growth, and query-performance trade-offs."
    ),
}


class QuestionResult(BaseModel):
    question: str = Field(min_length=10)


def _parse_response(response, error_message: str):
    parsed = response.output_parsed
    if parsed is None:
        raise HTTPException(status_code=502, detail=error_message)
    return parsed


def _raise_openai_error(error: Exception) -> None:
    """Translate provider errors into safe, actionable API responses."""

    if isinstance(error, AuthenticationError):
        raise HTTPException(
            status_code=503,
            detail="AI service authentication failed. Ask the administrator to check the server API key.",
        ) from error
    if isinstance(error, RateLimitError):
        error_body = getattr(error, "body", {}) or {}
        provider_error = error_body.get("error", error_body) if isinstance(error_body, dict) else {}
        if provider_error.get("code") == "insufficient_quota":
            raise HTTPException(
                status_code=503,
                detail="AI service quota is unavailable. Add API credits or check the project spending limit.",
            ) from error
        raise HTTPException(
            status_code=429,
            detail="AI service is busy. Please wait a moment and try again.",
        ) from error
    if isinstance(error, APIConnectionError):
        raise HTTPException(
            status_code=503,
            detail="Could not reach the AI service. Please try again shortly.",
        ) from error
    raise HTTPException(
        status_code=502,
        detail="The AI service could not complete this request. Please try again.",
    ) from error


def generate_question(category: str, question_number: int, previous_questions: list[str]) -> str:
    if settings.use_mock_ai:
        questions = MOCK_QUESTIONS[category]
        unused_questions = [question for question in questions if question not in previous_questions]
        return unused_questions[0] if unused_questions else questions[(question_number - 1) % len(questions)]

    interview_type = "behavioral HR" if category == "HR" else f"technical {category}"
    previous = "\n".join(f"- {question}" for question in previous_questions) or "None"
    try:
        response = client.responses.parse(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are an experienced interviewer. Ask one concise, realistic question. "
                        "Do not include an answer, hints, numbering, or commentary."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Create question {question_number} for a {interview_type} interview.\n"
                        f"Avoid repeating these questions:\n{previous}"
                    ),
                },
            ],
            text_format=QuestionResult,
        )
        return _parse_response(response, "AI did not return a question").question
    except HTTPException:
        raise
    except Exception as error:
        _raise_openai_error(error)


def evaluate_answer(category: str, question: str, answer: str) -> AnswerEvaluation:
    if settings.use_mock_ai:
        words = answer.split()
        word_count = len(words)
        category_terms = {
            "HR": ("situation", "action", "result", "team", "learned"),
            "Python": ("python", "example", "performance", "memory", "exception"),
            "JavaScript": ("javascript", "scope", "event", "promise", "async"),
            "React": ("react", "state", "props", "render", "effect"),
            "Node.js": ("node", "event loop", "async", "middleware", "error"),
            "MongoDB": ("mongodb", "document", "index", "query", "collection"),
        }
        lowered_answer = answer.lower()
        relevant_terms = sum(term in lowered_answer for term in category_terms[category])
        length_score = min(3.0, word_count / 25)
        relevance_score = min(2.0, relevant_terms * 0.5)
        structure_score = 1.0 if any(word in lowered_answer for word in ("because", "for example", "result")) else 0.5
        score = round(min(9.5, 3.0 + length_score + relevance_score + structure_score), 1)

        if word_count < 20:
            feedback = "Your answer is understandable, but it is too brief. Add a concrete example, reasoning, and a clear outcome."
        elif relevant_terms == 0:
            feedback = "Your answer has useful detail, but connect it more directly to the question and use precise category-specific concepts."
        else:
            feedback = "Good foundation with relevant detail. Strengthen it by naming trade-offs and ending with a concise result or takeaway."

        communication_feedback = (
            "Use a clear opening point, two or three supporting details, and a short conclusion. "
            "Avoid filler words and keep sentences focused."
        )
        return AnswerEvaluation(
            score=score,
            feedback=feedback,
            better_answer=MOCK_BETTER_ANSWERS[category],
            communication_feedback=communication_feedback,
        )

    try:
        response = client.responses.parse(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a fair interview coach. Evaluate correctness, relevance, depth, "
                        "clarity, and communication. Scores must be realistic from 0 to 10. "
                        "Give constructive, specific feedback and a polished example answer."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Category: {category}\nQuestion: {question}\nCandidate answer: {answer}",
                },
            ],
            text_format=AnswerEvaluation,
        )
        return _parse_response(response, "AI did not return an evaluation")
    except HTTPException:
        raise
    except Exception as error:
        _raise_openai_error(error)


def analyze_resume_text(text: str) -> ResumeAnalysis:
    if settings.use_mock_ai:
        lowered_text = text.lower()
        recognized_skills = [
            skill
            for skill in ("Python", "JavaScript", "React", "Node.js", "MongoDB", "Git", "SQL", "Docker")
            if skill.lower() in lowered_text
        ]
        missing_skills = [skill for skill in ("Cloud", "Testing", "CI/CD") if skill.lower() not in lowered_text]
        ats_score = min(90, 58 + len(recognized_skills) * 4 + (8 if len(text) > 700 else 0))
        return ResumeAnalysis(
            ats_score=ats_score,
            strengths=(
                [f"Includes relevant technical skills: {', '.join(recognized_skills)}."]
                if recognized_skills
                else ["Contains readable professional experience and background information."]
            ) + ["Uses a text-based format that an ATS can parse."],
            weaknesses=[
                "Some achievements may need measurable results or business impact.",
                "Tailor keywords and the professional summary for each target role.",
            ],
            missing_skills=missing_skills,
            improved_summary=(
                "Results-focused software professional with experience building maintainable applications, "
                "collaborating across teams, and solving practical technical problems. Brings hands-on "
                "development skills and a commitment to reliable, user-centered delivery."
            ),
        )

    # Limiting text keeps requests affordable while retaining the most useful resume content.
    resume_text = text[:30000]
    try:
        response = client.responses.parse(
            model=settings.openai_model,
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are an ATS and recruiting specialist. Analyze only the supplied resume. "
                        "Use a 0-100 ATS score, concise evidence-based lists, likely missing marketable "
                        "skills, and a truthful improved professional summary. Never invent experience."
                    ),
                },
                {"role": "user", "content": f"Analyze this resume:\n\n{resume_text}"},
            ],
            text_format=ResumeAnalysis,
        )
        return _parse_response(response, "AI did not return a resume analysis")
    except HTTPException:
        raise
    except Exception as error:
        _raise_openai_error(error)
