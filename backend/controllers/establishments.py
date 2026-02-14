from flask import Blueprint, jsonify

from backend import db
from backend.models import Establishment

establishments_bp = Blueprint("establishments", __name__)


def _establishment_json(e):
    return {"id": e.id, "name": e.name, "address": e.address or ""}


@establishments_bp.get("/establishments")
def list_establishments():
    establishments = db.session.execute(db.select(Establishment).order_by(Establishment.name)).scalars().all()
    return jsonify([_establishment_json(e) for e in establishments])


@establishments_bp.get("/establishments/<int:establishment_id>")
def get_establishment(establishment_id):
    establishment = db.session.get(Establishment, establishment_id)
    if establishment is None:
        return jsonify(error="Establishment not found", code="NOT_FOUND"), 404
    return jsonify(_establishment_json(establishment))
