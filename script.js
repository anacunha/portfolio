// Loaded in <head> without defer so the saved theme is applied before first paint.
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "theme";

  root.classList.add("js");

  function readStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Storage may be blocked; the toggle still works for this visit.
    }
  }

  var systemLight = window.matchMedia("(prefers-color-scheme: light)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (systemLight.matches ? "light" : "dark");
  }

  var stored = readStoredTheme();
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setupThemeToggle() {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;

    function updateLabel() {
      var next = currentTheme() === "dark" ? "light" : "dark";
      button.setAttribute("aria-label", "Switch to " + next + " mode");
    }

    button.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      updateLabel();

      button.classList.remove("is-flipping");
      void button.offsetWidth; // restart the coin spin
      button.classList.add("is-flipping");
    });

    // Follow system changes until the visitor picks a theme themselves.
    systemLight.addEventListener("change", updateLabel);
    updateLabel();
  }

  // Types out a paragraph like an RPG dialog box. The full text stays
  // available to screen readers through a visually hidden copy.
  function setupTypewriter() {
    var elements = document.querySelectorAll("[data-typewriter]");
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    elements.forEach(function (el) {
      var text = el.textContent;

      var hidden = document.createElement("span");
      hidden.className = "visually-hidden";
      hidden.textContent = text;

      var visible = document.createElement("span");
      visible.setAttribute("aria-hidden", "true");
      visible.className = "typewriter-cursor";

      el.textContent = "";
      el.appendChild(hidden);
      el.appendChild(visible);

      var observer = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        var i = 0;
        var timer = setInterval(function () {
          i += 1;
          visible.textContent = text.slice(0, i);
          if (i >= text.length) {
            clearInterval(timer);
            visible.classList.remove("typewriter-cursor");
          }
        }, 25);
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  function setupSaber() {
    var saber = document.querySelector(".saber");
    if (!saber) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      saber.classList.add("is-lit");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      saber.classList.add("is-lit");
      observer.disconnect();
    }, { threshold: 1 });

    observer.observe(saber);
  }

  // Fun fact easter egg: she tries a trick, falls, loses a tooth, and her stats show up.
  function setupSkater() {
    var skater = document.querySelector(".skater");
    if (!skater) return;

    var hint = document.querySelector(".skate-hint");
    var card = document.querySelector(".stats-card");
    var retry = document.querySelector(".retry");
    var tooth = skater.querySelector(".skater-tooth");
    var playing = false;

    function finish() {
      playing = false;
      skater.classList.add("is-done");
      hint.hidden = true;
      card.hidden = false;
    }

    function play() {
      if (playing) return;
      playing = true;
      skater.classList.remove("is-playing", "is-done");
      card.hidden = true;

      if (prefersReducedMotion) {
        finish();
        return;
      }

      void skater.offsetWidth; // restart the CSS animations
      skater.classList.add("is-playing");
    }

    tooth.addEventListener("animationend", function () {
      skater.classList.remove("is-playing");
      finish();
    });

    skater.addEventListener("click", function () {
      if (!skater.classList.contains("is-done")) play();
    });

    retry.addEventListener("click", function () {
      hint.hidden = false;
      play();
      skater.focus();
    });
  }

  function setYear() {
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupThemeToggle();
    setupTypewriter();
    setupSaber();
    setupSkater();
    setYear();
  });
})();
