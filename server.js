const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

const root = __dirname;
const apiOrigin = process.env.ARADLENS_API_ORIGIN || "https://api.aradlens.binarysquad.club";
const publicOrigin = (process.env.PUBLIC_ORIGIN || "").replace(/\/+$/, "");
const devMode = process.env.DEV_MODE === "true";
const termsVersion = "1.0";
const consentLogPath = process.env.CONSENT_LOG_PATH || path.join(root, "data", "consent.log");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
const PUBLIC_STATIC_FILES = new Map([
  ["/", "index.html"],
  ["/index.html", "index.html"],
  ["/capture.html", "capture.html"],
  ["/terms.html", "terms.html"],
  ["/privacy.html", "privacy.html"],
  ["/cookies.html", "cookies.html"],
  ["/content-policy.html", "content-policy.html"],
  ["/accessibility.html", "accessibility.html"],
  ["/styles.css", "styles.css"],
  ["/app.js", "app.js"],
  ["/fonts.css", "fonts.css"],
  ["/legal.css", "legal.css"],
]);
const PUBLIC_ASSET_EXTENSIONS = new Set([".css", ".js", ".woff2", ".png", ".svg", ".ico", ".txt"]);
const rootRealPath = (() => {
  try {
    return fs.realpathSync(root);
  } catch {
    return root;
  }
})();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function isSecureRequest(req) {
  const forwarded = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim().toLowerCase();
  return Boolean(req.socket.encrypted) || forwarded === "https" || publicOrigin.startsWith("https://");
}

function securityHeaders(req) {
  const headers = {
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://tile.openstreetmap.org https://*.tile.openstreetmap.org; font-src 'self'; connect-src 'self'; media-src 'none'; worker-src 'none'",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Permissions-Policy": "geolocation=(self), camera=(self), microphone=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };
  if (isSecureRequest(req)) headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  return headers;
}

function clientIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
}

const rateBuckets = new Map();
function rateLimit(req, key, limit, windowMs) {
  const now = Date.now();
  const bucketKey = `${key}:${clientIp(req)}`;
  let bucket = rateBuckets.get(bucketKey);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs };
    rateBuckets.set(bucketKey, bucket);
  }
  bucket.count += 1;
  if (rateBuckets.size > 10_000) {
    for (const [existingKey, existingBucket] of rateBuckets) {
      if (existingBucket.reset <= now) rateBuckets.delete(existingKey);
    }
  }
  return bucket.count <= limit;
}

function sameOriginRequest(req) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  if (req.headers["sec-fetch-site"] === "cross-site") return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  const proto = String(req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http")).split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  return Boolean(host) && (origin === `${proto}://${host}` || (publicOrigin && origin === publicOrigin));
}

function recordConsent(req, type, username) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    username: username || null,
    terms_version: termsVersion,
    ip: clientIp(req),
    user_agent: String(req.headers["user-agent"] || "").slice(0, 300),
  };
  fs.mkdir(path.dirname(consentLogPath), { recursive: true }, () => {
    fs.appendFile(consentLogPath, `${JSON.stringify(entry)}\n`, () => {});
  });
}

const CAPTURE_TTL_MS = 24 * 60 * 60 * 1000;
const captureLinks = new Map();

function validCaptureLink(token) {
  const link = captureLinks.get(token);
  if (!link) return null;
  if (link.expiresAt <= Date.now()) {
    captureLinks.delete(token);
    return null;
  }
  return link;
}

function lanAddress() {
  for (const infos of Object.values(os.networkInterfaces())) {
    for (const info of infos || []) {
      if (info.family === "IPv4" && !info.internal) return info.address;
    }
  }
  return "";
}

function sendJson(res, status, payload, headers = {}) {
  sendBuffer(res.req || { headers: {}, socket: {} }, res, status, Buffer.from(JSON.stringify(payload)), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  });
}

/* Text responses are compressed, tagged with an ETag and allowed to answer
 * with a 304. The stylesheet, the script and the page are the whole first
 * paint, so they are the three that matter most. */
const COMPRESSIBLE_TYPE = /^(text\/|application\/(json|javascript|xml|manifest)|image\/svg\+xml)/i;
const COMPRESSION_FLOOR = 512;
const compressedCache = new Map();

function acceptsEncoding(req, encoding) {
  const header = String(req.headers["accept-encoding"] || "").toLowerCase();
  return header.split(",").some((part) => {
    const [name, ...params] = part.trim().split(";");
    if (name.trim() !== encoding) return false;
    const quality = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    return !quality || Number(quality.slice(2)) > 0;
  });
}

/* Fonts and images are already compressed. Compressing them again costs
 * server time and makes the file bigger, so they are left alone. */
function compress(req, body, contentType) {
  if (!COMPRESSIBLE_TYPE.test(String(contentType || ""))) return null;
  if (body.length < COMPRESSION_FLOOR) return null;
  const key = crypto.createHash("sha1").update(body).digest("base64url");
  let entry = compressedCache.get(key);
  if (!entry) {
    entry = {};
    if (acceptsEncoding(req, "br")) {
      entry.br = zlib.brotliCompressSync(body, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: body.length },
      });
    }
    if (acceptsEncoding(req, "gzip")) entry.gzip = zlib.gzipSync(body, { level: 6 });
    compressedCache.set(key, entry);
    if (compressedCache.size > 64) compressedCache.delete(compressedCache.keys().next().value);
  }
  if (entry.br && acceptsEncoding(req, "br")) return { body: entry.br, encoding: "br" };
  if (entry.gzip && acceptsEncoding(req, "gzip")) return { body: entry.gzip, encoding: "gzip" };
  return null;
}

/* Write a body with the right encoding, length and cache headers, and answer
 * a matching If-None-Match with 304 so a reload costs nothing. */
function sendBuffer(req, res, status, body, headers = {}) {
  const etag = `"${crypto.createHash("sha1").update(body).digest("base64url")}"`;
  if (status === 200 && String(req.headers["if-none-match"] || "") === etag) {
    res.writeHead(304, { ETag: etag, ...headers, ...securityHeaders(req) });
    res.end();
    return;
  }
  const compressed = compress(req, body, headers["Content-Type"]);
  const payload = compressed ? compressed.body : body;
  res.writeHead(status, {
    ...headers,
    "Content-Length": payload.length,
    ETag: etag,
    ...(compressed ? { "Content-Encoding": compressed.encoding, Vary: "Accept-Encoding" } : {}),
    ...securityHeaders(req),
  });
  res.end(payload);
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return [part.trim(), ""];
    return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
  }).filter(([name]) => name));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function readRawBody(req, limit = 25_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("Request body is too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseAccountsCookie(value) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([, token]) => typeof token === "string" && token));
  } catch {
    return {};
  }
}

function tokenClaims(token) {
  try {
    const parts = String(token).split(".");
    if (parts.length < 2) return null;
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function usernameFromToken(token) {
  const claims = tokenClaims(token);
  return typeof claims?.username === "string" && claims.username ? claims.username : "";
}

function maxAgeFromToken(token) {
  const claims = tokenClaims(token);
  return Number.isFinite(claims?.exp) ? Math.max(0, claims.exp - Math.floor(Date.now() / 1000)) : undefined;
}

function accountCookies(accounts, active, maxAge, secure = false) {
  const encoded = encodeURIComponent(JSON.stringify(accounts));
  const age = Number.isFinite(maxAge) ? `; Max-Age=${Math.max(0, maxAge)}` : "";
  const attributes = `HttpOnly; SameSite=Lax; Path=/${secure ? "; Secure" : ""}${age}`;
  const cookies = [`aradlens_accounts=${encoded}; ${attributes}`];
  if (active && accounts[active]) {
    cookies.push(`aradlens_token=${encodeURIComponent(accounts[active])}; ${attributes}`);
    cookies.push(`aradlens_active=${encodeURIComponent(active)}; ${attributes}`);
  }
  return cookies;
}

function clearAccountCookies(secure = false) {
  const expired = `HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? "; Secure" : ""}`;
  return [`aradlens_token=; ${expired}`, `aradlens_accounts=; ${expired}`, `aradlens_active=; ${expired}`];
}

const geocodeCache = new Map();

async function proxyApi(req, res, pathname) {
  if (!sameOriginRequest(req)) {
    sendJson(res, 403, { detail: "Cross-site request blocked." });
    return true;
  }
  if (pathname === "/api/geocode/reverse" && req.method === "GET") {
    if (!rateLimit(req, "geocode", 10, 60_000)) {
      sendJson(res, 429, { detail: "Too many geocoding requests. Try again shortly." }, { "Retry-After": "60" });
      return true;
    }
    let latitude;
    let longitude;
    try {
      const requestUrl = new URL(req.url, "http://localhost");
      latitude = Number(requestUrl.searchParams.get("lat"));
      longitude = Number(requestUrl.searchParams.get("lon") ?? requestUrl.searchParams.get("lng"));
    } catch {
      latitude = NaN;
      longitude = NaN;
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      sendJson(res, 400, { detail: "Valid lat and lon query parameters are required." });
      return true;
    }
    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      sendJson(res, 200, cached.payload, { "Cache-Control": "private, max-age=3600" });
      return true;
    }
    try {
      const upstream = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18&addressdetails=1`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": req.headers["accept-language"] || "ro,en",
          "User-Agent": "AradLensAdmin/1.0",
        },
      });
      if (!upstream.ok) {
        sendJson(res, 502, { detail: "Reverse geocoding is unavailable. Enter the place name manually." });
        return true;
      }
      const payload = await upstream.json();
      geocodeCache.set(cacheKey, { payload, expiresAt: Date.now() + 60 * 60 * 1000 });
      if (geocodeCache.size > 500) {
        const oldestKey = geocodeCache.keys().next().value;
        if (oldestKey) geocodeCache.delete(oldestKey);
      }
      sendJson(res, 200, payload, { "Cache-Control": "private, max-age=3600" });
    } catch {
      sendJson(res, 502, { detail: "Reverse geocoding is unavailable. Enter the place name manually." });
    }
    return true;
  }
  const cookies = parseCookies(req.headers.cookie);
  const clientAuthorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  const accounts = parseAccountsCookie(cookies.aradlens_accounts);
  let activeUser = typeof cookies.aradlens_active === "string" ? cookies.aradlens_active : "";
  if (!accounts[activeUser]) activeUser = Object.keys(accounts)[0] || "";
  const token = (activeUser && accounts[activeUser]) || cookies.aradlens_token;
  const isLogin = pathname === "/api/auth/login" && req.method === "POST";
  const isRegister = pathname === "/api/auth/register" && req.method === "POST";
  const isMe = pathname === "/api/auth/me" && req.method === "GET";
  const isPasswordChange = pathname === "/api/auth/change-password" && req.method === "POST";
  const isHealth = pathname === "/api/health" && req.method === "GET";
  const isLogout = pathname === "/api/auth/logout" && req.method === "POST";
  const isAccounts = pathname === "/api/auth/accounts" && req.method === "GET";
  const isSwitch = pathname === "/api/auth/switch" && req.method === "POST";
  const isAdminList = pathname === "/api/admins" && req.method === "GET";
  const isAdminUpdate = /^\/api\/admins\/\d+$/.test(pathname) && req.method === "PUT";
  const isAdminDelete = /^\/api\/admins\/\d+$/.test(pathname) && req.method === "DELETE";
  const isAdminEndpoint = isAdminList || isAdminUpdate || isAdminDelete;
  const isOwnAdminEndpoint = pathname === "/api/admins/me" && req.method === "PATCH";
  const isInvitesList = pathname === "/api/invites" && req.method === "GET";
  const isInviteCreate = pathname === "/api/invites" && req.method === "POST";
  const isInviteDelete = /^\/api\/invites\/\d+$/.test(pathname) && req.method === "DELETE";
  const isInviteEndpoint = isInvitesList || isInviteCreate || isInviteDelete;
  const isToursList = pathname === "/api/tours" && ["GET", "POST"].includes(req.method);
  const isTourDetails = /^\/api\/tours\/\d+$/.test(pathname) && ["GET", "PUT", "DELETE"].includes(req.method);
  const isTourEndpoint = isToursList || isTourDetails;
  const isTourWrite = (isToursList && req.method === "POST") || (isTourDetails && ["PUT", "DELETE"].includes(req.method));
  const isLocationsList = pathname === "/api/locations" && req.method === "GET";
  const isLocationDetails = /^\/api\/locations\/\d+$/.test(pathname) && req.method === "GET";
  const isLocationCreate = pathname === "/api/locations" && req.method === "POST";
  const isLocationUpdate = /^\/api\/locations\/\d+$/.test(pathname) && ["PATCH", "PUT"].includes(req.method);
  const isLocationDelete = /^\/api\/locations\/\d+$/.test(pathname) && req.method === "DELETE";
  const isLocationWrite = isLocationCreate || isLocationUpdate || isLocationDelete;
  const isLocationImages = /^\/api\/locations\/\d+\/images$/.test(pathname) && req.method === "POST";
  const isLocationImageFile = /^\/api\/locations\/images\/\d+$/.test(pathname) && req.method === "GET";
  const isLocationImageDelete = /^\/api\/locations\/\d+\/images\/\d+$/.test(pathname) && req.method === "DELETE";
  const isLocationImageEndpoint = isLocationImages || isLocationImageFile || isLocationImageDelete;
  const isLocationImageWrite = isLocationImages || isLocationImageDelete;
  const isCategoriesList = pathname === "/api/categories" && req.method === "GET";
  const isCategoryDetails = /^\/api\/categories\/\d+$/.test(pathname) && req.method === "GET";
  const isCategoryCreate = pathname === "/api/categories" && req.method === "POST";
  const isCategoryUpdate = /^\/api\/categories\/\d+$/.test(pathname) && req.method === "PUT";
  const isCategoryDelete = /^\/api\/categories\/\d+$/.test(pathname) && req.method === "DELETE";
  const isCategoryEndpoint = isCategoriesList || isCategoryDetails || isCategoryCreate || isCategoryUpdate || isCategoryDelete;
  const isCategoryWrite = isCategoryCreate || isCategoryUpdate || isCategoryDelete;
  const isPublicLocationRead = isLocationsList || isLocationDetails;
  const captureMatch = /^\/api\/capture\/([A-Za-z0-9_-]+)$/.exec(pathname);
  const captureImageMatch = /^\/api\/capture\/([A-Za-z0-9_-]+)\/images$/.exec(pathname);
  const isCaptureInfo = Boolean(captureMatch) && req.method === "GET";
  const isCaptureCreate = Boolean(captureMatch) && req.method === "POST";
  const isCaptureImage = Boolean(captureImageMatch) && req.method === "POST";
  const isCaptureLinkCreate = pathname === "/api/capture-links" && req.method === "POST";

  if (!isLogin && !isRegister && !isMe && !isPasswordChange && !isHealth && !isLogout && !isAccounts && !isSwitch && !isAdminEndpoint && !isOwnAdminEndpoint && !isInviteEndpoint && !isTourEndpoint && !isPublicLocationRead && !isLocationWrite && !isLocationImageEndpoint && !isCategoryEndpoint && !isCaptureInfo && !isCaptureCreate && !isCaptureImage && !isCaptureLinkCreate) return false;
  if ((isLogin || isRegister) && !rateLimit(req, "auth", 20, 15 * 60 * 1000)) {
    sendJson(res, 429, { detail: "Too many authentication attempts. Try again later." }, { "Retry-After": "900" });
    return true;
  }
  if ((isCaptureInfo || isCaptureCreate || isCaptureImage) && !rateLimit(req, "capture", 120, 15 * 60 * 1000)) {
    sendJson(res, 429, { detail: "Too many capture requests. Try again later." }, { "Retry-After": "900" });
    return true;
  }
  if (isCaptureLinkCreate && !rateLimit(req, "capture-link", 30, 60 * 60 * 1000)) {
    sendJson(res, 429, { detail: "Too many capture links created. Try again later." }, { "Retry-After": "3600" });
    return true;
  }
  if (devMode && isMe && token === "dev-token") {
    sendJson(res, 200, { username: "admin", role: "Administrator" });
    return true;
  }
  if (devMode && isPasswordChange && token === "dev-token") {
    sendJson(res, 200, { ok: true });
    return true;
  }
  if (devMode && isHealth) {
    sendJson(res, 200, { status: "ok" });
    return true;
  }
  if (isLogout) {
    delete accounts[activeUser];
    const remaining = Object.keys(accounts);
    if (!remaining.length) {
      sendJson(res, 200, { ok: true, active: null }, { "Set-Cookie": clearAccountCookies(isSecureRequest(req)) });
    } else {
      sendJson(res, 200, { ok: true, active: remaining[0] }, { "Set-Cookie": accountCookies(accounts, remaining[0], undefined, isSecureRequest(req)) });
    }
    return true;
  }
  const authorization = token ? `Bearer ${token}` : clientAuthorization;
  if ((isMe || isPasswordChange || isAdminEndpoint || isOwnAdminEndpoint || isInviteEndpoint || isTourWrite || isLocationWrite || isLocationImageWrite || isCategoryWrite || isCaptureLinkCreate) && !authorization) {
    sendJson(res, 401, { detail: "Not authenticated" });
    return true;
  }
  if (isCaptureImage && String(req.headers["x-aradlens-terms-version"] || "") !== termsVersion) {
    sendJson(res, 400, { detail: "The current Terms and Privacy Notice must be accepted before uploading an image." });
    return true;
  }

  const isMultipart = String(req.headers["content-type"] || "").includes("multipart/form-data");
  let payload;
  if (isMultipart) {
    try {
      payload = await readRawBody(req);
    } catch (error) {
      sendJson(res, 400, { detail: error.message });
      return true;
    }
  } else if (isLogin || isRegister || isPasswordChange || isInviteCreate || isLocationCreate || isLocationUpdate || req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    try {
      payload = await readJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { detail: error.message });
      return true;
    }
  }
  let consentType = "";
  let consentUsername = "";
  if (isRegister || isCaptureCreate) {
    if (!payload || payload.legal_accepted !== true || String(payload.terms_version || "") !== termsVersion) {
      sendJson(res, 400, { detail: "You must accept the current Terms of Use and Privacy Notice before continuing." });
      return true;
    }
    consentType = isRegister ? "registration" : "capture";
    consentUsername = isRegister && typeof payload.username === "string" ? payload.username : "";
    delete payload.legal_accepted;
    delete payload.terms_version;
  }
  if (isCaptureLinkCreate) {
    const token = crypto.randomBytes(24).toString("base64url");
    const expiresAt = Date.now() + CAPTURE_TTL_MS;
    const theme = payload && payload.theme === "night" ? "night" : "day";
    captureLinks.set(token, { authorization, expiresAt, theme });
    const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${process.env.PORT || 4173}`;
    const protocol = req.headers["x-forwarded-proto"] || "http";
    let base = publicOrigin || `${protocol}://${host}`;
    let lan = false;
    if (!publicOrigin && /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(base)) {
      const address = lanAddress();
      if (address) {
        const port = /:\d+$/.test(host) ? host.slice(host.lastIndexOf(":")) : "";
        base = `${protocol}://${address}${port}`;
        lan = true;
      }
    }
    sendJson(res, 200, {
      token,
      url: `${base}/capture/${token}`,
      lan,
      expires_at: new Date(expiresAt).toISOString(),
    });
    return true;
  }
  if (isCaptureInfo) {
    const link = validCaptureLink(captureMatch[1]);
    if (!link) {
      sendJson(res, 404, { detail: "This capture link is invalid or has expired." });
      return true;
    }
    sendJson(res, 200, { valid: true, theme: link.theme || "day", expires_at: new Date(link.expiresAt).toISOString() });
    return true;
  }
  if (isCaptureCreate) {
    const link = validCaptureLink(captureMatch[1]);
    if (!link) {
      sendJson(res, 404, { detail: "This capture link is invalid or has expired." });
      return true;
    }
    const name = payload && typeof payload.name === "string" ? payload.name.trim() : "";
    const latitude = Number(payload && payload.latitude);
    const longitude = Number(payload && payload.longitude);
    if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      sendJson(res, 422, { detail: "A place name and coordinates are required." });
      return true;
    }
    const forwarded = { name, latitude, longitude };
    if (payload.description) forwarded.description = String(payload.description);
    try {
      const upstream = await fetch(`${apiOrigin}/locations`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: link.authorization },
        body: JSON.stringify(forwarded),
      });
      const text = await upstream.text();
      let result;
      try { result = text ? JSON.parse(text) : {}; } catch { result = { detail: "The API returned an invalid response." }; }
      sendJson(res, upstream.status, result);
    } catch {
      sendJson(res, 502, { detail: "The AradLens API is unavailable. Try again shortly." });
    }
    return true;
  }
  if (isCaptureImage) {
    const link = validCaptureLink(captureImageMatch[1]);
    if (!link) {
      sendJson(res, 404, { detail: "This capture link is invalid or has expired." });
      return true;
    }
    const id = new URL(req.url, "http://localhost").searchParams.get("id") || "";
    if (!/^\d+$/.test(id)) {
      sendJson(res, 400, { detail: "A valid location id is required." });
      return true;
    }
    if (!Buffer.isBuffer(payload)) {
      sendJson(res, 400, { detail: "An image upload is required." });
      return true;
    }
    try {
      const upstream = await fetch(`${apiOrigin}/locations/${id}/images`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": req.headers["content-type"], Authorization: link.authorization },
        body: payload,
      });
      const text = await upstream.text();
      let result;
      try { result = text ? JSON.parse(text) : {}; } catch { result = { detail: "The API returned an invalid response." }; }
      sendJson(res, upstream.status, result);
    } catch {
      sendJson(res, 502, { detail: "The AradLens API is unavailable. Try again shortly." });
    }
    return true;
  }
  if (isAccounts) {
    const names = Object.keys(accounts);
    if (!names.length && !token) {
      sendJson(res, 401, { detail: "Not authenticated" });
      return true;
    }
    const list = names.length
      ? names.map((username) => ({ username, active: username === activeUser }))
      : [{ username: usernameFromToken(token) || "account", active: true }];
    sendJson(res, 200, { accounts: list, active: activeUser || list[0].username });
    return true;
  }
  if (isSwitch) {
    const username = payload && typeof payload.username === "string" ? payload.username : "";
    if (!username || !accounts[username]) {
      sendJson(res, 404, { detail: "Unknown account. Sign in again to add it." });
      return true;
    }
    sendJson(res, 200, { ok: true, active: username }, { "Set-Cookie": accountCookies(accounts, username, undefined, isSecureRequest(req)) });
    return true;
  }
  if (devMode && isLogin) {
    if (payload.username === "admin" && ["admin", "administrare"].includes(payload.password)) {
      sendJson(res, 200, { ok: true }, {
        "Set-Cookie": accountCookies({ admin: "dev-token" }, "admin", undefined, isSecureRequest(req)),
      });
    } else {
      sendJson(res, 401, { detail: "Invalid development credentials." });
    }
    return true;
  }

  const upstreamPath = isLogin ? "/auth/login"
    : isRegister ? "/auth/register"
    : isMe ? "/auth/me"
      : isPasswordChange ? "/auth/change-password"
        : (isAdminEndpoint || isOwnAdminEndpoint || isInviteEndpoint || isTourEndpoint || isPublicLocationRead || isLocationWrite || isLocationImageEndpoint || isCategoryEndpoint) ? pathname.replace(/^\/api/, "")
          : "/health";
  const upstreamHeaders = { Accept: req.headers.accept || "*/*" };
  if (payload) upstreamHeaders["Content-Type"] = Buffer.isBuffer(payload) ? req.headers["content-type"] : "application/json";
  if (authorization) upstreamHeaders.Authorization = authorization.startsWith("Bearer ") ? authorization : `Bearer ${authorization}`;

  try {
    const upstream = await fetch(`${apiOrigin}${upstreamPath}`, {
      method: req.method,
      headers: upstreamHeaders,
      body: payload ? (Buffer.isBuffer(payload) ? payload : JSON.stringify(payload)) : undefined,
    });
    const upstreamType = upstream.headers.get("content-type") || "";
    if (upstream.status === 204) {
      res.writeHead(204, { "Cache-Control": "no-store", ...securityHeaders(req) });
      res.end();
      return true;
    }
    if (!upstreamType.includes("application/json")) {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      const rawHeaders = { "Content-Type": upstreamType || "application/octet-stream", "Cache-Control": "no-store", ...securityHeaders(req) };
      const disposition = upstream.headers.get("content-disposition");
      if (disposition) rawHeaders["Content-Disposition"] = disposition;
      const length = upstream.headers.get("content-length");
      if (length) rawHeaders["Content-Length"] = length;
      res.writeHead(upstream.status, rawHeaders);
      res.end(buffer);
      return true;
    }
    const text = await upstream.text();
    let responsePayload;
    try {
      responsePayload = text ? JSON.parse(text) : {};
    } catch {
      responsePayload = { detail: "The API returned an invalid response." };
    }
    const responseHeaders = {};
    if (isLogin && upstream.ok && responsePayload.access_token) {
      const maxAge = Number.isFinite(responsePayload.expires_in) ? Math.max(0, responsePayload.expires_in) : undefined;
      const username = usernameFromToken(responsePayload.access_token)
        || (payload && typeof payload.username === "string" && payload.username)
        || "account";
      responseHeaders["Set-Cookie"] = accountCookies({ ...accounts, [username]: responsePayload.access_token }, username, maxAge, isSecureRequest(req));
    }
    if (isOwnAdminEndpoint && upstream.ok && activeUser && accounts[activeUser]
      && typeof responsePayload.username === "string" && responsePayload.username && responsePayload.username !== activeUser) {
      accounts[responsePayload.username] = accounts[activeUser];
      delete accounts[activeUser];
      responseHeaders["Set-Cookie"] = accountCookies(accounts, responsePayload.username, maxAgeFromToken(accounts[responsePayload.username]), isSecureRequest(req));
    }
    if (upstream.ok && consentType) recordConsent(req, consentType, consentUsername);
    sendJson(res, upstream.status, responsePayload, responseHeaders);
  } catch {
    sendJson(res, 502, { detail: "The AradLens API is unavailable. Try again shortly." });
  }
  return true;
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.split("?")[0] === "/favicon.ico") {
    res.writeHead(204);
    res.end();
    return;
  }
  let requested;
  try {
    requested = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requested);
  } catch {
    sendPlain(res, req, 400, "Bad request");
    return;
  }
  if (decodedPath.includes("\0")) {
    sendPlain(res, req, 400, "Bad request");
    return;
  }
  const servedPath = /^\/capture\/[A-Za-z0-9_-]+$/.test(decodedPath) ? "/capture.html" : decodedPath;
  proxyApi(req, res, servedPath).then((handled) => {
    if (handled) return;
    serveStatic(req, res, servedPath);
  }).catch(() => sendJson(res, 500, { detail: "Unexpected server error" }));
});

/* A version for the asset links, derived from the files themselves rather
   than from a number someone has to remember to bump. Recomputed per
   request, so a deploy that replaces a file busts the cache by itself. */
function assetVersion() {
  const material = ["styles.css", "app.js", "fonts.css"].map((name) => {
    try {
      const info = fs.statSync(path.join(root, name));
      return `${info.mtimeMs.toFixed(0)}:${info.size}`;
    } catch {
      return "0:0";
    }
  }).join("|");
  let hash = 0x811c9dc5;
  for (let index = 0; index < material.length; index += 1) {
    hash ^= material.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

function sendPlain(res, req, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8", ...securityHeaders(req) });
  res.end(message);
}

function isInside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function publicFileForPath(decodedPath) {
  const mapped = PUBLIC_STATIC_FILES.get(decodedPath);
  if (mapped) return mapped;
  if (!decodedPath.startsWith("/assets/") || decodedPath.includes("\\") || decodedPath.includes("\0")) return null;
  const segments = decodedPath.slice(1).split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.startsWith("."))) return null;
  if (!PUBLIC_ASSET_EXTENSIONS.has(path.extname(decodedPath).toLowerCase())) return null;
  return decodedPath.slice(1);
}

function allowedRealPath(relativeFile, realFilePath) {
  if (relativeFile.startsWith("assets/")) {
    const assetsRoot = path.join(rootRealPath, "assets");
    if (!isInside(assetsRoot, realFilePath)) return false;
    if (!PUBLIC_ASSET_EXTENSIONS.has(path.extname(realFilePath).toLowerCase())) return false;
    return !path.relative(assetsRoot, realFilePath).split(path.sep).some((segment) => segment === ".." || segment.startsWith("."));
  }
  const expected = path.resolve(rootRealPath, relativeFile);
  return process.platform === "win32"
    ? expected.toLowerCase() === realFilePath.toLowerCase()
    : expected === realFilePath;
}

function serveStatic(req, res, decodedPath) {
  const relativeFile = publicFileForPath(decodedPath);
  if (!relativeFile) {
    sendPlain(res, req, 404, "Not found");
    return;
  }
  const filePath = path.resolve(root, relativeFile);
  if (!isInside(root, filePath)) {
    sendPlain(res, req, 403, "Forbidden");
    return;
  }
  fs.realpath(filePath, (realError, realFilePath) => {
    if (realError) {
      sendPlain(res, req, 404, "Not found");
      return;
    }
    if (!isInside(rootRealPath, realFilePath) || !allowedRealPath(relativeFile, realFilePath)) {
      sendPlain(res, req, 403, "Forbidden");
      return;
    }
    const extension = path.extname(filePath).toLowerCase();
    fs.readFile(realFilePath, (error, data) => {
      if (error) {
        sendPlain(res, req, 404, "Not found");
        return;
      }
      let body = data;
      if (extension === ".html") {
        const html = data.toString("utf8")
          .replace(/(<meta name="aradlens-api-origin" content=")[^"]*(" \/>)/, `$1${escapeHtml(apiOrigin)}$2`)
          /* Stamp the asset links with a version derived from the files
             themselves, so a deploy that changes the CSS or the JS always
             produces a new URL. A hand-kept query string silently rots the
             moment someone forgets to bump it, and any caching proxy in
             front of the app then keeps serving the old build. */
          .replace(/(\?v=)[0-9a-z]*/gi, `$1${assetVersion()}`)
          .replace(/(href|src)="(\/[^"?]+\.(?:css|js))"/gi, (match, attribute, url) => `${attribute}="${url}?v=${assetVersion()}"`);
        body = Buffer.from(html, "utf8");
      }
      /* A link with a version in it can never change under that URL, so it
         may sit in the browser cache for a year. Everything else
         revalidates, and the ETag turns that revalidation into a 304 with
         no body. */
      const versioned = /[?&]v=[0-9a-z]+/i.test(req.url || "");
      const cacheControl = versioned
        ? "public, max-age=31536000, immutable"
        : extension === ".html" || extension === ".js" || extension === ".css"
          ? "no-cache"
          : extension === ".woff2" || extension === ".png" || extension === ".svg"
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600";
      sendBuffer(req, res, 200, body, {
        "Content-Type": mime[extension] || "application/octet-stream",
        "Cache-Control": cacheControl,
      });
    });
  });
}

server.listen(process.env.PORT || 4173, () => {
  console.log(`AradLens admin running at http://localhost:${process.env.PORT || 4173}`);
});
