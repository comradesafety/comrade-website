/**
 * mobile-menu.js
 * Opens/closes the mobile navigation drawer. Handles the hamburger
 * toggle, closing on link click, closing on Escape, and keeping
 * aria-expanded in sync for accessibility.
 */

export function initializeMobileMenu() {
  const toggle = document.querySelector(".comrade-navbar__toggle");
  const menu = document.querySelector(".comrade-navbar__mobile-menu");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    // The menu collapses visually via grid-template-rows (see navbar.css),
    // which does not remove its links from the tab order on its own.
    // "inert" keeps closed-menu links out of both keyboard focus and the
    // accessibility tree without disturbing the collapse transition.
    menu.inert = false;
  }

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.inert = true;
  }

  menu.inert = true;

  function toggleMenu() {
    const isOpen = menu.classList.contains("is-open");
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggle.addEventListener("click", toggleMenu);

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Keep behavior sane if the viewport grows past the mobile breakpoint
  // while the menu is open.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992) {
      closeMenu();
    }
  });
}
