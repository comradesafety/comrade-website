"""Blueprint registration.

Each blueprint owns one area of the site. Routes only render templates;
they never contain HTML, CSS, or JavaScript.
"""

from flask import Flask

from app.routes.home import home_bp
from app.routes.pages import pages_bp


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(home_bp)
    app.register_blueprint(pages_bp)
