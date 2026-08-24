# COMRADE WEBSITE: COMPLETE IMPLEMENTATION PROMPT

You are building a real, production-quality **Flask multi-page website** for a startup named **Comrade**.

The supplied screenshots are the primary visual references.

The objective is to build the website so it feels like the exact same brand and design system shown in the references, while keeping the implementation:

- Modular
- Reusable
- Secure
- Responsive
- AI-friendly
- Performance-conscious
- Easy to extend
- Visually polished
- Rich in smooth animations and interactions

Use:

- Python
- Flask
- Jinja2
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Bootstrap Icons and/or clean SVG icons

Do not turn this into a generic Bootstrap landing page.

The screenshot is the design reference and should be treated as the source of truth.

---

# 1. CURRENT PROJECT SCOPE

For this implementation:

### Fully build

- Homepage
- Navbar
- Hero section
- Hero image composition
- Orbit animation system
- CTA buttons
- Footer
- Responsive behavior
- Global animation system
- Theme system
- Security configuration
- Error pages

### Create only basic routing/placeholders for

- About
- Vision
- Products
- Contact

Do NOT fully design those other pages yet.

The architecture must still be ready for expanding them later.

---

# 2. IMPORTANT DESIGN REFERENCE

The supplied homepage screenshot shows the intended visual language.

Study it carefully before writing the code.

Match the reference in:

- Color palette
- Warm cream background
- Burgundy/magenta accent
- Typography
- Font weight
- Hero composition
- Hero image placement
- Navbar spacing
- Button shapes
- Border radius
- Decorative elements
- Whitespace
- Visual hierarchy
- Image scaling
- Alignment
- Overall premium editorial aesthetic

Do not create something merely "inspired by" the screenshot.

The result should visually feel like the same website.

---

# 3. PROVIDED ASSETS

I will place the actual:

1. Comrade logo
2. Hero image

inside the project directory.

You must inspect the project and identify those assets.

Move/copy them into a clean static asset directory if necessary.

Recommended:

```text
app/static/images/
```

Do not replace them with:

- Stock images
- Generated images
- Placeholder graphics
- Random online assets

Use the supplied files.

Use Flask/Jinja asset references such as:

```jinja2
{{ url_for('static', filename='images/logo.png') }}
```

Never use local machine paths such as:

```text
C:\Users\...
/home/user/...
file://...
```

---

# 4. MODULAR ARCHITECTURE IS MANDATORY

One of the most important requirements is that the project must NOT become a giant monolithic codebase.

Do not create:

- One 1000+ line CSS file
- One 1000+ line JavaScript file
- One giant HTML file
- One giant Flask route file

Each file should have one clear responsibility.

A developer or AI should understand a file from its name without having to inspect the entire project.

Prefer:

```text
navbar.html
hero.html
hero-orbit.html
footer.html
```

over:

```text
components.html
sections.html
misc.html
```

Prefer:

```text
navbar.css
hero.css
orbit.css
buttons.css
footer.css
```

over:

```text
styles.css
```

Prefer:

```text
navbar-scroll.js
mobile-menu.js
hero-animation.js
orbit-animation.js
scroll-reveal.js
```

over:

```text
main.js
```

containing everything.

---

# 5. KEEP FILES SMALL

Keep files intentionally small and focused.

A preferred range is approximately:

```text
50 to 250 lines
```

Try to remain below:

```text
300 to 400 lines
```

unless there is a legitimate technical reason.

When a file becomes too large, split it.

For example:

```text
hero.css
orbit.css
hero-responsive.css
```

is preferable to a 700-line hero stylesheet containing unrelated logic.

The goal is:

**small files + clear names + clear responsibilities + maximum reuse.**

This is important because the project will be maintained using AI coding tools.

The AI should not have to read thousands of lines to understand a small feature.

---

# 6. RECOMMENDED PROJECT STRUCTURE

Use a structure similar to:

```text
comrade/
│
├── run.py
├── config.py
├── requirements.txt
├── README.md
├── .env.example
├── .gitignore
│
├── instance/
│
├── app/
│   ├── __init__.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── home.py
│   │   └── pages.py
│   │
│   ├── templates/
│   │   ├── base.html
│   │   │
│   │   ├── pages/
│   │   │   ├── home.html
│   │   │   ├── about.html
│   │   │   ├── vision.html
│   │   │   ├── products.html
│   │   │   └── contact.html
│   │   │
│   │   ├── components/
│   │   │   ├── navbar.html
│   │   │   ├── hero.html
│   │   │   ├── hero-orbit.html
│   │   │   ├── hero-label.html
│   │   │   ├── cta-buttons.html
│   │   │   └── footer.html
│   │   │
│   │   ├── macros/
│   │   │   ├── buttons.html
│   │   │   ├── icons.html
│   │   │   └── hero-label.html
│   │   │
│   │   └── errors/
│   │       ├── 404.html
│   │       └── 500.html
│   │
│   └── static/
│       ├── css/
│       │   ├── variables.css
│       │   ├── reset.css
│       │   ├── base.css
│       │   ├── navbar.css
│       │   ├── hero.css
│       │   ├── orbit.css
│       │   ├── buttons.css
│       │   ├── animations.css
│       │   ├── footer.css
│       │   └── responsive.css
│       │
│       ├── js/
│       │   ├── app.js
│       │   ├── navbar-scroll.js
│       │   ├── mobile-menu.js
│       │   ├── hero-animation.js
│       │   ├── orbit-animation.js
│       │   └── scroll-reveal.js
│       │
│       ├── images/
│       │   ├── logo.*
│       │   ├── hero.*
│       │   └── ...
│       │
│       └── icons/
│
└── tests/
```

You may improve this structure, but keep the same modular philosophy.

Do not create folders merely for the sake of having more folders.

---

# 7. JINJA2 TEMPLATE INHERITANCE

Use Jinja2 template inheritance extensively.

Create:

```text
templates/base.html
```

This should contain:

- HTML document structure
- `<head>`
- Metadata
- Theme metadata
- CSS includes
- Navbar include
- Main content block
- Footer include
- Common JavaScript imports

Pages should extend `base.html`.

Example:

```jinja2
{% extends "base.html" %}
```

Do NOT repeat:

- `<html>`
- `<head>`
- Bootstrap imports
- Navbar
- Footer
- Common scripts
- Global CSS

inside every page.

---

# 8. JINJA2 COMPONENT REUSE

Use includes and macros.

For example:

```jinja2
{% include "components/navbar.html" %}
```

and:

```jinja2
{% include "components/footer.html" %}
```

Use Jinja macros for repeated structures.

For example, the four orbit labels should not require writing the same HTML structure four separate times.

Create a reusable macro such as:

```jinja2
{% from "macros/hero-label.html" import hero_label %}
```

and then:

```jinja2
{{ hero_label("Freedom", "icon-name") }}
{{ hero_label("Confidence", "icon-name") }}
```

The exact implementation can differ, but reuse is mandatory.

---

# 9. NO LOGIN OR AUTHENTICATION

Do not create:

- Login
- Signup
- User accounts
- Password systems
- Admin dashboards
- Authentication
- User sessions for authentication

These are not required right now.

Only create public routes.

---

# 10. FLASK ROUTES

Create:

```text
/
 /about
 /vision
 /products
 /contact
```

The homepage route should render the complete homepage.

The other routes should render minimal placeholder templates.

For example:

```text
About
Coming soon.
```

This is enough for now.

Do not spend development time designing those pages.

---

# 11. USE FLASK BLUEPRINTS

Use Flask Blueprints where appropriate.

For example:

```text
routes/home.py
routes/pages.py
```

Keep routes focused only on routing and page rendering.

Do not put large HTML strings inside Python.

Do not put CSS or JavaScript inside route files.

---

# 12. SECURITY

The website does not have authentication right now, but it must still be implemented with secure defaults.

Implement:

- Environment-based configuration
- Secure secret key handling
- Security headers
- Safe Jinja2 rendering
- Production-safe error handling
- No sensitive information leakage
- Proper HTTP methods
- Input validation for future forms
- CSRF protection for future POST/state-changing forms
- Safe logging

Do not hardcode secrets.

Use:

```text
.env.example
```

and add:

```text
.env
```

to `.gitignore`.

---

# 13. SECURITY HEADERS

Add appropriate security headers centrally.

Consider:

- Content-Security-Policy
- X-Content-Type-Options
- X-Frame-Options or CSP `frame-ancestors`
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security for HTTPS production environments

Do not create an intentionally weak CSP merely to make the animation work.

Prefer external CSS and JavaScript files instead of inline scripts/styles.

---

# 14. ERROR HANDLING

Create:

```text
templates/errors/404.html
templates/errors/500.html
```

Do not expose stack traces or internal application details in production.

The error pages should still use:

```text
base.html
```

and therefore remain visually consistent with the Comrade design.

---

# 15. EXACT COLOR SYSTEM

Use the supplied screenshot as the source of truth for the color palette.

Do not choose a generic similar palette.

The website should use the same visual family as the screenshot:

- Warm cream/off-white background
- Deep burgundy/magenta accent
- Near-black text
- Soft neutral secondary text
- Light borders
- Warm subtle shadows

Derive the closest practical color values from the reference.

Create:

```text
static/css/variables.css
```

with all theme colors.

For example:

```css
:root {
    --comrade-bg: ...;
    --comrade-surface: ...;
    --comrade-primary: ...;
    --comrade-primary-hover: ...;
    --comrade-text: ...;
    --comrade-text-muted: ...;
    --comrade-border: ...;
    --comrade-shadow: ...;
}
```

Every other stylesheet should use these variables.

Do not scatter repeated hex values throughout the codebase.

---

# 16. THEME LOCK

The Comrade website must use a fixed light theme.

Do NOT implement automatic dark mode.

Do NOT allow:

```css
@media (prefers-color-scheme: dark)
```

to change the website's visual theme.

The website should look the same whether the user's OS is:

- Light
- Dark
- Auto

Use:

```html
<meta name="color-scheme" content="light">
```

and:

```css
:root {
    color-scheme: light;
}
```

Set an appropriate:

```html
<meta name="theme-color" content="...">
```

based on the Comrade palette.

Do not add a theme toggle.

The design should remain intentionally locked to the provided visual identity.

Browser extensions that deliberately override websites cannot be fully blocked, but the site should not depend on system colors or default browser styling.

Use explicit colors for important UI surfaces.

---

# 17. BOOTSTRAP THEME OVERRIDE

Bootstrap is allowed, but its default color system must not leak into the design.

Do not allow Bootstrap default blue buttons, links, alerts, etc.

Override components as necessary.

Comrade buttons must use:

```css
background: var(--comrade-primary);
```

rather than Bootstrap's default primary color.

---

# 18. GLOBAL NAVBAR

Recreate the navbar from the screenshot.

Desktop structure:

```text
Comrade Logo
Home
About
Vision
Products
Contact
Coming Soon
```

Home should appear active.

Use burgundy for the active state.

The navbar should remain fixed or sticky appropriately.

---

# 19. NAVBAR SCROLL ANIMATION

This behavior is important.

At the top of the page:

- Navbar should have the spacious proportions shown in the screenshot.
- Logo should be slightly larger.
- Vertical padding should be comfortable.

When the user scrolls:

- Navbar should become slightly smaller.
- Logo should reduce slightly.
- Vertical spacing should reduce.
- A subtle surface/background effect may appear.
- A subtle shadow or border can appear.
- Transition must be smooth.

Implement this in:

```text
navbar-scroll.js
```

and:

```text
navbar.css
```

Use a class such as:

```text
navbar-scrolled
```

Do not jump between states abruptly.

---

# 20. MOBILE NAVBAR

Use Bootstrap responsive behavior if useful.

On mobile:

- Show a hamburger button
- Open a clean navigation menu
- Animate the menu smoothly
- Keep the logo visible
- Make links touch-friendly
- Keep the Coming Soon CTA usable
- Prevent the menu from covering content incorrectly

Keep mobile-specific behavior in:

```text
mobile-menu.js
```

---

# 21. HOMEPAGE HERO

The hero is the primary visual focus.

Desktop layout:

```text
LEFT                     RIGHT

Eyebrow                  Hero image
Headline                 Orbit system
Paragraph                Moving labels
CTA buttons
```

The layout should visually match the screenshot.

---

# 22. HERO EYEBROW

Use:

```text
WOMEN'S SAFETY, REIMAGINED
```

Include the short burgundy line before it.

Use appropriate letter spacing and typography.

---

# 23. HERO HEADLINE

Use:

```text
Safety that
stays with
you.
```

Highlight:

```text
stays
```

in the Comrade burgundy/magenta accent.

Preserve the visual line breaks on desktop.

Use responsive typography on smaller screens.

The heading must feel large, bold, editorial, and premium.

---

# 24. HERO DESCRIPTION

Use:

```text
Comrade is a pioneering force in women's safety, dedicated
to empowering women through innovation.
```

Maintain an appropriate reading width.

Do not stretch it excessively.

---

# 25. HERO CTA BUTTONS

Primary:

```text
Explore Our Vision ↗
```

Secondary:

```text
What's Coming ↗
```

Primary:

- Burgundy background
- White text
- Rounded shape
- Soft shadow
- Elegant hover animation

Secondary:

- Cream/light background
- Thin border
- Dark text
- Rounded shape
- Subtle hover effect

Arrow icons should be proper SVG/Bootstrap icons rather than cheap Unicode arrows where practical.

---

# 26. BUTTON MICRO-INTERACTIONS

Buttons should have high-quality hover interactions.

Examples:

- Slight upward translation
- Shadow transition
- Icon movement
- Subtle background transition

Example behavior:

```text
Normal
↓
Hover
Slight lift + shadow + icon movement
↓
Active
Small press-down effect
```

Do not make buttons bounce aggressively.

---

# 27. HERO IMAGE

Use the supplied hero image exactly.

Do not generate a replacement.

Do not distort it.

Maintain its aspect ratio.

Position it similarly to the screenshot.

The image should blend naturally with the cream background.

Responsive behavior must be handled carefully.

---

# 28. MOST IMPORTANT ANIMATION: CROSSED ORBIT SYSTEM

The hero image must have **two permanent thin oval orbit paths** around it.

This is one of the defining visual features of the homepage.

The orbit lines must always remain visible.

They should not disappear during animation.

Create two elliptical paths.

Conceptually:

```text
Orbit A:
top-right
    \
     \
      \
       \
        bottom-left


Orbit B:
top-left
    /
   /
  /
 /
bottom-right
```

The two paths must visually cross each other, forming an elegant X-like orbital composition around the hero image.

They should look like two thin elliptical orbital tracks intersecting around the image.

Do not make them circles.

Do not make them random curved lines.

They should clearly read as two oval orbital paths.

---

# 29. ORBIT VISUAL DESIGN

Each orbit should be:

- Very thin
- Elegant
- Subtle
- Light enough not to overpower the hero image
- Permanently visible
- Smooth
- Properly aligned with the hero composition

The lines should use the Comrade palette.

Do not use loud neon colors.

Do not use heavy strokes.

The orbit paths should visually blend into the overall premium aesthetic.

---

# 30. FOUR MOVING ORBIT LABELS

There are four labels:

```text
Freedom
Confidence
Safety
Strength
```

These labels must move continuously along the orbit paths.

This is NOT a simple CSS rotation of the entire hero image.

The labels themselves must travel around the elliptical paths.

---

# 31. TWO LABELS PER ORBIT

There are exactly:

```text
Orbit A:
2 labels

Orbit B:
2 labels
```

For example:

```text
Orbit A:
Freedom
Safety

Orbit B:
Confidence
Strength
```

You may choose the exact pairings, but each orbit must have exactly two labels.

---

# 32. LABELS MUST ACTUALLY FOLLOW THE PATH

The labels must visually remain attached to the orbit line.

They should move:

```text
along the exact oval path
```

rather than simply rotating around a central point.

The position should be calculated from the ellipse geometry.

A JavaScript-based implementation is strongly preferred.

For each label use an orbital parameter such as:

```text
theta
```

and calculate the position using ellipse equations:

```text
x = centerX + radiusX * cos(theta)
y = centerY + radiusY * sin(theta)
```

Then apply the appropriate transformation to the label.

The exact implementation can use another reliable approach, but the result must be equivalent.

---

# 33. CROSSING ORBITS MUST REMAIN INDEPENDENT

The two orbit systems must be independent.

Each orbit should have:

- Its own center
- Its own elliptical dimensions
- Its own rotation angle
- Its own animation speed
- Its own label positions

This allows the crossed-orbit effect to remain stable while labels move naturally.

---

# 34. LABEL ROTATION / ORIENTATION

The labels should look visually natural while moving.

They should not randomly flip upside down.

Prefer keeping the label text readable throughout the orbit.

The icon + pill should move together as one object.

The label should maintain proper orientation while travelling along the path.

Do not rotate the text continuously around its own axis unless it genuinely improves readability and matches the design.

Readability is more important than mechanical orbital rotation.

---

# 35. NEVER COLLIDE THE LABELS

This is extremely important.

The two labels on each orbit must **never collide or overlap**.

Implement phase offsets.

For example:

```text
Label A:
theta

Label B:
theta + PI
```

or another mathematically appropriate separation.

Do not simply place two elements at random positions.

The separation must be maintained dynamically.

Even while the orbit is moving, the labels must preserve a safe angular separation.

---

# 36. CONSTANT VELOCITY

The labels should move continuously.

The movement should feel:

- Smooth
- Calm
- Premium
- Consistent

Do not make the velocity jump.

Use either:

```text
requestAnimationFrame
```

or a carefully implemented animation system.

The speed should be controlled by a configuration value such as:

```javascript
const ORBIT_SPEED = ...;
```

Do not scatter timing constants throughout multiple files.

---

# 37. REQUESTANIMATIONFRAME

Prefer:

```text
requestAnimationFrame()
```

for dynamic orbital positioning.

This allows the exact position of each label to be calculated each frame.

Avoid using a sequence of arbitrary `setInterval()` calls for orbital motion.

The animation should remain smooth across different refresh rates.

Use delta-time or another appropriate method so the motion is not tied directly to a fixed frame rate.

---

# 38. ORBIT ANIMATION FILE

Keep the orbital logic in its own file:

```text
static/js/orbit-animation.js
```

This file should contain only orbital animation behavior.

Do not mix:

- Navbar logic
- Mobile menu
- Footer behavior
- General scroll logic

inside this file.

It must be independently reusable.

---

# 39. ORBIT CSS

Create:

```text
static/css/orbit.css
```

for:

- Orbit path styling
- Orbit container
- Label appearance
- Label pills
- Icon circles
- Responsive orbit variables
- Layering
- Overflow behavior

Do not put orbit styles into the general hero stylesheet unless they are genuinely structural.

---

# 40. ORBIT GEOMETRY

The orbital system should be responsive.

The same conceptual shape must work on:

- Large desktop
- Laptop
- Tablet
- Mobile

Do not use hardcoded desktop-only coordinates.

Use responsive calculations based on:

- Image dimensions
- Container width
- Container height
- Viewport
- CSS variables
- Bounding rectangles

The labels should remain attached to the orbit as the viewport changes.

If the browser resizes:

```text
recalculate orbit dimensions
recalculate center
recalculate label positions
```

Do not allow labels to drift away from the image.

---

# 41. ORBIT ROTATION

The two ellipses should have different orientations.

One should visually lean:

```text
top-right → bottom-left
```

and the other:

```text
top-left → bottom-right
```

The exact angles should be tuned visually against the screenshot.

The orbit path itself should remain stationary while the labels move along it.

Do NOT continuously rotate the entire orbit path.

The intended effect is:

```text
Static crossed orbital tracks
+
Moving labels
```

not:

```text
Rotating crossed tracks
```

---

# 42. ORBIT LABEL STYLE

Each moving label should visually resemble:

```text
[ circular icon ] [ Freedom ]
```

Use:

- Small circular icon area
- Cream/white pill
- Subtle shadow
- Burgundy accent
- Clean typography

Do not use emoji characters.

Use:

- Bootstrap Icons
- SVG
- CSS-based icons

---

# 43. ORBIT LAYERING

The visual stacking should be carefully designed.

Recommended order:

```text
background
↓
hero decorative effects
↓
hero image
↓
orbit lines
↓
moving labels
```

Adjust where necessary so the orbit looks naturally integrated with the image.

Do not allow orbit lines to visually dominate the image.

---

# 44. ORBIT PERFORMANCE

The orbit animation must remain smooth.

Do not perform expensive DOM queries every animation frame.

Calculate static values once where possible.

Use cached references.

Use `requestAnimationFrame`.

Recalculate dimensions only when necessary:

- Initial load
- Resize
- Image load
- Responsive breakpoint change

Do not repeatedly call expensive layout-measuring operations for every object every frame if avoidable.

---

# 45. HERO ENTRANCE ANIMATION

On initial page load:

1. Eyebrow gently fades in.
2. Headline reveals smoothly.
3. Paragraph appears slightly afterward.
4. CTA buttons appear.
5. Hero image fades and scales into position.
6. Orbit paths softly appear.
7. Orbit labels appear sequentially.
8. Orbital movement begins seamlessly.

The entire sequence should feel cohesive.

Avoid long delays.

Do not make the user wait several seconds before the site becomes interactive.

---

# 46. HERO IMAGE MICRO-MOTION

Add extremely subtle motion to the hero composition.

For example:

- Gentle floating effect
- Very slight vertical movement
- Subtle depth/parallax effect

The image should not visibly bounce.

The effect should be slow and almost imperceptible.

The goal is to make the image feel alive without becoming distracting.

---

# 47. DECORATIVE LABEL MOTION

Apart from their orbital movement, the labels may have a very subtle secondary animation:

- Soft glow
- Tiny opacity variation
- Minimal scale variation

Do not let this distort their path.

Their primary motion is orbital movement.

---

# 48. PAGE SCROLL ANIMATION SYSTEM

Create a reusable:

```text
static/js/scroll-reveal.js
```

using:

```text
IntersectionObserver
```

Create a reusable class such as:

```text
reveal-on-scroll
```

and optional variants:

```text
reveal-up
reveal-left
reveal-right
reveal-scale
```

Animations should be subtle.

Do not animate every single element.

Use them selectively.

---

# 49. GENERAL TRANSITIONS

All interactive elements should have smooth transitions.

Examples:

```text
navbar links
buttons
cards
icons
pills
footer links
hero labels
```

Use a consistent transition system.

For example:

```css
--comrade-transition-fast
--comrade-transition-normal
--comrade-transition-slow
```

Centralize these values in `variables.css`.

---

# 50. BUTTON MICRO-ANIMATION

When hovering:

Primary button:

```text
lift slightly
+
shadow grows slightly
+
arrow shifts
```

Secondary button:

```text
border changes subtly
+
background shifts slightly
+
arrow shifts
```

Keep it refined.

---

# 51. NAVIGATION HOVER EFFECT

Navbar links should have a subtle animated underline.

The underline should:

- Grow smoothly
- Use the burgundy color
- Match the active state

Do not use a static thick line.

---

# 52. LINK INTERACTION

Other textual links throughout the site should use subtle transitions.

Avoid default browser blue links.

Use Comrade colors.

---

# 53. FOOTER

A second footer screenshot will be provided.

Use it as the exact footer reference.

Build:

```text
components/footer.html
footer.css
```

and load the footer through `base.html`.

Do not duplicate footer code across pages.

Implement its responsive behavior.

---

# 54. RESPONSIVE DESIGN

Desktop should be visually closest to the reference.

Tablet should intelligently adapt.

Mobile should become a clean stacked composition.

Do not simply scale the desktop layout down.

On mobile, use an intentional composition such as:

```text
Navbar
↓
Eyebrow
↓
Headline
↓
Description
↓
Buttons
↓
Hero image + orbit system
↓
Footer
```

The exact order can be adjusted based on what gives the best result.

---

# 55. RESPONSIVE ORBIT SYSTEM

This deserves special attention.

On smaller screens:

- Reduce orbit dimensions
- Reduce label size
- Reduce orbit stroke
- Preserve crossed orientation
- Keep labels attached to paths
- Maintain separation
- Keep all labels within the viewport

Do not allow the orbit system to create horizontal scrolling.

If necessary, scale the entire orbit stage proportionally.

The visual concept must remain recognizable on mobile.

---

# 56. TOUCH AND MOBILE INTERACTION

Hover-only behavior must never be necessary to understand the site.

Touch users should still be able to navigate and interact correctly.

Do not require hover to reveal critical information.

---

# 57. ACCESSIBILITY

Implement:

- Semantic HTML
- Proper heading hierarchy
- Alt text
- Keyboard accessibility
- Focus states
- Accessible navigation
- Appropriate ARIA attributes
- Accessible mobile menu
- Reduced-motion support

---

# 58. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

However, this should reduce motion, not alter the Comrade color theme.

For users requesting reduced motion:

- Disable or reduce orbital movement
- Reduce entrance animations
- Remove excessive transitions
- Keep the visual layout intact
- Keep orbit paths visible if possible

Do NOT switch the color theme.

---

# 59. TYPOGRAPHY

Use a modern, clean, premium sans-serif.

The screenshot's typography is extremely important.

Match:

- Font weight
- Letter spacing
- Line height
- Heading size
- Paragraph size
- Navigation size
- Button text
- Eyebrow text

Use responsive sizing with `clamp()` where appropriate.

---

# 60. NO CHEAP EMOJIS

Do not use:

```text
😀
❤️
🔥
🚀
```

or other generic emoji characters.

Use proper:

- Bootstrap Icons
- SVG
- CSS shapes
- Image assets

The visual language should remain premium.

---

# 61. NO EM DASH

Do not use the em dash character `—` anywhere in website-visible text.

Use commas, periods, colons, semicolons, or other appropriate punctuation.

---

# 62. CSS ARCHITECTURE

Keep CSS modular.

Suggested:

```text
variables.css
```

Theme tokens.

```text
reset.css
```

Minimal browser normalization.

```text
base.css
```

Global typography and base structure.

```text
navbar.css
```

Navbar-only styles.

```text
hero.css
```

Hero layout.

```text
orbit.css
```

Orbit paths and orbit labels.

```text
buttons.css
```

Reusable buttons.

```text
animations.css
```

Shared animation classes.

```text
footer.css
```

Footer-only styles.

```text
responsive.css
```

Responsive overrides.

Do not duplicate the same rules across files.

---

# 63. JAVASCRIPT ARCHITECTURE

Use:

```text
app.js
```

as a lightweight entry point.

Separate modules:

```text
navbar-scroll.js
mobile-menu.js
hero-animation.js
orbit-animation.js
scroll-reveal.js
```

`app.js` can initialize or import the modules.

Do not turn `app.js` into a giant file.

---

# 64. DATABASE

Do not create a database right now.

There is:

- No login
- No signup
- No user account
- No dynamic dashboard

The homepage can use static/Jinja data.

Keep the architecture future-ready for:

- Contact submissions
- Newsletter subscriptions
- Dynamic products
- CMS content

but do not build those systems now.

---

# 65. PERFORMANCE

Keep the implementation lightweight.

Do not add unnecessary libraries.

Do not install a large animation framework for basic animations.

Prefer:

- CSS transitions
- CSS animations
- requestAnimationFrame
- IntersectionObserver
- Native browser APIs

Use Bootstrap only where useful.

---

# 66. ANIMATION PERFORMANCE

For animated elements:

- Prefer transforms
- Prefer opacity
- Avoid animating layout-heavy properties unnecessarily
- Avoid forced synchronous layout
- Cache DOM references
- Use `requestAnimationFrame`
- Recalculate responsive dimensions only when needed

For orbit labels, prefer:

```css
transform: translate3d(...)
```

or an equivalent GPU-friendly approach where appropriate.

---

# 67. NO CODE DUPLICATION

Before creating a new function, class, component, or template section:

Ask:

> Does this already exist somewhere else?

If yes:

- Reuse it
- Refactor it
- Create a shared helper
- Create a Jinja macro
- Create a reusable component

Do not duplicate code simply because two pages need similar content.

---

# 68. AI-FRIENDLY CODE

This project will be modified frequently through AI coding tools.

Therefore:

### File names must be explicit.

Good:

```text
orbit-animation.js
navbar-scroll.js
hero.css
footer.css
```

Bad:

```text
misc.js
new.js
final.js
styles2.css
```

### Functions must be explicit.

Good:

```text
initializeOrbitAnimation()
calculateOrbitPosition()
updateOrbitLabel()
initializeNavbarScroll()
```

Bad:

```text
start()
update()
thing()
```

### Classes must be meaningful.

Good:

```text
hero-orbit
hero-orbit-label
navbar-scrolled
reveal-on-scroll
```

Bad:

```text
box1
item2
effect
```

---

# 69. DOCUMENTATION

Create a concise README explaining:

- What Comrade is
- How to install
- How to create a virtual environment
- How to install requirements
- How to configure environment variables
- How to run Flask
- Project structure
- Where components are located
- Where animations are located
- Where theme variables are located
- Security notes

Keep it concise.

---

# 70. REQUIREMENTS

Create:

```text
requirements.txt
```

with only packages actually used.

Do not add unnecessary dependencies.

---

# 71. ENVIRONMENT

Create:

```text
.env.example
```

Do not include real secrets.

Use environment variables for sensitive configuration.

Add `.env` to `.gitignore`.

---

# 72. VALIDATION

After building the site:

1. Start Flask.
2. Open the homepage.
3. Verify the logo.
4. Verify the hero image.
5. Verify the navbar.
6. Verify all navigation links.
7. Verify the orbit paths.
8. Verify all four labels.
9. Verify continuous orbital motion.
10. Verify no label collisions.
11. Verify the crossed orbit geometry.
12. Verify responsive orbit scaling.
13. Verify mobile navigation.
14. Verify scroll navbar animation.
15. Verify page-load animation.
16. Verify scroll-reveal animations.
17. Verify buttons.
18. Verify footer.
19. Verify 404 page.
20. Verify 500 page.
21. Check browser console.
22. Check for horizontal overflow.
23. Check responsive layouts.
24. Check security headers.
25. Check production-safe configuration.

Fix any issues found.

---

# 73. VISUAL VALIDATION

Do not assume the result is correct simply because Flask runs.

Actually inspect the rendered page.

Compare it with the supplied screenshot.

Pay special attention to:

- Navbar height
- Logo size
- Navbar spacing
- Eyebrow alignment
- Headline proportions
- Word wrapping
- Burgundy highlight
- Paragraph width
- Button placement
- Image dimensions
- Image position
- Orbit dimensions
- Orbit crossing points
- Orbit line thickness
- Label size
- Label position
- Label spacing
- Background color
- Whitespace
- Footer layout

Iterate until the visual result is very close.

---

# 74. ORBIT VALIDATION CHECKLIST

The orbit animation is a critical feature.

Before considering the homepage complete, verify:

### Orbit paths

- [ ] Two oval paths exist.
- [ ] Both paths remain continuously visible.
- [ ] They cross each other.
- [ ] One is oriented from top-right to bottom-left.
- [ ] The other is oriented from top-left to bottom-right.

### Labels

- [ ] There are four labels.
- [ ] Freedom exists.
- [ ] Confidence exists.
- [ ] Safety exists.
- [ ] Strength exists.
- [ ] Two labels belong to Orbit A.
- [ ] Two labels belong to Orbit B.

### Movement

- [ ] Labels continuously move.
- [ ] Labels follow the exact elliptical paths.
- [ ] Motion is smooth.
- [ ] Velocity is consistent.
- [ ] Labels maintain their orbit association.
- [ ] Labels never collide.
- [ ] Labels never overlap each other.
- [ ] Labels do not jump unexpectedly.
- [ ] Labels remain readable.
- [ ] The paths themselves do not rotate.
- [ ] The image does not rotate.
- [ ] Browser resize recalculates the orbit correctly.

---

# 75. FINAL DESIGN PHILOSOPHY

The final website should feel:

- Premium
- Modern
- Elegant
- Trustworthy
- Minimal
- Technologically sophisticated
- Human
- Smooth
- Responsive

The animation should make the website feel alive without making it look like a flashy template.

The crossed orbital system should become one of the signature visual features of the Comrade homepage.

---

# 76. FINAL NON-NEGOTIABLE REQUIREMENTS

The following are mandatory:

1. Flask backend.
2. Jinja2 templates.
3. Jinja template inheritance.
4. Reusable Jinja components.
5. Reusable Jinja macros where appropriate.
6. Modular CSS.
7. Modular JavaScript.
8. Small, descriptive files.
9. No huge monolithic files.
10. No duplicated code.
11. Real supplied logo.
12. Real supplied hero image.
13. Same visual color palette as the screenshot.
14. Locked light theme.
15. No automatic dark mode.
16. No cheap emojis.
17. No em dash in visible text.
18. Responsive design.
19. Smooth navbar scroll transformation.
20. Smooth page-load animations.
21. Smooth scroll-reveal animations.
22. Rich but tasteful micro-interactions.
23. Two crossed elliptical orbit paths.
24. Four moving orbit labels.
25. Two labels per orbit.
26. Labels must actually travel along the ellipse.
27. Labels must maintain separation and never collide.
28. Orbit paths remain permanently visible.
29. Orbit system must be implemented with performant JavaScript.
30. Responsive orbital geometry.
31. Reduced-motion support.
32. Secure Flask configuration.
33. Security headers.
34. Safe Jinja2 rendering.
35. Production-safe error handling.
36. No login/authentication yet.
37. No unnecessary database.
38. About/Vision/Products/Contact routes exist as placeholders.
39. Footer built as a reusable component.
40. Visual validation must be performed before completion.

---

# 77. FINAL EXPECTED RESULT

When I run the project, I should get a polished Comrade website whose homepage closely resembles the supplied reference.

The overall structure should be approximately:

```text
                         COMRADE NAVBAR

        WOMEN'S SAFETY, REIMAGINED

        Safety that                [ Hero Image ]
        stays with                 [ crossed     ]
        you.                       [ orbit paths ]
                                   [ moving      ]
        Description                [ labels      ]

        [ Explore Our Vision ]     [ Freedom    ]
        [ What's Coming ]          [ Confidence ]
                                   [ Safety     ]
                                   [ Strength   ]

                         FOOTER
```

The hero image should remain the visual focal point on the right.

The two thin crossed elliptical orbit paths should always be visible.

The four labels should constantly and smoothly move along their respective orbital paths.

The movement must feel deliberate, mathematically clean, smooth, and premium.

The labels must never collide.

The entire site should feel like a carefully designed startup product website rather than a collection of disconnected HTML templates.

Build the complete foundation now so that future pages, features, forms, products, and backend functionality can be added without restructuring the entire project.