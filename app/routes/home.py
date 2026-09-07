"""Homepage route.

The homepage is the only fully-designed page in the current scope. All of
its content lives in templates; this route only supplies the data.
"""

import os

from flask import Blueprint, Response, current_app, render_template, send_from_directory

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


@home_bp.route("/robots.txt", methods=["GET"])
def robots():
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "Sitemap: https://www.comradesafety.com/sitemap.xml\n"
    )
    return Response(content, mimetype="text/plain")


@home_bp.route("/sitemap.xml", methods=["GET"])
def sitemap():
    pages = [
        "https://www.comradesafety.com/",
        "https://www.comradesafety.com/about",
        "https://www.comradesafety.com/vision",
        "https://www.comradesafety.com/products",
        "https://www.comradesafety.com/contact",
        "https://www.comradesafety.com/careers",
    ]
    xml_entries = "".join(
        f"<url><loc>{url}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>"
        for url in pages
    )
    xml_content = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{xml_entries}\n"
        "</urlset>"
    )
    return Response(xml_content, mimetype="application/xml")

