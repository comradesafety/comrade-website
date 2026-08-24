"""Smoke tests for every route and for the security headers/error pages."""

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest

from app import create_app


@pytest.fixture
def client():
    os.environ["FLASK_ENV"] = "development"
    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as client:
        yield client


@pytest.mark.parametrize(
    "path",
    ["/", "/about", "/vision", "/products", "/contact"],
)
def test_public_routes_return_200(client, path):
    response = client.get(path)
    assert response.status_code == 200


def test_unknown_route_returns_404(client):
    response = client.get("/this-route-does-not-exist")
    assert response.status_code == 404
    assert b"could not be found" in response.data.lower() or b"404" in response.data


def test_security_headers_present(client):
    response = client.get("/")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in response.headers
    assert "Referrer-Policy" in response.headers


def test_homepage_contains_hero_headline(client):
    response = client.get("/")
    assert b"stays" in response.data.lower()
