from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import check_database_connection, close_database_connection, create_indexes
from app.routes import auth, interview, resume


@asynccontextmanager
async def lifespan(_: FastAPI):
    check_database_connection()
    create_indexes()
    yield
    close_database_connection()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Backend API for AI-powered interview practice and resume analysis.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(resume.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "AI Interview Preparation Platform API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
