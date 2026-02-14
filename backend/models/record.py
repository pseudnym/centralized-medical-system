from datetime import datetime

from backend import db


class Record(db.Model):
    __tablename__ = "record"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    establishment_id = db.Column(db.Integer, db.ForeignKey("establishment.id", ondelete="CASCADE"), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey("patient.id", ondelete="CASCADE"), nullable=False)
    file_path = db.Column(db.String(512), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey("appointment.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
