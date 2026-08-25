"""Routes for pages that are not the homepage.

About is now fully designed (see templates/pages/about.html and its
components). Vision, Products, and Contact are still the shared minimal
"coming soon" template; when one of them is ready to be fully designed,
give it its own template and point its route at that instead, the same
way about() below no longer uses PLACEHOLDER_COPY.
"""

from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)

PLACEHOLDER_COPY = {
    "vision": {
        "title": "Vision",
        "message": "Our vision page is being crafted with care. Coming soon.",
    },
    "products": {
        "title": "Products",
        "message": "Product details are on the way. Coming soon.",
    },
    "contact": {
        "title": "Contact",
        "message": "A dedicated contact page is coming soon.",
    },
}

ABOUT_HERO = {
    "eyebrow": "Who we are",
    "headline": "Safety should never be something you have to remember to carry.",
    "description": (
        "Comrade is being built around a simple idea: personal safety "
        "should integrate naturally into everyday life. We are exploring "
        "new ways to bring thoughtful design and intelligent technology "
        "together in products made for the real world."
    ),
    "quote": "Protection should feel present, not intrusive.",
}

ABOUT_VALUES_HEADING = {
    "headline": "Safety should never stand in the way of living.",
    "description": (
        "At Comrade, we believe everyone deserves the freedom to live, "
        "explore, and pursue their dreams with confidence and peace of mind."
    ),
}

# Freedom/Confidence/Empowerment deliberately reuse the same icons as the
# homepage orbit labels (freedom, confidence, strength) rather than
# introducing near-duplicate icons for closely related concepts: the
# same idea gets the same icon everywhere on the site.
ABOUT_VALUES = [
    {
        "icon": "freedom",
        "title": "Freedom",
        "description": "Live, move, and explore without letting fear define your choices.",
    },
    {
        "icon": "confidence",
        "title": "Confidence",
        "description": "Because feeling prepared can change the way you experience the world.",
    },
    {
        "icon": "innovation",
        "title": "Innovation",
        "description": "Rethinking everyday safety through thoughtful technology and design.",
    },
    {
        "icon": "strength",
        "title": "Empowerment",
        "description": "Creating solutions that put people in control of their own safety.",
    },
]

ABOUT_PHILOSOPHY_HEADING = {
    "eyebrow": "Our philosophy",
    "headline": "How Comrade Thinks",
}

ABOUT_PHILOSOPHY = [
    {
        "number": "01",
        "icon": "feel-it",
        "title": "Feel It",
        "description": "Safety should feel present, without ever feeling in the way.",
    },
    {
        "number": "02",
        "icon": "trust-it",
        "title": "Trust It",
        "description": "Thoughtful design begins with reliability, simplicity, and purpose.",
    },
    {
        "number": "03",
        "icon": "move-freely",
        "title": "Move Freely",
        "description": "Safety should empower independence and confidence.",
    },
]

ABOUT_TEAM_HEADING = {
    "eyebrow": "Our team",
    "headline": "The people behind Comrade",
}

# Real names/photos to follow. The card design (see about-team.html and
# about.css) already renders correctly with a "name coming soon" state,
# so adding them later is a one-line data change here, not a template
# change: set "name" (and, once available, a "photo" static path).
ABOUT_TEAM_LEAD = {"role": "Founder & CEO", "name": None, "photo": None}
ABOUT_TEAM_EXECS = [
    {"role": "Chief Technology Officer", "name": None, "photo": None},
    {"role": "Chief Marketing Officer", "name": None, "photo": None},
]


@pages_bp.route("/about", methods=["GET"])
def about():
    return render_template(
        "pages/about.html",
        hero=ABOUT_HERO,
        values_heading=ABOUT_VALUES_HEADING,
        values=ABOUT_VALUES,
        philosophy_heading=ABOUT_PHILOSOPHY_HEADING,
        philosophy=ABOUT_PHILOSOPHY,
        team_heading=ABOUT_TEAM_HEADING,
        team_lead=ABOUT_TEAM_LEAD,
        team_execs=ABOUT_TEAM_EXECS,
    )


@pages_bp.route("/vision", methods=["GET"])
def vision():
    return render_template("pages/vision.html", copy=PLACEHOLDER_COPY["vision"])


@pages_bp.route("/products", methods=["GET"])
def products():
    return render_template("pages/products.html", copy=PLACEHOLDER_COPY["products"])


@pages_bp.route("/contact", methods=["GET"])
def contact():
    return render_template("pages/contact.html", copy=PLACEHOLDER_COPY["contact"])
