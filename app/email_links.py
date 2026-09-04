"""Gmail web-compose links shared by every "contact us by email" spot
on the site: the navbar's global Join Waitlist CTA, the Contact page's
Email card, and the footer's Email row.

These used to be plain mailto: links, but a mailto: link only does
anything if the visitor's browser/OS has a mail app registered as its
default handler for it -- plenty of visitors don't, and when that's
missing, clicking a mailto: link does nothing visible at all: no
error, no dialog, indistinguishable from a broken link. Gmail's own
web compose URL sidesteps that entirely: it opens in a normal new
browser tab and works for any visitor with a Google account (Gmail
prompts sign-in first if they're not already), with the recipient,
subject, and body already filled in -- no dependency on local mail
client configuration.

COMRADE_EMAIL is the one place the recipient address is defined; every
other file builds its link from gmail_compose_url() below rather than
hardcoding "comradessafety@gmail.com" a second time, so they can never
quietly drift apart.
"""

from urllib.parse import urlencode

COMRADE_EMAIL = "comradessafety@gmail.com"


def gmail_compose_url(to: str = COMRADE_EMAIL, subject: str | None = None, body: str | None = None) -> str:
    """Build a Gmail web-compose URL, opened via target="_blank" by
    every call site. urlencode() percent-encodes spaces, newlines,
    apostrophes, and everything else that isn't a bare unreserved
    character, the same job quote() did for the old mailto: hrefs --
    so a multi-line body still arrives well-formed instead of getting
    cut off at the first special character.
    """
    params = {"view": "cm", "fs": "1", "to": to}
    if subject:
        params["su"] = subject
    if body:
        params["body"] = body
    return "https://mail.google.com/mail/?" + urlencode(params)
