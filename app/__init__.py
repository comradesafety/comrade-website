"""Comrade application factory.

Creating the app through a factory (rather than a module-level global)
keeps configuration explicit and makes the app testable.
"""

import logging
import os

from flask import Flask
from flask_wtf import CSRFProtect

from config import get_config
from app.context_processors import register_context_processors
from app.errors import register_error_handlers
from app.routes import register_blueprints
from app.security import apply_security_headers

csrf = CSRFProtect()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(get_config())

    secret_key = (os.getenv("SECRET_KEY") or "").strip()
    if secret_key:
        app.config["SECRET_KEY"] = secret_key

    if not app.config.get("SECRET_KEY"):
        if app.config.get("DEBUG") or os.getenv("FLASK_ENV", "production").lower() == "development":
            app.config["SECRET_KEY"] = "dev-only-insecure-key-change-me"
        else:
            raise RuntimeError(
                "SECRET_KEY environment variable is required and must be non-empty in production."
            )

    logging.basicConfig(level=logging.INFO)

    csrf.init_app(app)
    apply_security_headers(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_context_processors(app)

    return app
