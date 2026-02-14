from flask import Blueprint, g, jsonify, request

from backend import db
from backend.models import Patient, Record, Appointment

patients_bp = Blueprint("patients", __name__)


def _patient_json(p):
    return {
        "id": p.id,
        "name": p.name,
        "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
    }


@patients_bp.get("/patients")
def list_patients():
    establishment_id = getattr(g, "establishment_id", None)
    query = db.select(Patient).order_by(Patient.name)
    if establishment_id is not None:
        # Only patients that have at least one record or appointment at this establishment
        sub_rec = db.select(Record.patient_id).where(Record.establishment_id == establishment_id).distinct()
        sub_app = db.select(Appointment.patient_id).where(Appointment.establishment_id == establishment_id).distinct()
        query = query.where(Patient.id.in_(sub_rec.union(sub_app)))
    patients = db.session.execute(query).scalars().all()
    return jsonify([_patient_json(p) for p in patients])


@patients_bp.get("/patients/<int:patient_id>")
def get_patient(patient_id):
    patient = db.session.get(Patient, patient_id)
    if patient is None:
        return jsonify(error="Patient not found", code="NOT_FOUND"), 404
    return jsonify(_patient_json(patient))


@patients_bp.post("/patients")
def create_patient():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify(error="name is required", code="VALIDATION_ERROR"), 400
    date_of_birth = data.get("date_of_birth")
    if date_of_birth is not None:
        try:
            from datetime import date

            if isinstance(date_of_birth, str):
                date_of_birth = date.fromisoformat(date_of_birth)
        except (ValueError, TypeError):
            return jsonify(error="date_of_birth must be YYYY-MM-DD", code="VALIDATION_ERROR"), 400
    patient = Patient(name=name, date_of_birth=date_of_birth)
    db.session.add(patient)
    db.session.commit()
    return jsonify(_patient_json(patient)), 201
