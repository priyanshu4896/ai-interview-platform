from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import settings
from app.database import check_database_connection, close_database_connection, create_indexes
from app.routes import auth, interview, resume


FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend_dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"


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
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(resume.router, prefix="/api")


@app.get("/", include_in_schema=False)
def root():
    if FRONTEND_INDEX.is_file():
        return FileResponse(FRONTEND_INDEX)
    return {"message": "AI Interview Preparation Platform API", "docs": "/docs"}


@app.get("/health", include_in_schema=False)
@app.get("/api/health", tags=["Health"])
def health():
    return {"status": "ok"}


@app.get("/{frontend_path:path}", include_in_schema=False)
def serve_frontend(frontend_path: str):
    """Serve built Vite files and fall back to React client-side routing."""

    if frontend_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API route not found")

    requested_file = (FRONTEND_DIST / frontend_path).resolve()
    try:
        requested_file.relative_to(FRONTEND_DIST.resolve())
    except ValueError as error:
        raise HTTPException(status_code=404, detail="File not found") from error

    if requested_file.is_file():
        return FileResponse(requested_file)
    if frontend_path.startswith("assets/"):
        raise HTTPException(status_code=404, detail="Asset not found")
    if FRONTEND_INDEX.is_file():
        return FileResponse(FRONTEND_INDEX)
    raise HTTPException(status_code=404, detail="Frontend build is not available")
