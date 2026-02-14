from datetime import datetime

from backend import db


class MedicationReminder(db.Model):
    __tablename__ = "medication_reminder"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    medication_id = db.Column(db.Integer, db.ForeignKey("medication.id", ondelete="CASCADE"), nullable=False)
    time_of_day = db.Column(db.String(64), nullable=False)  # e.g. "08:00" or cron-like
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
