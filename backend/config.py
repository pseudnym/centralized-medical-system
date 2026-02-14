"""Load configuration from environment."""
import os
from pathlib import Path

# Load .env when running from repo root (app.py or flask run)
from dotenv import load_dotenv

load_dotenv()


def get_env(key: str, default: str = "") -> str:
    return os.environ.get(key, default).strip()


# Database
DATABASE_URL = get_env("DATABASE_URL") or "sqlite:///project_ivy.db"

# Uploads directory (local filesystem storage)
UPLOADS_DIR = get_env("UPLOADS_DIR") or str(Path(__file__).resolve().parent.parent / "uploads")

# CORS
FRONTEND_ORIGIN = get_env("FRONTEND_ORIGIN") or "http://localhost:5173"

# Flask
FLASK_ENV = get_env("FLASK_ENV") or "development"
