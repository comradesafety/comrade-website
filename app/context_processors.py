"""Template context shared across every page.

Centralizing the navigation list here means the navbar and footer both
loop over the same data instead of each hardcoding their own copy.
"""

from datetime import datetime, timezone

from flask import Flask

MAIN_NAV_ITEMS = [
    ("home.index", "Home"),
    ("pages.about", "About"),
    ("pages.vision", "Vision"),
    ("pages.products", "Products"),
    ("pages.contact", "Contact"),
]


def register_context_processors(app: Flask) -> None:
    @app.context_processor
    def inject_navigation():
        return {"main_nav_items": MAIN_NAV_ITEMS}

    @app.context_processor
    def inject_current_year():
        return {"current_year": datetime.now(timezone.utc).year}
