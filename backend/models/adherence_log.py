from datetime import datetime, date

from backend import db


class AdherenceLog(db.Model):
    __tablename__ = "adherence_log"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    medication_id = db.Column(db.Integer, db.ForeignKey("medication.id", ondelete="CASCADE"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    taken_at = db.Column(db.DateTime, nullable=True)  # or use Boolean if preferred
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
