# AI Interview Preparation Platform

A full-stack AI Interview Preparation Platform that helps users practice interviews, get feedback, check scores, analyze resumes, and track interview history.

This project includes user authentication, interview question generation, answer evaluation, resume analysis, scanned PDF OCR support, and interview history tracking.

---

## Features

- User Register and Login
- JWT Authentication
- Protected Dashboard
- AI/Mock Interview Practice
- HR and Technical Interview Categories
- Answer Evaluation with Score
- Feedback and Better Answer Suggestions
- Interview History
- Resume Analyzer
- ATS Score Generation
- OCR Support for Scanned Resume PDFs
- JPG/JPEG/PNG Resume OCR Support
- MongoDB Data Storage
- Responsive Frontend UI

---

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Python
- FastAPI
- MongoDB
- JWT Authentication
- PyMuPDF
- Tesseract OCR
- Pytesseract
- Pillow

---

## Screenshots

### Landing Page

![Landing Page](screenshots/landing-page.png)

### Login Page

![Login Page](screenshots/login-page.png)

### Dashboard

![Dashboard](screenshots/dashboard.png)

### Interview Page

![Interview Page](screenshots/interview-page.png)

### Interview Result

![Interview Result](screenshots/result-page.png)

### Interview History

![Interview History](screenshots/history-page.png)

### Resume Analyzer

![Resume Analyzer](screenshots/resume-analyzer.png)

### Resume ATS Score

![Resume ATS Score](screenshots/resume-score.png)

---

## Project Structure

```text
AI INTERVIEW/
│
├── backend/
│   ├── app/
│   ├── .env.example
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── screenshots/
│   ├── landing-page.png
│   ├── login-page.png
│   ├── dashboard.png
│   ├── interview-page.png
│   ├── result-page.png
│   ├── history-page.png
│   ├── resume-analyzer.png
│   └── resume-score.png
│
├── .gitignore
└── README.md