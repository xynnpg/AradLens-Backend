/* Keeps the legal documents inside the same Clay theme as the workspace.
   The saved preference is shared with the app, so opening Privacy from a
   night workspace lands on a night page, and a change here follows back. */
(() => {
  const key = "aradlens-theme";
  const root = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');

  const read = () => {
    try {
      return localStorage.getItem(key) === "night" ? "night" : "day";
    } catch {
      return "day";
    }
  };

  const paint = (theme) => {
    const night = theme === "night";
    root.dataset.theme = night ? "night" : "day";
    if (meta) meta.setAttribute("content", night ? "#0b0b0b" : "#1a1917");
    document.querySelectorAll("[data-legal-theme-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", String(night));
      button.setAttribute("aria-label", night ? "Switch to day theme" : "Switch to night theme");
      const label = button.querySelector("[data-legal-theme-label]");
      if (label) label.textContent = night ? "Day" : "Night";
    });
  };

  paint(root.dataset.theme === "night" ? "night" : read());

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-legal-theme-toggle]");
    if (!button) return;
    const next = root.dataset.theme === "night" ? "day" : "night";
    try {
      localStorage.setItem(key, next);
    } catch {}
    paint(next);
  });

  window.addEventListener("storage", (event) => {
    if (event.key === key) paint(read());
  });
})();
