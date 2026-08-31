"""Routes for pages that are not the homepage.

About, Vision, Products, and Contact are all now fully designed (see
their templates/pages/*.html and components). No route here uses the
generic "coming soon" placeholder template any more, but
components/placeholder-section.html and static/css/placeholder.css
(the latter also still used by the 404/500 error pages, so it stays
either way) are kept in place, ready to include as-is the moment a new
page needs a "coming soon" state again.
"""

from flask import Blueprint, render_template

from app.routes.recruitment import (
    ACK_FIELDS,
    FORM_STEPS,
    HONEYPOT_FIELD,
    OPEN_POSITIONS,
    ROLE_AREA,
    ROLE_FOCUS,
    ROLE_STAGE,
    ROLE_TITLE,
    ROLE_TYPE,
)

pages_bp = Blueprint("pages", __name__)

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


# The headline itself (with its one highlighted word) is hardcoded
# directly in contact-hero.html, the same reasoning as every other
# page's hero above. "note" avoids repeating "conversation" since the
# headline already uses that word.
CONTACT_HERO = {
    "eyebrow": "Get in touch",
    "description": (
        "Have a question, a collaboration idea, or want to know more "
        "about what we're building? We'd love to hear from you."
    ),
    "note": "Every meaningful idea starts somewhere. Let's start here.",
}

# Both values are exactly what's already live in footer.html — never a
# second, possibly-drifting copy of the same contact details. "icon"
# names a branch in macros/icons.html; "external" adds target="_blank"
# rel="noopener noreferrer" for the one link that leaves the site.
CONTACT_METHODS = [
    {
        "label": "Email",
        "icon": "mail",
        "value": "comradessafety@gmail.com",
        "href": "mailto:comradessafety@gmail.com",
        "external": False,
    },
    {
        "label": "Instagram",
        "icon": "instagram",
        "value": "@comradesafe",
        "href": "https://www.instagram.com/comradesafe/",
        "external": True,
    },
]

CONTACT_TOPICS_HEADING = "What can we talk about?"

CONTACT_TOPICS = [
    "Product ideas",
    "Collaborations",
    "Partnerships",
    "Questions",
    "Feedback",
]


@pages_bp.route("/contact", methods=["GET"])
def contact():
    return render_template(
        "pages/contact.html",
        hero=CONTACT_HERO,
        methods=CONTACT_METHODS,
        topics_heading=CONTACT_TOPICS_HEADING,
        topics=CONTACT_TOPICS,
    )


# The Careers page is the public, editorial introduction to the opening
# defined in routes/recruitment.py; it never redefines the role's own
# identity (title, positions, type, focus) — those are imported above
# from recruitment.py so the two pages can never quietly drift apart.
# The headline sentences themselves follow the same hardcode-in-template
# convention as every other page's hero (see PRODUCTS_HERO above).
#
# The one idea a separate "Why Comrade" section used to carry — that
# this is a real-world problem worth solving, not just a resume line —
# lives here instead, as a single clause, the one place on the page
# "personal safety" is named at all. The rest of that section's cards
# (build from the ground up / own meaningful work / learn by building)
# were restating the Workflow and Internship sections in other words,
# so they were cut rather than kept as a fourth retelling.
CAREERS_HERO = {
    "eyebrow": "Careers",
    "description": (
        "We're building technology around personal safety — a problem "
        "that deserves better answers. We're looking for curious "
        "builders who want to help turn early ideas into a working "
        "product."
    ),
}

# "description" is the one sentence this role gets in Current Opening;
# the technical breakdown itself lives only in CAREERS_FOCUS below, so
# it's never stated twice in different words.
CAREERS_OPENING = {
    "role_title": ROLE_TITLE,
    "description": (
        "We're looking for a hands-on builder who can help convert "
        "concepts into functional prototypes, across electronics, "
        "embedded systems, and hardware-software integration."
    ),
    "meta": [OPEN_POSITIONS, ROLE_TYPE, ROLE_FOCUS, ROLE_AREA, ROLE_STAGE],
}

CAREERS_FOCUS = [
    {
        "icon": "circuit",
        "title": "Circuit Design",
        "description": "Designing and refining analog and digital circuits for real hardware.",
    },
    {
        "icon": "cpu",
        "title": "Microcontrollers",
        "description": "Working across Arduino, ESP32, STM32, and similar platforms.",
    },
    {
        "icon": "sensor",
        "title": "Sensors & Modules",
        "description": "Integrating sensors and modules into working systems.",
    },
    {
        "icon": "pcb",
        "title": "PCB Prototyping",
        "description": "Taking circuits from breadboard to a working prototype board.",
    },
    {
        "icon": "layers",
        "title": "Embedded Systems",
        "description": "Writing and debugging firmware that runs on real hardware.",
    },
    {
        "icon": "bug",
        "title": "Testing & Debugging",
        "description": "Measuring, isolating faults, and iterating until it works.",
    },
    {
        "icon": "plug",
        "title": "Hardware-Software Integration",
        "description": "Connecting firmware, hardware, and software into one working system.",
    },
]

CAREERS_WORKFLOW = [
    {"number": "01", "title": "Understand", "description": "Get clear on the problem before touching a single component."},
    {"number": "02", "title": "Research", "description": "Look at what exists, what fails, and what could work better."},
    {"number": "03", "title": "Design", "description": "Plan circuits, select components, and sketch the system."},
    {"number": "04", "title": "Prototype", "description": "Build it on breadboard or a prototype board."},
    {"number": "05", "title": "Test", "description": "Measure, observe, and find where it breaks."},
    {"number": "06", "title": "Improve", "description": "Refine the design based on what testing reveals."},
]

CAREERS_TRAITS = [
    "Hands-on",
    "Curious",
    "Technical",
    "Resourceful",
    "Patient",
    "Experimental",
    "Collaborative",
    "Self-directed",
]

# Deliberately proficiency-level statements, not a second parts list —
# CAREERS_FOCUS above is the one place the actual technical areas
# (circuits, microcontrollers, PCB, embedded systems...) get named.
CAREERS_EXPECTATIONS = {
    "core": [
        "Comfortable with analog and digital electronics fundamentals",
        "Some hands-on microcontroller experience",
        "Has physically prototyped something before — breadboard, soldering, or similar",
        "A genuine debugging mindset: measure, isolate, iterate",
    ],
    "preferred": [
        "PCB design experience",
        "Comfortable writing firmware, not just circuits",
        "Access to basic lab equipment",
        "Familiarity with IoT or communication protocols",
    ],
}

# Everything Current Opening already states as a chip (positions, type,
# focus, area) stays there and isn't repeated here — Duration is the
# one fact that doesn't fit a short chip, so it's the only line this
# section adds.
CAREERS_DURATION = "Based on mutual discussion"

CAREERS_CONFIDENTIALITY = (
    "Selected candidates may receive access to unreleased technical and "
    "product information as part of the development process."
)

CAREERS_SELECTION = [
    {"number": "01", "title": "Application", "description": "Submit your application through the form below."},
    {"number": "02", "title": "Technical Review", "description": "We review your background, projects, and technical answers."},
    {"number": "03", "title": "Discussion / Interview", "description": "Shortlisted applicants are invited to a conversation."},
    {"number": "04", "title": "Selection", "description": "We confirm the interns joining the team."},
    {"number": "05", "title": "Begin Building", "description": "Onboarding, and your first prototype work begins."},
]

CAREERS_CTA = {
    "heading": "Think you can build with us?",
    "description": (
        "Tell us what you've built, how you think, and how you'd "
        "approach the problems we're trying to solve."
    ),
}


@pages_bp.route("/careers", methods=["GET"])
def careers():
    return render_template(
        "pages/careers.html",
        hero=CAREERS_HERO,
        opening=CAREERS_OPENING,
        focus=CAREERS_FOCUS,
        workflow=CAREERS_WORKFLOW,
        traits=CAREERS_TRAITS,
        expectations=CAREERS_EXPECTATIONS,
        duration=CAREERS_DURATION,
        confidentiality=CAREERS_CONFIDENTIALITY,
        selection=CAREERS_SELECTION,
        cta=CAREERS_CTA,
        # Recruitment form context, reused as-is so the embedded
        # application below never becomes a second copy of it.
        steps=FORM_STEPS,
        ack_fields=ACK_FIELDS,
        honeypot_field=HONEYPOT_FIELD,
    )
