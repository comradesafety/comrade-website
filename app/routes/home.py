"""Homepage route.

The homepage is the only fully-designed page in the current scope. All of
its content lives in templates; this route only supplies the data.
"""

import os

from flask import Blueprint, current_app, render_template, send_from_directory

home_bp = Blueprint("home", __name__)

# Orbit A carries Freedom and Safety, orbit B carries Confidence and
# Strength. Keeping this list here (rather than hardcoded in the template)
# means adding or reordering a label never touches HTML markup. Each pair
# starts 180 degrees apart on its ellipse so the two labels can never
# collide, see orbit-animation.js.
ORBIT_LABELS = [
    {"text": "Freedom", "icon": "freedom", "orbit": "a", "phase": 0},
    {"text": "Safety", "icon": "safety", "orbit": "a", "phase": 180},
    {"text": "Confidence", "icon": "confidence", "orbit": "b", "phase": 0},
    {"text": "Strength", "icon": "strength", "orbit": "b", "phase": 180},
]


@home_bp.route("/", methods=["GET"])
def index():
    return render_template("pages/home.html", orbit_labels=ORBIT_LABELS)


@home_bp.route("/favicon.ico", methods=["GET"])
def favicon():
    # Browsers request /favicon.ico directly regardless of the <link>
    # tags in base.html, so this avoids a spurious 404 on every visit.
    images_dir = os.path.join(current_app.root_path, "static", "images")
    return send_from_directory(images_dir, "favicon.ico", mimetype="image/x-icon")
