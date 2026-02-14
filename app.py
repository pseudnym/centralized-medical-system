"""Entry point for Flask. Run with: flask run (set FLASK_APP=app:create_app) or python -m app."""
from dotenv import load_dotenv

load_dotenv()

from backend import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
