(function () {
  "use strict";

  /* ---------------- theme toggle ---------------- */

  const themeToggle = document.getElementById("themeToggle");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (prefersDark) document.body.classList.add("dark");

  themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");
  });

  /* ---------------- password visibility ---------------- */

  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  toggleBtn.addEventListener("click", function () {
    const showing = toggleBtn.classList.toggle("is-visible");
    passwordInput.type = showing ? "text" : "password";
    toggleBtn.setAttribute("aria-label", showing ? "Hide password" : "Show password");
  });

  /* ---------------- form validation + fake submit ---------------- */

  const form = document.getElementById("loginForm");
  const emailField = document.getElementById("emailField");
  const passwordField = document.getElementById("passwordField");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("submitBtn");
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setError(field, hasError) {
    field.classList.toggle("has-error", hasError);
  }

  // clear the error state as soon as the person starts fixing it
  emailInput.addEventListener("input", function () {
    if (isValidEmail(emailInput.value.trim())) setError(emailField, false);
  });
  passwordInput.addEventListener("input", function () {
    if (passwordInput.value.length >= 8) setError(passwordField, false);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const emailOk = isValidEmail(emailInput.value.trim());
    const passwordOk = passwordInput.value.length >= 8;

    setError(emailField, !emailOk);
    setError(passwordField, !passwordOk);

    if (!emailOk || !passwordOk) {
      const firstBad = !emailOk ? emailField : passwordField;
      firstBad.querySelector("input").focus();
      return;
    }

    submitBtn.classList.add("is-loading");

    // simulating an auth call — swap this for a real request
    setTimeout(function () {
      submitBtn.classList.remove("is-loading");
      showToast("Signed in — redirecting to your workspace…");
      setTimeout(function () {
        window.location.href = "index.html";
      }, 900);
    }, 1100);
  });

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add("is-shown");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove("is-shown");
    }, 2600);
  }

  /* ---------------- SSO buttons (demo stand-ins) ---------------- */

  ["ssoGoogle", "ssoGithub", "ssoMicrosoft"].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function () {
      const provider = btn.textContent.trim();
      showToast(provider + " sign-in isn't wired up in this preview.");
    });
  });

  /* ---------------- subtle parallax on the glimpse cards ---------------- */

  const glimpse = document.querySelector(".glimpse");
  const board = document.querySelector(".mini-board");

  if (glimpse && board && window.matchMedia("(min-width: 960px)").matches) {
    glimpse.addEventListener("mousemove", function (e) {
      const rect = glimpse.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      board.style.transform = "translate(" + (x * 10).toFixed(1) + "px, " + (y * 10).toFixed(1) + "px)";
    });
    glimpse.addEventListener("mouseleave", function () {
      board.style.transform = "translate(0, 0)";
    });
  }
})();