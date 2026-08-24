"""Local development entry point.

Production deployments should use a WSGI server (gunicorn, waitress, etc.)
pointed at app:create_app() rather than running this file directly.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from this file's own directory, not the process's current
# working directory, so behavior is the same no matter where run.py is
# launched from.
load_dotenv(Path(__file__).resolve().parent / ".env")

from app import create_app  # noqa: E402  (import after load_dotenv on purpose)

app = create_app()

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 5000))
    app.run(host=host, port=port)
