"""Application configuration.

Configuration is environment-driven so no secrets are hardcoded.
Values are read from environment variables (see .env.example).
"""

import os


class Config:
    """Base configuration shared by all environments."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-key-change-me")

    # CSRF protection (Flask-WTF) is ready for future forms.
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None

    # Cookies should never be readable by JavaScript or sent cross-site.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    # No build step/bundler produces content-hashed filenames here, so a
    # long max-age would risk a browser serving a stale CSS/JS file after
    # a deploy. A near-zero max-age still lets the browser cache the
    # bytes, but forces a cheap conditional revalidation (ETag) on every
    # request, guaranteeing correctness over raw cache-hit speed.
    SEND_FILE_MAX_AGE_DEFAULT = 0


class DevelopmentConfig(Config):
    """Local development configuration."""

    DEBUG = True
    SESSION_COOKIE_SECURE = False


class ProductionConfig(Config):
    """Production configuration with stricter, secure defaults."""

    DEBUG = False
    SESSION_COOKIE_SECURE = True


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_config():
    """Return the config class matching FLASK_ENV (defaults to production-safe)."""
    env_name = os.environ.get("FLASK_ENV", "production").lower()
    return CONFIG_MAP.get(env_name, ProductionConfig)
