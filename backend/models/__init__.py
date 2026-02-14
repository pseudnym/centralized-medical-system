# Import all models so they are registered with db and create_all() creates tables.
from backend.models.user import User
from backend.models.establishment import Establishment
from backend.models.patient import Patient
from backend.models.appointment import Appointment
from backend.models.record import Record
from backend.models.medication import Medication
from backend.models.medication_reminder import MedicationReminder
from backend.models.adherence_log import AdherenceLog
from backend.models.observation import Observation
from backend.models.insight import Insight

__all__ = [
    "User",
    "Establishment",
    "Patient",
    "Appointment",
    "Record",
    "Medication",
    "MedicationReminder",
    "AdherenceLog",
    "Observation",
    "Insight",
]
