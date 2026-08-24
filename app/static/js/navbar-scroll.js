/**
 * navbar-scroll.js
 * Toggles the "navbar-scrolled" class as the page scrolls, shrinking the
 * navbar and giving it a surface/shadow. Pure scroll logic only, no
 * mobile menu or other concerns live here.
 */

const SCROLL_THRESHOLD_DOWN = 60;
const SCROLL_THRESHOLD_UP = 10;

export function initializeNavbarScroll() {
  const navbar = document.querySelector(".comrade-navbar");
  if (!navbar) return;

  let ticking = false;

  function updateNavbarState() {
    const isScrolled = navbar.classList.contains("navbar-scrolled");
    
    if (!isScrolled && window.scrollY > SCROLL_THRESHOLD_DOWN) {
      navbar.classList.add("navbar-scrolled");
    } else if (isScrolled && window.scrollY <= SCROLL_THRESHOLD_UP) {
      navbar.classList.remove("navbar-scrolled");
    }
    ticking = false;
  }

  function requestNavbarUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateNavbarState);
  }

  updateNavbarState();
  window.addEventListener("scroll", requestNavbarUpdate, { passive: true });
}
