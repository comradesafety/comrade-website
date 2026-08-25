"""Routes for pages that are not the homepage.

About, Vision, and Products are now fully designed (see their
templates/pages/*.html and components). Contact is still the shared
minimal "coming soon" template; when it's ready to be fully designed,
give it its own template and point its route at that instead, the same
way about()/vision()/products() below no longer use PLACEHOLDER_COPY.
"""

from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)

PLACEHOLDER_COPY = {
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

# Real names/photos/links/messages to follow. The card design (see
# about-team.html and about.css) already renders correctly with a
# "coming soon" state for every one of these, so adding the real
# details later is a one-line data change here, not a template change:
# set "name", "photo" (a static path), "linkedin"/"instagram" (full
# URLs), "email", and "message" (a short first-person note).
ABOUT_TEAM_LEAD = {
    "role": "Founder & CEO",
    "name": None,
    "photo": None,
    "linkedin": None,
    "instagram": None,
    "email": None,
    "message": None,
}
ABOUT_TEAM_EXECS = [
    {
        "role": "Chief Technology Officer",
        "name": None,
        "photo": None,
        "linkedin": None,
        "instagram": None,
        "email": None,
        "message": None,
    },
    {
        "role": "Chief Marketing Officer",
        "name": None,
        "photo": None,
        "linkedin": None,
        "instagram": None,
        "email": None,
        "message": None,
    },
]


# The headline sentences themselves (with their one highlighted word or
# phrase each) are hardcoded directly in vision-hero.html / vision-why.html,
# the same way the homepage hero and footer statement hardcode their own
# highlight span rather than templating it: the highlighted word's
# position is fixed content, not configuration. Everything here is the
# copy that has no highlight to keep in sync with markup.
VISION_HERO = {
    "eyebrow": "Our vision",
    "description": (
        "Our vision is to reshape the way people experience personal "
        "safety through innovation, thoughtful design, and a deep "
        "understanding of everyday life. We envision a world where "
        "people can move, explore, and live with greater confidence, "
        "without allowing fear to define their choices."
    ),
    "status": "We're still building, testing, and refining what comes next.",
}

VISION_WHY = {
    "eyebrow": "Why Comrade",
}


# The two headline sentences (each with one highlighted phrase) are
# hardcoded directly in products-hero.html / products-how.html, the
# same reasoning as VISION_HERO above: a highlight's position is fixed
# content, not configuration.
PRODUCTS_HERO = {
    "eyebrow": "What we're exploring",
    "description": (
        "Comrade is exploring a new generation of everyday products "
        "designed with personal safety at their core."
    ),
}

# "illustration" names a macro branch in products-hero.html (own small
# abstract composition per product, not a shared icon), the same
# pattern icons.html's icon(name) macro uses. "status" drives which
# badge style renders: "coming-soon" is the solid pill, anything else
# (here just "in-development") is the outline pill.
PRODUCTS = [
    {
        "name": "Comrade Pulse",
        "status": "coming-soon",
        "status_label": "Coming Soon",
        "description": "Intelligent safety, designed to feel like second nature.",
        "illustration": "pulse",
    },
    {
        "name": "Comrade Aura",
        "status": "coming-soon",
        "status_label": "Coming Soon",
        "description": "A new way to think about everyday safety.",
        "illustration": "aura",
    },
    {
        "name": "Comrade Essentials",
        "status": "in-development",
        "status_label": "In Development",
        "description": "Everyday objects. A deeper sense of protection.",
        "illustration": "essentials",
    },
]

PRODUCTS_HOW_HEADING = {
    "eyebrow": "How we build",
}

PRODUCTS_HOW = [
    {
        "icon": "share",
        "title": "Connected Thinking",
        "description": "Exploring ways technology can help people stay better connected.",
    },
    {
        "icon": "eye-off",
        "title": "Discreet by Design",
        "description": "Safety solutions should integrate naturally into everyday products.",
    },
    {
        "icon": "accessibility",
        "title": "Thoughtful Interaction",
        "description": "Designed with simplicity and accessibility in mind.",
    },
    {
        "icon": "infinity",
        "title": "Built for Real Life",
        "description": "Technology should support people without getting in the way.",
    },
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
    return render_template(
        "pages/vision.html",
        hero=VISION_HERO,
        why=VISION_WHY,
    )


@pages_bp.route("/products", methods=["GET"])
def products():
    return render_template(
        "pages/products.html",
        hero=PRODUCTS_HERO,
        products=PRODUCTS,
        how_heading=PRODUCTS_HOW_HEADING,
        how=PRODUCTS_HOW,
    )


@pages_bp.route("/contact", methods=["GET"])
def contact():
    return render_template("pages/contact.html", copy=PLACEHOLDER_COPY["contact"])
