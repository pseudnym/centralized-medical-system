from flask import Blueprint

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def get_health():
    return {"status": "ok"}
