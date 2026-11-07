const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
let authenticatedAdmin = null;
const pageNames = { overview: "Overview", points: "Important points", users: "Users", debug: "Debug", activity: "Activity log", admins: "Administrators", settings: "Settings" };
const translations = {
  en: { username: "Username", password: "Password", signIn: "Sign in", loginHint: "Use your AradLens administrator account.", forgotPassword: "Forgot password?", day: "Day", night: "Night", switchDay: "Switch to day theme", switchNight: "Switch to night theme" },
  ro: { username: "Nume de utilizator", password: "Parolă", signIn: "Autentificare", loginHint: "Folosește contul de administrator AradLens.", forgotPassword: "Ai uitat parola?", day: "Zi", night: "Noapte", switchDay: "Schimbă la tema de zi", switchNight: "Schimbă la tema de noapte" },
};
const romanianText = {
  "Arad city guide": "Ghidul orașului Arad", "Admin workspace": "Spațiu de administrare", "Workspace": "Spațiu de lucru", "Monitor": "Monitorizare", Overview: "Prezentare generală", "Important points": "Obiective importante", Users: "Utilizatori", Debug: "Diagnosticare", "Activity log": "Jurnal de activitate", Settings: "Setări", "Sign out": "Deconectare", "Admin workspace": "Spațiu de administrare", "Good morning, Alex": "Bună dimineața, Alex", "Here’s the pulse of your Arad guide today.": "Iată starea ghidului Arad astăzi.", "Add important point": "Adaugă un obiectiv", "Published points": "Obiective publicate", "New users": "Utilizatori noi", "Needs attention": "Necesită atenție", "vs last month": "față de luna trecută", "since yesterday": "din ieri", "Guide health": "Starea ghidului", "Everything your visitors rely on, at a glance.": "Tot ce folosesc vizitatorii, dintr-o privire.", "View debug ↗": "Vezi diagnosticarea ↗", "Looking good": "Totul arată bine", "Last checked 4 min ago": "Verificat acum 4 minute", "Recent activity": "Activitate recentă", "The latest changes across your workspace.": "Cele mai recente modificări din spațiul de lucru.", "View activity ↗": "Vezi activitatea ↗", "Content library": "Biblioteca de conținut", "The places that make Arad worth finding.": "Locurile care merită descoperite în Arad.", "All categories": "Toate categoriile", "All statuses": "Toate stările", "List view": "Vizualizare listă", "Grid view": "Vizualizare grilă", Nature: "Natură", Leisure: "Timp liber", Culture: "Cultură", Parks: "Parcuri", Published: "Publicat", "Needs review": "Necesită verificare", "People using AradLens": "Persoane care folosesc AradLens", "A clear view of who’s discovering the city.": "O imagine clară asupra celor care descoperă orașul.", "Download CSV ↘": "Descarcă CSV ↘", "All users": "Toți utilizatorii", "Active this week": "Activi săptămâna aceasta", "New this month": "Noi luna aceasta", Returning: "Reveniți", Active: "Activ", Inactive: "Inactiv", "Debug & device health": "Diagnosticare și starea dispozitivelor", Monitor: "Monitorizare", "Stay ahead of the small things before they become a bad experience.": "Rezolvă lucrurile mici înainte să devină probleme.", "Run health check ↻": "Verifică starea ↻", "No active incidents": "Nu există incidente active", "All core services are responding normally. Last check completed 4 minutes ago.": "Toate serviciile răspund normal. Ultima verificare a fost acum 4 minute.", "Auto-refreshing": "Actualizare automată", "Device health": "Starea dispozitivelor", "Recent incidents": "Incidente recente", "0 open": "0 deschise", "No crashes or unresolved bugs in the last 24 hours.": "Nu există erori sau probleme nerezolvate în ultimele 24 de ore.", "Activity log": "Jurnal de activitate", "Workspace history": "Istoricul spațiului de lucru", "A readable trail of changes, reviews, and people at work.": "Un istoric clar al modificărilor și verificărilor.", "Export log ↘": "Exportă jurnalul ↘", "All activity": "Toată activitatea", "Showing the latest 50 changes.": "Sunt afișate ultimele 50 de modificări.", "Workspace preferences": "Preferințele spațiului de lucru", "Keep your admin workspace tuned to the way you work.": "Configurează spațiul de lucru după modul tău de lucru.", "Save changes": "Salvează modificările", Notifications: "Notificări", "Choose which updates deserve your attention.": "Alege actualizările care necesită atenția ta.", "Incident alerts": "Alerte de incidente", "Editorial reminders": "Mementouri editoriale", "Weekly activity digest": "Rezumat săptămânal de activitate", "Account security": "Securitatea contului", "Current password": "Parola actuală", "New password": "Parolă nouă", "Change password": "Schimbă parola", "Password recovery will be available when account recovery is connected.": "Recuperarea parolei va fi disponibilă după conectarea serviciului.", "Workspace switching will be available when multiple guides are connected.": "Schimbarea spațiului va fi disponibilă când sunt conectate mai multe ghiduri.", "Search points": "Caută obiective", Notifications: "Notificări", "AradLens API is healthy.": "API-ul AradLens funcționează corect.", "The API responded with an unexpected status.": "API-ul a răspuns cu o stare neașteptată.", "Check your connection and try again.": "Verifică conexiunea și încearcă din nou.", "Checking…": "Se verifică…", "Signing in…": "Se autentifică…"
};
const uiTranslations = {
  "AradLens — Admin workspace": "AradLens — Spațiu de administrare",
  "Admin workspace": "Spațiu de administrare",
  "Keep Arad": "Păstrează Aradul",
  "in focus.": "în prim-plan.",
  "Curate the places people love, spot what needs attention, and keep the city guide trustworthy.": "Îngrijește locurile apreciate, identifică ce necesită atenție și menține ghidul orașului de încredere.",
  "Language": "Limbă",
  "Password recovery will be available when account recovery is connected.": "Resetarea parolei va fi disponibilă după conectarea serviciului de recuperare a contului.",
  "Close navigation": "Închide meniul de navigare",
  "Workspace switching will be available when multiple guides are connected.": "Schimbarea spațiului de lucru va fi disponibilă după conectarea mai multor ghiduri.",
  "Arad city guide": "Ghidul orașului Arad",
  "Main navigation": "Navigare principală",
  "Workspace": "Spațiu de lucru",
  "Overview": "Prezentare generală",
  "Important points": "Puncte de interes",
  "Users": "Utilizatori",
  "Monitor": "Monitorizare",
  "All systems operational": "Toate sistemele funcționează normal",
  "Debug": "Diagnosticare",
  "Activity log": "Jurnal de activitate",
  "Settings": "Setări",
  "Sign out": "Deconectare",
  "Administrator": "Administrator",
  "Open navigation": "Deschide meniul de navigare",
  "Breadcrumb": "Traseu de navigare",
  "Search points": "Caută puncte de interes",
  "Notifications": "Notificări",
  "Tue, 14 May 2024": "Marți, 14 mai 2024",
  "Tuesday, 14 May 2024": "Marți, 14 mai 2024",
  "Good morning, Alex": "Bună dimineața, Alex",
  "Here’s the pulse of your Arad guide today.": "Iată situația de astăzi a ghidului tău pentru Arad.",
  "+ Add important point": "+ Adaugă punct de interes",
  "Workspace summary": "Rezumatul spațiului de lucru",
  "Published points": "Puncte publicate",
  "vs last month": "față de luna trecută",
  "New users": "Utilizatori noi",
  "Needs attention": "Necesită atenție",
  "since yesterday": "față de ieri",
  "Guide health": "Starea ghidului",
  "Everything your visitors rely on, at a glance.": "Tot ce contează pentru vizitatori, dintr-o privire.",
  "View debug ↗": "Vezi diagnosticarea ↗",
  "Looking good": "Totul este în regulă",
  "Last checked 4 min ago": "Ultima verificare: acum 4 minute",
  "API response": "Răspuns API",
  "App crashes": "Blocări ale aplicației",
  "0 today": "0 astăzi",
  "Slow screens": "Ecrane cu încărcare lentă",
  "Guide health over the past seven days": "Starea ghidului în ultimele șapte zile",
  "08 May": "08 mai", "09 May": "09 mai", "10 May": "10 mai", "11 May": "11 mai", "12 May": "12 mai", "13 May": "13 mai",
  "Today": "Astăzi",
  "Editorial queue": "Sarcini editoriale",
  "Small actions that keep the guide fresh.": "Acțiuni simple care mențin ghidul actualizat.",
  "More editorial options": "Mai multe opțiuni editoriale",
  "Use the queue items to jump directly to the work.": "Selectează o sarcină pentru a începe lucrul direct.",
  "3 points need review": "3 puncte necesită verificare",
  "Updated by a contributor": "Actualizate de un colaborator",
  "1 place is missing a photo": "Un loc nu are fotografie",
  "Could use a little love": "Merită puțină atenție",
  "12 new users this week": "12 utilizatori noi săptămâna aceasta",
  "See who’s discovering Arad": "Vezi cine descoperă Aradul",
  "Review all tasks": "Verifică toate sarcinile",
  "Recent activity": "Activitate recentă",
  "The latest changes across your workspace.": "Cele mai recente modificări din spațiul de lucru.",
  "View activity ↗": "Vezi activitatea ↗",
  "Change": "Modificare", "By": "Autor", "When": "Când",
  "Added “Mureș Floodplain”": "A adăugat „Mureș Floodplain”",
  "Updated “Neptun Beach” details": "A actualizat detaliile pentru „Neptun Beach”",
  "Flagged a duplicate listing": "A semnalat o înregistrare duplicată",
  "14 min ago": "acum 14 minute", "1 hour ago": "acum o oră", "3 hours ago": "acum 3 ore",
  "Content library": "Bibliotecă de conținut",
  "The places that make Arad worth finding.": "Locurile pentru care merită să descoperi Aradul.",
  "Adding points will be available when the API is connected.": "Adăugarea punctelor de interes va fi disponibilă după conectarea API-ului.",
  "Search points…": "Caută puncte de interes…",
  "Filter by category": "Filtrează după categorie",
  "All categories": "Toate categoriile",
  "Nature": "Natură", "Leisure": "Recreere", "Culture": "Cultură", "Parks": "Parcuri",
  "Filter by status": "Filtrează după stare",
  "All statuses": "Toate stările", "Published": "Publicat", "Needs review": "Necesită verificare",
  "List view": "Vizualizare listă", "Grid view": "Vizualizare grilă",
  "Quiet paths, open skies": "Poteci liniștite, cer deschis",
  "Riverside sun in the city": "Soare pe malul râului, în oraș",
  "Art Nouveau, right downtown": "Art Nouveau în centrul orașului",
  "Green space for slow afternoons": "Spațiu verde pentru după-amiezi liniștite",
  "Updated 14 min ago": "Actualizat acum 14 minute", "Updated 1 hr ago": "Actualizat acum o oră",
  "Updated yesterday": "Actualizat ieri", "Updated 2 days ago": "Actualizat acum 2 zile",
  "People using AradLens": "Oamenii care folosesc AradLens",
  "A clear view of who’s discovering the city.": "O imagine clară a celor care descoperă orașul.",
  "CSV export will be available when the API is connected.": "Exportul CSV va fi disponibil după conectarea API-ului.",
  "Download CSV ↘": "Descarcă CSV ↘",
  "All users": "Toți utilizatorii", "Active this week": "Activi săptămâna aceasta", "New this month": "Noi luna aceasta", "Returning": "Reveniți",
  "Search by name or email…": "Caută după nume sau e-mail…", "Filter users by status": "Filtrează utilizatorii după stare",
  "Active": "Activ", "Inactive": "Inactiv", "User": "Utilizator", "Last active": "Ultima activitate", "Saved places": "Locuri salvate", "Status": "Stare",
  "Today, 09:42": "Astăzi, 09:42", "Today, 08:17": "Astăzi, 08:17", "Yesterday": "Ieri", "12 May 2024": "12 mai 2024",
  "18 places": "18 locuri", "7 places": "7 locuri", "24 places": "24 de locuri", "3 places": "3 locuri",
  "Debug & device health": "Diagnosticare și starea dispozitivelor",
  "Stay ahead of the small things before they become a bad experience.": "Rezolvă problemele mici înainte să afecteze experiența utilizatorilor.",
  "Run health check ↻": "Verifică starea serviciilor ↻",
  "No active incidents": "Niciun incident activ",
  "All core services are responding normally. Last check completed 4 minutes ago.": "Toate serviciile principale răspund normal. Ultima verificare s-a încheiat acum 4 minute.",
  "Auto-refreshing": "Actualizare automată",
  "Device health": "Starea dispozitivelor",
  "Last 7 days across supported devices.": "Ultimele 7 zile pe dispozitivele compatibile.",
  "The device report will be available when the API is connected.": "Raportul despre dispozitive va fi disponibil după conectarea API-ului.",
  "View report ↗": "Vezi raportul ↗",
  "1,028 active devices": "1,028 de dispozitive active", "812 active devices": "812 dispozitive active", "426 active devices": "426 de dispozitive active",
  "Recent incidents": "Incidente recente", "Crashes and unusual behavior.": "Blocări și comportament neobișnuit.", "0 open": "0 deschise",
  "Quiet skies": "Totul este liniștit", "No crashes or unresolved bugs in the last 24 hours.": "Nicio blocare sau eroare nerezolvată în ultimele 24 de ore.",
  "There are no incidents in the current prototype data.": "Datele actuale ale prototipului nu conțin incidente.",
  "Browse incident history ↗": "Vezi istoricul incidentelor ↗",
  "Workspace history": "Istoricul spațiului de lucru",
  "A readable trail of changes, reviews, and people at work.": "Un istoric clar al modificărilor, verificărilor și contribuțiilor.",
  "Activity export will be available when the API is connected.": "Exportul activității va fi disponibil după conectarea API-ului.",
  "Export log ↘": "Exportă jurnalul ↘", "All activity": "Toată activitatea", "Showing the latest 50 changes.": "Sunt afișate ultimele 50 de modificări.",
  "Filter activity…": "Filtrează activitatea…", "Published “Arad Fortress”": "A publicat „Arad Fortress”",
  "Workspace preferences": "Preferințele spațiului de lucru",
  "Keep your admin workspace tuned to the way you work.": "Adaptează spațiul de administrare la modul tău de lucru.",
  "Settings saved for this prototype session.": "Setările au fost salvate pentru această sesiune a prototipului.", "Save changes": "Salvează modificările",
  "Choose which updates deserve your attention.": "Alege actualizările despre care vrei să fii informat.",
  "Incident alerts": "Alerte de incidente", "Get notified when crashes or API issues appear.": "Primește notificări când apar blocări sau probleme cu API-ul.",
  "Editorial reminders": "Mementouri editoriale", "Receive a daily summary of points awaiting review.": "Primește zilnic un rezumat al punctelor care așteaptă verificarea.",
  "Weekly activity digest": "Rezumat săptămânal al activității", "A short recap of changes across the workspace.": "Un rezumat scurt al modificărilor din spațiul de lucru.",
  "Account security": "Securitatea contului", "Change the password for your authenticated API account.": "Schimbă parola contului cu care te-ai autentificat prin API.",
  "Current password": "Parola actuală", "New password": "Parola nouă", "Use at least 8 characters.": "Folosește cel puțin 8 caractere.", "Change password": "Schimbă parola",
  "Basic details for this admin space.": "Detaliile de bază ale acestui spațiu de administrare.", "Workspace name": "Numele spațiului de lucru", "Timezone": "Fus orar",
  "Dismiss notification": "Închide notificarea",
  "We couldn't complete that request. Check your connection and try again.": "Nu am putut finaliza solicitarea. Verifică conexiunea și încearcă din nou.",
  "Signing in…": "Autentificare în curs…", "Sign in": "Autentificare",
  "We couldn't sign you in. Check your username and password, then try again.": "Nu te-am putut autentifica. Verifică numele de utilizator și parola, apoi încearcă din nou.",
  "Sign out of AradLens?": "Te deconectezi de la AradLens?",
  "Shortcuts: / search · g then o overview · g then p points · g then u users · g then d debug": "Comenzi rapide: / căutare · g apoi o prezentare generală · g apoi p puncte de interes · g apoi u utilizatori · g apoi d diagnosticare",
  "You’re all caught up. No new notifications.": "Ești la zi. Nu ai notificări noi.",
  "Checking…": "Verificare în curs…", "AradLens API is healthy.": "API-ul AradLens funcționează normal.", "The API responded with an unexpected status.": "API-ul a răspuns cu o stare neașteptată.",
  "Check API health": "Verifică starea API-ului",
  "Change your password?\n\nYour current session will remain active.": "Schimbi parola?\n\nSesiunea actuală va rămâne activă.",
  "Changing password…": "Schimbarea parolei în curs…", "New passwords do not match.": "Parolele noi nu coincid.",
  "Password changed successfully. You'll stay signed in.": "Parola a fost schimbată. Vei rămâne autentificat.",
  "We couldn't change your password. Check your current password and try again.": "Nu am putut schimba parola. Verifică parola actuală și încearcă din nou.",
  "This field is required.": "Acest câmp este obligatoriu.", "Use at least {min} characters.": "Folosește cel puțin {min} caractere."
};

function readPreference(storageName, key, allowed, fallback) {
  try {
    const value = window[storageName].getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch { return fallback; }
}

function writePreference(storageName, key, value) {
  try {
    if (value === null) window[storageName].removeItem(key);
    else window[storageName].setItem(key, value);
  } catch { /* Preferences remain usable in memory when storage is blocked. */ }
}

let currentLanguage = readPreference("localStorage", "aradlens-language", ["en", "ro"], "en");
let currentTheme = readPreference("localStorage", "aradlens-theme", ["day", "night"], "day");
let currentPage = "overview";
function t(key) {
  return translations[currentLanguage][key] || (currentLanguage === "ro" ? uiTranslations[key] : key) || key;
}

function setMessage(element, key) {
  element.dataset.messageKey = key;
  element.textContent = key ? t(key) : "";
}

function setButtonCopy(button, key) {
  button.dataset.i18n = key;
  button.textContent = t(key);
}
const toast = document.getElementById("toast");
let toastTimer;
const apiOptions = { credentials: "same-origin", headers: { Accept: "application/json" } };

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { ...apiOptions, ...options, headers: { ...apiOptions.headers, ...(options.headers || {}) } });
  } catch {
    throw new Error("The request could not reach AradLens. Check your connection and try again.");
  }
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && path !== "/api/auth/login") {
    setAuthenticated(false);
    throw new Error("Your session has expired. Sign in again to continue.");
  }
  if (!response.ok) {
    const detail = Array.isArray(body.detail) ? body.detail.map((item) => item.msg).join(" ") : body.detail;
    throw new Error(detail || "We couldn't complete that request. Check your connection and try again.");
  }
  return body;
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  loginView.classList.toggle("theme-night", currentTheme === "night");
  appView.classList.toggle("theme-night", currentTheme === "night");
  document.querySelectorAll("[data-theme-label]").forEach((label) => { label.textContent = translations[currentLanguage][currentTheme]; });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const nextTheme = currentTheme === "day" ? "night" : "day";
    button.setAttribute("aria-label", currentTheme === "day" ? translations[currentLanguage].switchNight : translations[currentLanguage].switchDay);
    button.querySelector(".theme-icon-sun")?.style.setProperty("display", currentTheme === "day" ? "inline" : "none");
    button.querySelector(".theme-icon-moon")?.style.setProperty("display", currentTheme === "night" ? "inline" : "none");
    button.dataset.nextTheme = nextTheme;
  });
}

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
function localizeDom() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
    const source = originalTextNodes.get(node);
    const original = source.trim();
    if (!original || !uiTranslations[original] || node.parentElement?.closest("script,style")) return;
    node.nodeValue = source.replace(original, t(original));
  });
  document.querySelectorAll("[title], [aria-label], input[placeholder]").forEach((element) => ["title", "aria-label", "placeholder"].forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;
    if (!originalAttributes.has(element)) originalAttributes.set(element, {});
    const originals = originalAttributes.get(element);
    if (!originals[attribute]) originals[attribute] = value;
    if (uiTranslations[originals[attribute]]) element.setAttribute(attribute, t(originals[attribute]));
  }));
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  localizeDom();
  document.title = currentLanguage === "ro" ? "AradLens - Spațiu de administrare" : "AradLens - Admin workspace";
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = element.dataset.i18n;
    if (element.matches("input, textarea")) element.placeholder = t(value);
    else if (value) element.textContent = t(value);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((attribute) => element.setAttribute(attribute, t(element.dataset[`i18n${attribute[0].toUpperCase()}${attribute.slice(1)}`])));
  });
  document.querySelectorAll("[data-message-key]").forEach((element) => setMessage(element, element.dataset.messageKey));
  document.querySelectorAll("[data-toast]").forEach((element) => {
    if (!element.dataset.toastKey) element.dataset.toastKey = element.dataset.toast;
    element.dataset.toast = t(element.dataset.toastKey);
  });
  document.querySelectorAll(".language-picker select").forEach((select) => { select.value = currentLanguage; });
  applyTheme();
  showPage(currentPage, false);
}

function setAuthenticated(isAuthenticated, admin = null) {
  authenticatedAdmin = isAuthenticated ? admin : null;
  const isSuperadmin = String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin";
  document.querySelectorAll(".superadmin-only").forEach((element) => {
    element.hidden = !isSuperadmin;
    element.classList.toggle("is-hidden", !isSuperadmin);
  });
  document.getElementById("admin-users-panel").classList.toggle("is-hidden", !isSuperadmin);
  if (!isAuthenticated) {
    document.getElementById("admins-list").replaceChildren();
    document.getElementById("admin-users-list").replaceChildren();
    resetAdminForm();
  }
  loginView.classList.toggle("is-hidden", isAuthenticated);
  appView.classList.toggle("is-hidden", !isAuthenticated);
  if (isAuthenticated) sessionStorage.setItem("aradlens-admin-auth", "true");
  else sessionStorage.removeItem("aradlens-admin-auth");
  if (isAuthenticated) loginError.textContent = "";
  showPage(currentPage, false);
}

function showPage(page, updateUrl = true) {
  currentPage = pageNames[page] && (page !== "admins" || String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin") ? page : "overview";
  page = currentPage;
  document.querySelectorAll(".page").forEach((section) => section.classList.remove("active-page"));
  const nextPage = document.getElementById(`page-${page}`);
  if (nextPage) nextPage.classList.add("active-page");
  document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
    const active = item.dataset.page === page;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page"); else item.removeAttribute("aria-current");
  });
  document.getElementById("breadcrumb-current").textContent = t(pageNames[page] || "Overview");
  document.querySelector(".sidebar")?.classList.remove("is-open");
  document.querySelector(".sidebar-scrim")?.classList.remove("is-visible");
  document.querySelector(".mobile-menu")?.setAttribute("aria-expanded", "false");
  if (["admins", "users"].includes(page) && String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin") loadAdmins();
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
  toast.querySelector(".toast-message").dataset.messageKey = message;
  toast.querySelector(".toast-message").textContent = t(message);
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 7000);
}

document.querySelector(".toast-dismiss")?.addEventListener("click", () => toast.classList.remove("is-visible"));
document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", () => {
  currentTheme = currentTheme === "day" ? "night" : "day";
  writePreference("localStorage", "aradlens-theme", currentTheme);
  applyTheme();
}));
document.querySelectorAll(".language-picker select").forEach((select) => select.addEventListener("change", (event) => {
  currentLanguage = ["en", "ro"].includes(event.target.value) ? event.target.value : "en";
  writePreference("localStorage", "aradlens-language", currentLanguage);
  applyLanguage();
}));

document.getElementById("toggle-login-password").addEventListener("click", (event) => {
  const input = document.getElementById("password");
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  event.currentTarget.textContent = visible ? "Show" : "Hide";
  event.currentTarget.setAttribute("aria-label", visible ? "Show password" : "Hide password");
  event.currentTarget.setAttribute("aria-pressed", String(!visible));
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const form = new FormData(loginForm);
  const submitButton = loginForm.querySelector("button[type=submit]");
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.firstChild.textContent = t("Signing in…");
  try {
    await apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    });
    const admin = await apiRequest("/api/auth/me");
    setAuthenticated(true, admin);
  } catch (error) {
    setMessage(loginError, error.message || "We couldn't sign you in. Check your username and password, then try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.firstChild.textContent = t("Sign in");
  }
});

document.getElementById("logout-button").addEventListener("click", async () => {
  if (!window.confirm(t("Sign out of AradLens?"))) return;
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
  button.firstChild.textContent = t("Checking…");
  try {
    const result = await apiRequest("/api/health");
    showToast(result.status === "ok" ? "AradLens API is healthy." : "The API responded with an unexpected status.");
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  button.firstChild.textContent = t("Check API health");
  }
});

document.getElementById("change-password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorMessage = document.getElementById("change-password-error");
  const submitButton = form.querySelector("button[type=submit]");
  if (!window.confirm(t("Change your password?\n\nYour current session will remain active."))) return;
  errorMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.firstChild.textContent = t("Changing password…");
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
    setMessage(errorMessage, error.message === "New passwords do not match." ? "New passwords do not match." : "We couldn't change your password. Check your current password and try again.");
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.firstChild.textContent = t("Change password");
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

const drawingByCategory = {
  Nature: "tree", Leisure: "lake", Culture: "museum", Parks: "playground",
};

function stableValue(element, attribute, fallback = "") {
  return element?.dataset[attribute] || fallback;
}

function setLocationDrawing(card, drawingId) {
  const drawing = card.querySelector(".point-drawing use");
  if (drawing) drawing.setAttribute("href", `#draw-${drawingId}`);
  card.dataset.drawing = drawingId;
}

function filterPoints() {
  const query = document.getElementById("points-search")?.value.trim().toLocaleLowerCase() || "";
  const category = document.getElementById("points-category")?.value || "all";
  const status = document.getElementById("points-status")?.value || "all";
  document.querySelectorAll(".point-card").forEach((card) => {
    const text = card.textContent.toLocaleLowerCase();
    const matches = (!query || text.includes(query))
      && (category === "all" || stableValue(card.querySelector(".point-category"), "value") === category)
      && (status === "all" || stableValue(card.querySelector(".status-tag"), "value") === status);
    card.hidden = !matches;
    if (matches) {
      const category = stableValue(card.querySelector(".point-category"), "value");
      setLocationDrawing(card, drawingByCategory[category] || "house");
    }
  });
}

document.getElementById("points-search")?.addEventListener("input", filterPoints);
document.getElementById("points-category")?.addEventListener("change", filterPoints);
document.getElementById("points-status")?.addEventListener("change", filterPoints);
document.getElementById("users-status")?.addEventListener("change", (event) => {
  document.querySelectorAll(".user-row:not(.user-head)").forEach((row) => {
    row.hidden = event.target.value !== "all" && stableValue(row.querySelector(".status-tag"), "value") !== event.target.value;
  });
});
filterRows("users-search", ".user-row:not(.user-head)", [".user-cell", ".status-tag"]);
filterRows("activity-search", "#page-activity .activity-row", [".activity-change", ".user-cell"]);
document.querySelectorAll(".view-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".view-toggle").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    document.querySelector(".points-grid")?.classList.toggle("list-view", button.dataset.view === "list");
  });
});

if (sessionStorage.getItem("aradlens-admin-auth") === "true") {
  apiRequest("/api/auth/me").then((admin) => setAuthenticated(true, admin)).catch(() => setAuthenticated(false));
}
document.getElementById("page-users").append(document.getElementById("admin-users-panel"));

let adminsRequestId = 0;
async function loadAdmins() {
  if (String(authenticatedAdmin?.role || "").toLowerCase() !== "superadmin") return;
  const requestId = ++adminsRequestId;
  const message = document.getElementById("admins-message");
  const list = document.getElementById("admins-list");
  const usersMessage = document.getElementById("admin-users-message");
  const usersList = document.getElementById("admin-users-list");
  [message, usersMessage].forEach((element) => { setMessage(element, "Loading administrators…"); element?.setAttribute("role", "status"); });
  list?.replaceChildren();
  usersList?.replaceChildren();
  try {
    const admins = await apiRequest("/api/admins");
    if (requestId !== adminsRequestId) return;
    if (!Array.isArray(admins)) throw new Error("The API returned an invalid administrator list.");
    for (const admin of admins) {
      const row = document.createElement("div");
      row.className = "setting-row admin-row";
      const details = document.createElement("span");
      details.textContent = `${admin.username} · ${admin.email} · ${admin.role} · ${admin.is_active ? "Active" : "Inactive"}`;
      row.append(details);
      for (const action of ["Edit", "Delete"]) {
        const button = document.createElement("button");
        button.className = "button button-soft";
        button.type = "button";
        button.textContent = action;
        button.addEventListener("click", async () => {
          button.disabled = true;
          try {
            if (action === "Delete") {
              if (!window.confirm(`Delete administrator ${admin.username}? This cannot be undone.`)) return;
              await apiRequest(`/api/admins/${admin.id}`, { method: "DELETE" });
              resetAdminForm();
              await loadAdmins();
            } else {
              const record = await apiRequest(`/api/admins/${admin.id}`);
              const form = document.getElementById("admin-form");
              form.elements.id.value = record.id;
              form.elements.username.value = record.username;
              form.elements.username.disabled = true;
              form.elements.email.value = record.email;
              form.elements.role.value = record.role;
              form.elements.is_active.checked = record.is_active;
              form.elements.password.value = "";
              form.elements.password.required = false;
              document.getElementById("admin-form-title").textContent = "Edit administrator";
              showPage("admins");
              form.elements.email.focus();
            }
          } catch (error) { message.textContent = error.message; }
          finally { button.disabled = false; }
        });
        row.append(button);
      }
      list?.append(row);
      const userRow = document.createElement("div");
      userRow.className = "user-row";
      const userCell = document.createElement("span");
      userCell.className = "user-cell";
      const name = document.createElement("strong");
      name.textContent = admin.username;
      userCell.append(name);
      const email = document.createElement("span");
      email.textContent = admin.email;
      const role = document.createElement("span");
      role.textContent = admin.role;
      const status = document.createElement("span");
      status.className = `status-tag ${admin.is_active ? "status-live" : "status-muted"}`;
      status.textContent = admin.is_active ? "Active" : "Inactive";
      const actions = document.createElement("span");
      actions.className = "admin-actions";
      actions.append(row.querySelector("button:first-of-type").cloneNode(true), row.querySelector("button:last-of-type").cloneNode(true));
      actions.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => row.querySelector(`button:nth-of-type(${button.textContent === "Edit" ? 1 : 2})`).click());
      });
      userRow.append(userCell, email, role, status, actions);
      usersList.append(userRow);
    }
    const resultMessage = admins.length ? `${admins.length} administrator(s)` : "No administrators found.";
    message.textContent = resultMessage;
    usersMessage.textContent = resultMessage;
  } catch (error) {
    const resultMessage = `${error.message} Click Refresh to try again.`;
    message.textContent = resultMessage;
    usersMessage.textContent = resultMessage;
  }
}

function resetAdminForm() {
  const form = document.getElementById("admin-form");
  form.reset();
  form.elements.id.value = "";
  form.elements.username.disabled = false;
  form.elements.password.required = true;
  document.getElementById("admin-form-title").textContent = "Create administrator";
  document.getElementById("admin-form-error").textContent = "";
}

document.getElementById("admins-refresh").addEventListener("click", loadAdmins);
document.getElementById("admin-cancel").addEventListener("click", resetAdminForm);
document.getElementById("admin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const errorMessage = document.getElementById("admin-form-error");
  const id = form.elements.id.value;
  const payload = { email: form.elements.email.value, role: form.elements.role.value, is_active: form.elements.is_active.checked };
  if (!id) payload.username = form.elements.username.value;
  if (form.elements.password.value) payload.password = form.elements.password.value;
  errorMessage.textContent = "";
  button.disabled = true;
  try {
    await apiRequest(id ? `/api/admins/${id}` : "/api/admins", { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    resetAdminForm();
    await loadAdmins();
    showToast(id ? "Administrator updated." : "Administrator created.");
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
});

const initialPage = window.location.hash.slice(1);
if (pageNames[initialPage]) showPage(initialPage, false);
bindPageActions();
applyLanguage();
window.addEventListener("popstate", () => showPage(window.location.hash.slice(1) || "overview", false));
