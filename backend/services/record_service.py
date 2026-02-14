"""Business logic for medical records: file storage and path safety."""
import uuid
from pathlib import Path

from backend import db
from backend.config import UPLOADS_DIR
from backend.models import Record


def _uploads_path() -> Path:
    return Path(UPLOADS_DIR).resolve()


def _safe_relative_path(relative: str) -> Path:
    """Resolve relative path and ensure it stays under UPLOADS_DIR (no directory traversal)."""
    base = _uploads_path()
    resolved = (base / relative).resolve()
    try:
        resolved.relative_to(base)
    except ValueError:
        raise ValueError("Path would escape uploads directory")
    return resolved


def save_upload(establishment_id: int, patient_id: int, file, file_name: str, appointment_id: int | None = None) -> Record:
    """Save uploaded file to disk and create Record in DB. Returns the new Record."""
    base = _uploads_path()
    base.mkdir(parents=True, exist_ok=True)
    establishment_dir = base / str(establishment_id)
    establishment_dir.mkdir(parents=True, exist_ok=True)
    # Safe filename: keep extension if it's .pdf, otherwise force .pdf
    ext = ".pdf" if (file_name or "").lower().endswith(".pdf") else ".pdf"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    relative_path = f"{establishment_id}/{unique_name}"
    full_path = _safe_relative_path(relative_path)
    file.save(str(full_path))
    record = Record(
        establishment_id=establishment_id,
        patient_id=patient_id,
        file_path=relative_path,
        file_name=file_name or unique_name,
        appointment_id=appointment_id,
    )
    db.session.add(record)
    db.session.commit()
    return record


def get_record_file_path(record: Record) -> Path:
    """Return absolute Path for a record's file. Raises ValueError if path escapes UPLOADS_DIR."""
    return _safe_relative_path(record.file_path)
