const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const apiOrigin = process.env.ARADLENS_API_ORIGIN || "http://api.aradlens.binarysquad.club";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

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

async function proxyApi(req, res, pathname) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.aradlens_token;
  const isLogin = pathname === "/api/auth/login" && req.method === "POST";
  const isMe = pathname === "/api/auth/me" && req.method === "GET";
  const isPasswordChange = pathname === "/api/auth/change-password" && req.method === "POST";
  const isHealth = pathname === "/api/health" && req.method === "GET";
  const isLogout = pathname === "/api/auth/logout" && req.method === "POST";

  if (!isLogin && !isMe && !isPasswordChange && !isHealth && !isLogout) return false;
  if (isLogout) {
    sendJson(res, 200, { ok: true }, {
      "Set-Cookie": "aradlens_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    });
    return true;
  }
  if ((isMe || isPasswordChange) && !token) {
    sendJson(res, 401, { detail: "Not authenticated" });
    return true;
  }

  let payload;
  if (isLogin || isPasswordChange) {
    try {
      payload = await readJsonBody(req);
    } catch (error) {
      sendJson(res, 400, { detail: error.message });
      return true;
    }
  }

  const upstreamPath = isLogin ? "/auth/login"
    : isMe ? "/auth/me"
      : isPasswordChange ? "/auth/change-password"
        : "/health";
  const upstreamHeaders = { Accept: "application/json" };
  if (payload) upstreamHeaders["Content-Type"] = "application/json";
  if (token) upstreamHeaders.Authorization = `Bearer ${token}`;

  try {
    const upstream = await fetch(`${apiOrigin}${upstreamPath}`, {
      method: isLogin || isPasswordChange ? "POST" : "GET",
      headers: upstreamHeaders,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const text = await upstream.text();
    let responsePayload;
    try {
      responsePayload = text ? JSON.parse(text) : {};
    } catch {
      responsePayload = { detail: "The API returned an invalid response." };
    }
    const responseHeaders = {};
    if (isLogin && upstream.ok && responsePayload.access_token) {
      const maxAge = Number.isFinite(responsePayload.expires_in) ? `; Max-Age=${Math.max(0, responsePayload.expires_in)}` : "";
      responseHeaders["Set-Cookie"] = `aradlens_token=${encodeURIComponent(responsePayload.access_token)}; HttpOnly; SameSite=Lax; Path=/${maxAge}`;
      responsePayload = { ok: true };
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
  proxyApi(req, res, decodedPath).then((handled) => {
    if (handled) return;
    serveStatic(req, res, decodedPath);
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
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "text/plain; charset=utf-8" });
    res.end(data);
  });
}

server.listen(process.env.PORT || 4173, () => {
  console.log(`AradLens admin running at http://localhost:${process.env.PORT || 4173}`);
});
