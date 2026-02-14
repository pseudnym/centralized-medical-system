from datetime import datetime

from backend import db


class Observation(db.Model):
    __tablename__ = "observation"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey("patient.id", ondelete="CASCADE"), nullable=False)
    metric_type = db.Column(db.String(64), nullable=False)
    value_numeric = db.Column(db.Float, nullable=True)
    value_text = db.Column(db.String(255), nullable=True)
    unit = db.Column(db.String(32), nullable=True)
    observed_at = db.Column(db.DateTime, nullable=False)
    source = db.Column(db.String(32), nullable=False)  # manual | device
    device_id = db.Column(db.String(128), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
