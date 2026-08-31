"""Application configuration.

Configuration is environment-driven so no secrets are hardcoded.
Values are read from environment variables (see .env.example).
"""

import os


class Config:
    """Base configuration shared by all environments."""

    SECRET_KEY = None

    # CSRF protection (Flask-WTF) is ready for future forms.
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None

    # The recruitment form (app/routes/recruitment.py) forwards validated
    # submissions server-side to a Google Apps Script Web App bound to a
    # Google Sheet — never from the browser, so this URL (and whatever the
    # script itself is authorized to do) never reaches client-side code.
    # Deliberately not a secret in the "leaks credentials" sense (Apps
    # Script Web App URLs carry no embedded key), but still kept
    # server-side only and out of source control, same as SECRET_KEY.
    # Empty by default; the route logs and fails closed if it's unset
    # rather than silently dropping submissions. See
    # google-apps-script/Code.gs for the script this URL must point to.
    GOOGLE_APPS_SCRIPT_URL = os.environ.get("GOOGLE_APPS_SCRIPT_URL", "")

    # Minimum seconds between two submissions from the same IP address.
    # Simple, in-process abuse mitigation — see recruitment.py's
    # _recent_submissions for why this is intentionally not a
    # distributed/persistent rate limiter at this project's scale.
    RECRUITMENT_SUBMIT_COOLDOWN_SECONDS = int(
        os.environ.get("RECRUITMENT_SUBMIT_COOLDOWN_SECONDS", "30")
    )

    # Cookies should never be readable by JavaScript or sent cross-site.
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"

    # No build step/bundler produces content-hashed filenames here, so a
    # long max-age would risk a browser serving a stale CSS/JS file after
    # a deploy. A near-zero max-age still lets the browser cache the
    # bytes, but forces a cheap conditional revalidation (ETag) on every
    # request, guaranteeing correctness over raw cache-hit speed.
    SEND_FILE_MAX_AGE_DEFAULT = 0

    # Flask ties Jinja's template auto-reload to DEBUG by default, so a
    # process running with DEBUG off silently keeps serving whatever
    # templates were on disk at startup, no matter what changes on disk
    # afterward. Explicit and unconditional here for the same reason as
    # SEND_FILE_MAX_AGE_DEFAULT above: the cost (a cheap mtime check per
    # render) is negligible at this project's scale, and it removes an
    # entire class of "I edited the file, why didn't anything change"
    # confusion regardless of which config/environment is active.
    TEMPLATES_AUTO_RELOAD = True


class DevelopmentConfig(Config):
    """Local development configuration."""

    DEBUG = True
    SESSION_COOKIE_SECURE = False
    SECRET_KEY = "dev-only-insecure-key-change-me"


class ProductionConfig(Config):
    """Production configuration with stricter, secure defaults."""

    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = None


CONFIG_MAP = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}


def get_config():
    """Return the config class matching FLASK_ENV (defaults to production-safe)."""
    env_name = os.environ.get("FLASK_ENV", "production").lower()
    return CONFIG_MAP.get(env_name, ProductionConfig)
