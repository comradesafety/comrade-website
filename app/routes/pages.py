"""Placeholder routes for pages that are not fully designed yet.

Each route renders the same minimal "coming soon" template with different
copy. When a page is ready to be fully designed, give it its own template
under templates/pages/ and point the route at it instead.
"""

from flask import Blueprint, render_template

pages_bp = Blueprint("pages", __name__)

PLACEHOLDER_COPY = {
    "about": {
        "title": "About",
        "message": "We are putting together the Comrade story. Coming soon.",
    },
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


@pages_bp.route("/about", methods=["GET"])
def about():
    return render_template("pages/about.html", copy=PLACEHOLDER_COPY["about"])


@pages_bp.route("/vision", methods=["GET"])
def vision():
    return render_template("pages/vision.html", copy=PLACEHOLDER_COPY["vision"])


@pages_bp.route("/products", methods=["GET"])
def products():
    return render_template("pages/products.html", copy=PLACEHOLDER_COPY["products"])


@pages_bp.route("/contact", methods=["GET"])
def contact():
    return render_template("pages/contact.html", copy=PLACEHOLDER_COPY["contact"])
