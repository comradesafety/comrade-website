# Comrade

Comrade is a startup building technology for women's safety. This repository
is the Flask website for the Comrade brand: a fully designed homepage, plus
placeholder routes for the pages still being designed.

## Getting started

**1. Create and activate a virtual environment**

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
source .venv/bin/activate  # macOS / Linux
```

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Configure environment variables**

```bash
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

Then edit `.env` and set a real `SECRET_KEY`. Generate one with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**4. Run the app**

```bash
python run.py
```

Visit `http://127.0.0.1:5000`.

**5. Run the tests**

```bash
pytest
```

## Project structure

```text
run.py                  Local development entry point
config.py                Environment-driven configuration
app/
  __init__.py             App factory
  security.py              Security headers
  errors.py                 404 / 500 handlers
  context_processors.py      Shared template data (nav links, year)
  routes/
    home.py                    Homepage route
    pages.py                    About / Vision / Products / Contact placeholders
  templates/
    base.html                   Document shell, extended by every page
    pages/                        One template per route
    components/                    navbar, hero, hero-orbit, footer, cta-buttons
    macros/                         Reusable Jinja macros (buttons, icons, hero-label)
    errors/                          404.html, 500.html
  static/
    css/                           One stylesheet per concern (see below)
    js/                            One module per concern (see below)
    images/                        Supplied logo and hero artwork, plus favicons
    fonts/                         Self-hosted Plus Jakarta Sans (variable weight)
    vendor/                        Self-hosted Bootstrap 5 (CSS; JS bundle unused today)
tests/
  test_routes.py                 Route, header, and error-page smoke tests
```

### CSS (`app/static/css/`)

| File | Responsibility |
|---|---|
| `variables.css` | Every color, spacing, radius, and transition token |
| `fonts.css` | Self-hosted `@font-face` declaration |
| `reset.css` | Minimal browser normalization |
| `base.css` | Global typography, links, focus states, containers |
| `navbar.css` | Navbar, scroll-shrink state, mobile menu |
| `hero.css` | Hero layout and headline |
| `orbit.css` | The crossed orbit paths and moving labels |
| `buttons.css` | The Comrade button system |
| `animations.css` | Scroll-reveal and hero entrance animation classes |
| `footer.css` | Footer only |
| `placeholder.css` | The shared "coming soon" section |
| `responsive.css` | Breakpoint overrides |

### JavaScript (`app/static/js/`)

| File | Responsibility |
|---|---|
| `app.js` | Entry point; imports and initializes every module |
| `navbar-scroll.js` | Adds/removes `navbar-scrolled` on scroll |
| `mobile-menu.js` | Opens/closes the mobile navigation drawer |
| `hero-animation.js` | Homepage entrance sequence timing |
| `orbit-animation.js` | Orbit ellipse geometry and continuous label motion |
| `scroll-reveal.js` | Generic `IntersectionObserver` reveal-on-scroll system |

## Security notes

- All configuration is environment-driven (`config.py`); no secrets are
  hardcoded. `.env` is git-ignored; only `.env.example` is committed.
- `app/security.py` adds a Content-Security-Policy, `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and (outside
  debug/testing) `Strict-Transport-Security` to every response.
- CSRF protection (`Flask-WTF`) is initialized globally, ready for any
  future form.
- 404 and 500 pages never expose stack traces; server errors are logged,
  not shown to the user.
- There is no authentication, no user accounts, and no database in this
  version of the site by design.

## Theme

The site uses a single, locked light theme derived from the supplied logo
and hero artwork (warm cream background, deep burgundy accent). It does not
follow the OS light/dark preference; see `meta[name="color-scheme"]` in
`base.html` and `:root { color-scheme: light; }` in `base.css`.
