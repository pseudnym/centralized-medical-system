from flask import Blueprint, jsonify

from backend import db
from backend.models import Establishment

establishments_bp = Blueprint("establishments", __name__)


@establishments_bp.get("/establishments")
def list_establishments():
    establishments = db.session.execute(db.select(Establishment).order_by(Establishment.name)).scalars().all()
    return jsonify([
        {"id": e.id, "name": e.name, "address": e.address}
        for e in establishments
    ])
