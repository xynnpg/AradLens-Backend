"use strict";

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const reportsDir = path.join(root, ".reports");
const junitPath = path.join(reportsDir, "junit.xml");
fs.mkdirSync(reportsDir, { recursive: true });

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Test server did not start at ${url}${lastError ? `: ${lastError.message}` : ""}`);
}

function stopProcess(child) {
  if (!child || child.killed) return;
  try { child.kill(); } catch {}
}

(async () => {
  const port = await freePort();
  const serverEnv = { ...process.env, PORT: String(port) };
  delete serverEnv.DEV_MODE;
  const server = spawn(process.execPath, ["server.js"], {
    cwd: root,
    env: serverEnv,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverError = "";
  server.stderr.on("data", (chunk) => { serverError += chunk.toString(); });
  server.once("exit", (code) => {
    if (code !== 0 && !serverError) serverError = `server exited with code ${code}`;
  });

  const cleanup = () => stopProcess(server);
  process.once("exit", cleanup);
  process.once("SIGINT", () => { cleanup(); process.exit(130); });
  process.once("SIGTERM", () => { cleanup(); process.exit(143); });

  try {
    await waitForServer(`http://127.0.0.1:${port}/`);
  } catch (error) {
    cleanup();
    if (serverError) process.stderr.write(serverError);
    throw error;
  }

  const testEnv = {
    ...process.env,
    TEST_BASE_URL: `http://127.0.0.1:${port}`,
  };
  const child = spawn(process.execPath, [
    "--test",
    "--test-reporter=spec",
    "--test-reporter-destination=stdout",
    "--test-reporter=junit",
    `--test-reporter-destination=${junitPath}`,
    path.join(__dirname, "app.test.js"),
  ], {
    cwd: root,
    env: testEnv,
    stdio: "inherit",
  });

  child.once("exit", (code, signal) => {
    cleanup();
    if (serverError) process.stderr.write(serverError);
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(typeof code === "number" ? code : 1);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
