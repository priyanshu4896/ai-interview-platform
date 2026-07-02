# Backend

FastAPI service for authentication, AI interviews, history, and PDF resume analysis.

## Run locally

1. Start MongoDB locally or set an Atlas connection string in `.env`.
2. Create and activate a virtual environment.
3. Install dependencies and start the API:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`; interactive documentation is at `/docs`.
