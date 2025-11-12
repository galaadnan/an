// Theme toggle with memory
(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") document.body.classList.add("dark-theme");
})();
function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-theme") ? "dark" : "light"
  );
}

// Stable dropdown (click to open/close, closes on outside click / Esc)
(function initDropdown() {
  const triggers = document.querySelectorAll(".dropdown > a");

  triggers.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const dd = a.parentElement;

      // close others
      document.querySelectorAll(".dropdown.open").forEach((open) => {
        if (open !== dd) open.classList.remove("open");
      });

      dd.classList.toggle("open");
      a.setAttribute("aria-expanded", dd.classList.contains("open"));
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown"))
      document.querySelectorAll(".dropdown.open").forEach((dd) => dd.classList.remove("open"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
      document.querySelectorAll(".dropdown.open").forEach((dd) => dd.classList.remove("open"));
  });
})();


// header shadow on scroll
(function () {
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
