const loginView = document.getElementById("login-view");
const appView = document.getElementById("app-view");
const errorView = document.getElementById("error-view");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const resetPasswordForm = document.getElementById("reset-password-form");
const passwordResetToken = /\/reset-password\/?$/.test(window.location.pathname)
  ? new URLSearchParams(window.location.search).get("token") || ""
  : "";
let authenticatedAdmin = null;
let globalSearchOpen = false;
let globalSearchQuery = "";
let globalSearchActiveIndex = -1;
let globalSearchItems = [];
let globalSearchReturnFocus = null;
let globalSearchBackground = [];
let globalSearchDataTask = null;
let globalSearchPreviousPaddingRight = "";
let locationPreviewIndex = 0;
document.addEventListener("click", (event) => {
  const addButton = event.target?.closest?.("#locations-add-button, #overview-add-point");
  if (!addButton) return;
  event.preventDefault();
  event.stopPropagation();
  openLocationModal(null);
  showPage("points");
}, true);
const pageNames = { overview: "Overview", points: "Important points", tours: "Tours", attention: "Attention", users: "Administrators", debug: "Debug", admins: "Access control", resets: "Password resets", settings: "Settings" };
const translations = {
  en: { username: "Username", password: "Password", signIn: "Sign in", loginHint: "Use your AradLens administrator account.", forgotPassword: "Forgot password?", day: "Day", night: "Night", switchDay: "Switch to day theme", switchNight: "Switch to night theme" },
  ro: { username: "Nume de utilizator", password: "Parolă", signIn: "Autentificare", loginHint: "Folosește contul de administrator AradLens.", forgotPassword: "Ai uitat parola?", day: "Zi", night: "Noapte", switchDay: "Schimbă la tema de zi", switchNight: "Schimbă la tema de noapte" },
};
const romanianText = {
  "Arad city guide": "Ghidul orașului Arad", "Admin workspace": "Spațiu de administrare", "Workspace": "Spațiu de lucru", "Monitor": "Monitorizare", Overview: "Prezentare generală", "Important points": "Obiective importante", Users: "Utilizatori", Debug: "Diagnosticare", "Activity log": "Jurnal de activitate", Settings: "Setări", "Sign out": "Deconectare", "Admin workspace": "Spațiu de administrare", "Good morning, Alex": "Bună dimineața, Alex", "Here’s the pulse of your Arad guide today.": "Iată starea ghidului Arad astăzi.", "Add important point": "Adaugă un obiectiv", "Published points": "Obiective publicate", "New users": "Utilizatori noi", "Needs attention": "Necesită atenție", "vs last month": "față de luna trecută", "since yesterday": "din ieri", "Guide health": "Starea ghidului", "Everything your visitors rely on, at a glance.": "Tot ce folosesc vizitatorii, dintr-o privire.", "View debug ↗": "Vezi diagnosticarea ↗", "Looking good": "Totul arată bine", "Last checked 4 min ago": "Verificat acum 4 minute", "Recent activity": "Activitate recentă", "The latest changes across your workspace.": "Cele mai recente modificări din spațiul de lucru.", "View activity ↗": "Vezi activitatea ↗", "Content library": "Biblioteca de conținut", "The places that make Arad worth finding.": "Locurile care merită descoperite în Arad.", "All categories": "Toate categoriile", "All statuses": "Toate stările", "List view": "Vizualizare listă", "Grid view": "Vizualizare grilă", Nature: "Natură", Leisure: "Timp liber", Culture: "Cultură", Parks: "Parcuri", Published: "Publicat", "Needs review": "Necesită verificare", "People using AradLens": "Persoane care folosesc AradLens", "A clear view of who’s discovering the city.": "O imagine clară asupra celor care descoperă orașul.", "Download CSV ↘": "Descarcă CSV ↘", "All users": "Toți utilizatorii", "Active this week": "Activi săptămâna aceasta", "New this month": "Noi luna aceasta", Returning: "Reveniți", Active: "Activ", Inactive: "Inactiv", "Debug & device health": "Diagnosticare și starea dispozitivelor", Monitor: "Monitorizare", "Stay ahead of the small things before they become a bad experience.": "Rezolvă lucrurile mici înainte să devină probleme.", "Run health check ↻": "Verifică starea ↻", "No active incidents": "Nu există incidente active", "All core services are responding normally. Last check completed 4 minutes ago.": "Toate serviciile răspund normal. Ultima verificare a fost acum 4 minute.", "Auto-refreshing": "Actualizare automată", "Device health": "Starea dispozitivelor", "Recent incidents": "Incidente recente", "0 open": "0 deschise", "No crashes or unresolved bugs in the last 24 hours.": "Nu există erori sau probleme nerezolvate în ultimele 24 de ore.", "Activity log": "Jurnal de activitate", "Workspace history": "Istoricul spațiului de lucru", "A readable trail of changes, reviews, and people at work.": "Un istoric clar al modificărilor și verificărilor.", "Export log ↘": "Exportă jurnalul ↘", "All activity": "Toată activitatea", "Showing the latest 50 changes.": "Sunt afișate ultimele 50 de modificări.", "Workspace preferences": "Preferințele spațiului de lucru", "Keep your admin workspace tuned to the way you work.": "Configurează spațiul de lucru după modul tău de lucru.", "Save changes": "Salvează modificările", Notifications: "Notificări", "Choose which updates deserve your attention.": "Alege actualizările care necesită atenția ta.", "Incident alerts": "Alerte de incidente", "Editorial reminders": "Mementouri editoriale", "Weekly activity digest": "Rezumat săptămânal de activitate", "Account security": "Securitatea contului", "Current password": "Parola actuală", "New password": "Parolă nouă", "Change password": "Schimbă parola", "Password recovery will be available when account recovery is connected.": "Recuperarea parolei va fi disponibilă după conectarea serviciului.", "Workspace switching will be available when multiple guides are connected.": "Schimbarea spațiului va fi disponibilă când sunt conectate mai multe ghiduri.", "Search points": "Caută obiective", Notifications: "Notificări", "AradLens API is healthy.": "API-ul AradLens funcționează corect.", "The API responded with an unexpected status.": "API-ul a răspuns cu o stare neașteptată.", "Check your connection and try again.": "Verifică conexiunea și încearcă din nou.", "Checking…": "Se verifică…", "Signing in…": "Se autentifică…"
};
const uiTranslations = {
  "Attention": "Atenție",
  "Every problem across your guide, in one place.": "Toate problemele ghidului tău, într-un singur loc.",
  "Nothing needs attention": "Nimic nu necesită atenție",
  "Every point has a photo, a description and a place on the map.": "Fiecare punct are o fotografie, o descriere și o poziție pe hartă.",
  "Refresh": "Reîmprospătează",
  "Fix": "Rezolvă",
  "No photo": "Fără fotografie",
  "Add at least one image": "Adaugă cel puțin o imagine",
  "No description": "Fără descriere",
  "Say what makes it worth visiting": "Spune ce o face merită vizitată",
  "Not on the map": "În afara hărții",
  "Set the real position": "Setează poziția reală",
  "No category": "Fără categorie",
  "Choose where it belongs": "Alege unde se încadrează",
  "AradLens — Admin workspace": "AradLens — Spațiu de administrare",
  "Admin workspace": "Spațiu de administrare",
  "Keep Arad": "Păstrează Aradul",
  "in focus.": "în prim-plan.",
  "Curate the places people love, spot what needs attention, and keep the city guide trustworthy.": "Îngrijește locurile apreciate, identifică ce necesită atenție și menține ghidul orașului de încredere.",
  "Language": "Limbă",
  "Password recovery will be available when account recovery is connected.": "Resetarea parolei va fi disponibilă după conectarea serviciului de recuperare a contului.",
  "Enter the email address of your administrator account and we'll send you a reset link.": "Introdu adresa de email a contului de administrator și îți trimitem un link de resetare.",
  "Email": "Email",
  "Send reset link": "Trimite linkul de resetare",
  "Choose a new password for your administrator account.": "Alege o parolă nouă pentru contul de administrator.",
  "New password": "Parolă nouă",
  "Confirm new password": "Confirmă parola nouă",
  "Reset password": "Resetează parola",
  "Back to sign in": "Înapoi la autentificare",
  "Recover your account": "Recuperează-ți contul",
  "Reset your password": "Resetează-ți parola",
  "If that email exists, a reset link is on its way.": "Dacă emailul există, linkul de resetare este pe drum.",
  "We couldn't send the reset link. Try again.": "Nu am putut trimite linkul de resetare. Încearcă din nou.",
  "The two passwords do not match.": "Cele două parole nu coincid.",
  "This reset link is invalid or has expired.": "Linkul de resetare este invalid sau a expirat.",
  "Your password has been reset. You can sign in now.": "Parola a fost resetată. Te poți autentifica acum.",
  "We couldn't reset your password. Try again.": "Nu am putut reseta parola. Încearcă din nou.",
  "Password resets": "Resetări de parolă",
  "Administrators who asked to reset their password. Generate a link and send it to them.": "Administratorii care au cerut resetarea parolei. Generează un link și trimite-l.",
  "Pending requests": "Cereri în așteptare",
  "No pending requests.": "Nicio cerere în așteptare.",
  "Links are single-use and expire.": "Linkurile sunt de unică folosință și expiră.",
  "Administrator": "Administrator",
  "Requested": "Cerut la",
  "Status": "Stare",
  "Reset link": "Link de resetare",
  "Generate link": "Generează link",
  "Generating…": "Se generează…",
  "Copy": "Copiază",
  "Pending": "În așteptare",
  "Expired": "Expirat",
  "No pending password reset requests.": "Nicio cerere de resetare a parolei în așteptare.",
  "No password reset requests yet.": "Nu există încă cereri de resetare a parolei.",
  "Loading password reset requests…": "Se încarcă cererile de resetare a parolei…",
  "Reset link copied.": "Linkul de resetare a fost copiat.",
  "Could not copy the link.": "Nu am putut copia linkul.",
  "Reset link generated.": "Linkul de resetare a fost generat.",
  "Could not generate the reset link.": "Nu am putut genera linkul de resetare.",
  "pending request": "cerere în așteptare",
  "pending requests": "cereri în așteptare",
  "Close navigation": "Închide meniul de navigare",
  "Workspace switching will be available when multiple guides are connected.": "Schimbarea spațiului de lucru va fi disponibilă după conectarea mai multor ghiduri.",
  "Arad city guide": "Ghidul orașului Arad",
  "Main navigation": "Navigare principală",
  "Workspace": "Spațiu de lucru",
  "Overview": "Prezentare generală",
  "Important points": "Puncte de interes",
  "Tours": "Tururi",
  "Route list": "Lista traseelor",
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
  "Response time": "Timp de răspuns",
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
  "Choose which updates deserve your attention.": "Alege actualizările despre care vrei să fii informat.",
  "Incident alerts": "Alerte de incidente", "Get notified when crashes or API issues appear.": "Primește notificări când apar blocări sau probleme cu API-ul.",
  "Editorial reminders": "Mementouri editoriale", "Receive a daily summary of points awaiting review.": "Primește zilnic un rezumat al punctelor care așteaptă verificarea.",
  "Weekly activity digest": "Rezumat săptămânal al activității", "A short recap of changes across the workspace.": "Un rezumat scurt al modificărilor din spațiul de lucru.",
  "My account": "Contul meu",
  "Update your own username and email. Your current password is required to save.": "Actualizează-ți numele de utilizator și e-mailul. Parola actuală este necesară pentru salvare.",
  "Required to save account changes.": "Necesară pentru a salva modificările contului.",
  "Save account": "Salvează contul",
  "Saving account…": "Se salvează contul…",
  "Account updated.": "Contul a fost actualizat.",
  "Edit access": "Editează accesul",
  "Save access": "Salvează accesul",
  "Select an administrator to edit access.": "Selectează un administrator pentru a-i edita accesul.",
  "Administrator access updated.": "Accesul administratorului a fost actualizat.",
  "Account security": "Securitatea contului",
  "Current password": "Parola actuală", "New password": "Parola nouă", "Use at least 8 characters.": "Folosește cel puțin 8 caractere.", "Change password": "Schimbă parola",
  "Dismiss notification": "Închide notificarea",
  "We couldn't complete that request. Check your connection and try again.": "Nu am putut finaliza solicitarea. Verifică conexiunea și încearcă din nou.",
  "Signing in…": "Autentificare în curs…", "Sign in": "Autentificare",
  "We couldn't sign you in. Check your username and password, then try again.": "Nu te-am putut autentifica. Verifică numele de utilizator și parola, apoi încearcă din nou.",
  "Your session has expired. Sign in again to continue.": "Sesiunea a expirat. Autentifică-te din nou pentru a continua.",
  "Sign out of AradLens?": "Te deconectezi de la AradLens?",
  "Shortcuts: / or Ctrl K search · g then o overview · g then p points · g then u users · g then d debug": "Comenzi rapide: / sau Ctrl K căutare · g apoi o prezentare generală · g apoi p puncte de interes · g apoi u utilizatori · g apoi d diagnosticare",
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
  "Localhost was swapped for this machine's network address so a phone can open the link. Set PUBLIC_ORIGIN to use a different address.": "Localhost a fost înlocuit cu adresa de rețea a acestui computer, ca telefonul să poată deschide linkul. Setează PUBLIC_ORIGIN pentru altă adresă.",
  "Category": "Categorie",
  "Manage categories": "Gestionează categoriile",
  "Categories": "Categorii",
  "Existing categories": "Categorii existente",
  "New category": "Categorie nouă",
  "Category name": "Numele categoriei",
  "Add category": "Adaugă categoria",
  "No categories yet. Add the first one.": "Încă nu există categorii. Adaugă prima.",
  "Give the category a name.": "Dă categoriei un nume.",
  "Rename": "Redenumește",
  "Delete": "Șterge",
  "Save": "Salvează",
  "Cancel": "Anulează",
  "OpenStreetMap suggests": "OpenStreetMap sugerează",
  "Category deleted.": "Categoria a fost ștearsă.",

  /* Access control */
  "Manage access": "Gestionează accesul",
  "Decide who can sign in, what they can do, and when their access ends.": "Decide cine se poate autentifica, ce poate face și când îi expiră accesul.",
  "Every account that can sign in to this guide.": "Fiecare cont care se poate autentifica în acest ghid.",
  "Edit access to change a role or switch an account off.": "Editează accesul ca să schimbi un rol sau să oprești un cont.",
  "Your own row is locked so you cannot lock yourself out.": "Propriul rând este blocat, ca să nu te poți bloca singur.",
  "Role": "Rol",
  "Access": "Acces",
  "Actions": "Acțiuni",
  "Code": "Cod",
  "Expires": "Expiră",
  "expires": "expiră",
  "One code lets one new administrator register.": "Un cod permite unui administrator nou să se înregistreze.",
  "One day is 1440 minutes.": "O zi înseamnă 1440 de minute.",
  "You": "Tu",
  "You cannot change your own access.": "Nu îți poți schimba propriul acces.",
  "You cannot remove your own account.": "Nu îți poți elimina propriul cont.",
  "administrators": "administratori",
  "active accounts": "conturi active",
  "superadmins": "superadmini",
  "Delete administrator": "Elimină administratorul",
  "The account is deleted straight away. It cannot be brought back.": "Contul este șters imediat. Nu poate fi readus.",
  "Delete account": "Elimină contul",
  "Administrator deleted.": "Administrator eliminat.",
  "This cannot be undone.": "Această acțiune nu poate fi anulată.",
  "Copy": "Copiază",
  "Revoke": "Revocă",
  "Revoke invite code": "Revocă codul de invitație",
  "The code stops working straight away. It cannot be brought back.": "Codul nu mai funcționează imediat. Nu poate fi readus.",
  "Revoke code": "Revocă codul",
  "This invite can no longer be revoked.": "Această invitație nu mai poate fi revocată.",
  "Invite revoked.": "Invitație revocată.",
  "invite codes": "coduri de invitație",
  "Invite codes": "Coduri de invitație",
  "+ Add account": "+ Adaugă cont",
  "No other accounts": "Niciun alt cont",
  "Create an invite code": "Creează un cod de invitație",
  "Create invite code": "Creează cod de invitație",
  "Invite created.": "Invitație creată.",
  "New invite code": "Nou cod de invitație",
  "Send it to the new administrator. It works once, until it expires.": "Trimite-l noului administrator. Funcționează o singură dată, până expiră.",
  "Copy a code to hand it over. Revoke one you no longer need.": "Copiază un cod ca să-l predai. Revocă unul de care nu mai ai nevoie.",
  "Unused": "Neutilizat",
  "Used": "Folosit",
  "Revoked": "Revocat",
  "Expired": "Expirat",
  "A superadmin can manage other administrators and invite codes.": "Un superadmin poate gestiona alți administratori și coduri de invitație.",
  "Account is active": "Contul este activ",
  "An inactive account keeps its role but cannot sign in.": "Un cont inactiv își păstrează rolul, dar nu se mai poate autentifica.",

  /* Settings */
  "Your account, your password, and how this workspace looks.": "Contul tău, parola ta și cum arată acest spațiu de lucru.",
  "Password & security": "Parolă și securitate",
  "Change the password you use to sign in to this guide. You stay signed in afterwards.": "Schimbă parola cu care te autentifici în acest ghid. Rămâi autentificat după schimbare.",
  "You stay signed in after the change.": "Rămâi autentificat după schimbare.",
  "Confirm new password": "Confirmă parola nouă",
  "Type it once more so we know it landed.": "Scrie-o încă o dată, ca să știm că a ajuns corect.",
  "Appearance & language": "Aspect și limbă",
  "Kept on this device.": "Păstrate pe acest dispozitiv.",
  "Username": "Nume de utilizator",
  "Email": "E-mail",
  "Theme": "Temă",
  "Day": "Zi",
  "Night": "Noapte",
  "English": "Engleză",
  "Română": "Română",
  "Legal & privacy": "Legal și confidențialitate",
  "Terms, privacy, cookies, content rules and accessibility.": "Termeni, confidențialitate, cookie-uri, reguli de conținut și accesibilitate.",
  "Your data is handled as described in the Privacy Notice. No marketing, analytics or advertising cookies are used.": "Datele tale sunt prelucrate conform Notificării de confidențialitate. Nu se folosesc cookie-uri de marketing, analiză sau publicitate.",
  "Terms version 1.0.": "Versiunea termenilor 1.0.",
  "Terms of Use": "Condiții de utilizare",
  "Privacy Notice": "Notificare de confidențialitate",
  "Cookie Notice": "Notificare cookie-uri",
  "Content Policy": "Politică de conținut",
  "Accessibility": "Accesibilitate",
  /* ---- Everything the workspace can show, in one place ----    The keys below are the English source strings. They cover the    login screen, the rail, every page, every modal, every empty    state and every message a person can be shown. A key that takes    a value uses {braces} so the sentence can be rebuilt in the    other language without losing word order. */
  "Terms": "Termeni",
  "Privacy": "Confidențialitate",
  "Cookies": "Cookie-uri",
  "Content": "Conținut",
  "Show": "Arată",
  "Hide": "Ascunde",
  "Back to workspace": "Înapoi la spațiu de lucru",
  "Create account": "Creează cont",
  "Password": "Parolă",
  "Have an invite code? Create your administrator account.": "Ai un cod de invitație? Creează-ți contul de administrator.",
  "Invite code": "Cod de invitație",
  "I am at least 18 years old and I accept the": "Am cel puțin 18 ani și accept",
  "and the": "și",
  "You must accept the Terms of Use and Privacy Notice to create an account.": "Trebuie să accepți Condițiile de utilizare și Notificarea de confidențialitate pentru a crea un cont.",
  "Live count · locations": "Număr live · locații",
  "Live count · admins": "Număr live · administratori",
  "Live calculation": "Calcul live",
  "Loading editorial queue…": "Se încarcă coada editorială…",
  "Items appear as the guide loads.": "Elementele apar pe măsură ce ghidul se încarcă.",
  "View all": "Vezi tot",
  "Latest locations": "Ultimele locații",
  "The newest places in the guide.": "Cele mai noi locuri din ghid.",
  "View points ↗": "Vezi punctele ↗",
  "Place": "Loc",
  "Coordinates": "Coordonate",
  "ID": "ID",
  "Loading…": "Se încarcă…",
  "Filter points by completeness": "Filtrează punctele după completitudine",
  "All points": "Toate punctele",
  "Missing photo": "Fără fotografie",
  "Missing description": "Fără descriere",
  "Complete": "Complet",
  "Locations": "Locații",
  "Places currently in the guide.": "Locurile disponibile acum în ghid.",
  "Add or update a place in the guide.": "Adaugă sau actualizează un loc în ghid.",
  "Organize the categories visitors browse.": "Organizează categoriile pe care le răsfoiesc vizitatorii.",
  "Chain important points into a guided route for visitors.": "Lansează punctele importante într-un traseu ghidat pentru vizitatori.",
  "Chain important points in the order visitors should walk them.": "Lansează punctele importante în ordinea în care vizitatorii ar trebui să le parcurgă.",
  "+ Add tour": "+ Adaugă tur",
  "Add tour": "Adaugă tur",
  "Available points": "Puncte disponibile",
  "Route": "Traseu",
  "Stops in order": "Opriri în ordine",
  "Click a point to add it, then use the arrows to set the walking order.": "Apasă un punct ca să-l adaugi, apoi folosește săgețile pentru a stabili ordinea de mers.",
  "No stops selected.": "Nicio oprire selectată.",
  "All points are on this tour.": "Toate punctele sunt deja în acest tur.",
  "No important points yet. Add one first.": "Încă nu există puncte importante. Adaugă unul mai întâi.",
  "Give the tour a name.": "Dă turului un nume.",
  "Add at least one important point to the route.": "Adaugă cel puțin un punct important în traseu.",
  "Save tour": "Salvează turul",
  "Delete tour": "Șterge turul",
  "No tours yet.": "Încă nu există tururi.",
  "Add details from the Important points page": "Adaugă detalii din pagina Puncte de interes",
  "The people who manage the Arad guide.": "Oamenii care administrează ghidul Arad.",
  "Export CSV ↘": "Exportă CSV ↘",
  "Total admins": "Total administratori",
  "Superadmins": "Superadmini",
  "Filter admins by status": "Filtrează administratorii după stare",
  "All admins": "Toți administratorii",
  "No administrator data to export. Refresh the list first.": "Nu există date de administratori de exportat. Reîmprospătează mai întâi lista.",
  "No administrators found.": "Nu s-a găsit niciun administrator.",
  "Admin": "Administrator",
  "Superadmin": "Superadmin",
  "Nothing needs attention right now.": "Nimic nu necesită atenție chiar acum.",
  "All clear": "Totul e curat",
  "There are no points yet.": "Încă nu există puncte.",
  "No locations yet. Add the first one from Important points.": "Încă nu există locații. Adaugă prima din Puncte de interes.",
  "Loading the guide…": "Se încarcă ghidul…",
  "Loading locations…": "Se încarcă locațiile…",
  "Loading tours…": "Se încarcă tururile…",
  "Loading administrators…": "Se încarcă administratorii…",
  "Add location": "Adaugă locație",
  "Add photo": "Adaugă fotografie",
  "Manage photos": "Gestionează fotografiile",
  "No photos yet.": "Încă nu există fotografii.",
  "No photos yet. Drop a file below to add one.": "Încă nu există fotografii. Trage un fișier dedesubt pentru a adăuga una.",
  "An image failed to load. Try again in a moment.": "Imaginea nu a putut fi încărcată. Încearcă din nou în câteva momente.",
  "There is no photo to download.": "Nu există nicio fotografie de descărcat.",
  "Show photo {n}": "Arată fotografia {n}",
  "Delete photo {n}": "Șterge fotografia {n}",
  "Previous photo": "Fotografia anterioară",
  "Next photo": "Fotografia următoare",
  "Photo {current} of {total}": "Fotografia {current} din {total}",
  "That is not an image file. Drop a PNG, JPG or WebP.": "Nu este un fișier imagine. Trage un PNG, JPG sau WebP.",
  "Save the location first, then upload files.": "Salvează mai întâi locația, apoi încarcă fișierele.",
  "Save the location first.": "Salvează mai întâi locația.",
  "Give the location a name.": "Dă locației un nume.",
  "Pick a point on the map first.": "Alege mai întâi un punct pe hartă.",
  "No point selected — click the map to place it.": "Niciun punct selectat — apasă pe hartă pentru a-l plasa.",
  "Position on map": "Poziție pe hartă",
  "Use this name": "Folosește acest nume",
  "Name": "Nume",
  "Description": "Descriere",
  "Photos": "Fotografii",
  "Location images": "Imagini locație",
  "Drag images in or browse your files — uploads save right away.": "Trage imagini aici sau caută în fișierele tale — încărcările se salvează imediat.",
  "Drag an image here, or click to browse": "Trage o imagine aici sau apasă pentru a căuta",
  "PNG, JPG or WebP": "PNG, JPG sau WebP",
  "Download photo": "Descarcă fotografia",
  "Save location": "Salvează locația",
  "Location is not available on this device.": "Locația nu este disponibilă pe acest dispozitiv.",
  "Could not record your position. Allow location access and try again.": "Poziția nu a putut fi înregistrată. Permite accesul la locație și încearcă din nou.",
  "Recording…": "Se înregistrează…",
  "The map could not be loaded. Check your connection and try again.": "Harta nu a putut fi încărcată. Verifică conexiunea și încearcă din nou.",
  "Location created. Add images or keep editing.": "Locație creată. Adaugă imagini sau continuă editarea.",
  "Location deleted.": "Locație ștearsă.",
  "Photo deleted.": "Fotografie ștearsă.",
  "Tour created.": "Tur creat.",
  "Tour deleted.": "Tur șters.",
  "Tour updated.": "Tur actualizat.",
  "Invite code copied.": "Codul de invitație a fost copiat.",
  "Link": "Link",
  "Expires in (minutes)": "Expiră în (minute)",
  "Create invite": "Creează invitație",
  "Remove administrator": "Elimină administratorul",
  "Remove": "Elimină",
  "API returned an unexpected status": "API-ul a răspuns cu o stare neașteptată",
  "API unreachable": "API-ul nu poate fi contactat",
  "The API responded, but not with the expected health payload. Check the backend.": "API-ul a răspuns, dar nu cu datele de stare așteptate. Verifică backend-ul.",
  "Last check completed just now. All core services are responding normally.": "Ultima verificare tocmai s-a încheiat. Toate serviciile principale răspund normal.",
  "The request could not reach AradLens. Check your connection and try again.": "AradLens nu a putut fi contactat. Verifică conexiunea și încearcă din nou.",
  "Your session has expired. Sign in again to continue.": "Sesiunea a expirat. Autentifică-te din nou pentru a continua.",
  "Account actions": "Acțiuni de cont",
  "Account options": "Opțiuni de cont",
  "Legal and privacy": "Legal și confidențialitate",
  "Collapse sidebar": "Restrânge meniul lateral",
  "Expand sidebar": "Extinde meniul lateral",
  "Close dialog": "Închide fereastra",
  "Pick the location on the map": "Alege locația pe hartă",
  "Location photos": "Fotografii locație",
  "Your username": "Numele tău de utilizator",
  "Paste your invite code": "Lipește codul de invitație",
  "Choose a username": "Alege un nume de utilizator",
  "Show password": "Arată parola",
  "Hide password": "Ascunde parola",
  "Good morning": "Bună dimineața",
  "Good afternoon": "Bună ziua",
  "Good evening": "Bună seara",
  "Switch account": "Schimbă contul",
  "Live": "Live",
  "Edit": "Editează",
  "{n} place(s) missing a photo": "{n} locuri fără fotografie",
  "{n} place(s) missing a description": "{n} locuri fără descriere",
  "{n} images uploaded.": "{n} imagini încărcate.",
  "Image uploaded.": "Imagine încărcată.",
  "Exported {n} administrator(s).": "S-au exportat {n} administratori.",
  "Switched to {name}.": "Ai comutat la {name}.",
  "Signed out. Switched to {name}.": "Deconectare. Ai comutat la {name}.",
  "Account created: {name}": "Cont creat: {name}",
  "Category renamed: {name}": "Categorie redenumită: {name}",
  "Category created: {name}": "Categorie creată: {name}",
  "{n} stop(s)": "{n} opriri",
  "{n} tour(s)": "{n} tururi",
  "{n} location(s)": "{n} locații",
  "{n} photo(s)": "{n} fotografii",
  "API healthy · {ms}ms": "API funcțional · {ms}ms",
  "Selected: {lat}, {lng} — click elsewhere or drag the pin to move it.": "Selectat: {lat}, {lng} — apasă în altă parte sau trage pinul pentru a-l muta.",
  "OpenStreetMap calls this “{name}”.": "OpenStreetMap numește asta „{name}”.",
  "Delete category “{name}”? Locations that use it lose the category.": "Ștergi categoria „{name}”? Locațiile care o folosesc rămân fără categorie.",
  "Delete tour {name}? This cannot be undone.": "Ștergi turul „{name}”? Operațiunea nu poate fi anulată.",
  "Delete location #{id}? This cannot be undone.": "Ștergi locația #{id}? Operațiunea nu poate fi anulată.",
  "Edit location #{id}": "Editează locația #{id}",
  "Edit tour {name}": "Editează turul „{name}”",
  "Edit {name}": "Editează {name}",
  "Rename {name}": "Redenumește {name}",
  "Delete {name}": "Șterge {name}",
  "Move {name} up": "Mută {name} în sus",
  "Move {name} down": "Mută {name} în jos",
  "Remove {name} from the route": "Elimină {name} din traseu",
  "Drag points into the route or click to add. Drag route stops to reorder; drag one back to remove, or use the arrows.": "Trage puncte în traseu sau apasă pentru a le adăuga. Trage opririle pentru a le reordona; trage una înapoi pentru a o elimina sau folosește săgețile.",
  "Drag to add {name} to the route": "Trage pentru a adăuga {name} în traseu",
  "Drag to reorder {name}": "Trage pentru a reordona {name}",
  "Open {name} in Important points": "Deschide {name} în Puncte de interes",
  "Location #{id}": "Locația #{id}",
  "Tour #{id}": "Turul #{id}",
  "{message} Click Refresh to try again.": "{message} Apasă Reîmprospătează pentru a încerca din nou.",
  "{message} Click Run health check to try again.": "{message} Apasă Verifică starea serviciilor pentru a încerca din nou.",

  /* Error and recovery surfaces */
  "Offline": "Fără conexiune",
  "Page not found": "Pagina nu a fost găsită",
  "Server error": "Eroare de server",
  "The guide lost": "Ghidul a pierdut",
  "its signal.": "semnalul.",
  "Your browser can’t reach AradLens right now. Check your connection, then try again. Nothing you saved has been lost.": "Browserul tău nu poate ajunge la AradLens acum. Verifică conexiunea, apoi încearcă din nou. Nimic din ce ai salvat nu s-a pierdut.",
  "This page isn’t": "Această pagină nu este",
  "on the map.": "pe hartă.",
  "The address you followed doesn’t match anything in the workspace. Check the link, or head back to a known place.": "Adresa pe care ai urmat-o nu corespunde nimic din spațiul de lucru. Verifică linkul sau întoarce-te la un loc cunoscut.",
  "The workspace": "Spațiul de lucru",
  "hit a snag.": "a întâmpinat o problemă.",
  "AradLens couldn’t finish loading this screen. Your work is safe. Try again, and if it keeps happening, send the reference below to your operator.": "AradLens nu a putut termina încărcarea acestui ecran. Munca ta este în siguranță. Încearcă din nou, iar dacă problema persistă, trimite referința de mai jos operatorului.",
  "Try again": "Încearcă din nou",
  "Go to overview": "Mergi la prezentare generală",
  "Checking connection…": "Se verifică conexiunea…",
  "Preview closed.": "Previzualizare închisă.",
  "Back online.": "Conexiune restabilită.",
  "The workspace is responding again.": "Spațiul de lucru răspunde din nou.",
  "Still unavailable. Try again in a moment.": "Încă indisponibil. Încearcă din nou într-un moment.",
  "Still offline. Check your connection, then try again.": "Încă ești offline. Verifică conexiunea, apoi încearcă din nou.",
  "Reference copied.": "Referința a fost copiată.",
  "Could not copy the reference. Select it and copy manually.": "Referința nu a putut fi copiată. Selecteaz-o și copiaz-o manual.",
  "Reference": "Referință",
  "Reported": "Raportat",
  "Copy reference": "Copiază referința",
  "If this keeps happening, send the reference to your workspace operator.": "Dacă problema persistă, trimite referința operatorului spațiului de lucru.",
  "Preview": "Previzualizare",
  "This is a demonstration error, not a live incident.": "Aceasta este o eroare demonstrativă, nu un incident real.",
  /* Global search */
  "Search AradLens": "Caută în AradLens",
  "Search (Ctrl+K)": "Caută (Ctrl+K)",
  "Search anything…": "Caută orice…",
  "Close search": "Închide căutarea",
  "Search results": "Rezultatele căutării",
  "Type to search places, tours, administrators, pages and actions.": "Scrie pentru a căuta locuri, tururi, administratori, pagini și acțiuni.",
  "Pages": "Pagini",
  "Places": "Locuri",
  "Recovery": "Recuperare",
  "Page": "Pagină",
  "Action": "Acțiune",
  "Tour": "Tur",
  "Pulse of the guide today.": "Pulsul ghidului astăzi.",
  "Places in the live guide.": "Locurile din ghidul live.",
  "Walking routes through the city.": "Trasee de mers prin oraș.",
  "Everything that needs a look.": "Tot ce necesită atenție.",
  "People with workspace access.": "Persoanele cu acces la spațiul de lucru.",
  "API and device health.": "Starea API-ului și a dispozitivelor.",
  "Roles, invites and permissions.": "Roluri, invitații și permisiuni.",
  "Account, security and appearance.": "Cont, securitate și aspect.",
  "Create a new place.": "Creează un loc nou.",
  "Rename or remove the guide's categories.": "Redenumește sau elimină categoriile ghidului.",
  "Record a place from a phone.": "Înregistrează un loc de pe telefon.",
  "Review and create administrator invites.": "Verifică și creează invitații pentru administratori.",
  "Update the password for this account.": "Actualizează parola acestui cont.",
  "End this session.": "Încheie această sesiune.",
  "Change how the workspace looks.": "Schimbă aspectul spațiului de lucru.",
  "Review the recovery surface.": "Previzualizează ecranul de recuperare.",
  "No matches for “{query}”.": "Nicio potrivire pentru „{query}”.",
  "Try a place, tour, administrator, page or action.": "Încearcă un loc, un tur, un administrator, o pagină sau o acțiune.",
  "1 result": "1 rezultat",
  "{n} results": "{n} rezultate",
  "Preview page-not-found error": "Previzualizează eroarea pagină negăsită",
  "Preview server-error screen": "Previzualizează ecranul de eroare de server",
  "Preview offline error": "Previzualizează eroarea offline",
  "Switch to night theme": "Schimbă la tema de noapte",
  "Switch to day theme": "Schimbă la tema de zi",
  "stop": "oprire",
  "stops": "opriri",

  /* Singular/plural pairs used by counted(). */
  "administrator": "administrator",
  "active account": "cont activ",
  "superadmin": "superadmin",
  "invite code": "cod de invitație",
  "No invites found.": "Nu s-a găsit nicio invitație.",
  "0 stops": "0 opriri",
  "No locations found.": "Nu s-a găsit nicio locație.",
  "View route on the map": "Vezi traseul pe hartă",
  "View {name} on the map": "Vezi {name} pe hartă",
  "Tour route": "Traseul turului",
  "Walking order": "Ordinea de parcurgere",
  "Direct": "Direct",
  "Streets": "Străzi",
  "Route view": "Vizualizare traseu",
  "Street route": "Traseu pe străzi",
  "Finding street route…": "Se caută traseul pe străzi…",
  "walking": "pe jos",
  "Street route unavailable.": "Traseul pe străzi nu este disponibil.",
  "Too many route requests. Try again shortly.": "Prea multe cereri de traseu. Încearcă din nou curând.",
  "Provide between 2 and 25 route points.": "Furnizează între 2 și 25 de puncte de traseu.",
  "Route points must be inside Romania.": "Punctele traseului trebuie să fie în România.",
  "Street routing is unavailable. Showing direct lines.": "Traseul pe străzi nu este disponibil. Se afișează linii directe.",
  "Street routing returned no route. Showing direct lines.": "Traseul pe străzi nu a returnat nicio rută. Se afișează linii directe.",
  "{n} on map": "{n} pe hartă",
  "Loading route…": "Se încarcă traseul…",
  "The stops in this tour, in walking order.": "Opririle acestui tur, în ordinea de parcurgere.",
  "This tour has no stops yet. Add points to the route first.": "Acest tur nu are încă opriri. Adaugă mai întâi puncte pe traseu.",
  "Important point": "Punct de interes",
  "No map position": "Fără poziție pe hartă",
  "No mapped stops yet. Add coordinates to the points in this tour to see the route.": "Nicio oprire pe hartă încă. Adaugă coordonate punctelor din acest tur pentru a vedea traseul.",
  "Search a place in Romania": "Caută un loc în România",
  "Fit Romania": "Încadrează România",
  "Use my location": "Folosește locația mea",
  "Clear point": "Șterge punctul",
  "Romania only": "Doar România",
  "Search": "Caută",
  "Searching places in Romania…": "Se caută locuri în România…",
  "No places found in Romania. Try a different name.": "Nu s-a găsit niciun loc în România. Încearcă alt nume.",
  "Choose a point inside Romania.": "Alege un punct în România.",
  "Type at least two characters to search for a place in Romania.": "Scrie cel puțin două caractere pentru a căuta un loc în România.",
  "1 place found in Romania.": "Un loc găsit în România.",
  "{n} places found in Romania.": "{n} locuri găsite în România.",
  "Place search is unavailable. Click the map instead.": "Căutarea locurilor nu este disponibilă. Apasă pe hartă.",
  "Too many place searches. Try again shortly.": "Prea multe căutări de locuri. Încearcă din nou curând.",
  "Place search returned an unexpected result.": "Căutarea locurilor a returnat un rezultat neașteptat.",
  "The Romania outline could not be loaded. Reload the dialog and try again.": "Conturul României nu a putut fi încărcat. Reîncarcă dialogul și încearcă din nou.",
  "Loading Romania outline…": "Se încarcă conturul României…",
  "Recording…": "Se înregistrează…",
  "Position recorded.": "Poziție înregistrată.",
  "Pick both coordinates or clear the point.": "Alege ambele coordonate sau șterge punctul.",
  "Unnamed place": "Loc fără nume",
  "Place search results": "Rezultatele căutării de locuri",
  "Tour route map": "Harta traseului turului",
  "No coordinates": "Fără coordonate",
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
/* Resolve a key to the reader's language. A key may carry {name}
   placeholders; the caller supplies the values, so the sentence keeps
   its own word order in either language. */
function t(key, values) {
  const table = translations[currentLanguage] || {};
  let text = table[key] || (currentLanguage === "ro" ? uiTranslations[key] : key) || key;
  if (values) {
    text = String(text).replace(/\{([a-zA-Z0-9_]+)\}/g, (whole, name) => (values[name] === undefined ? whole : String(values[name])));
  }
  return text;
}

/* Romanian counts take three shapes — one, a few, and many — and
   only the last of them needs "de" between number and noun. */
function counted(n, oneKey, manyKey, options) {
  const many = t(manyKey, options);
  if (n === 1) return `${n} ${t(oneKey, options)}`;
  if (currentLanguage !== "ro") return `${n} ${many}`;
  const rest = n % 100;
  const needsDe = n !== 0 && (rest === 0 || rest > 19);
  return `${n} ${needsDe ? "de " + many : many}`;
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
    const error = new Error("The request could not reach AradLens. Check your connection and try again.");
    error.offline = true;
    throw error;
  }
  const body = await response.json().catch(() => ({}));
  if (response.status === 401 && !["/api/auth/login", "/api/auth/forgot-password", "/api/auth/reset-password"].includes(path)) {
    const message = t("Your session has expired. Sign in again to continue.");
    if (loginError) loginError.textContent = message;
    setAuthenticated(false);
    const error = new Error(message);
    error.status = 401;
    throw error;
  }
  if (!response.ok) {
    const detail = Array.isArray(body.detail) ? body.detail.map((item) => item.msg).join(" ") : body.detail;
    const error = new Error(detail || "We couldn't complete that request. Check your connection and try again.");
    error.status = response.status;
    throw error;
  }
  return body;
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  loginView.classList.toggle("theme-night", currentTheme === "night");
  appView.classList.toggle("theme-night", currentTheme === "night");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor)     themeColor.setAttribute("content", currentTheme === "night" ? "#101010" : "#f9f6ef");
  document.querySelectorAll("[data-theme-label]").forEach((label) => { label.textContent = translations[currentLanguage][currentTheme]; });
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const nextTheme = currentTheme === "day" ? "night" : "day";
    /* The visible word is the current theme. Keep it inside the accessible
       name so the control never reads as something other than what it shows. */
    const currentLabel = translations[currentLanguage][currentTheme];
    const actionLabel = currentTheme === "day" ? translations[currentLanguage].switchNight : translations[currentLanguage].switchDay;
    button.setAttribute("aria-label", `${currentLabel}. ${actionLabel}`);
    button.querySelector(".theme-icon-sun")?.style.setProperty("display", currentTheme === "day" ? "inline" : "none");
    button.querySelector(".theme-icon-moon")?.style.setProperty("display", currentTheme === "night" ? "inline" : "none");
    button.dataset.nextTheme = nextTheme;
  });
  refreshRomaniaTheme();
  syncSettingsControls();
}

const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
function localizeDom() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => {
    /* Some text must never be rewritten: language names are endonyms,
       and a person looking for their own language has to recognise it.
       Anything inside [data-no-translate] keeps the words it was born
       with. */
    if (node.parentElement?.closest("script,style,[data-no-translate]")) return;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
    const source = originalTextNodes.get(node);
    const original = source.trim();
    if (!original || !uiTranslations[original]) return;
    node.nodeValue = source.replace(original, t(original));
  });
  document.querySelectorAll("[title], [aria-label], input[placeholder]").forEach((element) => ["title", "aria-label", "placeholder"].forEach((attribute) => {
    if (element.closest("[data-no-translate]")) return;
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
  if (isErrorViewOpen()) renderErrorCopy();
  /* Lists that were built from cached data still hold the old words.
     Re-render them rather than leaving a half-translated page. */
  renderAccountMenu();
  if (!document.getElementById("category-modal")?.classList.contains("is-hidden")) renderCategoryList();
  if (cachedCategories.length) renderCategoryOptions(document.getElementById("location-category")?.value || "");
  if (currentPage === "attention") renderAttention();
  if (!isErrorViewOpen()) showPage(currentPage, false, true);
}

/* ============================================================
   ERROR SURFACE
   One screen, three honest explanations. The demo routes
   (#error, #error/404, #error/500) exist so the state can be
   reviewed without breaking the API, and the Debug page exposes
   the same previews as buttons. Real 404s, unreachable sessions
   and server failures use the same surface with real copy.
   ============================================================ */
const ERROR_VARIANTS = {
  offline: {
    tone: "bad",
    statusLabel: "Offline",
    code: "NO SIGNAL",
    titleLead: "The guide lost",
    titleTail: "its signal.",
    message: "Your browser can’t reach AradLens right now. Check your connection, then try again. Nothing you saved has been lost.",
    primary: "Try again",
    prefix: "NET",
    marker: "!",
  },
  "404": {
    tone: "warn",
    statusLabel: "Page not found",
    code: "404",
    titleLead: "This page isn’t",
    titleTail: "on the map.",
    message: "The address you followed doesn’t match anything in the workspace. Check the link, or head back to a known place.",
    primary: "Go to overview",
    prefix: "NAV",
    marker: "?",
  },
  "500": {
    tone: "bad",
    statusLabel: "Server error",
    code: "500",
    titleLead: "The workspace",
    titleTail: "hit a snag.",
    message: "AradLens couldn’t finish loading this screen. Your work is safe. Try again, and if it keeps happening, send the reference below to your operator.",
    primary: "Try again",
    prefix: "SRV",
    marker: "!",
  },
};
let errorState = null;

function isErrorViewOpen() {
  return Boolean(errorView && !errorView.classList.contains("is-hidden"));
}

function hasStoredSession() {
  try { return sessionStorage.getItem("aradlens-admin-auth") === "true"; } catch { return false; }
}

function makeErrorReference(prefix) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint8Array(6);
  try { crypto.getRandomValues(values); } catch {
    for (let index = 0; index < values.length; index += 1) values[index] = Math.floor(Math.random() * 256);
  }
  const code = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `AL-${prefix}-${code.slice(0, 4)}-${code.slice(4)}`;
}

function errorVariantFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (raw !== "error" && !raw.startsWith("error/")) return null;
  const variant = raw.split("/")[1] || "offline";
  return ERROR_VARIANTS[variant] ? variant : "offline";
}

function renderErrorCopy() {
  if (!errorState) return;
  const variant = ERROR_VARIANTS[errorState.variant];
  const statusLabel = document.getElementById("error-status-label");
  const statusCode = document.getElementById("error-status-code");
  const lead = document.getElementById("error-title-lead");
  const tail = document.getElementById("error-title-tail");
  const message = document.getElementById("error-message");
  const primary = document.getElementById("error-primary");
  const secondary = document.getElementById("error-secondary");
  const preview = document.getElementById("error-preview-note");
  const reference = document.getElementById("error-reference");
  const reported = document.getElementById("error-reported");
  const copy = document.getElementById("error-copy-reference");
  const marker = document.getElementById("error-marker-mark");
  if (statusLabel) {
    const nextStatus = t(variant.statusLabel);
    if (statusLabel.textContent !== nextStatus) statusLabel.textContent = nextStatus;
  }
  if (statusCode) statusCode.textContent = variant.code;
  if (lead) lead.textContent = t(variant.titleLead);
  if (tail) tail.textContent = t(variant.titleTail);
  if (message) message.textContent = t(variant.message);
  const canReturnToWorkspace = Boolean(authenticatedAdmin) || hasStoredSession();
  if (primary) {
    primary.disabled = false;
    primary.textContent = t(errorState.variant === "404" && !canReturnToWorkspace ? "Sign in" : variant.primary);
  }
  if (secondary) {
    secondary.hidden = errorState.variant === "404";
    secondary.disabled = false;
    secondary.textContent = t(canReturnToWorkspace ? "Back to workspace" : "Sign in");
  }
  if (preview) preview.hidden = !errorState.demo;
  if (reference) reference.textContent = errorState.reference;
  if (reported) reported.textContent = formatDateTime(errorState.reportedAt);
  if (copy) copy.setAttribute("aria-label", t("Copy reference"));
  if (marker) marker.textContent = variant.marker;
  document.title = `${t(variant.statusLabel)} · AradLens`;
}

function showErrorScreen(options = {}) {
  if (globalSearchOpen) closeGlobalSearch({ restoreFocus: false });
  const variantKey = ERROR_VARIANTS[options.variant] ? String(options.variant) : "offline";
  const variant = ERROR_VARIANTS[variantKey];
  const currentHash = window.location.hash || "#overview";
  const returnHash = options.returnHash
    || (variantKey === "404" || currentHash.startsWith("#error") ? "#overview" : currentHash);
  errorState = {
    variant: variantKey,
    demo: Boolean(options.demo),
    retry: typeof options.retry === "function" ? options.retry : null,
    returnHash,
    reference: makeErrorReference(variant.prefix),
    reportedAt: new Date().toISOString(),
  };
  errorView.dataset.tone = variant.tone;
  renderErrorCopy();
  errorView.classList.remove("is-hidden");
  document.querySelectorAll(".modal").forEach((modal) => modal.classList.add("is-hidden"));
  closeMenus();
  loginView.classList.add("is-hidden");
  appView.classList.add("is-hidden");
  document.documentElement.classList.remove("is-restoring");
  if (options.updateUrl) history.replaceState(null, "", `#error/${variantKey}`);
  window.scrollTo(0, 0);
  window.requestAnimationFrame(() => {
    document.getElementById("error-title")?.focus({ preventScroll: true });
  });
}

function restoreWorkspaceView() {
  if (!isErrorViewOpen()) return;
  errorView.classList.add("is-hidden");
  errorState = null;
  if (authenticatedAdmin) {
    loginView.classList.add("is-hidden");
    appView.classList.remove("is-hidden");
  } else {
    appView.classList.add("is-hidden");
    loginView.classList.remove("is-hidden");
  }
  document.title = currentLanguage === "ro" ? "AradLens - Spațiu de administrare" : "AradLens - Admin workspace";
}

async function leaveErrorScreen() {
  if (!isErrorViewOpen()) return;
  const targetHash = errorState?.returnHash || "#overview";
  errorView.classList.add("is-hidden");
  errorState = null;
  document.title = currentLanguage === "ro" ? "AradLens - Spațiu de administrare" : "AradLens - Admin workspace";
  let admin = authenticatedAdmin;
  if (!admin && hasStoredSession()) {
    try { admin = await apiRequest("/api/auth/me"); } catch (error) {
      admin = null;
      if (loginError) loginError.textContent = error?.message || "";
    }
  }
  if (admin) {
    if (!authenticatedAdmin) setAuthenticated(true, admin);
    else {
      loginView.classList.add("is-hidden");
      appView.classList.remove("is-hidden");
    }
    const page = targetHash.replace(/^#/, "");
    const nextPage = pageNames[page] ? page : "overview";
    showPage(nextPage, false, true);
    history.replaceState(null, "", `#${nextPage}`);
    window.requestAnimationFrame(() => {
      const heading = document.querySelector(`#page-${nextPage} .page-heading h2`);
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  } else {
    setAuthenticated(false);
    history.replaceState(null, "", window.location.pathname + window.location.search);
    window.requestAnimationFrame(() => document.getElementById("username")?.focus({ preventScroll: true }));
  }
}

async function attemptErrorRecovery() {
  if (!errorState) return;
  const variant = errorState.variant;
  if (variant === "404") {
    errorState.returnHash = "#overview";
    await leaveErrorScreen();
    return;
  }
  const primary = document.getElementById("error-primary");
  if (errorState.demo) {
    if (primary) {
      primary.disabled = true;
      primary.textContent = t("Checking connection…");
    }
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    if (primary) primary.disabled = false;
    await leaveErrorScreen();
    showToast(t("Preview closed."), "success");
    return;
  }
  if (errorState.retry) {
    if (primary) {
      primary.disabled = true;
      primary.textContent = t("Checking connection…");
    }
    try {
      await errorState.retry();
      await leaveErrorScreen();
      showToast(t(variant === "offline" ? "Back online." : "The workspace is responding again."), "success");
    } catch (error) {
      renderErrorCopy();
      showToast(error?.message || t("Still unavailable. Try again in a moment."), "error");
    }
    return;
  }
  if (variant === "offline" && !navigator.onLine) {
    showToast(t("Still offline. Check your connection, then try again."), "error");
    return;
  }
  window.location.reload();
}

async function copyErrorReference() {
  if (!errorState) return;
  try {
    await navigator.clipboard.writeText(errorState.reference);
    showToast(t("Reference copied."), "success");
  } catch {
    showToast(t("Could not copy the reference. Select it and copy manually."), "error");
  }
}

function handleHashRoute() {
  const preview = errorVariantFromHash();
  if (preview) {
    showErrorScreen({ variant: preview, demo: true });
    return;
  }
  if (isErrorViewOpen()) restoreWorkspaceView();
  const page = window.location.hash.slice(1) || "overview";
  if (pageNames[page]) {
    showPage(page, false);
    return;
  }
  showErrorScreen({ variant: "404", demo: false });
}

document.getElementById("error-primary")?.addEventListener("click", attemptErrorRecovery);
document.getElementById("error-secondary")?.addEventListener("click", () => { leaveErrorScreen(); });
document.getElementById("error-copy-reference")?.addEventListener("click", copyErrorReference);

function setAuthenticated(isAuthenticated, admin = null) {
  authenticatedAdmin = isAuthenticated ? admin : null;
  /* The restoring state has done its work, whichever way the answer went. */
  document.documentElement.classList.remove("is-restoring");
  const isSuperadmin = String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin";
  document.querySelectorAll(".superadmin-only").forEach((element) => {
    element.hidden = !isSuperadmin;
    element.classList.toggle("is-hidden", !isSuperadmin);
  });
  if (!isAuthenticated) {
    if (globalSearchOpen) closeGlobalSearch({ restoreFocus: false });
    document.getElementById("admins-list").replaceChildren();
    document.getElementById("location-modal")?.classList.add("is-hidden");
    document.getElementById("category-modal")?.classList.add("is-hidden");
    document.getElementById("image-modal")?.classList.add("is-hidden");
    document.getElementById("users-admins-list")?.replaceChildren();
    document.getElementById("invites-list")?.replaceChildren();
    document.getElementById("live-grid")?.replaceChildren();
    document.getElementById("tours-list")?.replaceChildren();
    cachedLocations = [];
    locationsLoaded = false;
    cachedTours = [];
    cachedCategories = [];
    ["stat-admins-total", "stat-admins-active", "stat-admins-inactive", "stat-admins-super"].forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.textContent = "—";
    });
    if (typeof resetLocationForm === "function") resetLocationForm();
    myAccounts = [];
    renderAccountMenu();
    closeMenus();
    addingAccount = false;
    document.getElementById("login-back-button")?.classList.add("is-hidden");
  }
  loginView.classList.toggle("is-hidden", isAuthenticated || isErrorViewOpen());
  appView.classList.toggle("is-hidden", !isAuthenticated || isErrorViewOpen());
  if (isAuthenticated) sessionStorage.setItem("aradlens-admin-auth", "true");
  else sessionStorage.removeItem("aradlens-admin-auth");
  if (isAuthenticated) {
    loginError.textContent = "";
    updateAccountChrome();
    refreshAccounts();
    loadCategories().catch(() => {});
  }
  if (isErrorViewOpen()) renderErrorCopy();
  if (!isErrorViewOpen()) {
    const hashPage = window.location.hash.slice(1);
    if (pageNames[hashPage]) showPage(hashPage, false, true);
    else showPage(currentPage, false, true);
  }
}

function showPage(page, updateUrl = true, force = false) {
  const previousPage = currentPage;
  const superadminOnlyPage = page === "admins" || page === "debug" || page === "resets";
  currentPage = pageNames[page] && (!superadminOnlyPage || isSuperadminAccount()) ? page : "overview";
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
  if (page === "resets" && authenticatedAdmin && isSuperadminAccount()) loadPasswordResetRequests();
  if (page === "points" && (previousPage !== "points" || force)) loadLocations();
  if (page === "tours" && (previousPage !== "tours" || force)) loadTours();
  if (page === "attention") { if (previousPage !== "attention" || force) loadLocations().catch(() => {}); renderAttention(); }
  if (page === "overview") loadOverview();
  if (page === "debug") runDebugHealth();
  if (page === "settings") fillAccountForm();
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

/* A notice carries its meaning in the mark, not only in colour, so the
   shape is what changes: a dot, a tick, or a warning. */
const TOAST_MARKS = { info: "•", success: "✓", error: "!" };

function showToast(message, kind = "info") {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  const holder = toast.querySelector(".toast-message");
  holder.dataset.messageKey = message;
  holder.textContent = t(message);
  const mark = toast.querySelector(".toast-mark");
  if (mark) mark.textContent = TOAST_MARKS[kind] || TOAST_MARKS.info;
  toast.dataset.kind = kind;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 7000);
}

document.querySelector(".toast-dismiss")?.addEventListener("click", () => toast.classList.remove("is-visible"));

let confirmOpener = null;
let confirmAction = null;
function openConfirm({ title, text, detail, confirmLabel, onConfirm }) {
  const modal = document.getElementById("confirm-modal");
  if (!modal) return;
  confirmOpener = document.activeElement;
  confirmAction = onConfirm;
  const heading = document.getElementById("confirm-modal-title");
  const copy = document.getElementById("confirm-modal-text");
  const detailElement = document.getElementById("confirm-modal-detail");
  const confirmButton = document.getElementById("confirm-modal-confirm");
  if (heading) heading.textContent = title;
  if (copy) copy.textContent = text;
  if (detailElement) detailElement.textContent = detail || "";
  if (confirmButton) confirmButton.textContent = confirmLabel || "Remove";
  modal.classList.remove("is-hidden");
  confirmButton?.focus();
}

function closeConfirm() {
  const modal = document.getElementById("confirm-modal");
  if (!modal || modal.classList.contains("is-hidden")) return;
  modal.classList.add("is-hidden");
  confirmAction = null;
  if (confirmOpener && document.contains(confirmOpener)) confirmOpener.focus();
  confirmOpener = null;
}

document.getElementById("confirm-modal-cancel")?.addEventListener("click", closeConfirm);
document.querySelector("#confirm-modal [data-close-confirm-modal]")?.addEventListener("click", closeConfirm);
document.getElementById("confirm-modal-confirm")?.addEventListener("click", async () => {
  const action = confirmAction;
  const button = document.getElementById("confirm-modal-confirm");
  if (button) button.disabled = true;
  try {
    if (action) await action();
  } finally {
    if (button) button.disabled = false;
    closeConfirm();
  }
});
document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", () => {
  currentTheme = currentTheme === "day" ? "night" : "day";
  writePreference("localStorage", "aradlens-theme", currentTheme);
  applyTheme();
}));
window.addEventListener("storage", (event) => {
  if (event.key !== "aradlens-theme" || !["day", "night"].includes(event.newValue) || event.newValue === currentTheme) return;
  currentTheme = event.newValue;
  applyTheme();
});
document.querySelectorAll(".language-picker select").forEach((select) => select.addEventListener("change", (event) => {
  currentLanguage = ["en", "ro"].includes(event.target.value) ? event.target.value : "en";
  writePreference("localStorage", "aradlens-language", currentLanguage);
  applyLanguage();
}));

document.getElementById("toggle-login-password").addEventListener("click", (event) => {
  const input = document.getElementById("password");
  const visible = input.type === "text";
  input.type = visible ? "password" : "text";
  event.currentTarget.textContent = visible ? t("Show") : t("Hide");
  event.currentTarget.setAttribute("aria-label", visible ? t("Show password") : t("Hide password"));
  event.currentTarget.setAttribute("aria-pressed", String(!visible));
});

const registerForm = document.getElementById("register-form");

function showAuthView(view) {
  const views = [
    ["login", loginForm],
    ["register", registerForm],
    ["forgot", forgotPasswordForm],
    ["reset", resetPasswordForm],
  ];
  views.forEach(([name, form]) => form?.classList.toggle("is-hidden", name !== view));
  const isRecovery = view === "forgot" || view === "reset";
  loginView.querySelector(".login-panel")?.classList.toggle("is-recovery", isRecovery);
  document.querySelector(".auth-tabs")?.classList.toggle("is-hidden", isRecovery);
  document.getElementById("login-hint-row")?.classList.toggle("is-hidden", isRecovery);
  document.getElementById("auth-back-button")?.classList.toggle("is-hidden", !isRecovery);
  document.getElementById("auth-tab-login")?.setAttribute("aria-selected", String(view === "login"));
  document.getElementById("auth-tab-register")?.setAttribute("aria-selected", String(view === "register"));
  if (view === "forgot") document.getElementById("forgot-email")?.focus();
  if (view === "reset") document.getElementById("reset-password")?.focus();
}

function showAuthTab(tab) {
  showAuthView(tab);
}

document.getElementById("auth-tab-login")?.addEventListener("click", () => showAuthTab("login"));
document.getElementById("auth-tab-register")?.addEventListener("click", () => showAuthTab("register"));
document.getElementById("forgot-password-link")?.addEventListener("click", (event) => {
  event.preventDefault();
  const message = document.getElementById("forgot-password-message");
  if (message) message.textContent = "";
  showAuthView("forgot");
});
document.getElementById("auth-back-button")?.addEventListener("click", () => showAuthView("login"));

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

function setFormMessage(element, key, kind = "error") {
  if (!element) return;
  setMessage(element, key);
  if (kind === "success") element.dataset.kind = "success";
  else delete element.dataset.kind;
}

forgotPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("forgot-password-message");
  setFormMessage(message, "", "error");
  const email = String(new FormData(forgotPasswordForm).get("email") || "").trim();
  const submitButton = forgotPasswordForm.querySelector("button[type=submit]");
  submitButton.disabled = true;
  try {
    const result = await apiRequest("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setFormMessage(message, "If that email exists, a reset link is on its way.", "success");
    if (result?.reset_link) {
      window.location.href = result.reset_link;
      return;
    }
    forgotPasswordForm.reset();
  } catch (error) {
    setFormMessage(message, error.message || "We couldn't send the reset link. Try again.", "error");
  } finally {
    submitButton.disabled = false;
  }
});

resetPasswordForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = document.getElementById("reset-password-message");
  setFormMessage(message, "", "error");
  const form = new FormData(resetPasswordForm);
  const password = String(form.get("password") || "");
  const confirm = String(form.get("confirm") || "");
  if (password !== confirm) {
    setFormMessage(message, "The two passwords do not match.", "error");
    return;
  }
  if (!passwordResetToken) {
    setFormMessage(message, "This reset link is invalid or has expired.", "error");
    return;
  }
  const submitButton = resetPasswordForm.querySelector("button[type=submit]");
  submitButton.disabled = true;
  try {
    await apiRequest("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: passwordResetToken, new_password: password }),
    });
    resetPasswordForm.reset();
    window.history.replaceState({}, "", "/");
    setFormMessage(message, "Your password has been reset. You can sign in now.", "success");
    window.setTimeout(() => {
      showAuthView("login");
      showToast(t("Your password has been reset. You can sign in now."), "success");
    }, 1400);
  } catch (error) {
    setFormMessage(
      message,
      error.status === 400
        ? "This reset link is invalid or has expired."
        : (error.message || "We couldn't reset your password. Try again."),
      "error",
    );
  } finally {
    submitButton.disabled = false;
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
      showToast(t("Signed out. Switched to {name}.", { name: admin.username }), "success");
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
function isTypingTarget(target) {
  return Boolean(target && (target.matches?.("input, textarea, select") || target.isContentEditable));
}

document.addEventListener("keydown", (event) => {
  if (globalSearchOpen) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeGlobalSearch();
    }
    return;
  }
  if (event.key === "Escape") {
    closeMobileNavigation();
    closeMenus();
    if (!document.getElementById("image-modal")?.classList.contains("is-hidden")) closeImageModal();
    else if (!document.getElementById("location-modal")?.classList.contains("is-hidden")) closeLocationModal();
    else if (!document.getElementById("tour-view-modal")?.classList.contains("is-hidden")) closeTourView();
    else if (!document.getElementById("tour-modal")?.classList.contains("is-hidden")) closeTourModal();
    else if (!document.getElementById("capture-modal")?.classList.contains("is-hidden")) closeCaptureModal();
    else if (!document.getElementById("confirm-modal")?.classList.contains("is-hidden")) closeConfirm();
    else if (!document.getElementById("admin-modal")?.classList.contains("is-hidden")) closeAdminModal();
    else if (!document.getElementById("invite-modal")?.classList.contains("is-hidden")) closeInviteModal();
    else if (!document.getElementById("invites-modal")?.classList.contains("is-hidden")) closeInvitesModal();
    else if (!document.getElementById("password-modal")?.classList.contains("is-hidden")) closePasswordModal();
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openGlobalSearch();
    return;
  }
  if (event.key === "/" && !isTypingTarget(event.target)) {
    event.preventDefault();
    openGlobalSearch();
    return;
  }
  if (event.key === "?" && !isTypingTarget(event.target)) showToast("Shortcuts: / or Ctrl K search · g then o overview · g then p points · g then u users · g then d debug");
});

document.getElementById("global-search-button").addEventListener("click", openGlobalSearch);
document.querySelector("[data-api-health]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.firstChild.textContent = t("Checking…");
  try {
    const result = await apiRequest("/api/health");
    showToast(result.status === "ok" ? t("AradLens API is healthy.") : t("The API responded with an unexpected status."));
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    button.disabled = false;
  button.firstChild.textContent = t("Check API health");
  }
});

function fillAccountForm() {
  const form = document.getElementById("account-form");
  if (!form || !authenticatedAdmin) return;
  form.elements.username.value = authenticatedAdmin.username || "";
  form.elements.email.value = authenticatedAdmin.email || "";
  form.elements.old_password.value = "";
  document.getElementById("account-form-error").textContent = "";
}

function syncSettingsControls() {
  document.querySelectorAll("[data-settings-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.settingsTheme === currentTheme));
  });
  const languageSelect = document.getElementById("settings-language");
  if (languageSelect) languageSelect.value = currentLanguage;
}

document.querySelectorAll("[data-settings-theme]").forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.settingsTheme;
    if (!["day", "night"].includes(theme) || theme === currentTheme) return;
    currentTheme = theme;
    writePreference("localStorage", "aradlens-theme", theme);
    applyTheme();
    syncSettingsControls();
  });
});

document.getElementById("settings-language")?.addEventListener("change", (event) => {
  const language = ["en", "ro"].includes(event.target.value) ? event.target.value : "en";
  if (language === currentLanguage) return;
  currentLanguage = language;
  writePreference("localStorage", "aradlens-language", language);
  applyLanguage();
});

document.getElementById("account-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorMessage = document.getElementById("account-form-error");
  const submitButton = form.querySelector("button[type=submit]");
  const values = new FormData(form);
  const priorLabel = submitButton.textContent;
  errorMessage.textContent = "";
  submitButton.disabled = true;
  submitButton.classList.add("is-loading");
  submitButton.textContent = t("Saving account…");
  try {
    const updated = await apiRequest("/api/admins/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: values.get("username"),
        email: values.get("email"),
        old_password: values.get("old_password"),
      }),
    });
    authenticatedAdmin = { ...authenticatedAdmin, ...updated };
    updateAccountChrome();
    await refreshAccounts();
    form.elements.old_password.value = "";
    showToast("Account updated.", "success");
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.classList.remove("is-loading");
    submitButton.textContent = priorLabel;
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
    closePasswordModal();
    showToast("Password changed successfully. You'll stay signed in.", "success");
  } catch (error) {
    setMessage(errorMessage, error.message === "New passwords do not match." ? t("New passwords do not match.") : t("We couldn't change your password. Check your current password and try again."));
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
let locationsLoaded = false;
let cachedTours = [];
let romaniaOutline = null;
var romaniaMask = null;
var romaniaBorder = null;
let romaniaOutlineState = "idle";
let romaniaOutlineRequest = null;
let pickerLastPoint = null;
let mapSearchRequestId = 0;
let locationGeoRequestId = 0;
let locationModalRequestId = 0;

/* The picker is an editor for Romanian places, so the country is the whole
   map: the view cannot leave its bounding box and the land outside the border
   is muted. The outline is the small public-domain GeoJSON in assets/. */
const ROMANIA_BOUNDS = [[43.55, 20.05], [48.4, 30.0]];
const ROMANIA_CENTER = [45.9432, 24.9668];

/* The API ships placeholder rows (latitude -90, longitude -180). They are not
   real places, so they must never reach the map: a fit that includes them
   spans the whole world and drops the picker to zoom 0. */
function usableCoordinate(latitude, longitude) {
  if ([latitude, longitude].some((value) => value === null || value === undefined || String(value).trim() === "")) return false;
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat <= -89.9 || lat >= 89.9) return false;
  if (lng <= -179.9 || lng >= 179.9) return false;
  return true;
}

function coordinateLabel(location) {
  return usableCoordinate(location?.latitude, location?.longitude)
    ? `${location.latitude}, ${location.longitude}`
    : t("No coordinates");
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
}

function syncMapMotionPreference() {
  const reduce = prefersReducedMotion();
  for (const map of [pickerMap, tourViewMap]) {
    if (!map) continue;
    map.options.zoomAnimation = !reduce;
    map.options.fadeAnimation = !reduce;
    map.options.markerZoomAnimation = !reduce;
  }
}

window.matchMedia?.("(prefers-reduced-motion: reduce)")?.addEventListener?.("change", syncMapMotionPreference);

function renderPickerPlaces(exceptId) {
  if (!pickerMap || typeof window.L === "undefined") return;
  if (!pickerPlacesLayer) pickerPlacesLayer = window.L.layerGroup().addTo(pickerMap);
  pickerPlacesLayer.clearLayers();
  for (const location of cachedLocations) {
    if (String(location.id) === String(exceptId)) continue;
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const tooltip = document.createElement("span");
    tooltip.textContent = String(location.name || `#${location.id}`);
    window.L.circleMarker([latitude, longitude], { radius: 5, weight: 2, color: romaniaColor(), fillColor: romaniaColor(), fillOpacity: 0.28 })
      .bindTooltip(tooltip)
      .addTo(pickerPlacesLayer);
  }
}

function ensurePickerMap() {
  if (pickerMap) {
    if (!romaniaOutline && romaniaOutlineState !== "loading") loadRomaniaOutline(pickerMap);
    return pickerMap;
  }
  if (typeof window.L === "undefined") return pickerMap;
  const element = document.getElementById("location-picker-map");
  if (!element) return null;
  pickerMap = window.L.map(element, {
    center: ROMANIA_CENTER,
    zoom: 7,
    minZoom: 6,
    maxBounds: ROMANIA_BOUNDS,
    maxBoundsViscosity: 1,
    zoomControl: true,
    zoomAnimation: !prefersReducedMotion(),
    fadeAnimation: !prefersReducedMotion(),
    markerZoomAnimation: !prefersReducedMotion(),
  });
  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(pickerMap);
  pickerMap.on("click", (event) => {
    clearMapSearch();
    if (!isInsideRomania(event.latlng.lat, event.latlng.lng)) {
      setMapStatus(t("Choose a point inside Romania."));
      return;
    }
    setMapStatus("");
    setPickerPoint(event.latlng.lat, event.latlng.lng);
  });
  loadRomaniaOutline(pickerMap);
  return pickerMap;
}

function pointInRing(lat, lng, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [lat1, lng1] = ring[index];
    const [lat2, lng2] = ring[previous];
    const crosses = (lng1 > lng) !== (lng2 > lng);
    if (crosses && lat < ((lat2 - lat1) * (lng - lng1)) / (lng2 - lng1) + lat1) inside = !inside;
  }
  return inside;
}

function isWithinRomaniaBounds(lat, lng) {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= ROMANIA_BOUNDS[0][0] && latitude <= ROMANIA_BOUNDS[1][0]
    && longitude >= ROMANIA_BOUNDS[0][1] && longitude <= ROMANIA_BOUNDS[1][1];
}

function isInsideRomania(lat, lng) {
  if (!isWithinRomaniaBounds(lat, lng)) return false;
  /* Fail closed while the country polygon is still loading or if it could
     not be fetched: the bbox still contains slices of neighbouring states. */
  if (!romaniaOutline?.length) return false;
  return pointInRing(Number(lat), Number(lng), romaniaOutline);
}

function romaniaColor() {
  return currentTheme === "night" ? "#e08a63" : "#a04a27";
}

function refreshRomaniaTheme() {
  if (romaniaBorder) romaniaBorder.setStyle({ color: romaniaColor() });
  if (romaniaMask) {
    romaniaMask.setStyle({
      fillColor: currentTheme === "night" ? "#101010" : "#f9f6ef",
      color: "transparent",
    });
  }
}

function loadRomaniaOutline(map) {
  if (!map || romaniaOutline) return Promise.resolve();
  if (romaniaOutlineRequest) return romaniaOutlineRequest;
  romaniaOutlineState = "loading";
  setMapStatus(t("Loading Romania outline…"));
  romaniaOutlineRequest = (async () => {
    try {
      const response = await fetch("/assets/romania.geojson", { credentials: "same-origin" });
      if (!response.ok) throw new Error("Romania outline request failed.");
      const payload = await response.json();
      const feature = payload?.features?.[0];
      const coordinates = feature?.geometry?.coordinates?.[0];
      if (!Array.isArray(coordinates) || coordinates.length < 3) throw new Error("Romania outline is invalid.");
      romaniaOutline = coordinates.map(([lng, lat]) => [lat, lng]);
      if (!map.getPane("romaniaPane")) {
        const pane = map.createPane("romaniaPane");
        pane.style.zIndex = "350";
        pane.style.pointerEvents = "none";
      }
      const outer = [[41.5, 17.5], [41.5, 32.5], [50.5, 32.5], [50.5, 17.5]];
      romaniaMask = window.L.polygon([outer, romaniaOutline], {
        stroke: false,
        fillColor: currentTheme === "night" ? "#101010" : "#f9f6ef",
        fillOpacity: 0.82,
        interactive: false,
        className: "romania-mask",
        pane: "romaniaPane",
      }).addTo(map);
      romaniaBorder = window.L.polyline([...romaniaOutline, romaniaOutline[0]], {
        color: romaniaColor(),
        weight: 1.4,
        opacity: 0.85,
        interactive: false,
        pane: "romaniaPane",
      }).addTo(map);
      romaniaOutlineState = "ready";
      setMapStatus("");
    } catch {
      romaniaOutlineState = "failed";
      setMapStatus(t("The Romania outline could not be loaded. Reload the dialog and try again."));
    } finally {
      romaniaOutlineRequest = null;
    }
  })();
  return romaniaOutlineRequest;
}

/* The picker lives inside a modal that is still laying out when the map is
   created, so the container can measure zero. Leaflet answers a zero-size
   viewport with zoom 0 (the whole world) and the first click then lands
   nowhere near the cursor. Measure first, then set the view, and repeat on
   the next frame once the modal has settled. */
function focusPickerMap(latitude, longitude, zoom) {
  if (!pickerMap) return;
  const apply = () => {
    pickerMap.invalidateSize({ animate: false, pan: false });
    const hasPoint = [latitude, longitude].every((value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)));
    if (hasPoint) {
      pickerMap.setView([Number(latitude), Number(longitude)], zoom || 15, { animate: false });
      return;
    }
    pickerMap.fitBounds(ROMANIA_BOUNDS, { padding: [8, 8], animate: false });
  };
  apply();
  window.requestAnimationFrame(apply);
}

function setPickerPoint(lat, lng) {
  const form = document.getElementById("location-form");
  if (!form || !pickerMap) return;
  const latitude = String(Math.round(Number(lat) * 1e6) / 1e6);
  const longitude = String(Math.round(Number(lng) * 1e6) / 1e6);
  form.elements.latitude.value = latitude;
  form.elements.longitude.value = longitude;
  pickerLastPoint = [latitude, longitude];
  const label = document.getElementById("location-coords-label");
  if (label) label.textContent = t("Selected: {lat}, {lng} — click elsewhere or drag the pin to move it.", { lat: latitude, lng: longitude });
  if (pickerMarker) pickerMarker.setLatLng([latitude, longitude]);
  else {
    pickerMarker = window.L.marker([latitude, longitude], {
      draggable: true,
      icon: window.L.divIcon({
        className: "picker-pin-wrap",
        html: '<span class="picker-pin"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 26],
      }),
    }).addTo(pickerMap);
    pickerMarker.on("dragend", () => {
      const point = pickerMarker.getLatLng();
      if (!isInsideRomania(point.lat, point.lng)) {
        if (pickerLastPoint) pickerMarker.setLatLng(pickerLastPoint);
        setMapStatus(t("Choose a point inside Romania."));
        return;
      }
      setMapStatus("");
      setPickerPoint(point.lat, point.lng);
    });
  }
  suggestOsmName(Number(latitude), Number(longitude));
}

function setMapStatus(text) {
  const status = document.getElementById("location-map-status");
  if (status) status.textContent = text || "";
}

function clearMapSearch() {
  mapSearchRequestId++;
  const input = document.getElementById("location-map-search");
  const results = document.getElementById("location-map-results");
  if (input) input.value = "";
  if (results) {
    results.replaceChildren();
    results.hidden = true;
  }
  setMapStatus("");
}

function renderMapResults(results) {
  const box = document.getElementById("location-map-results");
  if (!box) return;
  box.replaceChildren();
  if (!Array.isArray(results) || !results.length) {
    box.hidden = true;
    setMapStatus(t("No places found in Romania. Try a different name."));
    return;
  }
  const resultSeen = new Set();
  for (const result of results) {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    const key = result.display_name || `${latitude},${longitude}`;
    if (resultSeen.has(key)) continue;
    resultSeen.add(key);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "map-result";
    const title = document.createElement("strong");
    const name = result.name || String(result.display_name || "").split(",")[0] || t("Unnamed place");
    title.textContent = name;
    const detail = document.createElement("small");
    detail.textContent = result.display_name || "";
    button.append(title, detail);
    button.addEventListener("click", () => {
      if (!isInsideRomania(latitude, longitude)) {
        setMapStatus(t("Choose a point inside Romania."));
        return;
      }
      const nameInput = document.querySelector("#location-form [name=name]");
      if (nameInput && !nameInput.value.trim()) nameInput.value = name;
      const searchInput = document.getElementById("location-map-search");
      if (searchInput) searchInput.value = name;
      box.hidden = true;
      setMapStatus("");
      setPickerPoint(latitude, longitude);
      focusPickerMap(latitude, longitude, 16);
      searchInput?.focus();
    });
    box.append(button);
  }
  if (!box.children.length) {
    box.hidden = true;
    setMapStatus(t("No places found in Romania. Try a different name."));
    return;
  }
  const count = box.children.length;
  box.hidden = false;
  setMapStatus(count === 1
    ? t("1 place found in Romania.")
    : t("{n} places found in Romania.", { n: count }));
}

async function searchMapPlaces() {
  const input = document.getElementById("location-map-search");
  const query = input?.value.trim() || "";
  if (query.length < 2) {
    setMapStatus(t("Type at least two characters to search for a place in Romania."));
    return;
  }
  const requestId = ++mapSearchRequestId;
  setMapStatus(t("Searching places in Romania…"));
  try {
    const results = await apiRequest(`/api/geocode/search?q=${encodeURIComponent(query)}`);
    if (requestId !== mapSearchRequestId) return;
    renderMapResults(results);
  } catch (error) {
    if (requestId !== mapSearchRequestId) return;
    const message = uiTranslations[error.message]
      ? t(error.message)
      : t("Place search is unavailable. Click the map instead.");
    setMapStatus(message);
  }
}

function resetGeoControls() {
  const locateButton = document.getElementById("location-map-locate");
  if (locateButton) {
    locateButton.disabled = false;
    locateButton.textContent = t("Use my location");
  }
  const recordButton = document.getElementById("location-record");
  if (recordButton) {
    recordButton.disabled = false;
    const recordLabel = recordButton.querySelector("span");
    if (recordLabel) recordLabel.textContent = t("Record location");
  }
}

function recordPickerLocation(button) {
  const errorMessage = document.getElementById("location-form-error");
  const form = document.getElementById("location-form");
  const recordId = form?.elements.id.value || "";
  const requestId = ++locationGeoRequestId;
  const label = button.querySelector("span")?.textContent || button.textContent;
  const setLabel = (text) => {
    const span = button.querySelector("span");
    if (span) span.textContent = text;
    else button.textContent = text;
  };
  clearMapSearch();
  if (!navigator.geolocation) {
    if (errorMessage) errorMessage.textContent = t("Location is not available on this device.");
    return;
  }
  const finish = () => {
    button.disabled = false;
    setLabel(label);
  };
  const isCurrent = () => requestId === locationGeoRequestId
    && !document.getElementById("location-modal")?.classList.contains("is-hidden")
    && document.getElementById("location-form")?.elements.id.value === recordId;
  if (errorMessage) errorMessage.textContent = "";
  resetGeoControls();
  button.disabled = true;
  setLabel(t("Recording…"));
  navigator.geolocation.getCurrentPosition((position) => {
    if (!isCurrent()) return;
    finish();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    if (!isInsideRomania(latitude, longitude)) {
      setMapStatus(t("Choose a point inside Romania."));
      return;
    }
    focusPickerMap(latitude, longitude, 16);
    setPickerPoint(latitude, longitude);
    showToast(t("Position recorded."));
  }, () => {
    if (!isCurrent()) return;
    finish();
    if (errorMessage) errorMessage.textContent = t("Could not record your position. Allow location access and try again.");
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
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
  window.fetch(`/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`, { headers: { Accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (requestId !== osmRequestId) return;
      const suggestion = osmPlaceName(data).trim();
      if (suggestion) {
        const current = nameInput.value.trim();
        if (!current) nameInput.value = suggestion;
        else if (current.toLocaleLowerCase() !== suggestion.toLocaleLowerCase()) {
          osmSuggestion = suggestion;
          label.textContent = t("OpenStreetMap calls this “{name}”.", { name: suggestion });
          box.removeAttribute("hidden");
        }
      }
      const descriptionInput = document.getElementById("location-form")?.elements.description;
      if (descriptionInput && !descriptionInput.value.trim()) {
        const generated = osmDescription(data);
        if (generated) descriptionInput.value = generated;
      }
      applyOsmCategory(data);
    })
    .catch(() => {});
}

function clearPickerPoint() {
  osmRequestId++;
  locationGeoRequestId++;
  resetGeoControls();
  hideOsmSuggestion();
  if (pickerMarker && pickerMap) pickerMap.removeLayer(pickerMarker);
  pickerMarker = null;
  pickerLastPoint = null;
  const form = document.getElementById("location-form");
  if (form?.elements?.latitude) form.elements.latitude.value = "";
  if (form?.elements?.longitude) form.elements.longitude.value = "";
  const label = document.getElementById("location-coords-label");
  if (label) label.textContent = t("No point selected - click the map to place it.");
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
filterRows("users-search", "#users-admins-list .user-row", [".user-cell", ".user-email", ".status-tag"]);
filterRows("activity-search", "#page-activity .activity-row", [".activity-change", ".user-cell"]);

if (passwordResetToken) {
  try { sessionStorage.removeItem("aradlens-admin-auth"); } catch {}
  document.documentElement.classList.remove("is-restoring");
  loginView.classList.remove("is-hidden");
  appView.classList.add("is-hidden");
  errorView?.classList.add("is-hidden");
  showAuthView("reset");
} else if (!errorVariantFromHash() && sessionStorage.getItem("aradlens-admin-auth") === "true") {
  /* One request, not two in a chain. The accounts list is a background
     refresh that setAuthenticated starts anyway, so the only thing worth
     waiting for is the answer to "who am I". When that answer cannot
     arrive because the network or the API is down, show the recovery
     surface instead of dropping the administrator on the sign-in form. */
  const retrySession = async () => {
    const admin = await apiRequest("/api/auth/me");
    setAuthenticated(true, admin);
  };
  apiRequest("/api/auth/me")
    .then((admin) => setAuthenticated(true, admin))
    .catch((error) => {
      if (error?.offline || !navigator.onLine) {
        showErrorScreen({ variant: "offline", demo: false, retry: retrySession });
      } else if (Number(error?.status) >= 500) {
        showErrorScreen({ variant: "500", demo: false, retry: retrySession });
      } else {
        setAuthenticated(false);
      }
    });
}

let adminsRequestId = 0;
let cachedAdmins = [];

function roleLabel(role) {
  const value = String(role || "").toLowerCase();
  if (value === "superadmin") return t("Superadmin");
  if (value === "admin" || value === "administrator") return t("Admin");
  return role ? String(role) : t("Admin");
}

function currentAdminId() {
  const id = Number(authenticatedAdmin?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try {
    return date.toLocaleString(currentLanguage === "ro" ? "ro-RO" : "en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
}

function buildRosterRow(admin) {
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
  role.textContent = roleLabel(admin.role);
  const status = document.createElement("span");
  status.className = `status-tag ${admin.is_active ? "status-live" : "status-muted"}`;
  status.dataset.value = admin.is_active ? "Active" : "Inactive";
  status.textContent = admin.is_active ? t("Active") : t("Inactive");
  userRow.append(userCell, email, role, status);
  return userRow;
}

function buildAccessRow(admin, selfId) {
  const row = document.createElement("div");
  row.className = "user-row access-row";
  const isSelf = selfId !== null && Number(admin.id) === selfId;

  const identity = document.createElement("span");
  identity.className = "user-cell";
  const name = document.createElement("strong");
  name.textContent = admin.username;
  identity.append(name);
  if (isSelf) {
    const badge = document.createElement("span");
    badge.className = "access-badge";
    badge.textContent = t("You");
    identity.append(badge);
  }
  const email = document.createElement("span");
  email.className = "user-email";
  email.textContent = admin.email;
  identity.append(email);
  row.append(identity);

  const role = document.createElement("span");
  role.className = "access-role-text";
  role.textContent = roleLabel(admin.role);
  row.append(role);

  const access = document.createElement("span");
  access.className = `status-tag ${admin.is_active ? "status-live" : "status-muted"}`;
  access.dataset.value = admin.is_active ? "Active" : "Inactive";
  access.textContent = admin.is_active ? t("Active") : t("Inactive");
  row.append(access);

  const actions = document.createElement("span");
  actions.className = "access-actions";
  const edit = document.createElement("button");
  edit.className = "button button-soft";
  edit.type = "button";
  edit.textContent = t("Edit access");
  edit.disabled = isSelf;
  edit.title = isSelf ? t("You cannot change your own access.") : "";
  edit.addEventListener("click", () => openAdminModal(admin));
  const remove = document.createElement("button");
  remove.className = "button button-danger";
  remove.type = "button";
  remove.textContent = t("Delete");
  remove.disabled = isSelf;
  remove.title = isSelf ? t("You cannot remove your own account.") : "";
  remove.addEventListener("click", () => confirmRemoveAdmin(admin));
  actions.append(edit, remove);
  row.append(actions);

  return row;
}

async function loadAdmins() {
  if (!authenticatedAdmin) return;
  const requestId = ++adminsRequestId;
  const message = document.getElementById("admins-message");
  const list = document.getElementById("admins-list");
  const summary = document.getElementById("admins-summary");
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
    if (summary) summary.textContent = [counted(admins.length, "administrator", "administrators"), counted(activeCount, "active account", "active accounts"), counted(superCount, "superadmin", "superadmins")].join(" · ");
    const selfId = currentAdminId();
    for (const admin of admins) {
      if (list) list.append(buildAccessRow(admin, selfId));
      if (usersList) usersList.append(buildRosterRow(admin));
    }
    const resultMessage = admins.length ? counted(admins.length, "administrator", "administrators") : t("No administrators found.");
    if (message) setMessage(message, "");
    if (usersMessage) setMessage(usersMessage, resultMessage);
  } catch (error) {
    const resultMessage = t("{message} Click Refresh to try again.", { message: error.message });
    if (message) message.textContent = resultMessage;
    if (usersMessage) usersMessage.textContent = resultMessage;
  }
}

function confirmRemoveAdmin(admin) {
  openConfirm({
    title: t("Delete administrator"),
    text: t("The account is deleted straight away. It cannot be brought back."),
    detail: `${admin.username} · ${admin.email}`,
    confirmLabel: t("Delete account"),
    onConfirm: async () => {
      try {
        await apiRequest(`/api/admins/${admin.id}`, { method: "DELETE" });
        showToast("Administrator deleted.", "success");
        await loadAdmins();
      } catch (error) {
        setMessage(document.getElementById("admins-message"), error.message);
      }
    },
  });
}

document.getElementById("admins-refresh").addEventListener("click", loadAdmins);
document.getElementById("users-refresh")?.addEventListener("click", loadAdmins);

/* ---- Password reset requests ---- */
let resetRequestsRequestId = 0;

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch {
    return false;
  }
}

async function generateResetLink(request, actions) {
  const button = actions.querySelector("button");
  if (button) {
    button.disabled = true;
    button.textContent = t("Generating…");
  }
  try {
    const result = await apiRequest(`/api/auth/password-reset-requests/${request.admin_id}`, { method: "POST" });
    actions.replaceChildren();
    const input = document.createElement("input");
    input.type = "text";
    input.readOnly = true;
    input.className = "reset-link-input";
    input.value = result.reset_link;
    input.setAttribute("aria-label", t("Reset link"));
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "button button-dark";
    copy.textContent = t("Copy");
    copy.addEventListener("click", async () => {
      const ok = await copyText(result.reset_link);
      showToast(ok ? t("Reset link copied.") : t("Could not copy the link."), ok ? "success" : "error");
    });
    actions.append(input, copy);
    showToast(t("Reset link generated."), "success");
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = t("Generate link");
    }
    showToast(error.message || t("Could not generate the reset link."), "error");
  }
}

function buildResetRow(request) {
  const row = document.createElement("div");
  row.className = "user-row resets-row";

  const user = document.createElement("span");
  user.className = "user-cell";
  const name = document.createElement("strong");
  name.textContent = request.username;
  user.append(name);

  const email = document.createElement("span");
  email.className = "user-email";
  email.textContent = request.email;

  const requested = document.createElement("span");
  requested.textContent = formatDateTime(request.requested_at);

  const status = document.createElement("span");
  status.className = `status-tag ${request.expired ? "status-muted" : "status-live"}`;
  status.dataset.value = request.expired ? "Inactive" : "Active";
  status.textContent = request.expired ? t("Expired") : t("Pending");

  const actions = document.createElement("span");
  actions.className = "reset-actions";
  const generate = document.createElement("button");
  generate.type = "button";
  generate.className = "button button-soft";
  generate.textContent = t("Generate link");
  generate.addEventListener("click", () => generateResetLink(request, actions));
  actions.append(generate);

  row.append(user, email, requested, status, actions);
  return row;
}

async function loadPasswordResetRequests() {
  if (!authenticatedAdmin || !isSuperadminAccount()) return;
  const requestId = ++resetRequestsRequestId;
  const list = document.getElementById("resets-list");
  const message = document.getElementById("resets-message");
  const summary = document.getElementById("resets-summary");
  if (message) setMessage(message, "Loading password reset requests…");
  list?.replaceChildren();
  try {
    const requests = await apiRequest("/api/auth/password-reset-requests");
    if (requestId !== resetRequestsRequestId) return;
    if (!Array.isArray(requests)) throw new Error("The API returned an invalid password reset list.");
    if (summary) summary.textContent = requests.length ? counted(requests.length, "pending request", "pending requests") : t("No pending password reset requests.");
    if (message) setMessage(message, "");
    if (!requests.length) {
      if (list) {
        const empty = document.createElement("div");
        empty.className = "user-row resets-row resets-empty";
        empty.textContent = t("No password reset requests yet.");
        list.append(empty);
      }
      return;
    }
    requests.forEach((request) => list?.append(buildResetRow(request)));
  } catch (error) {
    if (message) message.textContent = t("{message} Click Refresh to try again.", { message: error.message });
  }
}

document.getElementById("resets-refresh")?.addEventListener("click", loadPasswordResetRequests);

/* ---- Edit access ---- */
let adminModalOpener = null;
function openAdminModal(admin) {
  const modal = document.getElementById("admin-modal");
  const form = document.getElementById("admin-form");
  if (!modal || !form) return;
  adminModalOpener = document.activeElement;
  form.elements.id.value = admin.id;
  form.elements.role.value = String(admin.role || "").toLowerCase() === "superadmin" ? "superadmin" : "admin";
  form.elements.is_active.checked = Boolean(admin.is_active);
  const title = document.getElementById("admin-modal-title");
  if (title) title.textContent = t("Edit access");
  const subtitle = document.getElementById("admin-modal-subtitle");
  if (subtitle) subtitle.textContent = `${admin.username} · ${admin.email}`;
  const error = document.getElementById("admin-form-error");
  if (error) error.textContent = "";
  modal.classList.remove("is-hidden");
  form.elements.role.focus();
}

function closeAdminModal() {
  document.getElementById("admin-modal")?.classList.add("is-hidden");
  if (adminModalOpener && document.contains(adminModalOpener)) adminModalOpener.focus();
  adminModalOpener = null;
}

document.getElementById("admin-modal-close")?.addEventListener("click", closeAdminModal);
document.getElementById("admin-cancel")?.addEventListener("click", closeAdminModal);
document.querySelector("#admin-modal [data-close-admin-modal]")?.addEventListener("click", closeAdminModal);
document.getElementById("admin-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const errorMessage = document.getElementById("admin-form-error");
  const id = form.elements.id.value;
  if (!id) {
    setMessage(errorMessage, "Select an administrator to edit access.");
    return;
  }
  const payload = { role: form.elements.role.value, is_active: form.elements.is_active.checked };
  setMessage(errorMessage, "");
  button.disabled = true;
  try {
    await apiRequest(`/api/admins/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    closeAdminModal();
    await loadAdmins();
    showToast("Administrator access updated.", "success");
  } catch (error) {
    setMessage(errorMessage, error.message);
  } finally {
    button.disabled = false;
  }
});

/* ---- Invite codes ---- */
let invitesRequestId = 0;
function inviteState(invite) {
  if (invite.is_revoked) return { label: t("Revoked"), className: "status-revoked" };
  if (invite.used_at) return { label: t("Used"), className: "status-muted" };
  if (invite.expires_at && new Date(invite.expires_at).getTime() < Date.now()) return { label: t("Expired"), className: "status-muted" };
  return { label: t("Unused"), className: "status-live" };
}

function buildInviteLine(invite) {
  const state = inviteState(invite);
  const line = document.createElement("div");
  line.className = "invite-line";

  const top = document.createElement("div");
  top.className = "invite-line-top";
  const code = document.createElement("code");
  code.className = "invite-code";
  code.textContent = invite.code;
  code.title = invite.code;
  const tag = document.createElement("span");
  tag.className = `status-tag ${state.className}`;
  tag.textContent = state.label;
  top.append(code, tag);
  line.append(top);

  const meta = document.createElement("p");
  meta.className = "invite-line-meta";
  meta.textContent = `${roleLabel(invite.role)} · ${t("expires")} ${formatDateTime(invite.expires_at)}`;
  line.append(meta);

  const actions = document.createElement("div");
  actions.className = "invite-line-actions";
  const copy = document.createElement("button");
  copy.className = "button button-soft";
  copy.type = "button";
  copy.textContent = t("Copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(invite.code);
      showToast("Invite code copied.", "success");
    } catch {
      showToast(invite.code, "error");
    }
  });
  actions.append(copy);
  const revoke = document.createElement("button");
  revoke.className = "button button-danger";
  revoke.type = "button";
  revoke.textContent = t("Revoke");
  revoke.disabled = Boolean(invite.is_revoked) || Boolean(invite.used_at);
  revoke.title = revoke.disabled ? t("This invite can no longer be revoked.") : "";
  revoke.addEventListener("click", () => confirmRevokeInvite(invite));
  actions.append(revoke);
  line.append(actions);

  return line;
}

function confirmRevokeInvite(invite) {
  openConfirm({
    title: t("Revoke invite code"),
    text: t("The code stops working straight away. It cannot be brought back."),
    detail: invite.code,
    confirmLabel: t("Revoke code"),
    onConfirm: async () => {
      try {
        await apiRequest(`/api/invites/${invite.id}`, { method: "DELETE" });
        showToast("Invite revoked.", "success");
        await loadInvites();
      } catch (error) {
        setMessage(document.getElementById("invites-message"), error.message);
      }
    },
  });
}

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
    for (const invite of invites) list.append(buildInviteLine(invite));
    setMessage(message, invites.length ? counted(invites.length, "invite code", "invite codes") : "No invites found.");
  } catch (error) {
    message.textContent = t("{message} Click Refresh to try again.", { message: error.message });
  }
}

/* Create one code, show it once, let the person copy it away. */
let inviteModalOpener = null;
function openInviteModal() {
  const modal = document.getElementById("invite-modal");
  const form = document.getElementById("invite-form");
  if (!modal || !form) return;
  inviteModalOpener = document.activeElement;
  form.reset();
  form.elements.expires_in_minutes.value = "1440";
  const error = document.getElementById("invite-form-error");
  if (error) error.textContent = "";
  const created = document.getElementById("invite-created");
  if (created) created.hidden = true;
  modal.classList.remove("is-hidden");
  form.elements.role.focus();
}

function closeInviteModal() {
  document.getElementById("invite-modal")?.classList.add("is-hidden");
  if (inviteModalOpener && document.contains(inviteModalOpener)) inviteModalOpener.focus();
  inviteModalOpener = null;
}

document.getElementById("admins-create-invite")?.addEventListener("click", openInviteModal);
document.getElementById("invite-modal-close")?.addEventListener("click", closeInviteModal);
document.getElementById("invite-cancel")?.addEventListener("click", closeInviteModal);
document.querySelector("#invite-modal [data-close-invite-modal]")?.addEventListener("click", closeInviteModal);
document.getElementById("invite-created-copy")?.addEventListener("click", async (event) => {
  const code = document.getElementById("invite-created-code")?.textContent || "";
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    showToast("Invite code copied.", "success");
  } catch {
    showToast(code, "error");
  }
});
document.getElementById("invite-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const errorMessage = document.getElementById("invite-form-error");
  setMessage(errorMessage, "");
  button.disabled = true;
  try {
    const invite = await apiRequest("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: form.elements.role.value,
        expires_in_minutes: Number(form.elements.expires_in_minutes.value),
      }),
    });
    const code = document.getElementById("invite-created-code");
    if (code) code.textContent = invite?.code || "";
    const created = document.getElementById("invite-created");
    if (created) created.hidden = false;
    showToast("Invite created.", "success");
  } catch (error) {
    setMessage(errorMessage, error.message);
  } finally {
    button.disabled = false;
  }
});

/* See every code, copy one, revoke one. */
let invitesModalOpener = null;
function openInvitesModal() {
  const modal = document.getElementById("invites-modal");
  if (!modal) return;
  invitesModalOpener = document.activeElement;
  modal.classList.remove("is-hidden");
  loadInvites();
}

function closeInvitesModal() {
  document.getElementById("invites-modal")?.classList.add("is-hidden");
  if (invitesModalOpener && document.contains(invitesModalOpener)) invitesModalOpener.focus();
  invitesModalOpener = null;
}

document.getElementById("admins-invites")?.addEventListener("click", openInvitesModal);
document.getElementById("invites-modal-close")?.addEventListener("click", closeInvitesModal);
document.getElementById("invites-modal-done")?.addEventListener("click", closeInvitesModal);
document.querySelector("#invites-modal [data-close-invites-modal]")?.addEventListener("click", closeInvitesModal);
document.getElementById("invites-refresh")?.addEventListener("click", loadInvites);

/* ---- Password ---- */
let passwordModalOpener = null;
function openPasswordModal() {
  const modal = document.getElementById("password-modal");
  const form = document.getElementById("change-password-form");
  if (!modal || !form) return;
  passwordModalOpener = document.activeElement;
  form.reset();
  const error = document.getElementById("change-password-error");
  if (error) error.textContent = "";
  modal.classList.remove("is-hidden");
  document.getElementById("old-password")?.focus();
}

function closePasswordModal() {
  document.getElementById("password-modal")?.classList.add("is-hidden");
  if (passwordModalOpener && document.contains(passwordModalOpener)) passwordModalOpener.focus();
  passwordModalOpener = null;
}

document.getElementById("open-password-modal")?.addEventListener("click", openPasswordModal);
document.getElementById("password-modal-close")?.addEventListener("click", closePasswordModal);
document.getElementById("password-modal-cancel")?.addEventListener("click", closePasswordModal);
document.querySelector("#password-modal [data-close-password-modal]")?.addEventListener("click", closePasswordModal);

function resetLocationForm() {
  const form = document.getElementById("location-form");
  if (!form) return;
  form.reset();
  form.elements.id.value = "";
  const title = document.getElementById("location-modal-title");
  if (title) title.textContent = t("Add location");
  document.getElementById("location-form-error").textContent = "";
  const categoryHint = document.getElementById("location-category-hint");
  if (categoryHint) categoryHint.textContent = "";
  pendingLocationPhoto = null;
  if (pendingPhotoPreviewUrl) {
    URL.revokeObjectURL(pendingPhotoPreviewUrl);
    pendingPhotoPreviewUrl = "";
  }
  setLocationPhotoStatus("");
  locationPreviewIndex = 0;
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
  const categoryName = location.category?.name || "";
  const imageIds = Array.isArray(location.images) ? location.images : [];
  const card = document.createElement("article");
  card.className = "point-card";
  card.dataset.live = "true";
  card.dataset.drawing = kind.drawing;
  card.dataset.hasPhoto = hasPhoto(location) ? "true" : "false";
  card.dataset.hasText = String(location.description).trim() ? "true" : "false";
  card.dataset.category = location.category?.id === undefined || location.category?.id === null ? "" : String(location.category.id);
  const categoryChip = categoryName ? `<span class="point-category" data-value="${escapeHtml(categoryName)}">${escapeHtml(categoryName)}</span>` : "";
  const photo = imageIds.length ? `<img class="point-photo" src="${imageFileUrl(imageIds[0])}" alt="" loading="lazy" />` : "";
  if (photo) card.classList.add("has-photo");
  card.innerHTML =
    `<div class="point-image">${photo}<svg class="point-drawing" viewBox="0 0 120 80" aria-hidden="true"><use href="#draw-${kind.drawing}"></use></svg><span class="point-badge">P</span>${categoryChip}</div>` +
    `<div class="point-body"><div><h3>${escapeHtml(location.name)}</h3><p>${escapeHtml(location.description || "—")}</p></div><span class="status-tag status-live" data-value="Published">${escapeHtml(t("Live"))}</span></div>` +
    `<div class="point-meta"><span>#${location.id} · ${escapeHtml(coordinateLabel(location))}</span></div>`;
  const open = document.createElement("button");
  open.className = "card-open";
  open.type = "button";
  open.textContent = "↗";
  open.setAttribute("aria-label", t("Edit {name}", { name: location.name }));
  open.addEventListener("click", () => openLocationModal(location.id));
  card.querySelector(".point-meta").append(open);
  card.addEventListener("click", (event) => {
    if (event.target.closest("button, a")) return;
    openLocationModal(location.id);
  });
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
    locationsLoaded = true;
    for (const location of locations) {
      seedLocationImages(location.id, location.images);
      grid.append(renderLocationCard(location));
    }
    filterLiveCards();
    /* The rail shows the live count, and shows nothing at all until it is
       known — a made-up number in the navigation is worse than no number. */
    const navCount = document.querySelector('.nav-item[data-page="points"] .nav-count');
    if (navCount) {
      navCount.textContent = String(locations.length);
      navCount.classList.remove("is-hidden");
    }
    message.textContent = locations.length ? t("{n} location(s)", { n: locations.length }) : t("No locations found.");
    /* The Attention page reads the same list, so it has to be redrawn when
       the locations arrive. Without this, opening Attention before the
       Important points page leaves it empty. */
    if (currentPage === "attention") renderAttention();
  } catch (error) {
    message.textContent = t("{message} Click Refresh to try again.", { message: error.message });
  }
}

let locationModalOpener = null;
let categoryModalOpener = null;
let categoriesRequestId = 0;
let cachedCategories = [];

function categorySelect() {
  return document.getElementById("location-category");
}

function normalizeCategoryName(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categoryWords(value) {
  return normalizeCategoryName(value).split(" ").filter(Boolean);
}

function containsCategoryPhrase(words, phrase) {
  const parts = phrase.split(" ").filter(Boolean);
  if (!parts.length || words.length < parts.length) return false;
  for (let index = 0; index + parts.length <= words.length; index++) {
    let matched = true;
    for (let offset = 0; offset < parts.length; offset++) {
      if (words[index + offset] !== parts[offset]) { matched = false; break; }
    }
    if (matched) return true;
  }
  return false;
}

const osmCategoryHints = {
  biserici: ["place of worship", "church", "cathedral", "chapel", "monastery", "mosque", "synagogue", "parish", "biserica", "biserici", "catedrala", "capela", "manastirea"],
  muzee: ["museum", "muzee", "muzeu", "muzeul"],
  "galerii de arta": ["gallery", "art gallery", "galerie", "galeria", "galerii"],
  monumente: ["monument", "memorial", "ruins", "castle", "fortress", "archaeological site", "tomb", "monumentul", "monumente", "cetatea"],
  "cladiri istorice": ["historic", "heritage", "town hall", "townhall", "palace", "manor", "old town", "neoclassical", "architecture", "cladirea", "cladirile", "palatul", "primaria"],
  parcuri: ["park", "parkland", "garden", "nature reserve", "parc", "parcuri", "parcul", "gradina"],
  piete: ["marketplace", "market", "bazaar", "fair", "piata", "piete", "pietei"],
  poduri: ["bridge", "viaduct", "pod", "poduri", "podul"],
  restaurante: ["restaurant", "fast food", "pizza", "food court", "restaurante", "restaurantul"],
  cafenele: ["cafe", "coffee shop", "bar", "pub", "bistro", "tea house", "cafenele", "cafenea", "cafeneaua"],
  statui: ["statue", "sculpture", "artwork", "statui", "statuia", "statuie"],
  turnuri: ["tower", "lighthouse", "minaret", "watchtower", "turn", "turnul", "turnuri"],
};

function osmSuggestedCategory(data) {
  if (!data || !cachedCategories.length) return null;
  const typeWords = categoryWords(`${data.type || ""} ${data.addresstype || ""}`);
  const nameWords = categoryWords(`${data.name || ""} ${Object.values(data.extratags || {}).join(" ")}`);
  const addressWords = categoryWords(Object.values(data.address || {}).join(" "));
  const kindWords = categoryWords(`${data.category || ""}`);
  let best = null;
  let bestScore = 0;
  for (const category of cachedCategories) {
    const name = normalizeCategoryName(category.name);
    const hints = osmCategoryHints[name] || [];
    let score = 0;
    for (const hint of hints) {
      if (containsCategoryPhrase(typeWords, hint)) score = Math.max(score, 4);
      else if (containsCategoryPhrase(nameWords, hint)) score = Math.max(score, 3);
      else if (containsCategoryPhrase(addressWords, hint)) score = Math.max(score, 2);
      else if (containsCategoryPhrase(kindWords, hint)) score = Math.max(score, 1);
    }
    if (name && containsCategoryPhrase(typeWords, name)) score = Math.max(score, 3);
    else if (name && containsCategoryPhrase(nameWords, name)) score = Math.max(score, 2);
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best;
}

function applyOsmCategory(data) {
  const select = categorySelect();
  if (!select) return;
  const hint = document.getElementById("location-category-hint");
  const suggested = osmSuggestedCategory(data);
  if (!suggested) {
    if (hint && !select.value) hint.textContent = "";
    return;
  }
  if (select.value) return;
  select.value = String(suggested.id);
  if (hint) hint.textContent = `${t("OpenStreetMap suggests")} “${suggested.name}”.`;
}

async function loadCategories(force = false) {
  if (!force && cachedCategories.length) return cachedCategories;
  const requestId = ++categoriesRequestId;
  const categories = await apiRequest("/api/categories");
  if (requestId !== categoriesRequestId) return cachedCategories;
  cachedCategories = Array.isArray(categories) ? categories.filter((entry) => entry && entry.id !== undefined && entry.name) : [];
  renderCategoryOptions();
  renderCategoryList();
  return cachedCategories;
}

function renderCategoryOptions(selectedId) {
  const select = categorySelect();
  if (!select) return;
  const current = selectedId === undefined ? select.value : selectedId;
  select.replaceChildren();
  const empty = document.createElement("option");
  empty.value = "";
  empty.textContent = t("No category");
  select.append(empty);
  for (const category of cachedCategories) {
    const option = document.createElement("option");
    option.value = String(category.id);
    option.textContent = category.name;
    select.append(option);
  }
  select.value = current === undefined || current === null ? "" : String(current);
}

function renderCategoryList() {
  const list = document.getElementById("category-list");
  if (!list) return;
  list.replaceChildren();
  if (!cachedCategories.length) {
    const empty = document.createElement("li");
    empty.className = "tour-empty";
    empty.textContent = t("No categories yet. Add the first one.");
    list.append(empty);
    return;
  }
  for (const category of cachedCategories) {
    const row = document.createElement("li");
    row.className = "category-row";
    const name = document.createElement("span");
    name.className = "category-name";
    name.textContent = category.name;
    const actions = document.createElement("span");
    actions.className = "category-actions";
    const rename = document.createElement("button");
    rename.type = "button";
    rename.className = "category-action";
    rename.textContent = t("Rename");
    rename.setAttribute("aria-label", t("Rename {name}", { name: category.name }));
    rename.addEventListener("click", () => startCategoryRename(category, row));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "category-action is-danger";
    remove.textContent = t("Delete");
    remove.setAttribute("aria-label", t("Delete {name}", { name: category.name }));
    remove.addEventListener("click", () => removeCategory(category));
    actions.append(rename, remove);
    row.append(name, actions);
    list.append(row);
  }
}

function startCategoryRename(category, row) {
  row.classList.add("is-editing");
  row.replaceChildren();
  const input = document.createElement("input");
  input.type = "text";
  input.className = "category-rename-input";
  input.value = category.name;
  input.maxLength = 100;
  input.setAttribute("aria-label", t("Rename {name}", { name: category.name }));
  const actions = document.createElement("span");
  actions.className = "category-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "button button-dark";
  save.textContent = t("Save");
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "button button-soft";
  cancel.textContent = t("Cancel");
  actions.append(save, cancel);
  const commit = async () => {
    const name = input.value.trim();
    if (!name) {
      setCategoryError("Give the category a name.");
      input.focus();
      return;
    }
    save.disabled = true;
    try {
      await apiRequest(`/api/categories/${category.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
      await loadCategories(true);
      showToast(t("Category renamed: {name}", { name }), "success");
    } catch (error) {
      setCategoryError(error.message);
    } finally {
      save.disabled = false;
    }
  };
  save.addEventListener("click", commit);
  cancel.addEventListener("click", () => renderCategoryList());
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") { event.preventDefault(); commit(); }
    if (event.key === "Escape") renderCategoryList();
  });
  row.append(input, actions);
  input.focus();
  input.select();
}

function setCategoryError(message) {
  const element = document.getElementById("category-modal-error");
  if (element) element.textContent = message || "";
}

async function createCategory(name) {
  const created = await apiRequest("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  await loadCategories(true);
  showToast(t("Category created: {name}", { name: created?.name || name }), "success");
  return created;
}

async function removeCategory(category) {
  if (!window.confirm(`Delete category “${category.name}”? Locations that use it lose the category.`)) return;
  try {
    await apiRequest(`/api/categories/${category.id}`, { method: "DELETE" });
    await loadCategories(true);
    showToast("Category deleted.", "success");
  } catch (error) {
    setCategoryError(error.message);
  }
}

function openCategoryModal() {
  const modal = document.getElementById("category-modal");
  if (!modal) return;
  categoryModalOpener = document.activeElement;
  setCategoryError("");
  const input = document.getElementById("category-name-input");
  if (input) input.value = "";
  renderCategoryList();
  modal.classList.remove("is-hidden");
  loadCategories(true).then(() => input?.focus()).catch((error) => setCategoryError(error.message));
}

function closeCategoryModal() {
  document.getElementById("category-modal")?.classList.add("is-hidden");
  if (categoryModalOpener && document.contains(categoryModalOpener)) categoryModalOpener.focus();
  categoryModalOpener = null;
}

document.getElementById("categories-manage-button")?.addEventListener("click", openCategoryModal);
document.getElementById("location-category-manage")?.addEventListener("click", openCategoryModal);
document.getElementById("category-modal-close")?.addEventListener("click", closeCategoryModal);
document.getElementById("category-modal-done")?.addEventListener("click", closeCategoryModal);
document.querySelector("#category-modal [data-close-category-modal]")?.addEventListener("click", closeCategoryModal);
document.getElementById("category-create")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const input = document.getElementById("category-name-input");
  const name = input?.value.trim() || "";
  if (!name) {
    setCategoryError("Give the category a name.");
    input?.focus();
    return;
  }
  setCategoryError("");
  button.disabled = true;
  try {
    const created = await createCategory(name);
    if (input) input.value = "";
    const select = categorySelect();
    if (select && created?.id) select.value = String(created.id);
    input?.focus();
  } catch (error) {
    setCategoryError(error.message);
  } finally {
    button.disabled = false;
  }
});
document.getElementById("category-name-input")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  document.getElementById("category-create")?.click();
});
document.getElementById("location-category")?.addEventListener("change", () => {
  const hint = document.getElementById("location-category-hint");
  if (hint) hint.textContent = "";
});
function openLocationModal(id) {
  locationGeoRequestId++;
  const modal = document.getElementById("location-modal");
  const form = document.getElementById("location-form");
  if (!modal || !form) return;
  resetGeoControls();
  const requestId = ++locationModalRequestId;
  locationModalOpener = document.activeElement;
  const errorMessage = document.getElementById("location-form-error");
  errorMessage.textContent = "";
  const categoryHint = document.getElementById("location-category-hint");
  if (categoryHint) categoryHint.textContent = "";
  const deleteButton = document.getElementById("location-delete");
  const showPicker = (latitude, longitude, zoom) => {
    modal.classList.remove("is-hidden");
    clearMapSearch();
    document.getElementById("location-name")?.focus();
    window.requestAnimationFrame(() => {
      if (!ensurePickerMap()) {
        errorMessage.textContent = t("The map could not be loaded. Check your connection and try again.");
        return;
      }
      renderPickerPlaces(form.elements.id.value);
      const hasPoint = usableCoordinate(latitude, longitude) && isWithinRomaniaBounds(latitude, longitude);
      focusPickerMap(hasPoint ? latitude : null, hasPoint ? longitude : null, zoom || 15);
      if (hasPoint) setPickerPoint(latitude, longitude);
      else clearPickerPoint();
    });
  };
  loadCategories().catch(() => {});
  if (id == null) {
    form.reset();
    form.elements.id.value = "";
    renderCategoryOptions("");
    setLocationImages("", []);
    pendingLocationPhoto = null;
    if (pendingPhotoPreviewUrl) {
      URL.revokeObjectURL(pendingPhotoPreviewUrl);
      pendingPhotoPreviewUrl = "";
    }
    setLocationPhotoStatus("");
    locationPreviewIndex = 0;
    updateImagePreview();
    document.getElementById("location-modal-title").textContent = t("Add location");
    if (deleteButton) deleteButton.hidden = true;
    clearPickerPoint();
    showPicker(null, null);
    return;
  }
  const message = document.getElementById("locations-message");
  Promise.all([apiRequest(`/api/locations/${id}`), loadCategories().catch(() => [])]).then(([record]) => {
    if (requestId !== locationModalRequestId) return;
    form.elements.id.value = record.id;
    form.elements.name.value = record.name || "";
    form.elements.description.value = record.description || "";
    setLocationImages(record.id, record.images);
    renderCategoryOptions(record.category?.id === undefined || record.category?.id === null ? "" : record.category.id);
    locationPreviewIndex = 0;
    updateImagePreview();
    document.getElementById("location-modal-title").textContent = t("Edit location #{id}", { id: record.id });
    if (deleteButton) deleteButton.hidden = false;
    clearPickerPoint();
    showPicker(record.latitude, record.longitude);
  }).catch((error) => {
    if (requestId !== locationModalRequestId) return;
    if (message) message.textContent = error.message;
  });
}

function closeLocationModal() {
  document.getElementById("location-modal")?.classList.add("is-hidden");
  locationGeoRequestId++;
  locationModalRequestId++;
  clearMapSearch();
  if (locationModalOpener && document.contains(locationModalOpener)) locationModalOpener.focus();
  locationModalOpener = null;
}

document.getElementById("invites-refresh")?.addEventListener("click", loadInvites);
document.getElementById("locations-refresh")?.addEventListener("click", loadLocations);
document.getElementById("osm-suggest-apply")?.addEventListener("click", () => {
  const form = document.getElementById("location-form");
  if (form && osmSuggestion) form.elements.name.value = osmSuggestion;
  hideOsmSuggestion();
});

/* Images live in their own table upstream. A location carries `images` as an
   array of image ids; every id is served as a file through
   `/api/locations/images/:id`, so the admin app never links to the API
   origin directly (the page CSP only allows same-origin images). */
const locationImages = new Map();

function imageFileUrl(imageId) {
  return `/api/locations/images/${encodeURIComponent(imageId)}`;
}
function currentLocationId() {
  return document.getElementById("location-form")?.elements.id.value || "";
}
function locationImageIds(locationId) {
  const key = String(locationId ?? "");
  if (!key) return [];
  return locationImages.get(key) || [];
}
function setLocationImages(locationId, ids) {
  const key = String(locationId ?? "");
  if (!key) return;
  const list = Array.isArray(ids) ? ids.map(Number).filter((value) => Number.isFinite(value)) : [];
  locationImages.set(key, list);
}
function seedLocationImages(locationId, ids) {
  const key = String(locationId ?? "");
  if (!key || locationImages.has(key)) return;
  const list = Array.isArray(ids) ? ids.map(Number).filter((value) => Number.isFinite(value)) : [];
  locationImages.set(key, list);
}
function addLocationImage(locationId, imageId) {
  const key = String(locationId ?? "");
  const id = Number(imageId);
  if (!key || !Number.isFinite(id)) return;
  const list = locationImages.get(key) || [];
  if (!list.includes(id)) locationImages.set(key, [...list, id]);
}
function removeLocationImage(locationId, imageId) {
  const key = String(locationId ?? "");
  const id = Number(imageId);
  locationImages.set(key, (locationImages.get(key) || []).filter((value) => value !== id));
}
function locationPreviewIds() {
  return locationImageIds(currentLocationId());
}
function moveLocationPreview(delta) {
  const ids = locationPreviewIds();
  if (ids.length < 2) return;
  locationPreviewIndex = (locationPreviewIndex + delta + ids.length) % ids.length;
  updateImagePreview();
}
function renderLocationPreviewDots(ids) {
  const dots = document.getElementById("location-image-dots");
  if (!dots) return;
  dots.replaceChildren();
  if (ids.length < 2) {
    dots.hidden = true;
    return;
  }
  dots.hidden = false;
  ids.forEach((imageId, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "image-carousel-dot";
    dot.setAttribute("aria-label", t("Show photo {n}", { n: index + 1 }));
    dot.setAttribute("aria-current", String(index === locationPreviewIndex));
    dot.addEventListener("click", () => {
      locationPreviewIndex = index;
      updateImagePreview();
    });
    dots.append(dot);
  });
}
function updateImagePreview() {
  const ids = locationImageIds(currentLocationId());
  const box = document.getElementById("location-image-preview");
  const img = document.getElementById("location-image-img");
  const addButton = document.getElementById("location-image-button");
  const count = document.getElementById("location-image-count");
  const prev = document.getElementById("location-image-prev");
  const next = document.getElementById("location-image-next");
  const position = document.getElementById("location-image-position");
  const pending = Boolean(pendingLocationPhoto && pendingPhotoPreviewUrl);
  const total = ids.length + (pending ? 1 : 0);
  if (count) count.textContent = total ? t("{n} photo(s)", { n: total }) : t("No photos yet.");
  if (!box || !img) return;
  if (pending) {
    img.src = pendingPhotoPreviewUrl;
    box.hidden = false;
    if (addButton) addButton.textContent = t("Manage photos");
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    if (position) position.hidden = true;
    renderLocationPreviewDots([]);
    return;
  }
  if (!ids.length) {
    img.removeAttribute("src");
    box.hidden = true;
    if (addButton) addButton.textContent = t("Add photo");
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    if (position) position.hidden = true;
    renderLocationPreviewDots([]);
    return;
  }
  if (locationPreviewIndex >= ids.length) locationPreviewIndex = 0;
  img.src = imageFileUrl(ids[locationPreviewIndex]);
  box.hidden = false;
  if (addButton) addButton.textContent = t("Manage photos");
  const multiple = ids.length > 1;
  if (prev) prev.hidden = !multiple;
  if (next) next.hidden = !multiple;
  if (position) {
    position.hidden = !multiple;
    position.textContent = `${locationPreviewIndex + 1} / ${ids.length}`;
    position.setAttribute("aria-label", t("Photo {current} of {total}", { current: locationPreviewIndex + 1, total: ids.length }));
  }
  renderLocationPreviewDots(ids);
}
document.getElementById("location-image-prev")?.addEventListener("click", () => moveLocationPreview(-1));
document.getElementById("location-image-next")?.addEventListener("click", () => moveLocationPreview(1));
let pendingLocationPhoto = null;
let pendingPhotoPreviewUrl = "";
function setLocationPhotoStatus(text, state = "") {
  const status = document.getElementById("location-photo-status");
  if (!status) return;
  status.textContent = text || "";
  if (state) status.dataset.state = state;
  else delete status.dataset.state;
}
let galleryIndex = 0;
function refreshImageGallery() {
  const strip = document.getElementById("image-strip");
  const preview = document.getElementById("image-gallery-img");
  const box = document.getElementById("image-gallery-preview");
  const errorMessage = document.getElementById("image-modal-error");
  const prev = document.getElementById("image-gallery-prev");
  const next = document.getElementById("image-gallery-next");
  const position = document.getElementById("image-gallery-position");
  const ids = locationImageIds(currentLocationId());
  if (galleryIndex >= ids.length) galleryIndex = 0;
  const multiple = ids.length > 1;
  if (prev) prev.hidden = !multiple;
  if (next) next.hidden = !multiple;
  if (position) {
    position.hidden = !ids.length;
    position.textContent = ids.length ? `${galleryIndex + 1} / ${ids.length}` : "";
    if (ids.length) position.setAttribute("aria-label", t("Photo {current} of {total}", { current: galleryIndex + 1, total: ids.length }));
  }
  if (strip) {
    strip.replaceChildren();
    if (!ids.length) {
      const empty = document.createElement("p");
      empty.className = "tour-empty";
      empty.textContent = t("No photos yet. Drop a file below to add one.");
      strip.append(empty);
    }
    ids.forEach((imageId, index) => {
      const thumb = document.createElement("span");
      thumb.className = "image-thumb";
      const select = document.createElement("button");
      select.type = "button";
      select.className = "image-thumb-select";
      select.setAttribute("aria-pressed", String(index === galleryIndex));
      select.setAttribute("aria-label", t("Show photo {n}", { n: index + 1 }));
      const img = document.createElement("img");
      img.src = imageFileUrl(imageId);
      img.alt = "";
      img.loading = "lazy";
      select.append(img);
      select.addEventListener("click", () => {
        galleryIndex = index;
        refreshImageGallery();
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "image-thumb-delete";
      remove.textContent = "×";
      remove.setAttribute("aria-label", t("Delete photo {n}", { n: index + 1 }));
      remove.addEventListener("click", () => deleteLocationImage(imageId));
      thumb.append(select, remove);
      strip.append(thumb);
    });
  }
  if (preview && box) {
    preview.onload = () => { if (errorMessage) errorMessage.textContent = ""; };
    preview.onerror = () => { if (preview.src && errorMessage) errorMessage.textContent = t("An image failed to load. Try again in a moment."); };
    if (ids.length) {
      preview.src = imageFileUrl(ids[galleryIndex]);
      box.hidden = false;
    } else {
      preview.removeAttribute("src");
      box.hidden = true;
    }
  }
  updateImagePreview();
}
function moveGallery(delta) {
  const ids = locationImageIds(currentLocationId());
  if (ids.length < 2) return;
  galleryIndex = (galleryIndex + delta + ids.length) % ids.length;
  refreshImageGallery();
}
document.getElementById("image-gallery-prev")?.addEventListener("click", () => moveGallery(-1));
document.getElementById("image-gallery-next")?.addEventListener("click", () => moveGallery(1));
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
async function prepareImageForUpload(file) {
  if (!file || !file.type.startsWith("image/") || ["image/gif", "image/svg+xml"].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 2048;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.86));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") || "location-photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

async function uploadPendingLocationPhoto(locationId) {
  const file = await prepareImageForUpload(pendingLocationPhoto);
  if (!file || !locationId) return;
  const body = new FormData();
  body.append("file", file, file.name);
  const response = await fetch(`/api/locations/${locationId}/images`, { method: "POST", body, credentials: "same-origin", headers: { Accept: "application/json" } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    setLocationPhotoStatus(t("The photo could not be uploaded."), "error");
    throw new Error(result.detail || "The photo could not be uploaded.");
  }
  if (result.id) addLocationImage(locationId, result.id);
  pendingLocationPhoto = null;
  if (pendingPhotoPreviewUrl) {
    URL.revokeObjectURL(pendingPhotoPreviewUrl);
    pendingPhotoPreviewUrl = "";
  }
  setLocationPhotoStatus("");
  locationPreviewIndex = 0;
  updateImagePreview();
  if (!document.getElementById("image-modal")?.classList.contains("is-hidden")) refreshImageGallery();
}
document.getElementById("location-record")?.addEventListener("click", (event) => {
  recordPickerLocation(event.currentTarget);
});
document.getElementById("location-map-locate")?.addEventListener("click", (event) => {
  recordPickerLocation(event.currentTarget);
});
document.getElementById("location-map-fit")?.addEventListener("click", () => {
  clearMapSearch();
  focusPickerMap(null, null, 0);
});
document.getElementById("location-map-clear")?.addEventListener("click", () => {
  clearMapSearch();
  clearPickerPoint();
  setMapStatus("");
  document.getElementById("location-picker-map")?.focus();
});
document.getElementById("location-map-search-button")?.addEventListener("click", searchMapPlaces);
document.getElementById("location-map-search")?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchMapPlaces();
  } else if (event.key === "Escape") {
    clearMapSearch();
  }
});
document.getElementById("location-map-search")?.addEventListener("input", () => {
  mapSearchRequestId++;
  const box = document.getElementById("location-map-results");
  if (box) {
    box.replaceChildren();
    box.hidden = true;
  }
  setMapStatus("");
});
document.getElementById("location-photo")?.addEventListener("change", (event) => {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  pendingLocationPhoto = file;
  setLocationPhotoStatus(t("Photo ready — it uploads when you save."), "ready");
  if (pendingPhotoPreviewUrl) URL.revokeObjectURL(pendingPhotoPreviewUrl);
  pendingPhotoPreviewUrl = URL.createObjectURL(file);
  locationPreviewIndex = 0;
  updateImagePreview();
  document.getElementById("location-form-error").textContent = "";
  input.value = "";
});
const imagePicker = document.getElementById("image-file");
const imageDropzone = document.getElementById("image-dropzone");
let imageUploading = false;
async function uploadImageFiles(fileList) {
  const errorMessage = document.getElementById("image-modal-error");
  const form = document.getElementById("location-form");
  const id = form?.elements.id.value || "";
  errorMessage.textContent = "";
  const files = [...(fileList || [])].filter((file) => file.type.startsWith("image/"));
  if (!files.length) {
    errorMessage.textContent = t("That is not an image file. Drop a PNG, JPG or WebP.");
    return;
  }
  if (!id) {
    errorMessage.textContent = t("Save the location first, then upload files.");
    return;
  }
  if (imageUploading) return;
  imageUploading = true;
  imageDropzone?.classList.add("is-uploading");
  imageDropzone?.setAttribute("aria-busy", "true");
  try {
    for (const file of files) {
      const uploadFile = await prepareImageForUpload(file);
      const body = new FormData();
      body.append("file", uploadFile, uploadFile.name);
      const response = await fetch(`/api/locations/${id}/images`, { method: "POST", body, credentials: "same-origin", headers: { Accept: "application/json" } });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Upload failed. Try again.");
      if (payload.id) addLocationImage(id, payload.id);
    }
    if (imagePicker) imagePicker.value = "";
    refreshImageGallery();
    await loadLocations();
    showToast(files.length > 1 ? t("{n} images uploaded.", { n: files.length }) : t("Image uploaded."), "success");
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    imageUploading = false;
    imageDropzone?.classList.remove("is-uploading");
    imageDropzone?.removeAttribute("aria-busy");
  }
}
imagePicker?.addEventListener("change", () => uploadImageFiles(imagePicker.files));
imageDropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  imageDropzone.classList.add("is-dragover");
});
imageDropzone?.addEventListener("dragleave", (event) => {
  if (!imageDropzone.contains(event.relatedTarget)) imageDropzone.classList.remove("is-dragover");
});
imageDropzone?.addEventListener("drop", (event) => {
  event.preventDefault();
  imageDropzone.classList.remove("is-dragover");
  uploadImageFiles(event.dataTransfer?.files);
});
["dragover", "drop"].forEach((type) => document.addEventListener(type, (event) => {
  const modal = document.getElementById("image-modal");
  if (modal && !modal.classList.contains("is-hidden")) event.preventDefault();
}));
async function refreshLocationImages(locationId) {
  try {
    const record = await apiRequest(`/api/locations/${locationId}`);
    setLocationImages(locationId, record.images);
  } catch {
    /* keep the cached list when the detail call fails */
  }
}
async function deleteLocationImage(imageId) {
  const errorMessage = document.getElementById("image-modal-error");
  const locationId = currentLocationId();
  if (!locationId) {
    if (errorMessage) errorMessage.textContent = t("Save the location first.");
    return;
  }
  if (!window.confirm("Delete this photo? It cannot be undone.")) return;
  try {
    const response = await fetch(`/api/locations/${locationId}/images/${imageId}`, { method: "DELETE", credentials: "same-origin", headers: { Accept: "application/json" } });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.detail || "The photo could not be deleted.");
    }
    removeLocationImage(locationId, imageId);
    await refreshLocationImages(locationId);
    refreshImageGallery();
    await loadLocations();
    showToast("Photo deleted.", "success");
  } catch (error) {
    if (errorMessage) errorMessage.textContent = error.message;
  }
}
document.getElementById("image-download")?.addEventListener("click", (event) => {
  const errorMessage = document.getElementById("image-modal-error");
  const locationId = currentLocationId();
  const ids = locationImageIds(locationId);
  const imageId = ids[galleryIndex];
  if (errorMessage) errorMessage.textContent = "";
  if (!imageId) {
    if (errorMessage) errorMessage.textContent = t("There is no photo to download.");
    return;
  }
  const link = document.createElement("a");
  link.href = imageFileUrl(imageId);
  link.download = `location_${locationId}_photo_${imageId}.jpg`;
  document.body.append(link);
  link.click();
  link.remove();
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
    showToast(error.message, "error");
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
    showToast("Capture link copied.", "success");
  } catch {
    input?.select();
    showToast("Copy the selected link.", "error");
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
  if (!window.confirm(t("Delete location #{id}? This cannot be undone.", { id }))) return;
  const button = event.currentTarget;
  const errorMessage = document.getElementById("location-form-error");
  button.disabled = true;
  try {
    await apiRequest(`/api/locations/${id}`, { method: "DELETE" });
    locationImages.delete(String(id));
    closeLocationModal();
    await loadLocations();
    showToast("Location deleted.", "success");
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
});
document.getElementById("register-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector("button[type=submit]");
  const message = document.getElementById("register-form-message");
  message.textContent = "";
  if (!form.elements.legal?.checked) {
    message.textContent = t("You must accept the Terms of Use and Privacy Notice to create an account.");
    form.elements.legal?.focus();
    return;
  }
  const termsVersion = document.querySelector('meta[name="aradlens-legal-version"]')?.content || "";
  button.disabled = true;
  try {
    const payload = { code: form.elements.code.value, username: form.elements.username.value, email: form.elements.email.value, password: form.elements.password.value, legal_accepted: true, terms_version: termsVersion };
    const account = await apiRequest("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const createdUsername = account.username || "";
    form.reset();
    showAuthTab("login");
    if (createdUsername) document.getElementById("username").value = createdUsername;
    showToast(t("Account created: {name}", { name: createdUsername || t("sign in to continue.") }), "success");
  } catch (error) { message.textContent = error.message; }
  finally { button.disabled = false; }
});
async function saveLocation() {
  const form = document.getElementById("location-form");
  const button = document.getElementById("location-save");
  if (!form || !button) return;
  const errorMessage = document.getElementById("location-form-error");
  const name = form.elements.name.value.trim();
  const id = form.elements.id.value;
  if (!name) {
    errorMessage.textContent = t("Give the location a name.");
    form.elements.name.focus();
    return;
  }
  const latitudeValue = String(form.elements.latitude.value ?? "").trim();
  const longitudeValue = String(form.elements.longitude.value ?? "").trim();
  const hasCoordinates = latitudeValue !== "" && longitudeValue !== "";
  if ((latitudeValue === "") !== (longitudeValue === "")) {
    errorMessage.textContent = t("Pick both coordinates or clear the point.");
    return;
  }
  if (!id && !hasCoordinates) {
    errorMessage.textContent = t("Pick a point on the map first.");
    return;
  }
  const payload = {
    name,
    latitude: hasCoordinates ? Number(latitudeValue) : null,
    longitude: hasCoordinates ? Number(longitudeValue) : null,
  };
  /* Always send the description, even when it is empty. Leaving it out of
     the payload made the API keep the old text, so a description could
     never be cleared. */
  payload.description = form.elements.description.value.trim() || null;
  const categoryField = form.elements.category_id;
  if (categoryField && categoryField.options.length > 1) {
    payload.category_id = categoryField.value ? Number(categoryField.value) : null;
  }
  errorMessage.textContent = "";
  button.disabled = true;
  try {
    const saved = await apiRequest(id ? `/api/locations/${id}` : "/api/locations", { method: id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!id && saved && saved.id) {
      form.elements.id.value = saved.id;
      document.getElementById("location-modal-title").textContent = t("Edit location #{id}", { id: saved.id });
      const deleteButton = document.getElementById("location-delete");
      if (deleteButton) deleteButton.hidden = false;
      if (pendingLocationPhoto) {
        try { await uploadPendingLocationPhoto(saved.id); } catch (error) { showToast(error.message, "error"); }
      }
      await loadLocations();
      showToast("Location created. Add images or keep editing.", "success");
    } else {
      if (pendingLocationPhoto && id) {
        try { await uploadPendingLocationPhoto(id); } catch (error) { showToast(error.message, "error"); }
      }
      resetLocationForm();
      closeLocationModal();
      await loadLocations();
      showToast(id ? "Location updated." : "Location created.", "success");
    }
  } catch (error) { errorMessage.textContent = error.message; }
  finally { button.disabled = false; }
}
document.getElementById("location-save")?.addEventListener("click", saveLocation);
document.getElementById("location-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  saveLocation();
});

const tourTemplateLocations = [
  { id: 1, name: "string" },
  { id: 2, name: "Palatul Cultural" },
  { id: 3, name: "Primăria" },
  { id: 4, name: "Teatrul Slavici" },
  { id: 5, name: "Catedrala Veche" },
  { id: 7, name: "Aeroport" },
  { id: 8, name: "Biserica Roșie" },
  { id: 9, name: "Catedrala Arhiepiscopală „Sfânta Treime”" },
];
let tourModalOpener = null;
let tourSelectedIds = [];
let tourDragState = null;
let tourViewOpener = null;
let tourViewTour = null;
let tourViewMap = null;
let tourViewLayer = null;
let tourViewRouteLayer = null;
let tourViewLatLngs = [];
let tourViewRequestId = 0;
let tourViewRouteId = 0;
let tourViewMode = "direct";
let tourViewStraightSegments = [];
let tourViewStraightDistance = "";
let tourViewMetaBase = "";

function tourLocations() {
  return cachedLocations.length ? cachedLocations : tourTemplateLocations;
}

function tourLocationName(id, tour) {
  const listed = (tour?.locations || []).find((location) => String(location.id) === String(id));
  if (listed?.name) return listed.name;
  const cached = tourLocations().find((location) => String(location.id) === String(id));
  return cached?.name || `Location #${id}`;
}

function renderTourPicker() {
  const pool = document.getElementById("tour-location-pool");
  const order = document.getElementById("tour-location-order");
  const count = document.getElementById("tour-stop-count");
  if (!pool || !order) return;
  pool.replaceChildren();
  const selected = new Set(tourSelectedIds.map(String));
  const locations = tourLocations();
  const available = locations.filter((location) => !selected.has(String(location.id)));
  if (!locations.length) {
    const empty = document.createElement("p");
    empty.className = "tour-empty";
    empty.textContent = t("No important points yet. Add one first.");
    pool.append(empty);
  } else if (!available.length) {
    const empty = document.createElement("p");
    empty.className = "tour-empty";
    empty.textContent = t("All points are on this tour.");
    pool.append(empty);
  } else {
    const sorted = [...available].sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    for (const location of sorted) {
      const name = location.name || `Location #${location.id}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tour-pool-item";
      button.textContent = `+ ${name}`;
      button.draggable = true;
      button.title = t("Drag to add {name} to the route", { name });
      button.addEventListener("dragstart", (event) => {
        tourDragState = { type: "pool", id: location.id };
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "copyMove";
          event.dataTransfer.setData("text/plain", String(location.id));
          event.dataTransfer.setData("application/x-aradlens-tour-stop", JSON.stringify(tourDragState));
        }
        button.classList.add("is-dragging");
        document.getElementById("tour-location-order")?.classList.add("is-drop-target");
      });
      button.addEventListener("dragend", () => {
        tourDragState = null;
        clearTourDropIndicators();
      });
      button.addEventListener("click", () => {
        if (!button.isConnected) return;
        tourSelectedIds.push(location.id);
        renderTourPicker();
      });
      pool.append(button);
    }
  }
  order.replaceChildren();
  if (!tourSelectedIds.length) {
    const empty = document.createElement("li");
    empty.className = "tour-empty";
    empty.textContent = t("No stops selected.");
    order.append(empty);
  }
  tourSelectedIds.forEach((id, index) => {
    const item = document.createElement("li");
    item.className = "tour-stop";
    item.draggable = true;
    item.title = t("Drag to reorder {name}", { name: tourLocationName(id) });
    item.addEventListener("dragstart", (event) => {
      tourDragState = { type: "route", id, fromIndex: index };
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(id));
        event.dataTransfer.setData("application/x-aradlens-tour-stop", JSON.stringify({ type: "route", id, fromIndex: index }));
      }
      item.classList.add("is-dragging");
      document.getElementById("tour-location-pool")?.classList.add("is-drop-target");
    });
    item.addEventListener("dragend", () => {
      tourDragState = null;
      clearTourDropIndicators();
    });
    const number = document.createElement("span");
    number.className = "tour-stop-number";
    number.textContent = String(index + 1);
    const name = document.createElement("span");
    name.className = "tour-stop-name";
    name.textContent = tourLocationName(id);
    const actions = document.createElement("span");
    actions.className = "tour-stop-actions";
    const up = document.createElement("button");
    up.type = "button";
    up.className = "tour-stop-action";
    up.textContent = "↑";
    up.setAttribute("aria-label", t("Move {name} up", { name: tourLocationName(id) }));
    up.disabled = index === 0;
    up.addEventListener("click", () => {
      if (!item.isConnected) return;
      [tourSelectedIds[index - 1], tourSelectedIds[index]] = [tourSelectedIds[index], tourSelectedIds[index - 1]];
      renderTourPicker();
    });
    const down = document.createElement("button");
    down.type = "button";
    down.className = "tour-stop-action";
    down.textContent = "↓";
    down.setAttribute("aria-label", t("Move {name} down", { name: tourLocationName(id) }));
    down.disabled = index === tourSelectedIds.length - 1;
    down.addEventListener("click", () => {
      if (!item.isConnected) return;
      [tourSelectedIds[index + 1], tourSelectedIds[index]] = [tourSelectedIds[index], tourSelectedIds[index + 1]];
      renderTourPicker();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "tour-stop-action";
    remove.textContent = "×";
    remove.setAttribute("aria-label", t("Remove {name} from the route", { name: tourLocationName(id) }));
    remove.addEventListener("click", () => {
      if (!item.isConnected) return;
      tourSelectedIds.splice(index, 1);
      renderTourPicker();
    });
    actions.append(up, down, remove);
    item.append(number, name, actions);
    order.append(item);
  });
  if (count) count.textContent = tourSelectedIds.length ? counted(tourSelectedIds.length, "stop", "stops") : t("0 stops");
}

function clearTourDropIndicators() {
  document.getElementById("tour-location-pool")?.classList.remove("is-drop-target");
  document.getElementById("tour-location-order")?.classList.remove("is-drop-target");
  document.querySelectorAll(".tour-stop.is-drop-before, .tour-stop.is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
  document.querySelectorAll(".tour-pool-item.is-dragging, .tour-stop.is-dragging").forEach((item) => {
    item.classList.remove("is-dragging");
  });
}

function setTourDropIndicator(index) {
  const order = document.getElementById("tour-location-order");
  if (!order) return;
  const items = [...order.querySelectorAll(".tour-stop")];
  items.forEach((item) => item.classList.remove("is-drop-before", "is-drop-after"));
  if (!items.length) return;
  if (index >= items.length) items[items.length - 1].classList.add("is-drop-after");
  else items[index].classList.add("is-drop-before");
}

function tourDropIndexFromPointer(order, clientY) {
  const items = [...order.querySelectorAll(".tour-stop")];
  for (let index = 0; index < items.length; index += 1) {
    const rect = items[index].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return index;
  }
  return items.length;
}

function autoScrollTourList(container, event) {
  const rect = container.getBoundingClientRect();
  const edge = 30;
  if (event.clientY < rect.top + edge) container.scrollTop = Math.max(0, container.scrollTop - 14);
  else if (event.clientY > rect.bottom - edge) container.scrollTop += 14;
}

function readTourDragState(event) {
  if (tourDragState) return tourDragState;
  try {
    const raw = event.dataTransfer?.getData("application/x-aradlens-tour-stop");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function applyTourDrop(state, index) {
  if (!state) return;
  if (state.type === "pool") {
    if (!tourSelectedIds.some((selected) => String(selected) === String(state.id))) {
      const at = Math.max(0, Math.min(index, tourSelectedIds.length));
      tourSelectedIds.splice(at, 0, state.id);
    }
  } else if (state.type === "route") {
    const from = Number(state.fromIndex);
    if (!Number.isInteger(from) || from < 0 || from >= tourSelectedIds.length) return;
    let to = Math.max(0, Math.min(index, tourSelectedIds.length));
    const [moved] = tourSelectedIds.splice(from, 1);
    if (from < to) to -= 1;
    tourSelectedIds.splice(to, 0, moved);
  } else {
    return;
  }
  tourDragState = null;
  renderTourPicker();
  clearTourDropIndicators();
}

function removeTourStopAt(index) {
  const from = Number(index);
  if (!Number.isInteger(from) || from < 0 || from >= tourSelectedIds.length) return;
  tourSelectedIds.splice(from, 1);
  tourDragState = null;
  renderTourPicker();
  clearTourDropIndicators();
}

function initTourPickerDragAndDrop() {
  const pool = document.getElementById("tour-location-pool");
  const order = document.getElementById("tour-location-order");
  if (!pool || !order || pool.dataset.dragReady === "true") return;
  pool.dataset.dragReady = "true";

  pool.addEventListener("dragover", (event) => {
    const state = readTourDragState(event);
    if (!state || state.type !== "route") return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    pool.classList.add("is-drop-target");
    autoScrollTourList(pool, event);
  });
  pool.addEventListener("dragleave", (event) => {
    if (!pool.contains(event.relatedTarget)) pool.classList.remove("is-drop-target");
  });
  pool.addEventListener("drop", (event) => {
    const state = readTourDragState(event);
    if (!state || state.type !== "route") return;
    event.preventDefault();
    removeTourStopAt(state.fromIndex);
  });

  order.addEventListener("dragover", (event) => {
    const state = readTourDragState(event);
    if (!state) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = state.type === "route" ? "move" : "copy";
    order.classList.add("is-drop-target");
    setTourDropIndicator(tourDropIndexFromPointer(order, event.clientY));
    autoScrollTourList(order, event);
  });
  order.addEventListener("dragleave", (event) => {
    if (order.contains(event.relatedTarget)) return;
    order.classList.remove("is-drop-target");
    clearTourDropIndicators();
  });
  order.addEventListener("drop", (event) => {
    const state = readTourDragState(event);
    if (!state) return;
    event.preventDefault();
    applyTourDrop(state, tourDropIndexFromPointer(order, event.clientY));
  });
}

initTourPickerDragAndDrop();

async function openTourModal(tour = null) {
  const modal = document.getElementById("tour-modal");
  const form = document.getElementById("tour-form");
  if (!modal || !form) return;
  tourModalOpener = document.activeElement;
  form.reset();
  document.getElementById("tour-form-error").textContent = "";
  const deleteButton = document.getElementById("tour-delete");
  if (tour) {
    form.elements.id.value = String(tour.id);
    form.elements.name.value = tour.name || "";
    form.elements.description.value = tour.description || "";
    tourSelectedIds = [...(tour.location_ids || (tour.locations || []).map((location) => location.id))];
    document.getElementById("tour-modal-title").textContent = t("Edit tour {name}", { name: tour.name });
    if (deleteButton) deleteButton.hidden = false;
  } else {
    form.elements.id.value = "";
    tourSelectedIds = [];
    document.getElementById("tour-modal-title").textContent = t("Add tour");
    if (deleteButton) deleteButton.hidden = true;
  }
  renderTourPicker();
  modal.classList.remove("is-hidden");
  document.getElementById("tour-name")?.focus();
}

function closeTourModal() {
  document.getElementById("tour-modal")?.classList.add("is-hidden");
  if (tourModalOpener && document.contains(tourModalOpener)) tourModalOpener.focus();
  tourModalOpener = null;
}

let toursRequestId = 0;
async function loadTours() {
  const message = document.getElementById("tours-message");
  const list = document.getElementById("tours-list");
  if (!message || !list) return;
  const requestId = ++toursRequestId;
  setMessage(message, "Loading tours…");
  message.setAttribute("role", "status");
  list.replaceChildren();
  try {
    const payload = await apiRequest("/api/tours");
    if (requestId !== toursRequestId) return;
    const tours = Array.isArray(payload) ? payload : Array.isArray(payload?.tours) ? payload.tours : [];
    cachedTours = tours;
    for (const tour of tours) list.append(renderTourRow(tour));
    message.textContent = tours.length ? t("{n} tour(s)", { n: tours.length }) : t("No tours yet.");
  } catch (error) {
    if (requestId !== toursRequestId) return;
    message.textContent = t("{message} Click Refresh to try again.", { message: error.message });
  }
}

function tourStopRecords(tour) {
  const ids = Array.isArray(tour.location_ids) && tour.location_ids.length
    ? tour.location_ids
    : (tour.locations || []).map((location) => location.id);
  return ids.map((id) => {
    const listed = (tour.locations || []).find((location) => String(location.id) === String(id)) || {};
    const cached = cachedLocations.find((location) => String(location.id) === String(id)) || {};
    const rawLatitude = cached.latitude ?? listed.latitude;
    const rawLongitude = cached.longitude ?? listed.longitude;
    const hasRawCoordinates = [rawLatitude, rawLongitude].every((value) => value !== null && value !== undefined && String(value).trim() !== "");
    const latitude = hasRawCoordinates ? Number(rawLatitude) : NaN;
    const longitude = hasRawCoordinates ? Number(rawLongitude) : NaN;
    return {
      id,
      name: cached.name || listed.name || `Location #${id}`,
      category: cached.category?.name || listed.category?.name || "",
      description: cached.description || listed.description || "",
      latitude,
      longitude,
      mapped: hasRawCoordinates && usableCoordinate(latitude, longitude) && isWithinRomaniaBounds(latitude, longitude),
    };
  });
}

function ensureTourViewMap() {
  if (tourViewMap || typeof window.L === "undefined") return tourViewMap;
  const element = document.getElementById("tour-view-map");
  if (!element) return null;
  tourViewMap = window.L.map(element, {
    center: ROMANIA_CENTER,
    zoom: 7,
    minZoom: 6,
    maxBounds: ROMANIA_BOUNDS,
    maxBoundsViscosity: 1,
    zoomControl: true,
    zoomAnimation: !prefersReducedMotion(),
    fadeAnimation: !prefersReducedMotion(),
    markerZoomAnimation: !prefersReducedMotion(),
  });
  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(tourViewMap);
  if (!tourViewMap.getPane("tourRoutePane")) {
    const pane = tourViewMap.createPane("tourRoutePane");
    pane.style.zIndex = "380";
    pane.style.pointerEvents = "none";
  }
  tourViewLayer = window.L.layerGroup().addTo(tourViewMap);
  tourViewRouteLayer = window.L.layerGroup().addTo(tourViewMap);
  return tourViewMap;
}

function formatTourDistance(metres) {
  return metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${Math.round(metres)} m`;
}

function tourDistanceLabel(stops) {
  if (!window.L) return "";
  let metres = 0;
  let legs = 0;
  for (let index = 1; index < stops.length; index += 1) {
    const previous = stops[index - 1];
    const current = stops[index];
    if (!previous.mapped || !current.mapped) continue;
    metres += window.L.latLng(previous.latitude, previous.longitude)
      .distanceTo(window.L.latLng(current.latitude, current.longitude));
    legs += 1;
  }
  return legs ? formatTourDistance(metres) : "";
}

function drawTourRoute(segments, fitCoords) {
  if (!tourViewMap || !tourViewRouteLayer) return;
  tourViewRouteLayer.clearLayers();
  segments.forEach((leg) => {
    if (leg.length < 2) return;
    window.L.polyline(leg, {
      color: currentTheme === "night" ? "#1a1a19" : "#fffefb",
      weight: 7,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
      pane: "tourRoutePane",
    }).addTo(tourViewRouteLayer);
    window.L.polyline(leg, {
      color: romaniaColor(),
      weight: 3,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
      pane: "tourRoutePane",
    }).addTo(tourViewRouteLayer);
  });
  if (!fitCoords.length) return;
  if (fitCoords.length === 1) {
    tourViewMap.setView(fitCoords[0], 15, { animate: false });
  } else {
    tourViewMap.fitBounds(fitCoords, { padding: [36, 36], maxZoom: 15, animate: false });
  }
}

function syncTourModeButtons() {
  document.querySelectorAll("#tour-view-modal [data-tour-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.tourMode === tourViewMode));
  });
}

function setTourLegend(text) {
  const label = document.getElementById("tour-view-legend-label");
  if (label) label.textContent = text;
}

function setTourMeta(text) {
  const meta = document.getElementById("tour-view-meta");
  if (meta) meta.textContent = text;
}

async function loadStreetTourRoute() {
  const routeSegments = tourViewStraightSegments.filter((segment) => segment.length > 1);
  if (!routeSegments.length) {
    tourViewMode = "direct";
    syncTourModeButtons();
    setTourLegend(t("Walking order"));
    setTourMeta(`${tourViewMetaBase}${tourViewStraightDistance ? ` · ${tourViewStraightDistance}` : ""}`);
    return;
  }
  const requestId = ++tourViewRouteId;
  try {
    const responses = await Promise.all(routeSegments.map((segment) => apiRequest(
      `/api/route/walk?points=${encodeURIComponent(segment.map(([lat, lng]) => `${lat},${lng}`).join(";"))}`
    )));
    if (requestId !== tourViewRouteId || tourViewMode !== "street" || document.getElementById("tour-view-modal")?.classList.contains("is-hidden")) return;
    const lines = responses.map((response) => (Array.isArray(response?.coordinates) ? response.coordinates : [])).filter((line) => line.length >= 2);
    if (!lines.length) throw new Error("Street route returned no line.");
    const metres = responses.reduce((total, response) => total + (Number(response?.distance) || 0), 0);
    drawTourRoute(lines, lines.flat());
    setTourLegend(t("Street route"));
    setTourMeta(`${tourViewMetaBase} · ${formatTourDistance(metres)} ${t("walking")}`);
  } catch {
    if (requestId !== tourViewRouteId) return;
    tourViewMode = "direct";
    syncTourModeButtons();
    drawTourRoute(tourViewStraightSegments, tourViewLatLngs);
    setTourLegend(t("Walking order"));
    setTourMeta(`${tourViewMetaBase}${tourViewStraightDistance ? ` · ${tourViewStraightDistance}` : ""} · ${t("Street route unavailable.")}`);
  }
}

function setTourMode(mode) {
  if (!["direct", "street"].includes(mode) || mode === tourViewMode) return;
  tourViewMode = mode;
  tourViewRouteId++;
  syncTourModeButtons();
  if (tourViewTour) renderTourView(tourViewTour);
}

function renderTourView(tour) {
  const list = document.getElementById("tour-view-stops");
  const empty = document.getElementById("tour-view-empty");
  const meta = document.getElementById("tour-view-meta");
  const description = document.getElementById("tour-view-description");
  if (!list || !meta || !description || !tourViewMap || !tourViewLayer) return;
  list.replaceChildren();
  tourViewRouteId++;
  tourViewLayer.clearLayers();
  tourViewRouteLayer?.clearLayers();
  tourViewLatLngs = [];
  const stops = tourStopRecords(tour);
  const mapped = stops.filter((stop) => stop.mapped);
  const distance = tourDistanceLabel(stops);
  tourViewStraightDistance = distance;
  tourViewStraightSegments = [];
  tourViewMetaBase = `${t("{n} stop(s)", { n: stops.length })}${mapped.length ? ` · ${t("{n} on map", { n: mapped.length })}` : ""}`;
  meta.textContent = `${tourViewMetaBase}${distance ? ` · ${distance}` : ""}`;
  description.textContent = tour.description || t("The stops in this tour, in walking order.");
  syncTourModeButtons();
  if (!stops.length) {
    if (empty) {
      empty.textContent = t("This tour has no stops yet. Add points to the route first.");
      empty.hidden = false;
    }
    setTourLegend(t("Walking order"));
    tourViewMap.setView(ROMANIA_CENTER, 7, { animate: false });
    return;
  }
  if (empty) empty.hidden = true;
  const markers = [];
  const segments = [];
  let segment = [];
  stops.forEach((stop, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tour-stop-open";
    const number = document.createElement("span");
    number.className = "tour-stop-number";
    number.textContent = String(index + 1);
    const copy = document.createElement("span");
    copy.className = "tour-stop-copy";
    const name = document.createElement("strong");
    name.textContent = stop.name;
    const detail = document.createElement("small");
    detail.textContent = [stop.category, stop.description].filter(Boolean).join(" · ") || t("Important point");
    copy.append(name, detail);
    if (!stop.mapped) {
      const missing = document.createElement("span");
      missing.className = "tour-stop-missing";
      missing.textContent = t("No map position");
      copy.append(missing);
    }
    button.append(number, copy);
    item.append(button);
    list.append(item);
    if (!stop.mapped) {
      if (segment.length) {
        segments.push(segment);
        segment = [];
      }
      return;
    }

    const marker = window.L.marker([stop.latitude, stop.longitude], {
      icon: window.L.divIcon({
        className: "tour-marker-wrap",
        html: `<span class="tour-marker">${index + 1}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    }).addTo(tourViewLayer);
    const popup = document.createElement("div");
    const popupName = document.createElement("strong");
    popupName.textContent = stop.name;
    const popupDetail = document.createElement("small");
    popupDetail.textContent = [stop.category, stop.description].filter(Boolean).join(" · ");
    popup.append(popupName);
    if (popupDetail.textContent) popup.append(popupDetail);
    marker.bindPopup(popup);
    markers[index] = marker;
    tourViewLatLngs.push([stop.latitude, stop.longitude]);
    segment.push([stop.latitude, stop.longitude]);

    const activate = () => {
      list.querySelectorAll(".tour-stop-open").forEach((candidate, candidateIndex) => {
        candidate.classList.toggle("is-active", candidateIndex === index);
      });
    };
    button.addEventListener("click", () => {
      activate();
      tourViewMap.setView([stop.latitude, stop.longitude], 16, { animate: !prefersReducedMotion() });
      marker.openPopup();
    });
    marker.on("click", activate);
  });
  if (segment.length) segments.push(segment);
  tourViewStraightSegments = segments;

  if (tourViewLatLngs.length) {
    drawTourRoute(segments, tourViewLatLngs);
    if (tourViewMode === "street") {
      setTourLegend(t("Street route"));
      setTourMeta(`${tourViewMetaBase} · ${t("Finding street route…")}`);
      loadStreetTourRoute();
    } else {
      setTourLegend(t("Walking order"));
      setTourMeta(`${tourViewMetaBase}${distance ? ` · ${distance}` : ""}`);
    }
  } else {
    if (empty) {
      empty.textContent = t("No mapped stops yet. Add coordinates to the points in this tour to see the route.");
      empty.hidden = false;
    }
    setTourLegend(t("Walking order"));
    setTourMeta(tourViewMetaBase);
    tourViewMap.setView(ROMANIA_CENTER, 7, { animate: false });
  }
}

async function openTourView(tour) {
  const modal = document.getElementById("tour-view-modal");
  if (!modal) return;
  const requestId = ++tourViewRequestId;
  tourViewOpener = document.activeElement;
  tourViewTour = tour;
  document.getElementById("tour-view-title").textContent = tour.name || t("Tour #{id}", { id: tour.id });
  document.getElementById("tour-view-meta").textContent = t("Loading route…");
  document.getElementById("tour-view-description").textContent = tour.description || "";
  document.getElementById("tour-view-stops").replaceChildren();
  const empty = document.getElementById("tour-view-empty");
  if (empty) empty.hidden = true;
  modal.classList.remove("is-hidden");
  document.getElementById("tour-view-close")?.focus();
  if (!cachedLocations.length) {
    try {
      await loadLocations();
    } catch {}
  }
  if (requestId !== tourViewRequestId || modal.classList.contains("is-hidden")) return;
  if (!ensureTourViewMap()) return;
  renderTourView(tour);
  window.requestAnimationFrame(() => {
    if (requestId !== tourViewRequestId || !tourViewMap) return;
    tourViewMap.invalidateSize({ animate: false, pan: false });
    if (tourViewLatLngs.length > 1) tourViewMap.fitBounds(tourViewLatLngs, { padding: [36, 36], maxZoom: 15, animate: false });
    else if (tourViewLatLngs.length === 1) tourViewMap.setView(tourViewLatLngs[0], 15, { animate: false });
  });
}

function closeTourView() {
  tourViewRequestId++;
  tourViewRouteId++;
  document.getElementById("tour-view-modal")?.classList.add("is-hidden");
  if (tourViewOpener && document.contains(tourViewOpener)) tourViewOpener.focus();
  tourViewOpener = null;
}


function renderTourRow(tour) {
  const row = document.createElement("div");
  row.className = "setting-row admin-row tour-row";
  const details = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = tour.name || t("Tour #{id}", { id: tour.id });
  const route = document.createElement("small");
  route.className = "tour-route";
  const ids = Array.isArray(tour.location_ids) && tour.location_ids.length
    ? tour.location_ids
    : (tour.locations || []).map((location) => location.id);
  const names = ids.map((id) => tourLocationName(id, tour)).filter((name) => !name.startsWith("Location #"));
  route.textContent = names.length
    ? `${t("{n} stop(s)", { n: names.length })} · ${names.join(" → ")}`
    : t("{n} stop(s)", { n: ids.length });
  if (tour.description) {
    const description = document.createElement("small");
    description.className = "tour-description";
    description.textContent = tour.description;
    details.append(title, route, description);
  } else {
    details.append(title, route);
  }
  const hint = document.createElement("small");
  hint.className = "tour-open-hint";
  hint.textContent = `${t("View route on the map")} ↗`;
  details.append(hint);
  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "tour-open";
  detailsButton.setAttribute("aria-label", t("View {name} on the map", { name: title.textContent }));
  detailsButton.append(details);
  detailsButton.addEventListener("click", () => openTourView(tour));
  row.append(detailsButton);
  const edit = document.createElement("button");
  edit.className = "button button-soft";
  edit.type = "button";
  edit.textContent = t("Edit");
  edit.addEventListener("click", () => openTourModal(tour));
  const remove = document.createElement("button");
  remove.className = "button button-soft";
  remove.type = "button";
  remove.textContent = t("Delete");
  remove.addEventListener("click", async () => {
    if (!window.confirm(t("Delete tour {name}? This cannot be undone.", { name: tour.name }))) return;
    remove.disabled = true;
    try {
      await apiRequest(`/api/tours/${tour.id}`, { method: "DELETE" });
      showToast("Tour deleted.", "success");
      await loadTours();
    } catch (error) {
      showToast(error.message, "error");
      remove.disabled = false;
    }
  });
  row.append(edit, remove);
  return row;
}

document.getElementById("tours-refresh")?.addEventListener("click", loadTours);
document.getElementById("tour-view-close")?.addEventListener("click", closeTourView);
document.getElementById("tour-view-done")?.addEventListener("click", closeTourView);
document.querySelector("#tour-view-modal [data-close-tour-view]")?.addEventListener("click", closeTourView);
document.querySelectorAll("#tour-view-modal [data-tour-mode]").forEach((button) => {
  button.addEventListener("click", () => setTourMode(button.dataset.tourMode));
});
document.getElementById("tour-view-edit")?.addEventListener("click", () => {
  const tour = tourViewTour;
  closeTourView();
  if (tour) openTourModal(tour);
});
document.getElementById("tour-add-button")?.addEventListener("click", () => {
  showPage("tours");
  openTourModal();
});
document.getElementById("tour-modal-close")?.addEventListener("click", closeTourModal);
document.getElementById("tour-cancel")?.addEventListener("click", closeTourModal);
document.querySelector("#tour-modal [data-close-tour-modal]")?.addEventListener("click", closeTourModal);
document.getElementById("tour-delete")?.addEventListener("click", async (event) => {
  const form = document.getElementById("tour-form");
  const id = form?.elements.id.value;
  if (!id) return;
  const name = form.elements.name.value || `#${id}`;
  if (!window.confirm(`Delete tour ${name}? This cannot be undone.`)) return;
  const errorMessage = document.getElementById("tour-form-error");
  const button = document.getElementById("tour-delete");
  errorMessage.textContent = "";
  button.disabled = true;
  try {
    await apiRequest(`/api/tours/${id}`, { method: "DELETE" });
    closeTourModal();
    showToast("Tour deleted.", "success");
    await loadTours();
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
document.getElementById("tour-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const errorMessage = document.getElementById("tour-form-error");
  const name = form.elements.name.value.trim();
  const description = form.elements.description.value.trim();
  const id = form.elements.id.value;
  if (!name) {
    errorMessage.textContent = t("Give the tour a name.");
    form.elements.name.focus();
    return;
  }
  if (!tourSelectedIds.length) {
    errorMessage.textContent = t("Add at least one important point to the route.");
    return;
  }
  errorMessage.textContent = "";
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const payload = { name, description, location_ids: tourSelectedIds };
    if (id) {
      await apiRequest(`/api/tours/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      showToast("Tour updated.", "success");
    } else {
      await apiRequest("/api/tours", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      showToast("Tour created.", "success");
    }
    closeTourModal();
    await loadTours();
  } catch (error) {
    errorMessage.textContent = error.message;
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
});

function setOverviewStat(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value);
}

/* The API sends `images` as an array of ids and `category` as an object.
   Older builds looked for a flat `image` field that no longer exists, which
   reported every point as missing a photo. */
function hasPhoto(location) {
  if (Array.isArray(location?.images)) return location.images.length > 0;
  return Boolean(location?.image);
}

function locationCategoryName(location) {
  return location?.category?.name ? String(location.category.name) : "";
}

const problemKinds = [
  { key: "photo", label: "No photo", note: "Add at least one image" },
  { key: "description", label: "No description", note: "Say what makes it worth visiting" },
  { key: "position", label: "Not on the map", note: "Set the real position" },
  { key: "category", label: "No category", note: "Choose where it belongs" },
];

function locationProblems(location) {
  const problems = [];
  if (!hasPhoto(location)) problems.push(problemKinds[0]);
  if (!String(location?.description || "").trim()) problems.push(problemKinds[1]);
  if (!usableCoordinate(location?.latitude, location?.longitude)) problems.push(problemKinds[2]);
  if (!location?.category?.name) problems.push(problemKinds[3]);
  return problems;
}

function renderOverviewQueue(places) {
  const list = document.getElementById("overview-queue");
  const badge = document.getElementById("overview-queue-count");
  if (!list) return;
  list.replaceChildren();
  const items = [];
  const missingPhoto = places.filter((place) => !hasPhoto(place));
  if (missingPhoto.length) items.push({ marker: "!", markerClass: "marker-yellow", title: t("{n} place(s) missing a photo", { n: missingPhoto.length }), sub: t("Could use a little love") });
  const missingDescription = places.filter((place) => !String(place.description || "").trim());
  if (missingDescription.length) items.push({ marker: "…", markerClass: "marker-fog", title: t("{n} place(s) missing a description", { n: missingDescription.length }), sub: t("Add details from the Important points page") });
  if (badge) badge.textContent = String(items.length);
  if (!items.length) {
    const calm = document.createElement("div");
    calm.className = "queue-item";
    const copy = document.createElement("span");
    const clearTitle = document.createElement("strong");
    clearTitle.textContent = t("All clear");
    const clearNote = document.createElement("small");
    clearNote.textContent = t("Nothing needs attention right now.");
    copy.append(clearTitle, clearNote);
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

function renderAttention() {
  const summary = document.getElementById("attention-summary");
  const groups = document.getElementById("attention-groups");
  if (!summary || !groups) return;
  const places = cachedLocations;
  summary.replaceChildren();
  groups.replaceChildren();

  const buckets = new Map();
  for (const kind of problemKinds) buckets.set(kind.key, { kind, items: [] });
  let total = 0;
  for (const place of places) {
    for (const problem of locationProblems(place)) {
      buckets.get(problem.key).items.push(place);
      total += 1;
    }
  }

  if (!places.length) {
    const loading = document.createElement("p");
    loading.className = "attention-empty";
    loading.textContent = locationsLoaded ? t("There are no points yet.") : t("Loading the guide…");
    groups.append(loading);
    return;
  }

  for (const kind of problemKinds) {
    const count = buckets.get(kind.key).items.length;
    const card = document.createElement("div");
    card.className = count ? "attention-stat attention-stat-bad" : "attention-stat attention-stat-clear";
    const number = document.createElement("b");
    number.textContent = String(count);
    const label = document.createElement("span");
    label.textContent = t(kind.label);
    card.append(number, label);
    summary.append(card);
  }

  if (!total) {
    const empty = document.createElement("div");
    empty.className = "panel attention-clear";
    const badge = document.createElement("span");
    badge.className = "attention-clear-mark";
    badge.setAttribute("aria-hidden", "true");
    badge.textContent = "✓";
    const title = document.createElement("strong");
    title.textContent = t("Nothing needs attention");
    const note = document.createElement("p");
    note.textContent = t("Every point has a photo, a description and a place on the map.");
    empty.append(badge, title, note);
    groups.append(empty);
    return;
  }

  for (const kind of problemKinds) {
    const bucket = buckets.get(kind.key);
    if (!bucket.items.length) continue;
    const panel = document.createElement("section");
    panel.className = "panel attention-group";
    const heading = document.createElement("div");
    heading.className = "panel-heading";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = t(kind.label);
    const sub = document.createElement("p");
    sub.textContent = t(kind.note);
    copy.append(title, sub);
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = String(bucket.items.length);
    heading.append(copy, badge);
    const list = document.createElement("div");
    list.className = "attention-list";
    for (const place of bucket.items) {
      const row = document.createElement("div");
      row.className = "attention-row";
      const marker = document.createElement("span");
      marker.className = "attention-marker";
      marker.setAttribute("aria-hidden", "true");
      marker.textContent = kind.key === "photo" ? "!" : kind.key === "description" ? "…" : kind.key === "position" ? "@" : "·";
      const text = document.createElement("span");
      const name = document.createElement("strong");
      name.textContent = place.name || t("Location #{id}", { id: place.id });
      const detail = document.createElement("small");
      detail.textContent = `#${place.id}`;
      text.append(name, detail);
      const fix = document.createElement("button");
      fix.className = "button button-soft";
      fix.type = "button";
      fix.textContent = t("Fix");
      fix.addEventListener("click", () => {
        showPage("points");
        openLocationModal(place.id);
      });
      row.append(marker, text, fix);
      list.append(row);
    }
    panel.append(heading, list);
    groups.append(panel);
  }
}

document.getElementById("attention-refresh")?.addEventListener("click", async () => {
  await loadLocations().catch(() => {});
  renderAttention();
});

function renderOverviewLatest(places) {
  const list = document.getElementById("overview-latest-list");
  if (!list) return;
  list.replaceChildren();
  const latest = [...places].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);
  if (!latest.length) {
    const row = document.createElement("div");
    row.className = "activity-row";
    const cell = document.createElement("span");
    cell.textContent = t("No locations yet. Add the first one from Important points.");
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
    coords.textContent = coordinateLabel(place);
    const id = document.createElement("span");
    id.textContent = `#${place.id}`;
    const go = document.createElement("button");
    go.className = "text-button";
    go.type = "button";
    go.textContent = "↗";
    go.setAttribute("aria-label", t("Open {name} in Important points", { name: place.name }));
    go.addEventListener("click", () => {
      showPage("points");
      openLocationModal(place.id);
    });
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
  setOverviewStat("stat-attention-overview", places.filter((place) => locationProblems(place).length).length);
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
  for (const ids of [["footer-avatar", "footer-username", "footer-role"]]) {
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
    const part = hour < 12 ? t("Good morning") : hour < 18 ? t("Good afternoon") : t("Good evening");
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

  /* Who you are sits at the top of the menu that belongs to you. It is a
     heading, not a row you pick from, so it needs no tick and no fill. */
  const identity = document.createElement("div");
  identity.className = "menu-identity";
  const avatar = document.createElement("span");
  avatar.className = "avatar";
  avatar.textContent = accountInitials(authenticatedAdmin?.username);
  const copy = document.createElement("span");
  copy.className = "menu-identity-copy";
  const name = document.createElement("strong");
  name.textContent = authenticatedAdmin?.username || "—";
  name.title = authenticatedAdmin?.username || "";
  const role = document.createElement("small");
  role.textContent = roleLabel(authenticatedAdmin?.role);
  copy.append(name, role);
  identity.append(avatar, copy);
  menu.append(identity);

  const separator = () => {
    const line = document.createElement("span");
    line.className = "menu-separator";
    return line;
  };

  const others = myAccounts.filter((account) => account.username !== authenticatedAdmin?.username);
  if (others.length) {
    menu.append(separator());
    const label = document.createElement("span");
    label.className = "menu-label";
    label.textContent = t("Switch account");
    menu.append(label);
    for (const account of others) {
      const item = document.createElement("button");
      item.type = "button";
      item.setAttribute("role", "menuitem");
      const mark = document.createElement("span");
      mark.className = "avatar avatar-tiny";
      mark.textContent = accountInitials(account.username);
      const accountName = document.createElement("span");
      accountName.className = "menu-name";
      accountName.textContent = account.username;
      accountName.title = account.username;
      item.append(mark, accountName);
      item.addEventListener("click", () => switchAccount(account.username));
      menu.append(item);
    }
  }

  const add = document.createElement("button");
  add.type = "button";
  add.setAttribute("role", "menuitem");
  add.className = "menu-add";
  add.textContent = t("+ Add account");
  add.addEventListener("click", startAddAccount);
  menu.append(add);

  /* One control, one menu: the account, the accounts it can switch to, and
     the two things you do with your account. */
  menu.append(separator());
  for (const [action, label] of [["settings", t("Settings")], ["logout", t("Sign out")]]) {
    const item = document.createElement("button");
    item.type = "button";
    item.setAttribute("role", "menuitem");
    item.dataset.menuAction = action;
    item.className = "menu-action";
    item.textContent = label;
    menu.append(item);
  }
}

function clearAccountMenuFlyout() {
  const menu = document.getElementById("account-menu");
  if (!menu) return;
  menu.classList.remove("is-rail-flyout");
  menu.style.removeProperty("--menu-left");
  menu.style.removeProperty("--menu-bottom");
}

function positionAccountMenuFlyout() {
  const menu = document.getElementById("account-menu");
  const button = document.getElementById("account-switcher");
  if (!menu || !button) return;
  const collapsed = window.innerWidth > 760 && document.body.classList.contains("nav-collapsed");
  if (!collapsed) {
    clearAccountMenuFlyout();
    return;
  }
  // Apply the fixed-position flyout before measuring: while the menu is still
  // position:absolute its 196px min-width overflows the 84px rail and shifts
  // the account button, which would skew --menu-bottom.
  menu.classList.add("is-rail-flyout");
  const rect = button.getBoundingClientRect();
  menu.style.setProperty("--menu-left", `${Math.round(rect.right + 10)}px`);
  menu.style.setProperty("--menu-bottom", `${Math.round(window.innerHeight - rect.top + 8)}px`);
}

function toggleMenu(menuId, buttonId) {
  const menu = document.getElementById(menuId);
  const button = document.getElementById(buttonId);
  if (!menu || !button) return;
  const willOpen = menu.classList.contains("is-hidden");
  closeMenus();
  menu.classList.toggle("is-hidden", !willOpen);
  button.setAttribute("aria-expanded", String(willOpen));
  if (menuId === "account-menu" && willOpen) {
    positionAccountMenuFlyout();
    requestAnimationFrame(() => {
      if (!menu.classList.contains("is-hidden")) positionAccountMenuFlyout();
    });
  }
}

function closeMenus() {
  for (const ids of [["account-menu", "account-switcher"]]) {
    document.getElementById(ids[0])?.classList.add("is-hidden");
    document.getElementById(ids[1])?.setAttribute("aria-expanded", "false");
  }
  clearAccountMenuFlyout();
}

async function switchAccount(username) {
  closeMenus();
  try {
    await apiRequest("/api/auth/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username }) });
    const admin = await apiRequest("/api/auth/me");
    setAuthenticated(true, admin);
    showToast(t("Switched to {name}.", { name: admin.username }), "success");
  } catch (error) {
    showToast(error.message, "error");
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
document.getElementById("account-menu")?.addEventListener("click", (event) => {
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
  if (!event.target.closest("#account-menu, #account-switcher")) closeMenus();
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
    showToast("No administrator data to export. Refresh the list first.", "error");
    return;
  }
  downloadCsv("administrators.csv", [["username", "email", "role", "is_active"], ...cachedAdmins.map((admin) => [admin.username, admin.email, admin.role, admin.is_active])]);
  showToast(t("Exported {n} administrator(s).", { n: cachedAdmins.length }), "success");
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
      title.textContent = t("API healthy · {ms}ms", { ms });
      text.textContent = t("Last check completed just now. All core services are responding normally.");
    } else {
      title.textContent = t("API returned an unexpected status");
      text.textContent = t("The API responded, but not with the expected health payload. Check the backend.");
    }
  } catch (error) {
    if (requestId !== debugRequestId) return;
    title.textContent = t("API unreachable");
    text.textContent = t("{message} Click Run health check to try again.", { message: error.message });
  }
}

function setSidebarCollapsed(collapsed) {
  document.body.classList.toggle("nav-collapsed", collapsed);
  closeMenus();
  try {
    window.localStorage.setItem("aradlens-nav", collapsed ? "collapsed" : "open");
  } catch {}
  const button = document.getElementById("sidebar-collapse");
  if (button) {
    button.textContent = collapsed ? "»" : "«";
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("aria-label", collapsed ? t("Expand sidebar") : t("Collapse sidebar"));
  }
}
document.getElementById("sidebar-collapse")?.addEventListener("click", () => {
  setSidebarCollapsed(!document.body.classList.contains("nav-collapsed"));
});
if (readPreference("localStorage", "aradlens-nav", ["open", "collapsed"], "open") === "collapsed") {
  setSidebarCollapsed(true);
}
let wasDesktop = window.innerWidth > 760;
window.addEventListener("resize", () => {
  const isDesktop = window.innerWidth > 760;
  const crossed = isDesktop !== wasDesktop;
  wasDesktop = isDesktop;
  const menu = document.getElementById("account-menu");
  if (!menu || menu.classList.contains("is-hidden")) return;
  if (crossed) {
    closeMenus();
  } else if (menu.classList.contains("is-rail-flyout")) {
    positionAccountMenuFlyout();
  }
});

bindPageActions();
handleHashRoute();
applyLanguage();
window.addEventListener("popstate", handleHashRoute);

/* ============================================================
   GLOBAL SEARCH
   The index is built from the pages and actions that always
   exist plus whatever live records are already cached (or can
   be fetched once). Results stay hidden until the first
   keystroke, so opening search is a quiet, empty field.
   ============================================================ */
const SEARCH_ICONS = {
  page: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h10M4 19h16" /></svg>',
  action: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>',
  place: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 10-7 10S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>',
  tour: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="M8.5 6H14a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6.5" /></svg>',
  admin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>',
  category: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13 11 22 2 13V2h11z" /><circle cx="7" cy="7" r="1.5" /></svg>',
  recovery: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 3.9 2.6 17.4a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 16.6h.01" /></svg>',
};
const SEARCH_GROUP_ORDER = ["Pages", "Actions", "Places", "Tours", "Administrators", "Categories", "Recovery"];
const SEARCH_GROUP_LIMIT = 6;

function isSuperadminAccount() {
  return String(authenticatedAdmin?.role || "").toLowerCase() === "superadmin";
}

function toggleGlobalSearchTheme() {
  currentTheme = currentTheme === "day" ? "night" : "day";
  writePreference("localStorage", "aradlens-theme", currentTheme);
  applyTheme();
}

function buildGlobalSearchEntries() {
  const entries = [];
  const pages = [
    ["overview", "Pulse of the guide today.", "dashboard home pulse start today"],
    ["points", "Places in the live guide.", "locations places pins map important points"],
    ["tours", "Walking routes through the city.", "routes walks stops tours"],
    ["attention", "Everything that needs a look.", "issues problems review missing attention"],
    ["users", "People with workspace access.", "administrators admins people accounts users"],
    ["debug", "API and device health.", "health crashes api device monitor error debug"],
    ["admins", "Roles, invites and permissions.", "access control permissions roles superadmin invites"],
    ["settings", "Account, security and appearance.", "profile password theme language preferences settings"],
  ];
  for (const [page, subtitleKey, keywords] of pages) {
    if ((page === "admins" || page === "debug") && !isSuperadminAccount()) continue;
    const title = t(pageNames[page]);
    const subtitle = t(subtitleKey);
    entries.push({
      group: "Pages",
      title,
      subtitle,
      keywords: `${pageNames[page]} ${subtitleKey} ${keywords} ${title} ${subtitle}`,
      icon: "page",
      run: () => showPage(page),
    });
  }

  const actions = [
    { titleKey: "Add important point", subtitleKey: "Create a new place.", keywords: "new create add location place point", icon: "action", run: () => { showPage("points"); openLocationModal(null); } },
    { titleKey: "Manage categories", subtitleKey: "Rename or remove the guide's categories.", keywords: "categories tags rename remove manage", icon: "category", run: () => openCategoryModal() },
    { titleKey: "Generate link", subtitleKey: "Record a place from a phone.", keywords: "capture link phone record share generate", icon: "action", run: () => { showPage("points"); document.getElementById("capture-link-button")?.click(); } },
    { titleKey: "Invite codes", subtitleKey: "Review and create administrator invites.", keywords: "invites access admin create review", icon: "admin", superadminOnly: true, run: () => { showPage("admins"); openInvitesModal(); } },
    { titleKey: "Create invite code", subtitleKey: "Review and create administrator invites.", keywords: "invite create access admin code", icon: "action", superadminOnly: true, run: () => { showPage("admins"); openInviteModal(); } },
    { titleKey: "Change password", subtitleKey: "Update the password for this account.", keywords: "password security account change", icon: "action", run: () => { showPage("settings"); openPasswordModal(); } },
    { titleKey: currentTheme === "day" ? "Switch to night theme" : "Switch to day theme", subtitleKey: "Change how the workspace looks.", keywords: "theme dark light appearance night day switch", icon: "action", run: toggleGlobalSearchTheme },
    { titleKey: "Sign out", subtitleKey: "End this session.", keywords: "logout sign out exit leave session", icon: "action", run: () => signOutCurrent() },
  ];
  for (const action of actions) {
    if (action.superadminOnly && !isSuperadminAccount()) continue;
    const title = t(action.titleKey);
    const subtitle = t(action.subtitleKey);
    entries.push({
      group: "Actions",
      title,
      subtitle,
      keywords: `${action.titleKey} ${action.subtitleKey} ${action.keywords} ${title} ${subtitle}`,
      icon: action.icon,
      run: action.run,
    });
  }

  if (isSuperadminAccount()) {
    const recovery = [
      { variant: "404", titleKey: "Preview page-not-found error", keywords: "404 error not found missing page recovery" },
      { variant: "500", titleKey: "Preview server-error screen", keywords: "500 error server crash recovery" },
      { variant: "offline", titleKey: "Preview offline error", keywords: "offline network connection error recovery" },
    ];
    for (const item of recovery) {
      const title = t(item.titleKey);
      entries.push({
        group: "Recovery",
        title,
        subtitle: t("Review the recovery surface."),
        keywords: `${item.keywords} ${title}`,
        icon: "recovery",
        run: () => showErrorScreen({ variant: item.variant, demo: true, updateUrl: true }),
      });
    }
  }

  for (const location of cachedLocations) {
    if (!location) continue;
    const name = location.name || t("Unnamed place");
    const category = location.category?.name || "";
    const hasCoords = location.latitude !== null && location.latitude !== undefined && location.latitude !== ""
      && location.longitude !== null && location.longitude !== undefined && location.longitude !== ""
      && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));
    const coordinates = hasCoords
      ? `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`
      : t("No map position");
    entries.push({
      group: "Places",
      title: name,
      subtitle: [category, coordinates].filter(Boolean).join(" · "),
      keywords: `location place pin map ${name} ${location.description || ""} ${category} ${location.id} ${coordinates}`,
      icon: "place",
      run: () => openLocationModal(location.id),
    });
  }

  for (const tour of cachedTours) {
    if (!tour) continue;
    const stopCount = Array.isArray(tour.location_ids)
      ? tour.location_ids.length
      : Array.isArray(tour.locations) ? tour.locations.length : 0;
    const stopNames = tourStopRecords(tour).map((stop) => stop.name).join(" ");
    const title = tour.name || t("Tour #{id}", { id: tour.id });
    entries.push({
      group: "Tours",
      title,
      subtitle: counted(stopCount, "stop", "stops"),
      keywords: `tour route walk ${title} ${tour.description || ""} ${stopNames}`,
      icon: "tour",
      run: () => openTourView(tour),
    });
  }

  for (const admin of cachedAdmins) {
    if (!admin) continue;
    entries.push({
      group: "Administrators",
      title: admin.username,
      subtitle: [roleLabel(admin.role), admin.email].filter(Boolean).join(" · "),
      keywords: `administrator admin user account ${admin.username} ${admin.email || ""} ${admin.role || ""}`,
      icon: "admin",
      run: () => {
        showPage("users");
        loadAdmins().then(() => {
          const input = document.getElementById("users-search");
          if (!input) return;
          input.value = admin.username;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.focus();
        }).catch(() => {});
      },
    });
  }

  for (const category of cachedCategories) {
    if (!category) continue;
    entries.push({
      group: "Categories",
      title: category.name,
      subtitle: t("Category"),
      keywords: `category ${category.name}`,
      icon: "category",
      run: () => openCategoryModal(),
    });
  }

  return entries;
}

function scoreGlobalSearchEntry(entry, normalizedQuery, tokens) {
  const title = normalizeCategoryName(entry.title);
  const subtitle = normalizeCategoryName(entry.subtitle);
  const keywords = normalizeCategoryName(entry.keywords || "");
  const haystack = `${title} ${subtitle} ${keywords}`;
  if (!tokens.every((token) => haystack.includes(token))) return 0;
  let score = 0;
  if (title === normalizedQuery) score += 120;
  else if (title.startsWith(normalizedQuery)) score += 80;
  else if (title.split(" ").some((word) => word.startsWith(normalizedQuery))) score += 60;
  else if (title.includes(normalizedQuery)) score += 40;
  if (subtitle.includes(normalizedQuery)) score += 14;
  if (keywords.includes(normalizedQuery)) score += 8;
  for (const token of tokens) {
    if (title.includes(token)) score += 9;
    if (subtitle.includes(token)) score += 3;
  }
  return score;
}

function setGlobalSearchActive(index) {
  if (!globalSearchItems.length) {
    globalSearchActiveIndex = -1;
    return;
  }
  const bounded = Math.max(0, Math.min(index, globalSearchItems.length - 1));
  globalSearchItems.forEach((item, itemIndex) => {
    const active = itemIndex === bounded;
    item.element.classList.toggle("is-active", active);
    item.element.setAttribute("aria-selected", String(active));
  });
  globalSearchActiveIndex = bounded;
  const input = document.getElementById("global-search-input");
  const activeItem = globalSearchItems[bounded];
  input?.setAttribute("aria-activedescendant", activeItem.element.id);
  activeItem.element.scrollIntoView({ block: "nearest" });
}

function moveGlobalSearchActive(direction) {
  if (!globalSearchItems.length) return;
  const next = globalSearchActiveIndex < 0
    ? 0
    : (globalSearchActiveIndex + direction + globalSearchItems.length) % globalSearchItems.length;
  setGlobalSearchActive(next);
}

function activateGlobalSearchEntry(entry) {
  if (!entry) return;
  closeGlobalSearch();
  Promise.resolve().then(() => entry.run()).catch((error) => {
    showToast(error?.message || t("We couldn't complete that request. Check your connection and try again."), "error");
  });
}

function activateGlobalSearchActive() {
  const item = globalSearchItems[globalSearchActiveIndex];
  if (item) activateGlobalSearchEntry(item.entry);
}

function renderGlobalSearchResults() {
  const results = document.getElementById("global-search-results");
  const input = document.getElementById("global-search-input");
  const status = document.getElementById("global-search-status");
  if (!results || !input) return;
  const query = globalSearchQuery.trim();
  if (!query) {
    results.hidden = true;
    results.replaceChildren();
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    if (status) status.textContent = "";
    globalSearchItems = [];
    globalSearchActiveIndex = -1;
    return;
  }

  const normalizedQuery = normalizeCategoryName(query);
  const tokens = normalizedQuery.split(" ").filter(Boolean);
  const matches = buildGlobalSearchEntries()
    .map((entry) => ({ entry, score: scoreGlobalSearchEntry(entry, normalizedQuery, tokens) }))
    .filter((item) => item.score > 0);
  const groups = new Map();
  for (const item of matches) {
    if (!groups.has(item.entry.group)) groups.set(item.entry.group, []);
    groups.get(item.entry.group).push(item);
  }

  const fragment = document.createDocumentFragment();
  globalSearchItems = [];
  let groupIndex = 0;
  const orderedGroups = [...groups.keys()].sort((a, b) => {
    const bestA = Math.max(...groups.get(a).map((item) => item.score));
    const bestB = Math.max(...groups.get(b).map((item) => item.score));
    if (bestA !== bestB) return bestB - bestA;
    return SEARCH_GROUP_ORDER.indexOf(a) - SEARCH_GROUP_ORDER.indexOf(b);
  });
  for (const groupKey of orderedGroups) {
    const groupMatches = (groups.get(groupKey) || [])
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, SEARCH_GROUP_LIMIT);
    if (!groupMatches.length) continue;
    const group = document.createElement("div");
    group.className = "global-search-group";
    group.setAttribute("role", "group");
    const labelId = `global-search-group-${groupIndex}`;
    group.setAttribute("aria-labelledby", labelId);
    const label = document.createElement("p");
    label.className = "global-search-group-label";
    label.id = labelId;
    label.textContent = t(groupKey);
    group.append(label);
    for (const { entry } of groupMatches) {
      const index = globalSearchItems.length;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "global-search-result";
      button.id = `global-search-option-${index}`;
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      const icon = document.createElement("span");
      icon.className = "global-search-result-icon";
      icon.innerHTML = SEARCH_ICONS[entry.icon] || SEARCH_ICONS.page;
      const copy = document.createElement("span");
      copy.className = "global-search-copy";
      const title = document.createElement("strong");
      title.textContent = entry.title;
      const subtitle = document.createElement("small");
      subtitle.textContent = entry.subtitle;
      copy.append(title, subtitle);
      button.append(icon, copy);
      button.addEventListener("click", () => activateGlobalSearchEntry(entry));
      button.addEventListener("pointerenter", () => setGlobalSearchActive(index));
      group.append(button);
      globalSearchItems.push({ element: button, entry });
    }
    fragment.append(group);
    groupIndex += 1;
  }

  if (!globalSearchItems.length) {
    const empty = document.createElement("div");
    empty.className = "global-search-empty";
    const title = document.createElement("strong");
    title.textContent = t("No matches for “{query}”.", { query });
    const hint = document.createElement("span");
    hint.textContent = t("Try a place, tour, administrator, page or action.");
    empty.append(title, hint);
    fragment.append(empty);
    results.replaceChildren(fragment);
    results.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.removeAttribute("aria-activedescendant");
    if (status) status.textContent = title.textContent;
    globalSearchActiveIndex = -1;
    return;
  }

  results.replaceChildren(fragment);
  results.hidden = false;
  input.setAttribute("aria-expanded", "true");
  results.scrollTop = 0;
  globalSearchActiveIndex = -1;
  setGlobalSearchActive(0);
  if (status) {
    status.textContent = globalSearchItems.length === 1
      ? t("1 result")
      : t("{n} results", { n: globalSearchItems.length });
  }
}

function closeGlobalSearch({ restoreFocus = true } = {}) {
  if (!globalSearchOpen) return;
  globalSearchOpen = false;
  const overlay = document.getElementById("global-search-overlay");
  overlay?.classList.add("is-hidden");
  overlay?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-open");
  document.body.style.paddingRight = globalSearchPreviousPaddingRight;
  globalSearchPreviousPaddingRight = "";
  globalSearchBackground.forEach((element) => { element.inert = false; });
  globalSearchBackground = [];
  document.getElementById("global-search-button")?.setAttribute("aria-expanded", "false");
  const input = document.getElementById("global-search-input");
  const results = document.getElementById("global-search-results");
  const status = document.getElementById("global-search-status");
  if (input) {
    input.value = "";
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }
  if (results) {
    results.hidden = true;
    results.replaceChildren();
  }
  if (status) status.textContent = "";
  globalSearchQuery = "";
  globalSearchActiveIndex = -1;
  globalSearchItems = [];
  if (restoreFocus) {
    const target = globalSearchReturnFocus && document.contains(globalSearchReturnFocus) && globalSearchReturnFocus.offsetParent !== null
      ? globalSearchReturnFocus
      : document.getElementById("global-search-button");
    target?.focus({ preventScroll: true });
  }
  globalSearchReturnFocus = null;
}

async function loadGlobalSearchData() {
  if (globalSearchDataTask) return globalSearchDataTask;
  const tasks = [];
  if (!cachedLocations.length) {
    tasks.push(apiRequest("/api/locations").then((locations) => {
      if (Array.isArray(locations)) {
        cachedLocations = locations;
        locationsLoaded = true;
      }
    }).catch(() => {}));
  }
  if (!cachedTours.length) {
    tasks.push(apiRequest("/api/tours").then((payload) => {
      cachedTours = Array.isArray(payload) ? payload : Array.isArray(payload?.tours) ? payload.tours : [];
    }).catch(() => {}));
  }
  if (!cachedCategories.length) {
    tasks.push(loadCategories().catch(() => {}));
  }
  if (isSuperadminAccount() && !cachedAdmins.length) {
    tasks.push(apiRequest("/api/admins").then((admins) => {
      if (Array.isArray(admins)) cachedAdmins = admins;
    }).catch(() => {}));
  }
  globalSearchDataTask = Promise.all(tasks).then(() => {
    if (globalSearchOpen && globalSearchQuery.trim()) renderGlobalSearchResults();
  }).finally(() => {
    globalSearchDataTask = null;
  });
  return globalSearchDataTask;
}

function openGlobalSearch() {
  if (globalSearchOpen) return;
  if (!authenticatedAdmin || isErrorViewOpen()) return;
  if (document.querySelector(".modal:not(.is-hidden)")) return;
  const overlay = document.getElementById("global-search-overlay");
  const input = document.getElementById("global-search-input");
  const results = document.getElementById("global-search-results");
  const status = document.getElementById("global-search-status");
  if (!overlay || !input) return;
  closeMenus();
  closeMobileNavigation();
  globalSearchOpen = true;
  globalSearchReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  globalSearchQuery = "";
  globalSearchActiveIndex = -1;
  globalSearchItems = [];
  input.value = "";
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  if (results) {
    results.hidden = true;
    results.replaceChildren();
  }
  if (status) status.textContent = "";
  overlay.classList.remove("is-hidden");
  overlay.setAttribute("aria-hidden", "false");
  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
  globalSearchPreviousPaddingRight = document.body.style.paddingRight;
  document.body.classList.add("search-open");
  if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`;
  globalSearchBackground = [...document.body.children].filter((element) => element !== overlay && !element.matches("script, style"));
  globalSearchBackground.forEach((element) => { element.inert = true; });
  document.getElementById("global-search-button")?.setAttribute("aria-expanded", "true");
  window.requestAnimationFrame(() => input.focus({ preventScroll: true }));
  loadGlobalSearchData();
}

document.getElementById("global-search-input")?.addEventListener("input", (event) => {
  globalSearchQuery = event.currentTarget.value.trim();
  renderGlobalSearchResults();
});

document.getElementById("global-search-input")?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    moveGlobalSearchActive(1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    moveGlobalSearchActive(-1);
  } else if (event.key === "Enter") {
    event.preventDefault();
    activateGlobalSearchActive();
  } else if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    closeGlobalSearch();
  }
});

document.getElementById("global-search-close")?.addEventListener("click", () => closeGlobalSearch());
document.getElementById("global-search-overlay")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeGlobalSearch();
});
document.getElementById("global-search-overlay")?.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const overlay = event.currentTarget;
  const focusables = [...overlay.querySelectorAll("input, button:not([disabled])")]
    .filter((element) => element.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
