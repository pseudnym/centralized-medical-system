"""Flask app factory. Registers db, blueprints, CORS, and request context."""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from backend.config import DATABASE_URL, FRONTEND_ORIGIN

db = SQLAlchemy()


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # Import models so they are registered with db before create_all()
    with app.app_context():
        from backend import models  # noqa: F401
        db.create_all()

    # Request context from headers/query (X-Establishment-Id, X-Patient-Id)
    from backend.middleware.context import inject_request_context
    app.before_request(inject_request_context)

    # API v1 blueprints
    from backend.controllers.health import health_bp
    from backend.controllers.establishments import establishments_bp
    from backend.controllers.patients import patients_bp
    from backend.controllers.records import records_bp
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(establishments_bp, url_prefix="/api/v1")
    app.register_blueprint(patients_bp, url_prefix="/api/v1")
    app.register_blueprint(records_bp, url_prefix="/api/v1")

    # CORS for frontend origin
    CORS(app, origins=[FRONTEND_ORIGIN], supports_credentials=True)

    # JSON error responses
    @app.errorhandler(404)
    def not_found(e):
        return jsonify(error=str(e.description) if e.description else "Not found", code="NOT_FOUND"), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify(error="Internal server error", code="INTERNAL_ERROR"), 500

    return app
