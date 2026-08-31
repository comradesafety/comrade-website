"""Electronics & Hardware Intern recruitment form.

GET renders the multi-step application. POST /submit receives the
completed application as JSON, validates it server-side — the
client-side validation in recruitment-form.js is a UX convenience
only, never trusted alone, per this project's security posture — and
forwards a validated, normalized payload to the Google Apps Script Web
App configured via GOOGLE_APPS_SCRIPT_URL (see config.py), which
appends it to a Google Sheet. No Google credentials of any kind live
in this file or ever reach the browser: the Apps Script Web App URL is
read from server-side config only, and Flask makes the one outbound
HTTPS request to it — the browser never talks to Google directly. See
google-apps-script/Code.gs for the script this URL must point to, and
its own header comment for the exact deploy steps.
"""

import json
import re
import time
import urllib.error
import urllib.request

from flask import Blueprint, current_app, jsonify, redirect, request, url_for

recruitment_bp = Blueprint("recruitment", __name__)

# Single source of truth for the role's identity/metadata, so the public
# Careers page (pages.careers, careers-opening.html) and this application
# never drift apart into two slightly different descriptions of the same
# opening. Anything here is safe to show publicly; it deliberately stays
# at the "hardware/embedded systems" level of detail, never the product
# itself (see careers.html's confidentiality note for why that line
# exists).
ROLE_TITLE = "Electronics & Hardware Intern"
ROLE_TEAM = "Comrade · Hardware team"
OPEN_POSITIONS = "1–3 positions"
ROLE_TYPE = "Unpaid internship"
ROLE_FOCUS = "Product development"
ROLE_AREA = "Hardware + Embedded"
ROLE_STAGE = "Prototype → MVP"

EMAIL_PATTERN = re.compile(r"^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,24}$")
MAX_SHORT_TEXT = 200
MAX_LONG_TEXT = 4000
MAX_URL_LENGTH = 300

HONEYPOT_FIELD = "company_website"

SKILL_SCALE_OPTIONS = [
    "Beginner",
    "Basic",
    "Intermediate",
    "Strong",
    "Advanced",
]

MICROCONTROLLER_OPTIONS = [
    "Arduino",
    "ESP32",
    "ESP8266",
    "STM32",
    "Raspberry Pi",
    "RP2040",
    "AVR",
    "PIC",
    "Other",
]

PCB_EXPERIENCE_OPTIONS = [
    "No experience",
    "Basic exposure",
    "Designed simple PCBs",
    "Designed and tested multiple PCBs",
    "Strong practical PCB experience",
]

PROTOTYPING_EXPERIENCE_OPTIONS = [
    "None",
    "Academic projects",
    "1–2 personal projects",
    "Multiple practical projects",
    "Extensive hands-on experience",
]

WEEKLY_HOURS_OPTIONS = ["3–5", "5–8", "8–12", "12–20", "20+"]
DURATION_OPTIONS = ["1 month", "2 months", "3 months", "4–6 months", "6+ months"]
WORKING_MODE_OPTIONS = ["Remote", "Hybrid", "In-person", "Flexible"]


TEXT_FIELDS = [
    ("full_name", "Full name", True, MAX_SHORT_TEXT),
    ("email", "Email address", True, MAX_SHORT_TEXT),
    ("phone", "WhatsApp / phone number", True, 40),
    ("college", "College / university", True, MAX_SHORT_TEXT),
    ("degree", "Degree / program", True, MAX_SHORT_TEXT),
    ("linkedin_url", "LinkedIn Profile", False, MAX_URL_LENGTH),
    ("github_url", "GitHub / Portfolio link", False, MAX_URL_LENGTH),
]

LONG_TEXT_FIELDS = [
    ("challenging_project", "Most challenging project", True),
    ("motivation_reason", "Motivation for Comrade", True),
]

RADIO_FIELDS = [
    ("analog_electronics", "Analog Electronics understanding", True, SKILL_SCALE_OPTIONS),
    ("digital_electronics", "Digital Electronics understanding", True, SKILL_SCALE_OPTIONS),
    ("pcb_experience", "PCB design experience", True, PCB_EXPERIENCE_OPTIONS),
    ("prototyping_experience", "Hands-on prototyping experience", True, PROTOTYPING_EXPERIENCE_OPTIONS),
    ("weekly_hours", "Weekly availability", True, WEEKLY_HOURS_OPTIONS),
    ("duration", "Commitment duration", True, DURATION_OPTIONS),
    ("working_mode", "Working mode", False, WORKING_MODE_OPTIONS),
]

CHECKBOX_FIELDS = [
    ("microcontrollers", "Microcontrollers worked with", False, MICROCONTROLLER_OPTIONS),
]

ACK_FIELDS = [
    ("unpaid_ack", "the unpaid internship acknowledgement"),
    ("confidentiality_ack", "the confidentiality acknowledgement"),
    ("privacy_ack", "the privacy acknowledgement"),
]

SHEET_COLUMNS = [
    "full_name",
    "email",
    "phone",
    "college",
    "degree",
    "analog_electronics",
    "digital_electronics",
    "microcontrollers",
    "pcb_experience",
    "prototyping_experience",
    "challenging_project",
    "linkedin_url",
    "github_url",
    "weekly_hours",
    "duration",
    "working_mode",
    "motivation_reason",
    "unpaid_ack",
    "confidentiality_ack",
    "privacy_ack",
]

FORM_STEPS = [
    {
        "number": "01",
        "title": "About You",
        "fields": [
            {"key": "full_name", "kind": "text", "label": "Full name", "required": True},
            {"key": "email", "kind": "email", "label": "Email address", "required": True, "placeholder": "you@example.com"},
            {"key": "phone", "kind": "tel", "label": "WhatsApp / phone number", "required": True},
            {"key": "college", "kind": "text", "label": "College / university", "required": True},
            {"key": "degree", "kind": "text", "label": "Degree / program", "required": True, "placeholder": "e.g. B.Tech Electronics & Communication"},
        ],
    },
    {
        "number": "02",
        "title": "Technical Overview",
        "intro": "Tell us about your practical electronics background.",
        "fields": [
            {"key": "analog_electronics", "kind": "radio", "label": "How would you rate your understanding of Analog Electronics?", "required": True, "options": SKILL_SCALE_OPTIONS},
            {"key": "digital_electronics", "kind": "radio", "label": "How would you rate your understanding of Digital Electronics?", "required": True, "options": SKILL_SCALE_OPTIONS},
            {"key": "microcontrollers", "kind": "checkbox", "label": "Which microcontrollers or development platforms have you worked with?", "options": MICROCONTROLLER_OPTIONS},
            {"key": "pcb_experience", "kind": "radio", "label": "Have you worked with PCB design?", "required": True, "options": PCB_EXPERIENCE_OPTIONS},
            {"key": "prototyping_experience", "kind": "radio", "label": "How much hands-on hardware prototyping experience do you have?", "required": True, "options": PROTOTYPING_EXPERIENCE_OPTIONS},
        ],
    },
    {
        "number": "03",
        "title": "Experience & Projects",
        "intro": "We care about what you actually built, tested, broke, fixed, and learned from.",
        "fields": [
            {"key": "challenging_project", "kind": "textarea", "label": "Tell us about the most technically challenging electronics or hardware project you have personally built.", "required": True, "rows": 4},
            {"key": "linkedin_url", "kind": "url", "label": "LinkedIn Profile", "placeholder": "https://linkedin.com/in/.../"},
            {"key": "github_url", "kind": "url", "label": "GitHub / Portfolio", "placeholder": "https://github.com/..."},
        ],
    },
    {
        "number": "04",
        "title": "Availability & Motivation",
        "fields": [
            {"key": "weekly_hours", "kind": "radio", "label": "How many hours per week can you realistically contribute?", "required": True, "options": WEEKLY_HOURS_OPTIONS},
            {"key": "duration", "kind": "radio", "label": "How long can you commit to the project?", "required": True, "options": DURATION_OPTIONS},
            {"key": "working_mode", "kind": "radio", "label": "What working mode are you comfortable with?", "required": True, "options": WORKING_MODE_OPTIONS},
            {"key": "motivation_reason", "kind": "textarea", "label": "Why are you interested in working on Comrade's product-development team?", "required": True, "rows": 4},
        ],
    },
]

_recent_submissions = {}


@recruitment_bp.route("/careers/product-development-internship", methods=["GET"])
def apply():
    # This used to render its own intro + form page, duplicating the
    # Careers page (pages.careers). /careers is now the one canonical
    # recruitment experience — this route stays only so links/bookmarks
    # to the old URL keep working, landing straight on the embedded
    # form there instead of a second copy of the introduction.
    return redirect(url_for("pages.careers") + "#application")


@recruitment_bp.route("/careers/product-development-internship/submit", methods=["POST"])
def submit():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify(success=False, error="Invalid submission."), 400

    if str(payload.get(HONEYPOT_FIELD, "")).strip():
        current_app.logger.info("Recruitment submission rejected: honeypot filled.")
        return jsonify(success=True)

    client_ip = request.remote_addr or "unknown"
    cooldown = current_app.config.get("RECRUITMENT_SUBMIT_COOLDOWN_SECONDS", 30)
    last_submitted = _recent_submissions.get(client_ip)
    now = time.monotonic()
    if last_submitted is not None and now - last_submitted < cooldown:
        return (
            jsonify(
                success=False,
                error="You've just submitted an application. Please wait a moment before trying again.",
            ),
            429,
        )

    errors, cleaned = _validate(payload)
    if errors:
        return jsonify(success=False, error="Please check the highlighted fields.", fields=errors), 400

    script_url = current_app.config.get("GOOGLE_APPS_SCRIPT_URL")
    if not script_url:
        current_app.logger.error(
            "Recruitment submission validated but GOOGLE_APPS_SCRIPT_URL is not configured; dropping it."
        )
        return (
            jsonify(success=False, error="Something went wrong while submitting your application. Please check your connection and try again."),
            503,
        )

    if not _forward_to_sheet(script_url, cleaned):
        return (
            jsonify(success=False, error="Something went wrong while submitting your application. Please check your connection and try again."),
            502,
        )

    _recent_submissions[client_ip] = now
    return jsonify(success=True)


def _validate(payload):
    errors = {}
    cleaned = {}

    for key, label, required, max_length in TEXT_FIELDS:
        value = str(payload.get(key, "")).strip()
        if required and not value:
            errors[key] = f"{label} is required."
            continue
        if len(value) > max_length:
            errors[key] = f"{label} is too long."
            continue
        if key == "email" and value and not EMAIL_PATTERN.match(value):
            errors[key] = "Enter a valid email address."
            continue
        cleaned[key] = value

    for key, label, required in LONG_TEXT_FIELDS:
        value = str(payload.get(key, "")).strip()
        if required and not value:
            errors[key] = f"{label} is required."
            continue
        if len(value) > MAX_LONG_TEXT:
            errors[key] = f"{label} is too long."
            continue
        cleaned[key] = value

    for key, label, required, options in RADIO_FIELDS:
        value = str(payload.get(key, "")).strip()
        if not value:
            if required:
                errors[key] = f"{label} is required."
            cleaned[key] = ""
            continue
        if value not in options:
            errors[key] = f"{label} has an invalid selection."
            continue
        cleaned[key] = value

    for key, label, required, options in CHECKBOX_FIELDS:
        raw = payload.get(key, [])
        if not isinstance(raw, list):
            errors[key] = f"{label} is invalid."
            continue
        values = [str(v).strip() for v in raw if str(v).strip()]
        if not values:
            if required:
                errors[key] = f"Select at least one option for {label.lower()}."
            cleaned[key] = ""
            continue
        invalid = [v for v in values if v not in options]
        if invalid:
            errors[key] = f"{label} has an invalid selection."
            continue
        cleaned[key] = ", ".join(values)

    for key, description in ACK_FIELDS:
        if payload.get(key) is not True:
            errors[key] = f"You must accept {description} to submit."
            continue
        cleaned[key] = "Yes"

    return errors, cleaned


def _forward_to_sheet(script_url, cleaned):
    row = [cleaned.get(key, "") for key in SHEET_COLUMNS]
    body = json.dumps({"row": row}).encode("utf-8")
    req = urllib.request.Request(
        script_url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            return 200 <= response.status < 300
    except (urllib.error.URLError, TimeoutError) as exc:
        current_app.logger.error("Failed to forward recruitment submission to Google Sheet: %s", exc)
        return False
