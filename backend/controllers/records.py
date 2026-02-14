from flask import Blueprint, jsonify, request, send_file

from backend import db
from backend.models import Establishment, Patient, Record
from backend.services.record_service import get_record_file_path, save_upload

records_bp = Blueprint("records", __name__)


def _record_metadata_json(r):
    return {
        "id": r.id,
        "file_name": r.file_name,
        "patient_id": r.patient_id,
        "appointment_id": r.appointment_id,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@records_bp.get("/establishments/<int:establishment_id>/records")
def list_records(establishment_id):
    establishment = db.session.get(Establishment, establishment_id)
    if establishment is None:
        return jsonify(error="Establishment not found", code="NOT_FOUND"), 404
    patient_id = request.args.get("patient_id", type=int)
    query = db.select(Record).where(Record.establishment_id == establishment_id).order_by(Record.created_at.desc())
    if patient_id is not None:
        query = query.where(Record.patient_id == patient_id)
    records = db.session.execute(query).scalars().all()
    return jsonify([_record_metadata_json(r) for r in records])


@records_bp.post("/establishments/<int:establishment_id>/records")
def upload_record(establishment_id):
    establishment = db.session.get(Establishment, establishment_id)
    if establishment is None:
        return jsonify(error="Establishment not found", code="NOT_FOUND"), 404
    if "file" not in request.files:
        return jsonify(error="No file in request; use multipart/form-data with 'file' key", code="VALIDATION_ERROR"), 400
    file = request.files["file"]
    if not file or not file.filename:
        return jsonify(error="No file selected", code="VALIDATION_ERROR"), 400
    if not (file.filename or "").lower().endswith(".pdf"):
        return jsonify(error="Only PDF files are allowed", code="VALIDATION_ERROR"), 400
    patient_id = request.form.get("patient_id", type=int)
    if patient_id is None:
        return jsonify(error="patient_id is required in form", code="VALIDATION_ERROR"), 400
    patient = db.session.get(Patient, patient_id)
    if patient is None:
        return jsonify(error="Patient not found", code="NOT_FOUND"), 404
    appointment_id = request.form.get("appointment_id", type=int) or None
    try:
        record = save_upload(
            establishment_id=establishment_id,
            patient_id=patient_id,
            file=file,
            file_name=file.filename,
            appointment_id=appointment_id,
        )
    except ValueError as e:
        return jsonify(error=str(e), code="VALIDATION_ERROR"), 400
    return jsonify(_record_metadata_json(record)), 201


@records_bp.get("/records/<int:record_id>")
def get_record_metadata(record_id):
    record = db.session.get(Record, record_id)
    if record is None:
        return jsonify(error="Record not found", code="NOT_FOUND"), 404
    return jsonify(_record_metadata_json(record))


@records_bp.get("/records/<int:record_id>/file")
def get_record_file(record_id):
    record = db.session.get(Record, record_id)
    if record is None:
        return jsonify(error="Record not found", code="NOT_FOUND"), 404
    try:
        path = get_record_file_path(record)
    except ValueError:
        return jsonify(error="File not found or invalid path", code="NOT_FOUND"), 404
    if not path.exists():
        return jsonify(error="File not found on disk", code="NOT_FOUND"), 404
    return send_file(
        path,
        mimetype="application/pdf",
        as_attachment=False,
        download_name=record.file_name or "record.pdf",
    )
