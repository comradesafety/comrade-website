"""Template context shared across every page.

Centralizing the navigation list here means the navbar and footer both
loop over the same data instead of each hardcoding their own copy.
"""

from datetime import datetime, timezone

from flask import Flask

from app.email_links import COMRADE_EMAIL, gmail_compose_url

MAIN_NAV_ITEMS = [
    ("home.index", "Home"),
    ("pages.about", "About"),
    ("pages.vision", "Vision"),
    ("pages.products", "Products"),
    ("pages.careers", "Career"),
    ("pages.contact", "Contact"),
]

# The waitlist is a Gmail-compose invitation, not a website form --
# there is no backend endpoint, no database, no Google Sheet for it.
# This is the one place the subject/body are defined; the navbar's
# global "Join Waitlist" CTA (the site's only waitlist entry point)
# builds its href from WAITLIST_EMAIL_HREF below rather than
# hardcoding the URL, so it can't drift from this source.
#
# Same recipient address already shown on the Contact page's Email
# card (app/routes/pages.py) and in the footer -- never a second one;
# all three come from COMRADE_EMAIL in app/email_links.py.
WAITLIST_SUBJECT = "I'd like to join the Comrade waitlist"
WAITLIST_BODY = (
    "Hi Comrade Team,\n\n"
    "I'd like to join the Comrade waitlist and stay updated on what "
    "you're building.\n\n"
    "Thanks!"
)
WAITLIST_EMAIL_HREF = gmail_compose_url(COMRADE_EMAIL, WAITLIST_SUBJECT, WAITLIST_BODY)

# The plain "just get in touch" link -- recipient only, no subject or
# body -- shared by the footer's Email row. The Contact page's Email
# card builds its own copy of this same value directly in pages.py
# (it isn't rendered through a context processor), but both call
# gmail_compose_url() with the same COMRADE_EMAIL, so they can't drift.
COMRADE_EMAIL_HREF = gmail_compose_url(COMRADE_EMAIL)


def register_context_processors(app: Flask) -> None:
    @app.context_processor
    def inject_navigation():
        return {"main_nav_items": MAIN_NAV_ITEMS}

    @app.context_processor
    def inject_current_year():
        return {"current_year": datetime.now(timezone.utc).year}

    @app.context_processor
    def inject_waitlist_cta():
        return {
            "waitlist_email_href": WAITLIST_EMAIL_HREF,
            "comrade_email_href": COMRADE_EMAIL_HREF,
        }
