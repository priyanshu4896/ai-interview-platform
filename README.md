# AI Interview Preparation Platform

A portfolio-ready full-stack interview coach with role-specific practice, per-answer feedback, browser voice input, progress tracking, and ATS resume analysis with scanned-document OCR.

## Stack

- React, Vite, Tailwind CSS, React Router, Axios, Web Speech API
- FastAPI, MongoDB, JWT, Passlib/bcrypt, OpenAI Python SDK, PyMuPDF, Pillow, Tesseract OCR

## Prerequisites

- Node.js 20 or newer
- Python 3.11–3.13
- MongoDB running locally, or a MongoDB Atlas connection string
- Tesseract OCR installed at `C:\Program Files\Tesseract-OCR\tesseract.exe` for image/scanned-PDF resumes
- An OpenAI API key for live AI mode (optional when `USE_MOCK_AI=true`)

## 1. Start MongoDB

Use a local MongoDB server at `mongodb://localhost:27017`, or update `MONGO_URI` in `backend/.env` with your Atlas URI. Atlas users must allow their IP and create a database user.

## 2. Run the backend

The local `.env` has already been configured in this workspace. For a fresh clone, copy `backend/.env.example` to `backend/.env` and replace the example values.

```powershell
cd backend
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Open `http://localhost:8000/docs` for the interactive API documentation.

## 3. Run the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

> A valid key also needs API credits and a sufficient project spending limit. A ChatGPT subscription does not include API usage. If the app reports that AI quota is unavailable, review [API billing](https://platform.openai.com/settings/organization/billing) and [project limits](https://platform.openai.com/settings/organization/limits).

For a no-cost local demo, set `USE_MOCK_AI=true` in `backend/.env`. Mock mode keeps interview and resume-analysis flows fully functional without calling OpenAI.

## Environment variables

Backend secrets belong only in `backend/.env`. Never prefix the OpenAI key with `VITE_`; Vite variables are included in the browser bundle.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI credential |
| `OPENAI_MODEL` | Model used for coaching (default `gpt-5.4-mini`) |
| `USE_MOCK_AI` | Use realistic local demo responses without API calls |
| `MONGO_URI` | Local or Atlas MongoDB connection string |
| `MONGO_DB_NAME` | MongoDB database name |
| `JWT_SECRET` | Long random signing secret |
| `JWT_ALGORITHM` | JWT algorithm, normally `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Login lifetime |
| `FRONTEND_URL` | Allowed CORS frontend origin |
| `VITE_API_BASE_URL` | Public backend origin; frontend only |

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`
- `POST /api/interviews/start`, `POST /api/interviews/{id}/answer`
- `GET /api/interviews`, `GET /api/interviews/{id}`
- `POST /api/resumes/analyze`, `GET /api/resumes`

Authentication uses `Authorization: Bearer <token>`. Resume analysis accepts PDF, JPG, JPEG, PNG, or at least 300 characters of pasted text. Scanned PDFs are rendered and processed with OCR. Files may be up to 5 MB.

## Voice recognition

Voice input uses the browser Web Speech API. Chrome and Edge currently provide the most reliable support; typed answers always work as a fallback.

## Portfolio features

- JWT registration, login, profile management, and protected routes
- HR and technical practice across six categories
- Typed or voice answers with structured scoring and coaching
- Persistent interview history, average/best scores, and dashboard metrics
- Resume ATS analysis from text PDFs, scanned PDFs, images, or pasted text
- Live OpenAI mode and a safe offline mock mode

## Screenshots

Add portfolio screenshots here after running the application:

- `docs/screenshots/landing.png` — landing page
- `docs/screenshots/dashboard.png` — dashboard statistics
- `docs/screenshots/interview.png` — interview room and voice controls
- `docs/screenshots/results.png` — performance report
- `docs/screenshots/resume-analysis.png` — ATS resume analysis
