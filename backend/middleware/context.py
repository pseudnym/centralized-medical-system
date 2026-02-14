"""Set request context (establishment_id, patient_id) from headers or query params."""
from flask import g, request


def inject_request_context():
    """Read X-Establishment-Id and X-Patient-Id from headers or query; set on g."""
    establishment_id = request.headers.get("X-Establishment-Id") or request.args.get("establishment_id")
    patient_id = request.headers.get("X-Patient-Id") or request.args.get("patient_id")
    try:
        g.establishment_id = int(establishment_id) if establishment_id is not None else None
    except (TypeError, ValueError):
        g.establishment_id = None
    try:
        g.patient_id = int(patient_id) if patient_id is not None else None
    except (TypeError, ValueError):
        g.patient_id = None
