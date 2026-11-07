const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
let authenticatedAdmin = null;
const pageNames = { overview: "Overview", points: "Important points", users: "Administrators", debug: "Debug", admins: "Access control", settings: "Settings" };
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
  "Administrators": "Administratori",
  "Access control": "Control acces",
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
  "This field is required.": "Acest câmp este obligatoriu.", "Use at least {min} characters.": "Folosește cel puțin {min} caractere.",
  "Generate link": "Generează link",
  "Capture link": "Link de captură",
  "Open this on a phone to record a location without signing in.": "Deschide acest link pe telefon pentru a înregistra o locație fără autentificare.",
  "Copy link": "Copiază linkul",
  "Share": "Distribuie",
  "Done": "Gata",
  "Record location": "Înregistrează locația",
  "Take photo": "Fă o fotografie",
  "Capture link copied.": "Linkul de captură a fost copiat.",
  "Copy the selected link.": "Copiază linkul selectat.",
  "Position recorded.": "Poziția a fost înregistrată.",
  "On this phone": "Pe acest telefon",
  "Photo ready — it uploads when you save.": "Fotografia este pregătită — se încarcă la salvare.",
  "The photo could not be uploaded.": "Fotografia nu a putut fi încărcată.",
  "Valid until": "Valabil până la",
  "Reusable during that time.": "Reutilizabil în acest interval.",
  "Localhost was swapped for this machine's network address so a phone can open the link. Set PUBLIC_ORIGIN to use a different address.": "Localhost a fost înlocuit cu adresa de rețea a acestui computer, ca telefonul să poată deschide linkul. Setează PUBLIC_ORIGIN pentru altă adresă."
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
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute("content", currentTheme === "night" ? "#100e16" : "#251b35");
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
  updateTopbarDate();
  if (authenticatedAdmin) updateAccountChrome();
  showPage(currentPage, false);
}

function setAuthenticated(isAuthenticated, admin = null) {
  authenticatedAdmin = isAuthenticated ? admin : null;
  const isSuperadmin = String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin";
  document.querySelectorAll(".superadmin-only").forEach((element) => {
    element.hidden = !isSuperadmin;
    element.classList.toggle("is-hidden", !isSuperadmin);
  });
  if (!isAuthenticated) {
    document.getElementById("admins-list").replaceChildren();
    document.getElementById("location-modal")?.classList.add("is-hidden");
    document.getElementById("image-modal")?.classList.add("is-hidden");
    document.getElementById("users-admins-list")?.replaceChildren();
    document.getElementById("invites-list")?.replaceChildren();
    document.getElementById("live-grid")?.replaceChildren();
    cachedLocations = [];
    ["stat-admins-total", "stat-admins-active", "stat-admins-inactive", "stat-admins-super"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "—";
    });
    resetAdminForm();
    if (typeof resetLocationForm === "function") resetLocationForm();
    myAccounts = [];
    renderAccountMenu();
    closeMenus();
    addingAccount = false;
    document.getElementById("login-back-button")?.classList.add("is-hidden");
  }
  loginView.classList.toggle("is-hidden", isAuthenticated);
  appView.classList.toggle("is-hidden", !isAuthenticated);
  if (isAuthenticated) sessionStorage.setItem("aradlens-admin-auth", "true");
  else sessionStorage.removeItem("aradlens-admin-auth");
  if (isAuthenticated) {
    loginError.textContent = "";
    updateAccountChrome();
    refreshAccounts();
  }
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
  if ((page === "admins" || page === "users") && authenticatedAdmin) loadAdmins();
  if (page === "admins" && authenticatedAdmin) loadInvites();
  if (page === "points") loadLocations();
  if (page === "overview") loadOverview();
  if (page === "debug") runDebugHealth();
  if (updateUrl) history.replaceState(null, "", `#${page}`);
}

function updateTopbarDate() {
  const element = document.querySelector(".topbar-date");
  if (!element) return;
  try {
    element.textContent = new Date().toLocaleDateString(currentLanguage === "ro" ? "ro-RO" : "en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  } catch {
    element.textContent = new Date().toDateString();
  }
}

function bindPageActions() {
  updateTopbarDate();
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

const registerForm = document.getElementById("register-form");
function showAuthTab(tab) {
  const isRegister = tab === "register";
  loginForm.classList.toggle("is-hidden", isRegister);
  registerForm?.classList.toggle("is-hidden", !isRegister);
  document.getElementById("auth-tab-login")?.setAttribute("aria-selected", String(!isRegister));
  document.getElementById("auth-tab-register")?.setAttribute("aria-selected", String(isRegister));
}
document.getElementById("auth-tab-login")?.addEventListener("click", () => showAuthTab("login"));
document.getElementById("auth-tab-register")?.addEventListener("click", () => showAuthTab("register"));

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

async function signOutCurrent() {
  closeMenus();
  if (!window.confirm(t("Sign out of AradLens?"))) return;
  let active = null;
  try {
    const result = await apiRequest("/api/auth/logout", { method: "POST" });
    active = result && typeof result.active === "string" ? result.active : null;
  } catch {}
  if (active) {
    try {
    const admin = await apiRequest("/api/auth/me");
    addingAccount = false;
    document.getElementById("login-back-button")?.classList.add("is-hidden");
    setAuthenticated(true, admin);
      showToast(`Signed out. Switched to ${admin.username}.`);
      return;
    } catch {}
  }
  setAuthenticated(false);
  loginForm.reset();
  document.getElementById("register-form")?.reset();
  showAuthTab("login");
}

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
  if (event.key === "Escape") {
    closeMobileNavigation();
    closeMenus();
    if (!document.getElementById("image-modal")?.classList.contains("is-hidden")) closeImageModal();
    else if (!document.getElementById("location-modal")?.classList.contains("is-hidden")) closeLocationModal();
    else if (!document.getElementById("capture-modal")?.classList.contains("is-hidden")) closeCaptureModal();
  }
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
  errorMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  const label = submitButton.firstChild && submitButton.firstChild.textContent !== undefined ? submitButton.firstChild : submitButton;
  const priorLabel = label.textContent;
  label.textContent = t("Changing password…");
  try {
    const values = new FormData(form);
    if (!values.get("confirm_password")) throw new Error("New passwords do not match.");
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
    label.textContent = priorLabel && String(priorLabel).includes("…") ? t("Change password") : (priorLabel || t("Change password"));
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

function stableValue(element, attribute, fallback = "") {
  return element?.dataset[attribute] || fallback;
}

let pickerMap = null;
let pickerMarker = null;
let pickerPlacesLayer = null;
let cachedLocations = [];

function pickerHomeBounds() {
  const bounds = [];
  for (const location of cachedLocations) {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) bounds.push([latitude, longitude]);
  }
  return bounds;
}

function renderPickerPlaces(exceptId) {
  if (!pickerMap || typeof window.L === "undefined") return;
  if (!pickerPlacesLayer) pickerPlacesLayer = window.L.layerGroup().addTo(pickerMap);
  pickerPlacesLayer.clearLayers();
  for (const location of cachedLocations) {
    if (String(location.id) === String(exceptId)) continue;
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    window.L.circleMarker([latitude, longitude], { radius: 5, weight: 2, fillOpacity: 0.7 })
      .bindTooltip(String(location.name || `#${location.id}`))
      .addTo(pickerPlacesLayer);
  }
}

function ensurePickerMap() {
  if (pickerMap || typeof window.L === "undefined") return pickerMap;
  const element = document.getElementById("location-picker-map");
  if (!element) return null;
  pickerMap = window.L.map(element).setView([46.166, 21.316], 13);
  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(pickerMap);
  pickerMap.on("click", (event) => setPickerPoint(event.latlng.lat, event.latlng.lng));
  return pickerMap;
}

function setPickerPoint(lat, lng) {
  const form = document.getElementById("location-form");
  if (!form || !pickerMap) return;
  const latitude = String(Math.round(Number(lat) * 1e6) / 1e6);
  const longitude = String(Math.round(Number(lng) * 1e6) / 1e6);
  form.elements.latitude.value = latitude;
  form.elements.longitude.value = longitude;
  const label = document.getElementById("location-coords-label");
  if (label) label.textContent = `Selected: ${latitude}, ${longitude} — click elsewhere or drag the pin to move it.`;
  if (pickerMarker) pickerMarker.setLatLng([latitude, longitude]);
  else {
    pickerMarker = window.L.marker([latitude, longitude], { draggable: true }).addTo(pickerMap);
    pickerMarker.on("dragend", () => {
      const point = pickerMarker.getLatLng();
      setPickerPoint(point.lat, point.lng);
    });
  }
  suggestOsmName(Number(latitude), Number(longitude));
}

let osmRequestId = 0;
let osmSuggestion = "";
function osmPlaceName(data) {
  if (!data || !data.name) return "";
  return String(data.name).trim();
}
function osmDescription(data) {
  if (!data) return "";
  const type = String(data.type || "").replace(/_/g, " ").trim();
  const address = data.address || {};
  const road = [address.road, address.house_number].filter(Boolean).join(" ");
  const place = address.suburb || address.neighbourhood || address.city || address.town || address.village || address.municipality || address.county || "";
  const parts = [type && type !== "yes" ? type : "", road, place].map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return "";
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
function hideOsmSuggestion() {
  osmSuggestion = "";
  document.getElementById("osm-suggest")?.setAttribute("hidden", "");
}
function suggestOsmName(lat, lng) {
  const nameInput = document.getElementById("location-form")?.elements.name;
  const box = document.getElementById("osm-suggest");
  const label = document.getElementById("osm-suggest-text");
  hideOsmSuggestion();
  if (!nameInput || !box || !label || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
  const requestId = ++osmRequestId;
  window.fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, { headers: { Accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (requestId !== osmRequestId) return;
      const suggestion = osmPlaceName(data).trim();
      if (suggestion) {
        const current = nameInput.value.trim();
        if (!current) nameInput.value = suggestion;
        else if (current.toLocaleLowerCase() !== suggestion.toLocaleLowerCase()) {
          osmSuggestion = suggestion;
          label.textContent = `OpenStreetMap calls this “${suggestion}”.`;
          box.removeAttribute("hidden");
        }
      }
      const descriptionInput = document.getElementById("location-form")?.elements.description;
      if (descriptionInput && !descriptionInput.value.trim()) {
        const generated = osmDescription(data);
        if (generated) descriptionInput.value = generated;
      }
    })
    .catch(() => {});
}

function clearPickerPoint() {
  osmRequestId++;
  hideOsmSuggestion();
  if (pickerMarker && pickerMap) pickerMap.removeLayer(pickerMarker);
  pickerMarker = null;
  const label = document.getElementById("location-coords-label");
  if (label) label.textContent = "No point selected — click the map to place it.";
}

function filterLiveCards() {
  const query = document.getElementById("points-search")?.value.trim().toLocaleLowerCase() || "";
  const status = document.getElementById("points-status")?.value || "all";
  document.querySelectorAll("#live-grid .point-card").forEach((card) => {
    const matchesQuery = !query || card.textContent.toLocaleLowerCase().includes(query);
    const hasPhoto = card.dataset.hasPhoto === "true";
    const hasText = card.dataset.hasText === "true";
    let matchesStatus = true;
    if (status === "missing-photo") matchesStatus = !hasPhoto;
    else if (status === "missing-text") matchesStatus = !hasText;
    else if (status === "complete") matchesStatus = hasPhoto && hasText;
    card.hidden = !(matchesQuery && matchesStatus);
  });
}
function setPointsView(view) {
  const grid = document.getElementById("live-grid");
  if (!grid) return;
  grid.classList.toggle("list-view", view === "list");
  document.getElementById("points-view-list")?.setAttribute("aria-pressed", String(view === "list"));
  document.getElementById("points-view-grid")?.setAttribute("aria-pressed", String(view === "grid"));
}
document.getElementById("points-status")?.addEventListener("change", filterLiveCards);
document.getElementById("points-view-list")?.addEventListener("click", () => setPointsView("list"));
document.getElementById("points-view-grid")?.addEventListener("click", () => setPointsView("grid"));
document.getElementById("users-status")?.addEventListener("change", (event) => {
  document.querySelectorAll(".user-row:not(.user-head)").forEach((row) => {
    row.hidden = event.target.value !== "all" && stableValue(row.querySelector(".status-tag"), "value") !== event.target.value;
  });
});
document.getElementById("points-search")?.addEventListener("input", filterLiveCards);
filterRows("users-search", ".user-row:not(.user-head)", [".user-cell", ".user-email", ".status-tag"]);
filterRows("activity-search", "#page-activity .activity-row", [".activity-change", ".user-cell"]);

if (sessionStorage.getItem("aradlens-admin-auth") === "true") {
  apiRequest("/api/auth/accounts").then((data) => {
    myAccounts = Array.isArray(data.accounts) ? data.accounts : [];
    renderAccountMenu();
    return apiRequest("/api/auth/me");
  }).then((admin) => setAuthenticated(true, admin)).catch(() => setAuthenticated(false));
}
document.getElementById("page-admins")?.append(document.getElementById("invites-panel"));

let adminsRequestId = 0;
let cachedAdmins = [];
async function loadAdmins() {
  if (!authenticatedAdmin) return;
  const requestId = ++adminsRequestId;
  const message = document.getElementById("admins-message");
  const list = document.getElementById("admins-list");
  const usersMessage = document.getElementById("users-admins-message");
  const usersList = document.getElementById("users-admins-list");
  if (message) { setMessage(message, "Loading administrators…"); message.setAttribute("role", "status"); }
  if (usersMessage) { setMessage(usersMessage, "Loading administrators…"); usersMessage.setAttribute("role", "status"); }
  list?.replaceChildren();
  usersList?.replaceChildren();
  try {
    const admins = await apiRequest("/api/admins");
    if (requestId !== adminsRequestId) return;
    if (!Array.isArray(admins)) throw new Error("The API returned an invalid administrator list.");
    cachedAdmins = admins;
    const activeCount = admins.filter((admin) => admin.is_active).length;
    const superCount = admins.filter((admin) => String(admin.role || "").toLowerCase() === "superadmin").length;
    const setStat = (id, value) => { const element = document.getElementById(id); if (element) element.textContent = String(value); };
    setStat("stat-admins-total", admins.length);
    setStat("stat-admins-active", activeCount);
    setStat("stat-admins-inactive", admins.length - activeCount);
    setStat("stat-admins-super", superCount);
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
              if (String(authenticatedAdmin?.username || "").toLowerCase() === String(admin.username || "").toLowerCase()) {
                showToast("You cannot delete your own administrator account.");
                return;
              }
              if (!window.confirm(`Delete administrator ${admin.username}? This cannot be undone.`)) return;
              await apiRequest(`/api/admins/${admin.id}`, { method: "DELETE" });
              resetAdminForm();
              await loadAdmins();
              showToast(`Administrator ${admin.username} deleted.`);
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
              document.getElementById("admin-form-title").textContent = `Edit administrator ${record.username}`;
              setAdminEditState(record.username);
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
      email.className = "user-email";
      email.textContent = admin.email;
      const role = document.createElement("span");
      role.textContent = admin.role;
      const status = document.createElement("span");
      status.className = `status-tag ${admin.is_active ? "status-live" : "status-muted"}`;
      status.dataset.value = admin.is_active ? "Active" : "Inactive";
      status.textContent = admin.is_active ? "Active" : "Inactive";
      userRow.append(userCell, email, role, status);
      usersList?.append(userRow);
    }
    const resultMessage = admins.length ? `${admins.length} administrator(s)` : "No administrators found.";
    if (message) message.textContent = resultMessage;
    if (usersMessage) usersMessage.textContent = resultMessage;
  } catch (error) {
    const resultMessage = `${error.message} Click Refresh to try again.`;
    if (message) message.textContent = resultMessage;
    if (usersMessage) usersMessage.textContent = resultMessage;
  }
}

function setAdminEditState(username) {
  const state = document.getElementById("admin-edit-state");
  if (!state) return;
  if (!username) {
    state.hidden = true;
    state.textContent = "";
    return;
  }
  state.hidden = false;
  state.textContent = `Editing administrator ${username} — Save to apply, Cancel to discard. Username cannot be changed.`;
}

function resetAdminForm() {
  const form = document.getElementById("admin-form");
  form.reset();
  form.elements.id.value = "";
  form.elements.username.disabled = false;
  form.elements.password.required = true;
  document.getElementById("admin-form-title").textContent = "Create administrator";
  document.getElementById("admin-form-error").textContent = "";
  setAdminEditState(null);
}

document.getElementById("admins-refresh").addEventListener("click", loadAdmins);
document.getElementById("admins-back")?.addEventListener("click", () => showPage("users"));
document.getElementById("users-refresh")?.addEventListener("click", loadAdmins);
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

let invitesRequestId = 0;
async function loadInvites() {
  const message = document.getElementById("invites-message");
  const list = document.getElementById("invites-list");
  if (!message || !list) return;
  const requestId = ++invitesRequestId;
  setMessage(message, "Loading invites…");
  message.setAttribute("role", "status");
  list.replaceChildren();
  try {
    const invites = await apiRequest("/api/invites");
    if (requestId !== invitesRequestId) return;
    if (!Array.isArray(invites)) throw new Error("The API returned an invalid invite list.");
    for (const invite of invites) {
      const row = document.createElement("div");
      row.className = "setting-row admin-row";
      const details = document.createElement("span");
      const used = invite.used_at ? `used ${invite.used_at}` : "unused";
      const revoked = invite.is_revoked ? " · revoked" : "";
      details.textContent = `#${invite.id} · ${invite.code} · ${invite.role} · expires ${invite.expires_at} · ${used}${revoked}`;
      const copyButton = document.createElement("button");
      copyButton.className = "button button-soft";
      copyButton.type = "button";
      copyButton.textContent = "Copy code";
      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(invite.code);
          showToast("Invite code copied.");
        } catch {
          showToast(invite.code);
        }
      });
      row.append(details, copyButton);
      list.append(row);
    }
    message.textContent = invites.length ? `${invites.length} invite(s)` : "No invites found.";
  } catch (error) {
    message.textContent = `${error.message} Click Refresh to try again.`;
  }
}

function resetLocationForm() {
  const form = document.getElementById("location-form");
  if (!form) return;
  form.reset();
  form.elements.id.value = "";
  const title = document.getElementById("location-modal-title");
  if (title) title.textContent = "Add location";
  document.getElementById("location-form-error").textContent = "";
  pendingLocationPhoto = null;
  setLocationPhotoStatus("");
  updateImagePreview();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function hashString(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash * 31 + text.charCodeAt(i)) >>> 0);
  return hash;
}

const locationKinds = [
  { drawings: ["church", "church-2", "chapel", "cathedral", "monastery"], category: "Culture", words: ["church", "cathedral", "catedrala", "biseric", "chapel", "capel", "monastery", "mănăstire", "manastire", "parish", "parohie", "orthodox", "ortodox", "catholic", "catolic", "mosque", "moschee", "geamie", "synagogue", "sinagog", "prayer", "rugăciune", "rugaciune", "clopotni", "cruce", "saint", "sfânt", "sfant", "sfântul", "sfantul", "maica", "precista", "adormirea", "înălțarea", "inaltarea", "schimbarea", "treime", "duhului"] },
  { drawings: ["theatre", "cinema"], category: "Culture", words: ["theatre", "theater", "teatru", "teatr", "cinema", "movie", "film", "spectacol", "show", "cabaret", "circus", "circ", "circul", "păpuși", "papusi", "marionette"] },
  { drawings: ["museum", "museum-2", "gallery", "library", "observatory"], category: "Culture", words: ["museum", "muzeu", "gallery", "galerie", "exhibition", "expozi", "collection", "colec", "artă", "arta", "filarmonic", "philharmonic", "opera", "concert", "observatory", "observator", "planetarium", "library", "bibliotec"] },
  { drawings: ["castle", "fortress", "ruins", "arch", "monument", "statue"], category: "Culture", words: ["castle", "fortress", "cetate", "cetății", "castel", "bastion", "ruins", "ruine", "ruină", "ruina", "arch", "arc", "arcul", "triumf", "monument", "statue", "statuie", "memorial", "mormânt", "mormant", "eroi", "erou", "heroes", "amphitheater", "amfiteatru", "revoluției", "revolutiei", "istoric", "historic", "heritage", "patrimoniu", "vestigii"] },
  { drawings: ["school", "university", "library"], category: "Culture", words: ["school", "școală", "scoala", "liceu", "colegiu", "gimnaz", "școlar", "scolar", "kindergarten", "grădiniță", "gradinita", "creșă", "cresa", "nursery", "university", "universitate", "facultate", "faculty", "campus", "academy", "academie", "student", "college", "dascăl", "profesor", "teacher", "class", "clasă", "clasa", "educa", "education", "știință", "stiinta", "science center"] },
  { drawings: ["hospital", "clinic", "pharmacy"], category: "Culture", words: ["hospital", "spital", "clinic", "clinică", "clinica", "policlinic", "medical", "sănătate", "sanatate", "health", "doctor", "medic", "stomatolog", "dentist", "dental", "cabinet", "oculist", "optic", "veterinar", "veterinary", "farmacie", "pharmacy", "drugstore", "farmacia", "farmacii", "trauma", "urgență", "urgenta", "salvare", "ambulan"] },
  { drawings: ["cafe", "restaurant", "bar", "pub", "bakery", "pizza", "fastfood", "terrace"], category: "Leisure", words: ["cafe", "cafenea", "coffee", "bistro", "restaurant", "pizzeria", "pizza", "trattoria", "tavern", "cârciumă", "carciuma", "bar", "barul", "pub", "pubul", "berărie", "berarie", "brewery", "terasă", "terasa", "terrace", "bakery", "brutărie", "brutarie", "patiserie", "pastry", "cofetărie", "cofetarie", "confectionery", "gelaterie", "ice cream", "înghețată", "inghetata", "burger", "fast food", "fastfood", "shaorma", "kebab", "mâncare", "mancare", "food", "eat", "dine", "catering", "ceainărie", "ceainarie", "tea house", "vinotecă", "vinoteca", "wine"] },
  { drawings: ["market", "supermarket", "shop", "mall", "kiosk"], category: "Leisure", words: ["market", "piață", "piata", "piața", "marketplace", "bazar", "bazaar", "obor", "oborul", "târg", "targ", "târgul", "targul", "fair", "supermarket", "hypermarket", "grocery", "alimentară", "alimentara", "butcher", "măcelărie", "macelarie", "florărie", "florarie", "flower shop", "shop", "magazin", "store", "mall", "plaza", "galerii comerciale", "kiosk", "chioșc", "chiosc", "tarabă", "taraba", "stall", "antique", "anticariat", "souvenir", "suvenir"] },
  { drawings: ["bookstore", "clothes", "hair", "shop"], category: "Leisure", words: ["bookstore", "librărie", "librarie", "bookshop", "clothes", "haine", "îmbrăcăminte", "imbracaminte", "boutique", "atelier", "croitorie", "tailor", "hair", "frizerie", "coafură", "coafura", "salon", "barber", "cosmetic", "parfum", "jewelry", "bijuterii", "ceasuri", "watches", "optică", "optica", "electronics", "electrocasnice", "furniture", "mobilă", "mobila", "toy", "jucării", "jucarii", "sport shop", "pet shop", "librărie"] },
  { drawings: ["bank", "atm", "post", "office"], category: "Culture", words: ["bank", "bancă", "banca", "bancomat", "atm", "finance", "financiar", "insurance", "asigurări", "asigurari", "post", "poștă", "posta", "courier", "curier", "office", "birou", "sediu", "firmă", "firma", "company", "agenție", "agentie", "agency", "notar", "notary", "avocat", "lawyer", "primăria", "primaria", "primărie", "primarie", "townhall", "city hall", "consiliu", "council", "prefectură", "prefectura", "județean", "judetean", "tribunal", "court", "judecătorie", "judecatorie", "poliție", "politie", "police", "jandarmerie", "pompieri", "fire station", "stație"] },
  { drawings: ["school", "townhall", "court", "police", "fire", "office"], category: "Culture", words: ["guvern", "government", "minister", "ambasadă", "ambasada", "embassy", "primar", "mayor", "tax", "taxe", "impozite"] },
  { drawings: ["hotel", "bed", "camping"], category: "Leisure", words: ["hotel", "motel", "pensiune", "guesthouse", "hostel", "cazare", "accommodation", "apartment", "apartament", "booking", "villa", "vilă", "vila", "cabana", "cabin", "chalet", "han", "hanul", "inn", "popas"] },
  { drawings: ["stadium", "arena", "gym", "tennis", "football", "basketball", "skate", "golf"], category: "Leisure", words: ["stadium", "stadion", "arena", "sport", "fotbal", "football", "soccer", "tenis", "tennis", "baschet", "basketball", "volei", "volleyball", "handbal", "handball", "rugby", "atletism", "athletics", "sală de sport", "sala de sport", "gym", "fitness", "aerobic", "yoga", "dans", "dance", "skate", "golf", "bowling", "biliard", "billiard", "pool hall", "călărie", "calarie", "echita", "hipodrom", "motodrom", "karting", "patinoar", "rink", "piscină"] },
  { drawings: ["aquapark", "pool", "beach", "lake"], category: "Leisure", words: ["aquapark", "acvaparc", "water park", "ștrand", "strand", "piscină", "piscina", "pool", "bazin", "plajă", "plaja", "beach", "scăldat", "scaldat", "swim", "înot", "inot", "saună", "sauna", "spa", "băi", "bai", "terme", "terma", "neptun"] },
  { drawings: ["playground", "swing", "slide", "picnic", "campfire", "camping"], category: "Leisure", words: ["playground", "loc de joacă", "loc de joaca", "children", "copii", "joacă", "joaca", "tobogan", "slide", "leagăn", "leagan", "swing", "carusel", "carousel", "picnic", "grătar", "gratar", "barbecue", "foc de tabără", "foc de tabara", "campfire", "cort", "tent", "camping", "tabără", "tabara"] },
  { drawings: ["river", "stream", "pond", "waterfall", "lake", "fountain"], category: "Nature", words: ["river", "râu", "raul", "râul", "râului", "rau", "mureș", "mures", "criș", "cris", "floodplain", "luncă", "lunca", "deltă", "delta", "stream", "pârâu", "parau", "brook", "creek", "izvor", "spring", "waterfall", "cascadă", "cascada", "lac", "lacul", "lacului", "lake", "pond", "baltă", "balta", "heleșteu", "helesteu", "canal", "dig", "dam", "baraj", "barajul", "fântână", "fantana", "fountain", "arteziană", "arteziana", "cișmea", "cismea", "well", "puț", "put", "pescuit", "fishing", "pescăresc", "insulă", "insula", "island", "mal", "malul", "bank", "shore", "vad", "ford"] },
  { drawings: ["tree", "pine", "forest", "garden", "flower", "leaf", "meadow"], category: "Parks", words: ["park", "parc", "parcul", "parcului", "garden", "grădină", "gradina", "green", "verde", "forest", "pădure", "padure", "copac", "tree", "stejar", "oak", "tei", "linden", "pin", "pine", "brad", "flower", "floare", "flori", "trandafir", "rose", "leaf", "frunză", "frunza", "meadow", "pajiște", "pajiste", "poiană", "poiana", "clearing", "livadă", "livada", "orchard", "seră", "sera", "greenhouse", "botanic", "dendrologic", "arboretum", "zoo", "grădină zoologică", "gradina zoologica"] },
  { drawings: ["mountain", "peak", "hill"], category: "Nature", words: ["mountain", "munte", "peak", "vârf", "varf", "creastă", "creasta", "ridge", "hill", "deal", "dealul", "colină", "colina", "pantă", "panta", "slope", "belvedere", "panoramă", "panorama", "viewpoint", "priveliste", "priveliște", "lookout"] },
  { drawings: ["beach", "island", "lake", "boat", "anchor", "lighthouse"], category: "Leisure", words: ["litoral", "coast", "țărm", "tarm", "nisip", "sand", "dună", "duna", "dune", "port", "harbour", "harbor", "marină", "marina", "doc", "dock", "ponton", "ferry", "bac", "boat", "barcă", "barca", "ship", "navă", "nava", "yacht", "iaht", "canoe", "caiac", "kayak", "anchor", "ancoră", "ancora", "far", "farul", "lighthouse", "tower", "turn", "turnul", "turnului"] },
  { drawings: ["train", "tram", "bus", "taxi", "bike", "airport", "fuel", "tunnel", "bridge"], category: "Culture", words: ["train", "tren", "railway", "cale ferată", "cale ferata", "gară", "gara", "station", "peron", "platform", "tram", "tramvai", "trolley", "troleibuz", "bus", "autobuz", "autogară", "autogara", "microbuz", "maxi-taxi", "taxi", "bike", "bicicletă", "bicicleta", "cycling", "velo", "airport", "aeroport", "avion", "plane", "zbor", "flight", "fuel", "benzinărie", "benzinarie", "petrol", "motorină", "motorina", "gaz", "gas", "spălătorie auto", " spalatorie auto", "service auto", "vulcanizare", "tunnel", "tunel", "pasaj", "pasarelă", "pasarela", "bridge", "pod", "podul", "podului", "poduri", "viaduct", "parcare", "parking", "parcaj"] },
  { drawings: ["parking", "fuel", "taxi"], category: "Culture", words: ["garaj", "garage", "rental", "rent a car", "închirieri", "inchirieri", "școală de șoferi", "scoala de soferi", "driving"] },
  { drawings: ["toilets", "wifi", "info", "viewpoint", "fountain", "well", "greenhouse"], category: "Culture", words: ["toilet", "toaletă", "toaleta", "wc", "baie publică", "baie publica", "wifi", "internet", "info", "informații", "informatii", "tourist info", "infocenter", "centru de informare", "centru de vizitare", "ghid", "guide"] },
  { drawings: ["house", "house-2", "house-3", "house-4", "house-5", "hut"], category: "Culture", words: ["house", "casă", "casa", "home", "locuință", "locuinta", "residence", "rezidență", "rezidenta", "apartament", "bloc", "imobil", "condominium", "duplex", "cottage", "chalet", "conac", "mansion", "palat", "palace", "curte", "courtyard", "domiciliu"] },
];
const defaultLocationKind = { drawings: ["house", "house-2", "house-4", "hut"], category: "Culture" };

const wholeWords = new Set(["arcul", "hanul", "barul", "pubul", "lacul", "farul"]);
function kindMatches(text, word) {
  if (wholeWords.has(word) || word.length <= 4) return text.split(/[^a-zăâîșț0-9]+/u).includes(word);
  return text.includes(word);
}

function locationKind(name, description) {
  const text = `${name || ""} ${description || ""}`.toLocaleLowerCase();
  const entry = locationKinds.find((kind) => kind.words.some((word) => kindMatches(text, word))) || defaultLocationKind;
  const drawings = entry.drawings || [entry.drawing];
  return { drawing: drawings[hashString(text) % drawings.length], category: entry.category };
}

function renderLocationCard(location) {
  const kind = locationKind(location.name, location.description);
  const card = document.createElement("article");
  card.className = "point-card";
  card.dataset.live = "true";
  card.dataset.drawing = kind.drawing;
  card.dataset.hasPhoto = location.image ? "true" : "false";
  card.dataset.hasText = location.description ? "true" : "false";
  card.innerHTML =
    `<div class="point-image"><svg class="point-drawing" viewBox="0 0 120 80" aria-hidden="true"><use href="#draw-${kind.drawing}"></use></svg><span class="point-badge">P</span><span class="point-category" data-value="${kind.category}">${kind.category}</span></div>` +
    `<div class="point-body"><div><h3>${escapeHtml(location.name)}</h3><p>${escapeHtml(location.description || "—")}</p></div><span class="status-tag status-live" data-value="Published">Live</span></div>` +
    `<div class="point-meta"><span>#${location.id} · ${escapeHtml(`${location.latitude}, ${location.longitude}`)}</span></div>`;
  const open = document.createElement("button");
  open.className = "card-open";
  open.type = "button";
  open.textContent = "↗";
  open.setAttribute("aria-label", `Edit ${location.name}`);
  open.addEventListener("click", () => openLocationModal(location.id));
  card.querySelector(".point-meta").append(open);
  return card;
}

let locationsRequestId = 0;
async function loadLocations() {
  const message = document.getElementById("locations-message");
  const grid = document.getElementById("live-grid");
  if (!message || !grid) return;
  const requestId = ++locationsRequestId;
  setMessage(message, "Loading locations…");
  message.setAttribute("role", "status");
  grid.replaceChildren();
  try {
    const locations = await apiRequest("/api/locations");
    if (requestId !== locationsRequestId) return;
    if (!Array.isArray(locations)) throw new Error("The API returned an invalid location list.");
    cachedLocations = locations;
    for (const location of locations) grid.append(renderLocationCard(location));
    filterLiveCards();
    const navCount = document.querySelector('.nav-item[data-page="points"] .nav-count');
    if (navCount) navCount.textContent = String(locations.length);
    message.textContent = locations.length ? `${locations.length} location(s)` : "No locations found.";
  } catch (error) {
    message.textContent = `${error.message} Click Refresh to try again.`;
  }
}

let locationModalOpener = null;
function openLocationModal(id) {
  const modal = document.getElementById("location-modal");
  const form = document.getElementById("location-form");
  if (!modal || !form) return;
  locationModalOpener = document.activeElement;
  const errorMessage = document.getElementById("location-form-error");
  errorMessage.textContent = "";
  const deleteButton = document.getElementById("location-delete");
  const showPicker = (latitude, longitude, zoom) => {
    modal.classList.remove("is-hidden");
    document.getElementById("location-name")?.focus();
    window.requestAnimationFrame(() => {
      if (!ensurePickerMap()) {
        errorMessage.textContent = "The map could not be loaded. Check your connection and try again.";
        return;
      }
      pickerMap.invalidateSize();
      renderPickerPlaces(form.elements.id.value);
      const hasPoint = [latitude, longitude].every((value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)));
      if (hasPoint) {
        pickerMap.setView([Number(latitude), Number(longitude)], zoom || 15);
        setPickerPoint(latitude, longitude);
      } else {
        const home = pickerHomeBounds();
        if (home.length) pickerMap.fitBounds(home, { padding: [40, 40] });
        else pickerMap.setView([46.166, 21.316], 13);
        clearPickerPoint();
      }
    });
  };
  if (id == null) {
    form.reset();
    form.elements.id.value = "";
    pendingLocationPhoto = null;
    setLocationPhotoStatus("");
    document.getElementById("location-modal-title").textContent = "Add location";
    if (deleteButton) deleteButton.hidden = true;
    clearPickerPoint();
    showPicker(null, null);
    return;
  }
  const message = document.getElementById("locations-message");
  apiRequest(`/api/locations/${id}`).then((record) => {
    form.elements.id.value = record.id;
    form.elements.name.value = record.name || "";
    form.elements.description.value = record.description || "";
    form.elements.image.value = record.image || "";
    updateImagePreview();
    document.getElementById("location-modal-title").textContent = `Edit location #${record.id}`;
    if (deleteButton) deleteButton.hidden = false;
    clearPickerPoint();
    showPicker(record.latitude, record.longitude);
  }).catch((error) => { if (message) message.textContent = error.message; });
}

function closeLocationModal() {
  document.getElementById("location-modal")?.classList.add("is-hidden");
  if (locationModalOpener && document.contains(locationModalOpener)) locationModalOpener.focus();
  locationModalOpener = null;
}

document.getElementById("invites-refresh")?.addEventListener("click", loadInvites);
document.getElementById("locations-refresh")?.addEventListener("click", loadLocations);
document.getElementById("locations-add-button")?.addEventListener("click", () => {
  showPage("points");
  openLocationModal(null);
});
document.getElementById("osm-suggest-apply")?.addEventListener("click", () => {
  const form = document.getElementById("location-form");
  if (form && osmSuggestion) form.elements.name.value = osmSuggestion;
  hideOsmSuggestion();
});

function resolveImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = (document.querySelector('meta[name="aradlens-api-origin"]')?.content || "https://api.aradlens.binarysquad.club").replace(/\/$/, "");
  return path.startsWith("/") ? `${origin}${path}` : `${origin}/${path}`;
}
function updateImagePreview() {
  const form = document.getElementById("location-form");
  const value = form?.elements.image.value || "";
  const box = document.getElementById("location-image-preview");
  const img = document.getElementById("location-image-img");
  const addButton = document.getElementById("location-image-button");
  if (!box || !img) return;
  if (value) {
    img.src = resolveImageUrl(value);
    box.hidden = false;
    if (addButton) addButton.textContent = "Change image";
  } else {
    img.removeAttribute("src");
    box.hidden = true;
    if (addButton) addButton.textContent = "Add image";
  }
}
let pendingLocationPhoto = null;
function setLocationPhotoStatus(text, state = "") {
  const status = document.getElementById("location-photo-status");
  if (!status) return;
  status.textContent = text || "";
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}
const sessionImages = {};
let galleryIndex = 0;
function locationImageList() {
  const form = document.getElementById("location-form");
  const id = form?.elements.id.value || "new";
  const list = [];
  const cover = form?.elements.image.value || "";
  if (cover) list.push(cover);
  for (const path of sessionImages[id] || []) if (!list.includes(path)) list.push(path);
  return list;
}
function refreshImageGallery() {
  const strip = document.getElementById("image-strip");
  const preview = document.getElementById("image-gallery-img");
  const box = document.getElementById("image-gallery-preview");
  const errorMessage = document.getElementById("image-modal-error");
  const list = locationImageList();
  if (galleryIndex >= list.length) galleryIndex = 0;
  if (strip) {
    strip.replaceChildren();
    list.forEach((path, index) => {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.setAttribute("role", "option");
      thumb.setAttribute("aria-selected", String(index === galleryIndex));
      thumb.setAttribute("aria-label", `Show image ${index + 1}`);
      const img = document.createElement("img");
      img.src = resolveImageUrl(path);
      img.alt = "";
      img.loading = "lazy";
      thumb.append(img);
      thumb.addEventListener("click", () => {
        galleryIndex = index;
        refreshImageGallery();
      });
      strip.append(thumb);
    });
  }
  if (preview && box) {
    preview.onload = () => { if (errorMessage) errorMessage.textContent = ""; };
    preview.onerror = () => { if (preview.src && errorMessage) errorMessage.textContent = "An image failed to load. Try again in a moment."; };
    if (list.length) {
      preview.src = resolveImageUrl(list[galleryIndex]);
      box.hidden = false;
    } else {
      preview.removeAttribute("src");
      box.hidden = true;
    }
  }
  updateImagePreview();
}
function openImageModal() {
  const modal = document.getElementById("image-modal");
  if (!modal) return;
  document.getElementById("image-modal-error").textContent = "";
  galleryIndex = 0;
  refreshImageGallery();
  modal.classList.remove("is-hidden");
  document.getElementById("image-file")?.focus();
}
function closeImageModal() {
  document.getElementById("image-modal")?.classList.add("is-hidden");
}
document.getElementById("location-image-button")?.addEventListener("click", openImageModal);
document.getElementById("location-image-clear")?.addEventListener("click", () => {
  const form = document.getElementById("location-form");
  if (form) form.elements.image.value = "";
  updateImagePreview();
});
async function uploadPendingLocationPhoto(locationId) {
  const file = pendingLocationPhoto;
  if (!file || !locationId) return;
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`/api/locations/${locationId}/images`, { method: "POST", body, credentials: "same-origin", headers: { Accept: "application/json" } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    setLocationPhotoStatus(t("The photo could not be uploaded."), "error");
    throw new Error(result.detail || "The photo could not be uploaded.");
  }
  if (result.image) {
    const key = String(locationId);
    sessionImages[key] = [...(sessionImages[key] || []), result.image].filter(Boolean);
  }
  pendingLocationPhoto = null;
  setLocationPhotoStatus("");
}
document.getElementById("location-record")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  const errorMessage = document.getElementById("location-form-error");
  const label = button.textContent;
  if (!navigator.geolocation) {
    errorMessage.textContent = "Location is not available on this device.";
    return;
  }
  errorMessage.textContent = "";
  button.disabled = true;
  button.textContent = "Recording…";
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    if (pickerMap) pickerMap.setView([latitude, longitude], 16);
    setPickerPoint(latitude, longitude);
    showToast("Position recorded.");
    button.disabled = false;
    button.textContent = label;
  }, () => {
    errorMessage.textContent = "Could not record your position. Allow location access and try again.";
    button.disabled = false;
    button.textContent = label;
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});
document.getElementById("location-photo")?.addEventListener("change", (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  pendingLocationPhoto = file;
  setLocationPhotoStatus(t("Photo ready — it uploads when you save."), "ready");
  const preview = document.getElementById("location-image-preview");
  const img = document.getElementById("location-image-img");
  if (preview && img) { img.src = URL.createObjectURL(file); preview.hidden = false; }
  document.getElementById("location-form-error").textContent = "";
  input.value = "";
});
document.getElementById("image-upload")?.addEventListener("click", async (event) => {
  const errorMessage = document.getElementById("image-modal-error");
  const form = document.getElementById("location-form");
  const id = form?.elements.id.value || "";
  const picker = document.getElementById("image-file");
  errorMessage.textContent = "";
  const file = picker?.files?.[0];
  if (!file) {
    errorMessage.textContent = "Choose an image file first.";
    return;
  }
  if (!id) {
    errorMessage.textContent = "Save the location first, then upload files.";
    return;
  }
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`/api/locations/${id}/images`, { method: "POST", body, credentials: "same-origin", headers: { Accept: "application/json" } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.detail || "Upload failed. Try again.");
    if (payload.image) {
      const key = String(id);
      sessionImages[key] = [...(sessionImages[key] || []), payload.image].filter(Boolean);
    }
    picker.value = "";
    refreshImageGallery();
    await loadLocations();
    showToast("Image uploaded.");
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
document.getElementById("image-download-all")?.addEventListener("click", async (event) => {
  const errorMessage = document.getElementById("image-modal-error");
  const id = document.getElementById("location-form")?.elements.id.value || "";
  errorMessage.textContent = "";
  if (!id) {
    errorMessage.textContent = "Save the location first.";
    return;
  }
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const response = await fetch(`/api/locations/${id}/images`, { credentials: "same-origin", headers: { Accept: "application/zip" } });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || "Download failed. Try again.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `location_${id}_images.zip`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
document.getElementById("image-modal-close")?.addEventListener("click", closeImageModal);
document.getElementById("image-modal-cancel")?.addEventListener("click", closeImageModal);
document.querySelector("#image-modal [data-close-image-modal]")?.addEventListener("click", closeImageModal);
function setCaptureLinkError(message) {
  const error = document.getElementById("capture-link-error");
  if (error) error.textContent = message || "";
}
function closeCaptureModal() {
  document.getElementById("capture-modal")?.classList.add("is-hidden");
}
document.getElementById("capture-link-button")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const input = document.getElementById("capture-link-input");
  const expiry = document.getElementById("capture-link-expiry");
  const shareButton = document.getElementById("capture-link-share");
  setCaptureLinkError("");
  button.disabled = true;
  try {
    const result = await apiRequest("/api/capture-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: currentTheme }) });
    if (input) input.value = result.url || "";
    if (expiry) expiry.textContent = result.expires_at ? `${t("Valid until")} ${new Date(result.expires_at).toLocaleString()}. ${t("Reusable during that time.")}` : "";
    const note = document.getElementById("capture-link-note");
    if (note) {
      note.textContent = result.lan ? t("Localhost was swapped for this machine's network address so a phone can open the link. Set PUBLIC_ORIGIN to use a different address.") : "";
      note.hidden = !result.lan;
    }
    if (shareButton) shareButton.hidden = !navigator.share;
    document.getElementById("capture-modal")?.classList.remove("is-hidden");
    input?.select();
  } catch (error) {
    showToast(error.message);
  } finally {
    button.disabled = false;
  }
});
document.getElementById("capture-link-copy")?.addEventListener("click", async () => {
  const input = document.getElementById("capture-link-input");
  const url = input?.value || "";
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    showToast("Capture link copied.");
  } catch {
    input?.select();
    showToast("Copy the selected link.");
  }
});
document.getElementById("capture-link-share")?.addEventListener("click", async () => {
  const url = document.getElementById("capture-link-input")?.value || "";
  if (!url || !navigator.share) return;
  try { await navigator.share({ title: "AradLens — record a location", url }); } catch { /* Share dismissed. */ }
});
document.getElementById("capture-modal-close")?.addEventListener("click", closeCaptureModal);
document.getElementById("capture-modal-done")?.addEventListener("click", closeCaptureModal);
document.querySelector("#capture-modal [data-close-capture-modal]")?.addEventListener("click", closeCaptureModal);
document.getElementById("location-cancel")?.addEventListener("click", closeLocationModal);
document.getElementById("location-modal-close")?.addEventListener("click", closeLocationModal);
document.querySelector("#location-modal [data-close-modal]")?.addEventListener("click", closeLocationModal);
document.getElementById("location-delete")?.addEventListener("click", async (event) => {
  const form = document.getElementById("location-form");
  const id = form.elements.id.value;
  if (!id) return;
  if (!window.confirm(`Delete location #${id}? This cannot be undone.`)) return;
  const button = event.currentTarget;
  const errorMessage = document.getElementById("location-form-error");
  button.disabled = true;
  try {
    await apiRequest(`/api/locations/${id}`, { method: "DELETE" });
    delete sessionImages[id];
    closeLocationModal();
    await loadLocations();
    showToast("Location deleted.");
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
});
document.getElementById("invite-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const errorMessage = document.getElementById("invite-form-error");
  errorMessage.textContent = "";
  button.disabled = true;
  try {
    const payload = { role: form.elements.role.value, expires_in_minutes: Number(form.elements.expires_in_minutes.value) };
    const invite = await apiRequest("/api/invites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    form.reset();
    await loadInvites();
    showToast(`Invite created: ${invite.code}`);
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
});
document.getElementById("register-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const message = document.getElementById("register-form-message");
  message.textContent = "";
  button.disabled = true;
  try {
    const payload = { code: form.elements.code.value, username: form.elements.username.value, email: form.elements.email.value, password: form.elements.password.value };
    const account = await apiRequest("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const createdUsername = account.username || "";
    form.reset();
    showAuthTab("login");
    if (createdUsername) document.getElementById("username").value = createdUsername;
    showToast(`Account created: ${createdUsername || "sign in to continue."}`);
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});
document.getElementById("location-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const errorMessage = document.getElementById("location-form-error");
  const id = form.elements.id.value;
  if (form.elements.latitude.value === "" || form.elements.longitude.value === "") {
    errorMessage.textContent = "Pick a point on the map first.";
    button.disabled = false;
    return;
  }
  const payload = { name: form.elements.name.value, latitude: Number(form.elements.latitude.value), longitude: Number(form.elements.longitude.value) };
  if (form.elements.description.value) payload.description = form.elements.description.value;
  if (form.elements.image.value) payload.image = form.elements.image.value;
  errorMessage.textContent = "";
  button.disabled = true;
  try {
    const saved = await apiRequest(id ? `/api/locations/${id}` : "/api/locations", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!id && saved && saved.id) {
      form.elements.id.value = saved.id;
      document.getElementById("location-modal-title").textContent = `Edit location #${saved.id}`;
      const deleteButton = document.getElementById("location-delete");
      if (deleteButton) deleteButton.hidden = false;
      if (pendingLocationPhoto) {
        try { await uploadPendingLocationPhoto(saved.id); } catch (error) { showToast(error.message); }
      }
      await loadLocations();
      showToast("Location created. Add images or keep editing.");
    } else {
      if (pendingLocationPhoto && id) {
        try { await uploadPendingLocationPhoto(id); } catch (error) { showToast(error.message); }
      }
      resetLocationForm();
      closeLocationModal();
      await loadLocations();
      showToast(id ? "Location updated." : "Location created.");
    }
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
});

function setOverviewStat(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

function renderOverviewQueue(places) {
  const list = document.getElementById("overview-queue");
  const badge = document.getElementById("overview-queue-count");
  if (!list) return;
  list.replaceChildren();
  const items = [];
  const missingPhoto = places.filter((place) => !place.image);
  if (missingPhoto.length) items.push({ marker: "!", markerClass: "marker-yellow", title: `${missingPhoto.length} place(s) missing a photo`, sub: "Could use a little love" });
  const missingDescription = places.filter((place) => !place.description);
  if (missingDescription.length) items.push({ marker: "…", markerClass: "marker-lilac", title: `${missingDescription.length} place(s) missing a description`, sub: "Add details from the Important points page" });
  if (badge) badge.textContent = String(items.length);
  if (!items.length) {
    const calm = document.createElement("div");
    calm.className = "queue-item";
    const copy = document.createElement("span");
    copy.innerHTML = "<strong>All clear</strong><small>Nothing needs attention right now.</small>";
    calm.append(copy);
    list.append(calm);
    return;
  }
  for (const item of items) {
    const button = document.createElement("button");
    button.className = "queue-item";
    button.type = "button";
    const marker = document.createElement("span");
    marker.className = `queue-marker ${item.markerClass}`;
    marker.textContent = item.marker;
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = item.title;
    const sub = document.createElement("small");
    sub.textContent = item.sub;
    copy.append(title, sub);
    const arrow = document.createElement("b");
    arrow.textContent = "›";
    button.append(marker, copy, arrow);
    button.addEventListener("click", () => showPage("points"));
    list.append(button);
  }
}

function renderOverviewLatest(places) {
  const list = document.getElementById("overview-latest-list");
  if (!list) return;
  list.replaceChildren();
  const latest = [...places].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);
  if (!latest.length) {
    const row = document.createElement("div");
    row.className = "activity-row";
    const cell = document.createElement("span");
    cell.textContent = "No locations yet. Add the first one from Important points.";
    row.append(cell, document.createElement("span"), document.createElement("span"), document.createElement("span"));
    list.append(row);
    return;
  }
  for (const place of latest) {
    const row = document.createElement("div");
    row.className = "activity-row";
    const name = document.createElement("span");
    name.className = "activity-change";
    const title = document.createElement("strong");
    title.textContent = place.name;
    name.append(title);
    const coords = document.createElement("span");
    coords.textContent = `${place.latitude}, ${place.longitude}`;
    const id = document.createElement("span");
    id.textContent = `#${place.id}`;
    const go = document.createElement("button");
    go.className = "text-button";
    go.type = "button";
    go.textContent = "↗";
    go.setAttribute("aria-label", `Open ${place.name} in Important points`);
    go.addEventListener("click", () => showPage("points"));
    row.append(name, coords, id, go);
    list.append(row);
  }
}

let overviewRequestId = 0;
async function loadOverview() {
  if (!authenticatedAdmin) return;
  const requestId = ++overviewRequestId;
  await loadLocations().catch(() => {});
  await loadAdmins().catch(() => {});
  if (requestId !== overviewRequestId) return;
  const places = cachedLocations;
  setOverviewStat("stat-points-published", places.length);
  setOverviewStat("stat-admins-overview", cachedAdmins.length);
  setOverviewStat("stat-attention-overview", places.filter((place) => !place.image || !place.description).length);
  const started = performance.now();
  try {
    const health = await apiRequest("/api/health");
    if (requestId !== overviewRequestId) return;
    setOverviewStat("health-api-value", health && health.status === "ok" ? `${Math.round(performance.now() - started)}ms` : "unexpected");
  } catch {
    if (requestId !== overviewRequestId) return;
    setOverviewStat("health-api-value", "unreachable");
  }
  renderOverviewQueue(places);
  renderOverviewLatest(places);
}

let myAccounts = [];
let addingAccount = false;

function accountInitials(username) {
  return (String(username || "").trim().slice(0, 2) || "A").toUpperCase();
}

function updateAccountChrome() {
  const username = authenticatedAdmin?.username || "…";
  const role = authenticatedAdmin?.role || "…";
  const initials = accountInitials(authenticatedAdmin?.username);
  for (const ids of [["account-avatar", "account-username", "account-role"], ["footer-avatar", "footer-username", "footer-role"]]) {
    const avatar = document.getElementById(ids[0]);
    if (avatar) avatar.textContent = initials;
    const name = document.getElementById(ids[1]);
    if (name) name.textContent = username;
    const roleElement = document.getElementById(ids[2]);
    if (roleElement) roleElement.textContent = role;
  }
  const greeting = document.getElementById("greeting-text");
  if (greeting && authenticatedAdmin?.username) {
    const hour = new Date().getHours();
    const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    greeting.textContent = `${part}, ${authenticatedAdmin.username}`;
  }
}

async function refreshAccounts() {
  try {
    const data = await apiRequest("/api/auth/accounts");
    myAccounts = Array.isArray(data.accounts) ? data.accounts : [];
  } catch {
    myAccounts = [];
  }
  renderAccountMenu();
  return myAccounts;
}

function renderAccountMenu() {
  const menu = document.getElementById("account-menu");
  if (!menu) return;
  menu.replaceChildren();
  const label = document.createElement("span");
  label.className = "menu-label";
  label.textContent = "Signed-in accounts";
  menu.append(label);
  const activeName = authenticatedAdmin?.username;
  if (!myAccounts.length) {
    const empty = document.createElement("span");
    empty.className = "menu-label";
    empty.textContent = "No other accounts";
    menu.append(empty);
  }
  for (const account of myAccounts) {
    const item = document.createElement("button");
    item.type = "button";
    item.setAttribute("role", "menuitemradio");
    const isActive = account.username === activeName;
    item.setAttribute("aria-checked", String(isActive));
    const avatar = document.createElement("span");
    avatar.className = "avatar avatar-small";
    avatar.textContent = accountInitials(account.username);
    const name = document.createElement("span");
    name.textContent = account.username;
    item.append(avatar, name);
    if (isActive) {
      const check = document.createElement("span");
      check.className = "menu-check";
      check.textContent = "✓";
      item.append(check);
    }
    item.addEventListener("click", () => {
      if (isActive) closeMenus();
      else switchAccount(account.username);
    });
    menu.append(item);
  }
  const separator = document.createElement("span");
  separator.className = "menu-separator";
  menu.append(separator);
  const add = document.createElement("button");
  add.type = "button";
  add.setAttribute("role", "menuitem");
  add.textContent = "+ Add account";
  add.addEventListener("click", startAddAccount);
  menu.append(add);
}

function toggleMenu(menuId, buttonId) {
  const menu = document.getElementById(menuId);
  const button = document.getElementById(buttonId);
  if (!menu || !button) return;
  const willOpen = menu.classList.contains("is-hidden");
  closeMenus();
  menu.classList.toggle("is-hidden", !willOpen);
  button.setAttribute("aria-expanded", String(willOpen));
}

function closeMenus() {
  for (const ids of [["account-menu", "account-switcher"], ["admin-menu", "admin-menu-button"]]) {
    document.getElementById(ids[0])?.classList.add("is-hidden");
    document.getElementById(ids[1])?.setAttribute("aria-expanded", "false");
  }
}

async function switchAccount(username) {
  closeMenus();
  try {
    await apiRequest("/api/auth/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    const admin = await apiRequest("/api/auth/me");
    setAuthenticated(true, admin);
    showToast(`Switched to ${admin.username}.`);
  } catch (error) {
    showToast(error.message);
  }
}

function startAddAccount() {
  closeMenus();
  addingAccount = true;
  loginForm.reset();
  document.getElementById("register-form")?.reset();
  loginError.textContent = "";
  showAuthTab("login");
  loginView.classList.remove("is-hidden");
  appView.classList.add("is-hidden");
  document.getElementById("login-back-button")?.classList.remove("is-hidden");
  document.getElementById("username")?.focus();
}

document.getElementById("account-switcher")?.addEventListener("click", () => toggleMenu("account-menu", "account-switcher"));
document.getElementById("admin-menu-button")?.addEventListener("click", () => toggleMenu("admin-menu", "admin-menu-button"));
document.getElementById("admin-menu")?.addEventListener("click", (event) => {
  const action = event.target.closest("[data-menu-action]")?.dataset.menuAction;
  if (action === "settings") {
    closeMenus();
    showPage("settings");
  } else if (action === "logout") {
    signOutCurrent();
  }
});
document.getElementById("login-back-button")?.addEventListener("click", async () => {
  addingAccount = false;
  document.getElementById("login-back-button")?.classList.add("is-hidden");
  try {
    const admin = await apiRequest("/api/auth/me");
    setAuthenticated(true, admin);
  } catch {
    setAuthenticated(false);
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest("#account-menu, #account-switcher, #admin-menu, #admin-menu-button")) closeMenus();
});

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.getElementById("users-export-csv")?.addEventListener("click", () => {
  if (!cachedAdmins.length) {
    showToast("No administrator data to export. Refresh the list first.");
    return;
  }
  downloadCsv("administrators.csv", [["username", "email", "role", "is_active"], ...cachedAdmins.map((admin) => [admin.username, admin.email, admin.role, admin.is_active])]);
  showToast(`Exported ${cachedAdmins.length} administrator(s).`);
});

let debugRequestId = 0;
async function runDebugHealth() {
  const title = document.getElementById("debug-banner-title");
  const text = document.getElementById("debug-banner-text");
  if (!title || !text) return;
  const requestId = ++debugRequestId;
  const started = performance.now();
  try {
    const result = await apiRequest("/api/health");
    if (requestId !== debugRequestId) return;
    const ms = Math.round(performance.now() - started);
    if (result && result.status === "ok") {
      title.textContent = `API healthy · ${ms}ms`;
      text.textContent = "Last check completed just now. All core services are responding normally.";
    } else {
      title.textContent = "API returned an unexpected status";
      text.textContent = "The API responded, but not with the expected health payload. Check the backend.";
    }
  } catch (error) {
    if (requestId !== debugRequestId) return;
    title.textContent = "API unreachable";
    text.textContent = `${error.message} Click Run health check to try again.`;
  }
}

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("nav-collapsed", collapsed);
  try {
    window.localStorage.setItem("aradlens-nav", collapsed ? "collapsed" : "open");
  } catch {}
  const button = document.getElementById("sidebar-collapse");
  if (button) {
    button.textContent = collapsed ? "»" : "«";
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
  }
}
document.getElementById("sidebar-collapse")?.addEventListener("click", () => {
  setSidebarCollapsed(!document.body.classList.contains("nav-collapsed"));
});
if (readPreference("localStorage", "aradlens-nav", ["open", "collapsed"], "open") === "collapsed") {
  setSidebarCollapsed(true);
}

const initialPage = window.location.hash.slice(1);
if (pageNames[initialPage]) showPage(initialPage, false);
bindPageActions();
applyLanguage();
window.addEventListener("popstate", () => showPage(window.location.hash.slice(1) || "overview", false));
