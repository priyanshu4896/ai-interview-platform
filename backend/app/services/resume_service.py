import io
import os
import shutil
from pathlib import Path

import fitz
from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
import pytesseract


MAX_FILE_SIZE = 5 * 1024 * 1024
MIN_RESUME_TEXT_LENGTH = 300
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

# Prefer an explicit deployment setting, then the system PATH, then the known
# local Windows installation. The Docker image discovers /usr/bin/tesseract.
WINDOWS_TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
TESSERACT_COMMAND = (
    os.getenv("TESSERACT_CMD")
    or shutil.which("tesseract")
    or (WINDOWS_TESSERACT_PATH if Path(WINDOWS_TESSERACT_PATH).is_file() else "")
)
pytesseract.pytesseract.tesseract_cmd = TESSERACT_COMMAND or "tesseract"
TESSERACT_PATH = Path(pytesseract.pytesseract.tesseract_cmd)


def tesseract_is_available() -> bool:
    command = pytesseract.pytesseract.tesseract_cmd
    return Path(command).is_file() or shutil.which(command) is not None


def validate_resume_text(text: str, *, source: str = "text") -> str:
    """Normalize resume text and reject content too short for useful analysis."""

    cleaned_text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if len(cleaned_text) < MIN_RESUME_TEXT_LENGTH:
        if source == "pdf":
            raise HTTPException(
                status_code=400,
                detail=(
                    "This PDF looks scanned or image-based. Please paste resume text below "
                    "or upload a text-based PDF."
                ),
            )
        if source == "scanned_pdf":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not read enough text from this scanned PDF. Please upload a clearer PDF "
                    "or paste resume text manually."
                ),
            )
        if source == "image":
            raise HTTPException(
                status_code=400,
                detail=(
                    "Not enough readable text was found. Please upload a clearer resume image "
                    "or paste resume text manually."
                ),
            )
        raise HTTPException(
            status_code=400,
            detail="Resume text must be at least 300 characters for a useful analysis.",
        )
    return cleaned_text


async def extract_resume_text(file: UploadFile) -> str:
    """Extract text from a PDF or run OCR for a supported resume image."""

    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Upload a PDF, JPG, JPEG, or PNG resume")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded resume file is empty")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Resume file must be 5 MB or smaller")

    if extension == ".pdf":
        try:
            with fitz.open(stream=io.BytesIO(content), filetype="pdf") as document:
                text = "\n".join(page.get_text("text") for page in document)
                cleaned_text = "\n".join(line.strip() for line in text.splitlines() if line.strip())
                if len(cleaned_text) >= MIN_RESUME_TEXT_LENGTH:
                    return cleaned_text

                if not tesseract_is_available():
                    raise HTTPException(
                        status_code=503,
                        detail=(
                            "OCR engine is not installed or path is incorrect. Please install Tesseract OCR "
                            "or paste resume text manually."
                        ),
                    )

                # The PDF has little selectable text, so render each page at 2x resolution
                # and OCR the resulting images. Higher resolution substantially improves OCR.
                ocr_pages = []
                for page in document:
                    pixmap = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    with Image.open(io.BytesIO(pixmap.tobytes("png"))) as page_image:
                        ocr_pages.append(pytesseract.image_to_string(page_image.convert("RGB")))
                return validate_resume_text("\n".join(ocr_pages), source="scanned_pdf")
        except HTTPException:
            raise
        except pytesseract.TesseractNotFoundError as error:
            raise HTTPException(
                status_code=503,
                detail=(
                    "OCR engine is not installed or path is incorrect. Please install Tesseract OCR "
                    "or paste resume text manually."
                ),
            ) from error
        except pytesseract.TesseractError as error:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not read enough text from this scanned PDF. Please upload a clearer PDF "
                    "or paste resume text manually."
                ),
            ) from error
        except Exception as error:
            raise HTTPException(status_code=400, detail="Could not read this PDF") from error

    if not tesseract_is_available():
        raise HTTPException(
            status_code=503,
            detail=(
                "OCR engine is not installed or path is incorrect. Please install Tesseract OCR "
                "or paste resume text manually."
            ),
        )

    try:
        with Image.open(io.BytesIO(content)) as image:
            # RGB produces consistent OCR results for palette, transparent, and grayscale images.
            text = pytesseract.image_to_string(image.convert("RGB"))
    except pytesseract.TesseractNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=(
                "OCR engine is not installed or path is incorrect. Please install Tesseract OCR "
                "or paste resume text manually."
            ),
        ) from error
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(status_code=400, detail="Could not read this resume image") from error

    return validate_resume_text(text, source="image")


# Kept for callers that imported the original PDF-only helper.
extract_pdf_text = extract_resume_text
