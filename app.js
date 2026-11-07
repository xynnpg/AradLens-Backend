const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const pageNames = { overview: "Overview", points: "Important points", users: "Users", debug: "Debug", activity: "Activity log", settings: "Settings" };
const toast = document.getElementById("toast");
let toastTimer;
const apiOptions = { credentials: "same-origin", headers: { Accept: "application/json" } };

async function apiRequest(path, options = {}) {
  const response = await fetch(path, { ...apiOptions, ...options, headers: { ...apiOptions.headers, ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(body.detail) ? body.detail.map((item) => item.msg).join(" ") : body.detail;
    throw new Error(detail || "We couldn't complete that request. Check your connection and try again.");
  }
  return body;
}

function setAuthenticated(isAuthenticated) {
  loginView.classList.toggle("is-hidden", isAuthenticated);
  appView.classList.toggle("is-hidden", !isAuthenticated);
  if (isAuthenticated) sessionStorage.setItem("aradlens-admin-auth", "true");
  else sessionStorage.removeItem("aradlens-admin-auth");
  if (isAuthenticated) loginError.textContent = "";
}

function showPage(page, updateUrl = true) {
  document.querySelectorAll(".page").forEach((section) => section.classList.remove("active-page"));
  const nextPage = document.getElementById(`page-${page}`);
  if (nextPage) nextPage.classList.add("active-page");
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    const active = item.dataset.page === page;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current");
  });
  document.getElementById("breadcrumb-current").textContent = pageNames[page] || "Overview";
  document.querySelector(".sidebar")?.classList.remove("is-open");
  document.querySelector(".sidebar-scrim")?.classList.remove("is-visible");
  document.querySelector(".mobile-menu")?.setAttribute("aria-expanded", "false");
  if (updateUrl) history.replaceState(null, "", `#${page}`);
}

function bindPageActions() {
  document.querySelectorAll("[data-page], [data-page-action]").forEach((element) => {
    element.addEventListener("click", () => showPage(element.dataset.page || element.dataset.pageAction));
  });
  document.querySelectorAll("[data-toast]").forEach((element) => {
    element.addEventListener("click", () => showToast(element.dataset.toast));
  });
}

function showToast(message) {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.querySelector(".toast-message").textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 7000);
}

document.querySelector(".toast-dismiss")?.addEventListener("click", () => toast.classList.remove("is-visible"));

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const form = new FormData(loginForm);
  const submitButton = loginForm.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.firstChild.textContent = "Signing in…";
  try {
    await apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
    setAuthenticated(true);
  } catch (error) {
    loginError.textContent = "We couldn't sign you in. Check your username and password, then try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.firstChild.textContent = "Sign in";
  }
});

document.getElementById("logout-button").addEventListener("click", async () => {
  if (!window.confirm("Sign out of AradLens?")) return;
  await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
  setAuthenticated(false);
  loginForm.reset();
});

const sidebar = document.querySelector(".sidebar");
const sidebarScrim = document.querySelector(".sidebar-scrim");
const mobileMenu = document.querySelector(".mobile-menu");

function closeMobileNavigation() {
  sidebar.classList.remove("is-open");
  sidebarScrim.classList.remove("is-visible");
  mobileMenu.setAttribute("aria-expanded", "false");
}

mobileMenu.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("is-open");
  sidebarScrim.classList.toggle("is-visible", isOpen);
  mobileMenu.setAttribute("aria-expanded", String(isOpen));
});
sidebarScrim.addEventListener("click", closeMobileNavigation);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMobileNavigation();
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
    event.preventDefault();
    showPage("points");
    document.getElementById("points-search")?.focus();
  }
  if (event.key === "?" && document.activeElement?.tagName !== "INPUT") showToast("Shortcuts: / search · g then o overview · g then p points · g then u users · g then d debug");
});

document.getElementById("global-search-button").addEventListener("click", () => {
  showPage("points");
  window.requestAnimationFrame(() => document.getElementById("points-search")?.focus());
});
document.getElementById("notifications-button").addEventListener("click", () => showToast("You’re all caught up. No new notifications."));
document.querySelector("[data-api-health]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.firstChild.textContent = "Checking…";
  try {
    const result = await apiRequest("/api/health");
    showToast(result.status === "ok" ? "AradLens API is healthy." : "The API responded with an unexpected status.");
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  button.firstChild.textContent = "Check API health";
  }
});

document.getElementById("change-password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorMessage = document.getElementById("change-password-error");
  const submitButton = form.querySelector("button[type=submit]");
  if (!window.confirm("Change your password?\n\nYour current session will remain active.")) return;
  errorMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.firstChild.textContent = "Changing password…";
  try {
    const values = new FormData(form);
    if (values.get("new_password") !== values.get("confirm_password")) throw new Error("New passwords do not match.");
    await apiRequest("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_password: values.get("old_password"), new_password: values.get("new_password") }),
    });
    form.reset();
    showToast("Password changed successfully. You'll stay signed in.");
  } catch (error) {
    errorMessage.textContent = error.message === "New passwords do not match." ? error.message : "We couldn't change your password. Check your current password and try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.firstChild.textContent = "Change password";
  }
});

function filterRows(inputId, selector, fields) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const apply = () => {
    const query = input.value.trim().toLocaleLowerCase();
    document.querySelectorAll(selector).forEach((row) => {
      const text = fields.map((field) => row.querySelector(field)?.textContent || "").join(" ").toLocaleLowerCase();
      row.hidden = Boolean(query) && !text.includes(query);
    });
  };
  input.addEventListener("input", apply);
}

function filterPoints() {
  const query = document.getElementById("points-search")?.value.trim().toLocaleLowerCase() || "";
  const category = document.getElementById("points-category")?.value || "all";
  const status = document.getElementById("points-status")?.value || "all";
  document.querySelectorAll(".point-card").forEach((card) => {
    const text = card.textContent.toLocaleLowerCase();
    const matches = (!query || text.includes(query))
      && (category === "all" || card.querySelector(".point-category")?.textContent === category)
      && (status === "all" || card.querySelector(".status-tag")?.textContent === status);
    card.hidden = !matches;
  });
}

document.getElementById("points-search")?.addEventListener("input", filterPoints);
document.getElementById("points-category")?.addEventListener("change", filterPoints);
document.getElementById("points-status")?.addEventListener("change", filterPoints);
document.getElementById("users-status")?.addEventListener("change", (event) => {
  document.querySelectorAll(".user-row:not(.user-head)").forEach((row) => {
    row.hidden = event.target.value !== "all" && row.querySelector(".status-tag")?.textContent !== event.target.value;
  });
});
filterRows("users-search", ".user-row:not(.user-head)", [".user-cell", ".status-tag"]);
filterRows("activity-search", "#page-activity .activity-row", [".activity-change", ".user-cell"]);
document.querySelectorAll(".view-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-toggle").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    document.querySelector(".points-grid")?.classList.toggle("list-view", button.getAttribute("aria-label") === "List view");
  });
});

if (sessionStorage.getItem("aradlens-admin-auth") === "true") {
  apiRequest("/api/auth/me").then(() => setAuthenticated(true)).catch(() => setAuthenticated(false));
}
const initialPage = window.location.hash.slice(1);
if (pageNames[initialPage]) showPage(initialPage, false);
bindPageActions();
window.addEventListener("popstate", () => showPage(window.location.hash.slice(1) || "overview", false));
