"""Seed demo data: 1-2 establishments and 1-2 patients. Idempotent."""
import sys
from pathlib import Path

# Ensure project root is on path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv()

from backend import create_app, db
from backend.models import Establishment, Patient


def seed():
    app = create_app()
    with app.app_context():
        if db.session.execute(db.select(Establishment).limit(1)).scalar_one_or_none() is not None:
            print("Establishments already exist; skipping seed.")
            return
        e1 = Establishment(name="City General Hospital", address="123 Main St")
        e2 = Establishment(name="Riverside Clinic", address="456 Oak Ave")
        db.session.add_all([e1, e2])
        db.session.flush()
        p1 = Patient(name="Jane Doe", date_of_birth=None)
        p2 = Patient(name="John Smith", date_of_birth=None)
        db.session.add_all([p1, p2])
        db.session.commit()
        print("Seeded 2 establishments and 2 patients.")


if __name__ == "__main__":
    seed()
