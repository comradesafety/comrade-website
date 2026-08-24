"""Centralized error handling.

Error pages stay visually consistent with the rest of the site (they
extend base.html) and never leak internal details such as stack traces.
"""

import logging

from flask import Flask, render_template

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Attach 404 and 500 handlers to the app."""

    @app.errorhandler(404)
    def handle_not_found(error):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def handle_server_error(error):
        # Log the real exception server-side only. The user never sees it.
        logger.exception("Unhandled server error: %s", error)
        return render_template("errors/500.html"), 500
