"""Template context shared across every page.

Centralizing the navigation list here means the navbar and footer both
loop over the same data instead of each hardcoding their own copy.
"""

from datetime import datetime, timezone
from urllib.parse import quote

from flask import Flask

MAIN_NAV_ITEMS = [
    ("home.index", "Home"),
    ("pages.about", "About"),
    ("pages.vision", "Vision"),
    ("pages.products", "Products"),
    ("pages.careers", "Career"),
    ("pages.contact", "Contact"),
]

# The waitlist is a mailto invitation, not a website form -- there is
# no backend endpoint, no database, no Google Sheet for it. This is
# the one place the recipient/subject/body are defined; the navbar's
# global "Join Waitlist" CTA (the site's only waitlist entry point)
# builds its href from WAITLIST_MAILTO_HREF below rather than
# hardcoding the mailto string, so it can't drift from this source.
#
# Same recipient address already shown on the Contact page's Email
# card and in the footer -- never a second address.
WAITLIST_EMAIL = "comradessafety@gmail.com"
WAITLIST_SUBJECT = "I'd like to join the Comrade waitlist"
WAITLIST_BODY = (
    "Hi Comrade Team,\n\n"
    "I'd like to join the Comrade waitlist and stay updated on what "
    "you're building.\n\n"
    "Thanks!"
)
# quote(), not manual string concatenation: percent-encodes spaces,
# newlines (-> %0A), apostrophes, and everything else that isn't a
# bare unreserved character, which is what makes the prefilled subject
# and multi-line body actually well-formed in every mail client
# instead of silently truncating at the first special character.
WAITLIST_MAILTO_HREF = (
    f"mailto:{WAITLIST_EMAIL}"
    f"?subject={quote(WAITLIST_SUBJECT, safe='')}"
    f"&body={quote(WAITLIST_BODY, safe='')}"
)


def register_context_processors(app: Flask) -> None:
    @app.context_processor
    def inject_navigation():
        return {"main_nav_items": MAIN_NAV_ITEMS}

    @app.context_processor
    def inject_current_year():
        return {"current_year": datetime.now(timezone.utc).year}

    @app.context_processor
    def inject_waitlist_cta():
        return {"waitlist_mailto_href": WAITLIST_MAILTO_HREF}
