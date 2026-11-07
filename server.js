const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const apiOrigin = process.env.ARADLENS_API_ORIGIN || "https://api.aradlens.binarysquad.club";
const publicOrigin = (process.env.PUBLIC_ORIGIN || "").replace(/\/+$/, "");
const devMode = process.env.DEV_MODE === "true";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

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
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", ...headers });
  res.end(JSON.stringify(payload));
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

function usernameFromToken(token) {
  try {
    const parts = String(token).split(".");
    if (parts.length < 2) return "";
    const claims = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    return typeof claims.username === "string" && claims.username ? claims.username : "";
  } catch {
    return "";
  }
}

function accountCookies(accounts, active, maxAge) {
  const encoded = encodeURIComponent(JSON.stringify(accounts));
  const age = Number.isFinite(maxAge) ? `; Max-Age=${Math.max(0, maxAge)}` : "";
  const cookies = [`aradlens_accounts=${encoded}; HttpOnly; SameSite=Lax; Path=/${age}`];
  if (active && accounts[active]) {
    cookies.push(`aradlens_token=${encodeURIComponent(accounts[active])}; HttpOnly; SameSite=Lax; Path=/${age}`);
    cookies.push(`aradlens_active=${encodeURIComponent(active)}; HttpOnly; SameSite=Lax; Path=/${age}`);
  }
  return cookies;
}

function clearAccountCookies() {
  const expired = "HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
  return [`aradlens_token=; ${expired}`, `aradlens_accounts=; ${expired}`, `aradlens_active=; ${expired}`];
}

async function proxyApi(req, res, pathname) {
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
  const isAdminEndpoint = /^\/api\/admins(?:\/\d+)?$/.test(pathname) && ["GET", "POST", "PUT", "DELETE"].includes(req.method);
  const isInvitesList = pathname === "/api/invites" && req.method === "GET";
  const isInviteCreate = pathname === "/api/invites" && req.method === "POST";
  const isInviteEndpoint = isInvitesList || isInviteCreate;
  const isLocationsList = pathname === "/api/locations" && req.method === "GET";
  const isLocationDetails = /^\/api\/locations\/\d+$/.test(pathname) && req.method === "GET";
  const isLocationCreate = pathname === "/api/locations" && req.method === "POST";
  const isLocationUpdate = /^\/api\/locations\/\d+$/.test(pathname) && ["PATCH", "PUT"].includes(req.method);
  const isLocationDelete = /^\/api\/locations\/\d+$/.test(pathname) && req.method === "DELETE";
  const isLocationWrite = isLocationCreate || isLocationUpdate || isLocationDelete;
  const isLocationImages = /^\/api\/locations\/\d+\/images$/.test(pathname) && ["GET", "POST"].includes(req.method);
  const isLocationImagesWrite = isLocationImages && req.method === "POST";
  const isPublicLocationRead = isLocationsList || isLocationDetails;
  const captureMatch = /^\/api\/capture\/([A-Za-z0-9_-]+)$/.exec(pathname);
  const captureImageMatch = /^\/api\/capture\/([A-Za-z0-9_-]+)\/images$/.exec(pathname);
  const isCaptureInfo = Boolean(captureMatch) && req.method === "GET";
  const isCaptureCreate = Boolean(captureMatch) && req.method === "POST";
  const isCaptureImage = Boolean(captureImageMatch) && req.method === "POST";
  const isCaptureLinkCreate = pathname === "/api/capture-links" && req.method === "POST";

  if (!isLogin && !isRegister && !isMe && !isPasswordChange && !isHealth && !isLogout && !isAccounts && !isSwitch && !isAdminEndpoint && !isInviteEndpoint && !isPublicLocationRead && !isLocationWrite && !isLocationImages && !isCaptureInfo && !isCaptureCreate && !isCaptureImage && !isCaptureLinkCreate) return false;
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
      sendJson(res, 200, { ok: true, active: null }, { "Set-Cookie": clearAccountCookies() });
    } else {
      sendJson(res, 200, { ok: true, active: remaining[0] }, { "Set-Cookie": accountCookies(accounts, remaining[0]) });
    }
    return true;
  }
  const authorization = token ? `Bearer ${token}` : clientAuthorization;
  if ((isMe || isPasswordChange || isAdminEndpoint || isInviteEndpoint || isLocationWrite || isLocationImagesWrite || isCaptureLinkCreate) && !authorization) {
    sendJson(res, 401, { detail: "Not authenticated" });
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
    sendJson(res, 200, { ok: true, active: username }, { "Set-Cookie": accountCookies(accounts, username) });
    return true;
  }
  if (devMode && isLogin) {
    if (payload.username === "admin" && ["admin", "administrare"].includes(payload.password)) {
      sendJson(res, 200, { ok: true }, {
        "Set-Cookie": accountCookies({ admin: "dev-token" }, "admin"),
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
        : (isAdminEndpoint || isInviteEndpoint || isPublicLocationRead || isLocationWrite || isLocationImages) ? pathname.replace(/^\/api/, "")
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
    if (!upstreamType.includes("application/json")) {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      const rawHeaders = { "Content-Type": upstreamType || "application/octet-stream" };
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
      responseHeaders["Set-Cookie"] = accountCookies({ ...accounts, [username]: responsePayload.access_token }, username, maxAge);
    }
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
  const decodedPath = decodeURIComponent(requested);
  const servedPath = /^\/capture\/[A-Za-z0-9_-]+$/.test(decodedPath) ? "/capture.html" : decodedPath;
  proxyApi(req, res, servedPath).then((handled) => {
    if (handled) return;
    serveStatic(req, res, servedPath);
  }).catch(() => sendJson(res, 500, { detail: "Unexpected server error" }));
});

function serveStatic(req, res, decodedPath) {
  const filePath = path.resolve(root, decodedPath === "/" ? "index.html" : `.${decodedPath}`);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    let body = data;
    if (path.basename(filePath) === "index.html") {
      body = Buffer.from(data.toString().replace(/(<meta name="aradlens-api-origin" content=")[^"]*(" \/>)/, `$1${apiOrigin}$2`));
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "text/plain; charset=utf-8" });
    res.end(body);
  });
}

server.listen(process.env.PORT || 4173, () => {
  console.log(`AradLens admin running at http://localhost:${process.env.PORT || 4173}`);
});
