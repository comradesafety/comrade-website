/**
 * app.js
 * Lightweight entry point. Imports each independent feature module and
 * initializes it once the DOM is ready. Contains no feature logic
 * itself, only wiring.
 */

import { initializeNavbarScroll } from "./navbar-scroll.js";
import { initializeMobileMenu } from "./mobile-menu.js";
import { initializeHeroAnimation } from "./hero-animation.js";
import { initializeOrbitAnimation } from "./orbit-animation.js";
import { initializeScrollReveal } from "./scroll-reveal.js";

function initializeComradeApp() {
  initializeNavbarScroll();
  initializeMobileMenu();
  initializeHeroAnimation();
  initializeOrbitAnimation();
  initializeScrollReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeComradeApp);
} else {
  initializeComradeApp();
}
