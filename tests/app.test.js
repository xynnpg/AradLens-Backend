"use strict";

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { createMockApi, PNG } = require("./support/mock-api");

const BASE = process.env.TEST_BASE_URL || "http://localhost:4173";
let browser;

before(async () => {
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
});

function assertClean(errors, allowed = []) {
  const unexpected = errors.filter((message) => !allowed.some((part) => message.includes(part)));
  assert.deepEqual(unexpected, [], `Unexpected browser errors:\n${unexpected.join("\n")}`);
}

async function openApp(t, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || { width: 1440, height: 932 },
    permissions: ["clipboard-read", "clipboard-write"],
    acceptDownloads: true,
  });
  const api = createMockApi({ role: options.role || "superadmin" });
  await context.route("**/api/**", (route) => api.handle(route));
  await context.route(/tile\.openstreetmap\.org/, (route) => route.fulfill({
    status: 200,
    contentType: "image/png",
    body: PNG,
  }));
  if (options.authenticated !== false) {
    await context.addInitScript(() => sessionStorage.setItem("aradlens-admin-auth", "true"));
  }
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${BASE}/${options.hash || ""}`, { waitUntil: "networkidle" });
  if (options.authenticated !== false) {
    await page.waitForSelector("#app-view:not(.is-hidden)", { timeout: 12000 });
    await page.waitForSelector(".page.active-page", { timeout: 12000 });
  }
  t.after(async () => { await context.close(); });
  return { context, page, api, errors };
}

async function goTo(page, name) {
  await page.click(`.nav-item[data-page="${name}"]`);
  await page.waitForSelector(`#page-${name}.active-page`, { timeout: 12000 });
  await page.waitForTimeout(250);
}

async function login(page) {
  await page.fill("#username", "admin");
  await page.fill("#password", "administrare");
  await page.click('#login-form button[type="submit"]');
  await page.waitForSelector("#app-view:not(.is-hidden)", { timeout: 12000 });
}

function requestCount(api, method, path) {
  return api.state.requests.filter((request) => request.method === method && request.path === path).length;
}

describe("AradLens admin", () => {
  test("login page: tabs, password reveal, invalid and valid login", async (t) => {
    const app = await openApp(t, { authenticated: false, hash: "" });
    const { page, errors } = app;
    await page.waitForSelector("#login-view:not(.is-hidden)");
    assert.equal((await page.locator("#login-error").textContent()).trim(), "");

    await page.click("#auth-tab-register");
    assert.equal(await page.locator("#register-form:not(.is-hidden)").count(), 1);
    await page.click("#auth-tab-login");
    assert.equal(await page.locator("#login-form:not(.is-hidden)").count(), 1);

    assert.equal(await page.locator("#password").getAttribute("type"), "password");
    await page.click("#toggle-login-password");
    assert.equal(await page.locator("#password").getAttribute("type"), "text");
    assert.equal(await page.locator("#toggle-login-password").getAttribute("aria-pressed"), "true");
    await page.click("#toggle-login-password");

    await page.fill("#username", "wrong");
    await page.fill("#password", "wrong");
    await page.click('#login-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById("login-error").textContent.trim().length > 0);
    assert.match(await page.locator("#login-error").textContent(), /Invalid|couldn't/i);

    await page.fill("#username", "admin");
    await page.fill("#password", "administrare");
    await page.click('#login-form button[type="submit"]');
    await page.waitForSelector("#app-view:not(.is-hidden)");
    assert.equal(await page.evaluate(() => sessionStorage.getItem("aradlens-admin-auth")), "true");
    assert.equal((await page.locator("#breadcrumb-current").textContent()).trim(), "Overview");
    assertClean(errors, ["401"]);
  });

  test("login theme and language controls", async (t) => {
    const app = await openApp(t, { authenticated: false, hash: "" });
    const { page, errors } = app;
    await page.waitForSelector("#login-view:not(.is-hidden)");
    await page.locator("#login-view [data-theme-toggle]").click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "night");
    await page.selectOption("#language-select", "ro");
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => document.documentElement.lang), "ro");
    assert.match(await page.locator(".login-intro").textContent(), /AradLens|ghid/i);
    await page.locator("#login-view [data-theme-toggle]").click();
    await page.selectOption("#language-select", "en");
    assertClean(errors);
  });

  test("overview loads live metrics and core actions", async (t) => {
    const app = await openApp(t);
    const { page, errors } = app;
    await page.waitForFunction(() => document.getElementById("stat-points-published")?.textContent.trim() !== "—");
    assert.equal((await page.locator("#stat-points-published").textContent()).trim(), "3");
    assert.equal((await page.locator("#stat-admins-overview").textContent()).trim(), "3");
    assert.equal(await page.locator(".prototype-notice").count(), 0);
    assert.equal(await page.locator("#notifications-button").count(), 0);
    assert.ok((await page.locator("#overview-queue").innerText()).length > 0);
    assert.ok(await page.locator("#overview-latest-list .activity-row").count() >= 3);

    await page.click('[data-page-action="points"]');
    await page.waitForSelector("#page-points.active-page");
    await page.click('.nav-item[data-page="overview"]');
    await page.waitForSelector("#page-overview.active-page");
    await page.click('[data-page-action="debug"]');
    await page.waitForSelector("#page-debug.active-page");
    await page.click('.nav-item[data-page="overview"]');

    await page.click("#overview-add-point");
    await page.waitForSelector("#location-modal:not(.is-hidden)");
    assert.equal(await page.locator("#location-modal-title").textContent(), "Add location");
    await page.click("#location-cancel");
    await page.waitForSelector("#location-modal", { state: "hidden" });
    assertClean(errors);
  });

  test("every page opens and shell controls work", async (t) => {
    const app = await openApp(t);
    const { page, errors } = app;
    const pages = [
      ["points", "Important points"],
      ["tours", "Tours"],
      ["attention", "Attention"],
      ["users", "Administrators"],
      ["debug", "Debug & device health"],
      ["admins", "Access control"],
    ];
    for (const [name, heading] of pages) {
      await goTo(page, name);
      assert.match(await page.locator(`#page-${name} h2`).textContent(), new RegExp(heading.replace("&", "&")));
      assert.equal(await page.locator(".page.active-page").count(), 1);
    }

    await page.click("#account-switcher");
    await page.waitForSelector("#account-menu:not(.is-hidden)");
    await page.click('#account-menu [data-menu-action="settings"]');
    await page.waitForSelector("#page-settings.active-page");
    assert.match(await page.locator("#page-settings h2").textContent(), /Settings/);

    await page.click("#sidebar-collapse");
    assert.equal(await page.locator("body.nav-collapsed").count(), 1);
    await page.click("#sidebar-collapse");
    assert.equal(await page.locator("body.nav-collapsed").count(), 0);

    await page.locator(".topbar-theme-toggle").click();
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "night");
    await page.locator(".topbar-theme-toggle").click();
    await page.selectOption("#top-language-select", "ro");
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => document.documentElement.lang), "ro");
    await page.selectOption("#top-language-select", "en");
    assertClean(errors);
  });

  test("important points: filters, view toggle, editors and capture link", async (t) => {
    const app = await openApp(t);
    const { page, api, errors } = app;
    await goTo(page, "points");
    await page.waitForFunction(() => document.querySelectorAll("#live-grid .point-card").length === 3);
    assert.equal(await page.locator("#live-grid .point-card").count(), 3);

    await page.fill("#points-search", "Aeroport");
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#live-grid .point-card:not([hidden])").count(), 1);
    await page.fill("#points-search", "");
    await page.selectOption("#points-status", "missing-photo");
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#live-grid .point-card:not([hidden])").count(), 3);
    await page.selectOption("#points-status", "complete");
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#live-grid .point-card:not([hidden])").count(), 0);
    await page.selectOption("#points-status", "all");

    await page.click("#points-view-list");
    assert.equal(await page.locator("#live-grid.list-view").count(), 1);
    await page.click("#points-view-grid");
    assert.equal(await page.locator("#live-grid.list-view").count(), 0);

    await page.locator("#live-grid .card-open").first().click();
    await page.waitForSelector("#location-modal:not(.is-hidden)");
    assert.match(await page.locator("#location-modal-title").textContent(), /Edit location/);
    assert.match(await page.locator("#location-name").inputValue(), /\[TEST QA\]/);
    await page.click("#location-cancel");
    await page.waitForSelector("#location-modal", { state: "hidden" });

    await page.click("#locations-add-button");
    await page.waitForSelector("#location-modal:not(.is-hidden)");
    assert.equal(await page.locator("#location-modal-title").textContent(), "Add location");
    await page.click("#location-cancel");

    await page.click("#categories-manage-button");
    await page.waitForSelector("#category-modal:not(.is-hidden)");
    assert.ok(await page.locator("#category-list .category-row").count() >= 2);
    await page.fill("#category-name-input", "[TEST QA] New category");
    await page.click("#category-create");
    await page.waitForFunction(() => Array.from(document.querySelectorAll("#category-list .category-name")).some((node) => node.textContent === "[TEST QA] New category"));
    assert.ok(requestCount(api, "POST", "/categories") >= 1);
    await page.click("#category-modal-done");
    await page.waitForSelector("#category-modal", { state: "hidden" });

    await page.click("#capture-link-button");
    await page.waitForSelector("#capture-modal:not(.is-hidden)");
    await page.waitForFunction(() => document.getElementById("capture-link-input").value.includes("capture/test-qa"));
    assert.match(await page.locator("#capture-link-input").inputValue(), /capture\/test-qa/);
    await page.click("#capture-modal-done");

    await page.click("#locations-refresh");
    await page.waitForTimeout(300);
    assertClean(errors);
  });

  test("tours: drag to add, reorder, remove, save, view route and delete", async (t) => {
    const app = await openApp(t);
    const { page, api, errors } = app;
    await goTo(page, "tours");
    await page.waitForFunction(() => document.querySelectorAll(".tour-row").length === 2);
    assert.equal(await page.locator(".tour-row").count(), 2);

    await page.click("#tour-add-button");
    await page.waitForSelector("#tour-modal:not(.is-hidden)");
    const firstPool = page.locator("#tour-location-pool .tour-pool-item").first();
    const poolName = (await firstPool.textContent()).replace(/^\+\s*/, "").trim();
    await firstPool.dragTo(page.locator("#tour-location-order"));
    await page.waitForTimeout(200);
    assert.equal(await page.locator("#tour-location-order .tour-stop").count(), 1);
    assert.equal((await page.locator("#tour-stop-count").textContent()).trim(), "1 stop");
    assert.match(poolName, /\[TEST QA\]/);

    await page.locator("#tour-location-pool .tour-pool-item").first().click();
    await page.waitForTimeout(200);
    assert.equal(await page.locator("#tour-location-order .tour-stop").count(), 2);
    const before = await page.locator("#tour-location-order .tour-stop-name").allInnerTexts();
    await page.locator("#tour-location-order .tour-stop").nth(1).dragTo(
      page.locator("#tour-location-order .tour-stop").first(),
      { targetPosition: { x: 20, y: 4 } },
    );
    await page.waitForTimeout(200);
    const after = await page.locator("#tour-location-order .tour-stop-name").allInnerTexts();
    assert.equal(after[0], before[1]);
    assert.equal(after[1], before[0]);

    await page.locator("#tour-location-order .tour-stop").first().dragTo(page.locator("#tour-location-pool"));
    await page.waitForTimeout(200);
    assert.equal(await page.locator("#tour-location-order .tour-stop").count(), 1);

    await page.fill("#tour-name", "[TEST QA] Drag tour");
    await page.fill("#tour-description", "Created by the automated suite");
    await page.click('#tour-form button[type="submit"]');
    await page.waitForSelector("#tour-modal", { state: "hidden" });
    const createRequest = api.state.requests.findLast((request) => request.method === "POST" && request.path === "/tours");
    assert.ok(createRequest);
    assert.equal(createRequest.body.name, "[TEST QA] Drag tour");
    assert.deepEqual(createRequest.body.location_ids, [1]);

    await page.waitForFunction(() => document.querySelectorAll(".tour-row").length === 3);
    await page.locator(".tour-row .tour-open").first().click();
    await page.waitForSelector("#tour-view-modal:not(.is-hidden)");
    assert.ok(await page.locator("#tour-view-stops .tour-stop-open").count() >= 2);
    await page.click('#tour-view-modal [data-tour-mode="street"]');
    await page.waitForTimeout(500);
    assert.match(await page.locator("#tour-view-meta").textContent(), /walking|Street route/i);
    await page.click("#tour-view-done");
    await page.waitForSelector("#tour-view-modal", { state: "hidden" });

    await page.locator(".tour-row").first().getByRole("button", { name: "Edit" }).click();
    await page.waitForSelector("#tour-modal:not(.is-hidden)");
    assert.match(await page.locator("#tour-modal-title").textContent(), /Edit tour/);
    await page.click("#tour-cancel");

    const beforeDelete = await page.locator(".tour-row").count();
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".tour-row").first().getByRole("button", { name: "Delete" }).click();
    await page.waitForTimeout(500);
    assert.equal(await page.locator(".tour-row").count(), beforeDelete - 1);
    assert.ok(requestCount(api, "DELETE", "/tours/1") + requestCount(api, "DELETE", "/tours/2") >= 1);
    assertClean(errors);
  });

  test("attention, administrators, access control and invites", async (t) => {
    const app = await openApp(t);
    const { page, api, errors } = app;

    await goTo(page, "attention");
    assert.equal(await page.locator(".attention-stat").count(), 4);
    assert.ok(await page.locator(".attention-group").count() > 0);

    await goTo(page, "users");
    await page.waitForFunction(() => document.querySelectorAll("#users-admins-list .user-row").length === 3);
    assert.equal((await page.locator("#stat-admins-total").textContent()).trim(), "3");
    assert.equal((await page.locator("#stat-admins-active").textContent()).trim(), "2");
    assert.equal((await page.locator("#stat-admins-super").textContent()).trim(), "1");
    const downloadPromise = page.waitForEvent("download");
    await page.click("#users-export-csv");
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "administrators.csv");
    await page.fill("#users-search", "qa-inactive");
    await page.waitForTimeout(150);
    assert.equal(await page.locator("#users-admins-list .user-row:not([hidden])").count(), 1);
    await page.fill("#users-search", "");

    await goTo(page, "admins");
    await page.waitForFunction(() => document.querySelectorAll("#admins-list .access-row").length === 3);
    const qaRow = page.locator("#admins-list .access-row", { hasText: "qa-admin" });
    await qaRow.getByRole("button", { name: "Edit access" }).click();
    await page.waitForSelector("#admin-modal:not(.is-hidden)");
    await page.selectOption("#admin-role", "superadmin");
    await page.click('#admin-form button[type="submit"]');
    await page.waitForSelector("#admin-modal", { state: "hidden" });
    assert.ok(requestCount(api, "PUT", "/admins/2") >= 1);

    await page.click("#admins-create-invite");
    await page.waitForSelector("#invite-modal:not(.is-hidden)");
    await page.selectOption("#invite-role", "admin");
    await page.fill("#invite-expires", "60");
    await page.click('#invite-form button[type="submit"]');
    await page.waitForSelector("#invite-created:not([hidden])");
    assert.match(await page.locator("#invite-created-code").textContent(), /TEST-QA/);
    await page.click("#invite-cancel");

    await page.click("#admins-invites");
    await page.waitForSelector("#invites-modal:not(.is-hidden)");
    await page.waitForFunction(() => document.querySelectorAll("#invites-list .invite-line").length >= 2);
    assert.ok(await page.locator("#invites-list .invite-line").count() >= 2);
    await page.locator("#invites-list .invite-line").last().getByRole("button", { name: "Revoke" }).click();
    await page.waitForSelector("#confirm-modal:not(.is-hidden)");
    await page.click("#confirm-modal-confirm");
    await page.waitForSelector("#confirm-modal", { state: "hidden" });
    assert.ok(api.state.requests.some((request) => request.method === "DELETE" && request.path.startsWith("/invites/")));
    await page.click("#invites-modal-done");

    const qaInactive = page.locator("#admins-list .access-row", { hasText: "qa-inactive" });
    await qaInactive.getByRole("button", { name: "Delete" }).click();
    await page.waitForSelector("#confirm-modal:not(.is-hidden)");
    await page.click("#confirm-modal-confirm");
    await page.waitForSelector("#confirm-modal", { state: "hidden" });
    await page.waitForFunction(() => document.querySelectorAll("#admins-list .access-row").length === 2);
    assert.ok(requestCount(api, "DELETE", "/admins/3") >= 1);
    assertClean(errors);
  });

  test("debug, settings and superadmin-only visibility", async (t) => {
    const app = await openApp(t);
    const { page, api, errors } = app;
    await goTo(page, "debug");
    assert.equal(await page.locator(".debug-states-panel").count(), 0);
    await page.click("[data-api-health]");
    await page.waitForFunction(() => document.getElementById("debug-banner-title").textContent.includes("API healthy"));

    await page.click("#account-switcher");
    await page.click('#account-menu [data-menu-action="settings"]');
    await page.waitForSelector("#page-settings.active-page");
    assert.equal(await page.locator("#account-username").inputValue(), "admin");
    assert.equal(await page.locator("#account-email").inputValue(), "admin@aradlens.local");
    await page.fill("#account-old-password", "administrare");
    await page.click('#account-form button[type="submit"]');
    await page.waitForTimeout(350);
    assert.ok(requestCount(api, "PATCH", "/admins/me") >= 1);
    assert.match(await page.locator("#toast .toast-message").textContent(), /updated/i);

    await page.click("#open-password-modal");
    await page.waitForSelector("#password-modal:not(.is-hidden)");
    await page.fill("#old-password", "administrare");
    await page.fill("#new-password", "test-password");
    await page.fill("#confirm-password", "different");
    await page.click('#change-password-form button[type="submit"]');
    await page.waitForFunction(() => document.getElementById("change-password-error").textContent.includes("do not match"));
    await page.fill("#confirm-password", "test-password");
    await page.click('#change-password-form button[type="submit"]');
    await page.waitForSelector("#password-modal", { state: "hidden" });
    assert.ok(requestCount(api, "POST", "/auth/change-password") >= 1);

    await page.click('[data-settings-theme="night"]');
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "night");
    await page.click('[data-settings-theme="day"]');
    await page.selectOption("#settings-language", "ro");
    await page.waitForTimeout(120);
    assert.equal(await page.evaluate(() => document.documentElement.lang), "ro");
    await page.selectOption("#settings-language", "en");
    assertClean(errors);

    const regular = await openApp(t, { role: "regular" });
    const regularPage = regular.page;
    assert.equal(await regularPage.locator('.nav-item[data-page="debug"]').isHidden(), true);
    assert.equal(await regularPage.locator('.nav-item[data-page="admins"]').isHidden(), true);
    assert.equal(await regularPage.locator('[data-page-action="debug"]').isHidden(), true);
    await regularPage.evaluate(() => showPage("debug"));
    await regularPage.waitForTimeout(200);
    assert.equal(await regularPage.locator("#page-overview.active-page").count(), 1);
    await regularPage.keyboard.press("Control+k");
    await regularPage.fill("#global-search-input", "debug");
    await regularPage.waitForTimeout(200);
    assert.equal(await regularPage.locator(".global-search-result", { hasText: "Debug" }).count(), 0);
    await regularPage.fill("#global-search-input", "404");
    await regularPage.waitForTimeout(200);
    assert.equal(await regularPage.locator(".global-search-empty").count(), 1);
    await regularPage.keyboard.press("Escape");
    assertClean(regular.errors);
  });

  test("global search: empty, keyboard, every result type and recovery", async (t) => {
    const app = await openApp(t);
    const { page, errors } = app;
    await page.keyboard.press("Control+k");
    await page.waitForSelector("#global-search-overlay:not(.is-hidden)");
    assert.equal(await page.locator("#global-search-results").isHidden(), true);
    assert.equal(await page.evaluate(() => document.activeElement?.id), "global-search-input");

    await page.fill("#global-search-input", "settings");
    await page.waitForTimeout(150);
    assert.ok(await page.locator(".global-search-result", { hasText: "Settings" }).count() > 0);
    await page.keyboard.press("Enter");
    await page.waitForSelector("#page-settings.active-page");

    await page.keyboard.press("Control+k");
    await page.fill("#global-search-input", "Aeroport");
    await page.waitForTimeout(200);
    await page.locator(".global-search-result", { hasText: "Aeroport" }).first().click();
    await page.waitForSelector("#location-modal:not(.is-hidden)");
    await page.click("#location-cancel");

    await page.keyboard.press("Control+k");
    await page.fill("#global-search-input", "Turul");
    await page.waitForTimeout(200);
    await page.locator(".global-search-result", { hasText: "Turul" }).first().click();
    await page.waitForSelector("#tour-view-modal:not(.is-hidden)");
    await page.click("#tour-view-done");

    await page.keyboard.press("Control+k");
    await page.fill("#global-search-input", "qa-admin");
    await page.waitForTimeout(200);
    await page.locator(".global-search-result", { hasText: "qa-admin" }).first().click();
    await page.waitForSelector("#page-users.active-page");
    await page.waitForFunction(() => document.getElementById("users-search").value === "qa-admin");
    assert.equal(await page.locator("#users-admins-list .user-row:not([hidden])").count(), 1);

    await page.keyboard.press("Control+k");
    await page.fill("#global-search-input", "404");
    await page.waitForTimeout(200);
    await page.locator(".global-search-result", { hasText: "page-not-found" }).first().click();
    await page.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal((await page.locator("#error-status-label").textContent()).trim(), "Page not found");
    await page.click("#error-primary");
    await page.waitForSelector("#page-overview.active-page");

    await page.keyboard.press("Control+k");
    await page.fill("#global-search-input", "zzzz-no-match");
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".global-search-empty").isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#global-search-overlay.is-hidden").count(), 1);

    await page.keyboard.press("Control+k");
    await page.mouse.click(10, 10);
    assert.equal(await page.locator("#global-search-overlay.is-hidden").count(), 1);
    assertClean(errors);
  });

  test("recovery screens: variants, copy, retry and return", async (t) => {
    const app = await openApp(t);
    const { page, errors } = app;

    await page.goto(`${BASE}/#error`, { waitUntil: "networkidle" });
    await page.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal((await page.locator("#error-status-label").textContent()).trim(), "Offline");
    assert.equal(await page.locator("#error-preview-note").isVisible(), true);
    await page.click("#error-copy-reference");
    await page.waitForTimeout(150);
    assert.match(await page.locator("#error-reference").textContent(), /^AL-NET-/);
    await page.click("#error-secondary");
    await page.waitForSelector("#page-overview.active-page");

    await page.goto(`${BASE}/#does-not-exist`, { waitUntil: "networkidle" });
    await page.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal((await page.locator("#error-status-label").textContent()).trim(), "Page not found");
    assert.equal(await page.locator("#error-preview-note").isHidden(), true);
    await page.click("#error-primary");
    await page.waitForSelector("#page-overview.active-page");

    await page.goto(`${BASE}/#error/500`, { waitUntil: "networkidle" });
    await page.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal((await page.locator("#error-status-label").textContent()).trim(), "Server error");
    await page.click("#error-primary");
    await page.waitForSelector("#page-overview.active-page");

    // Real offline recovery: the first /auth/me fails, the retry succeeds.
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const api = createMockApi();
    api.state.failMeOnce = true;
    await context.route("**/api/**", (route) => api.handle(route));
    await context.addInitScript(() => sessionStorage.setItem("aradlens-admin-auth", "true"));
    const offlinePage = await context.newPage();
    const offlineErrors = [];
    offlinePage.on("pageerror", (error) => offlineErrors.push(error.message));
    await offlinePage.goto(`${BASE}/#overview`, { waitUntil: "networkidle" });
    await offlinePage.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal((await offlinePage.locator("#error-status-label").textContent()).trim(), "Offline");
    assert.equal(await offlinePage.locator("#error-preview-note").isHidden(), true);
    await offlinePage.click("#error-primary");
    await offlinePage.waitForSelector("#app-view:not(.is-hidden)", { timeout: 8000 });
    assert.equal(await offlinePage.locator("#login-view:not(.is-hidden)").count(), 0);
    await context.close();
    assert.deepEqual(offlineErrors, []);
    assertClean(errors);
  });

  test("legal pages load and follow the shared theme", async (t) => {
    const app = await openApp(t);
    const { context, errors } = app;
    const legal = await context.newPage();
    const legalErrors = [];
    legal.on("console", (message) => { if (message.type() === "error") legalErrors.push(message.text()); });
    legal.on("pageerror", (error) => legalErrors.push(error.message));
    for (const path of ["terms.html", "privacy.html", "cookies.html", "content-policy.html", "accessibility.html"]) {
      const response = await legal.goto(`${BASE}/${path}`, { waitUntil: "networkidle" });
      assert.equal(response.status(), 200, path);
      assert.ok((await legal.locator("body").innerText()).length > 300, path);
      assert.equal(await legal.locator("[data-legal-theme-toggle]").count(), 1, path);
    }
    const before = await legal.evaluate(() => document.documentElement.dataset.theme || "day");
    await legal.locator("[data-legal-theme-toggle]").click();
    const after = await legal.evaluate(() => document.documentElement.dataset.theme);
    assert.notEqual(after, before);
    assert.deepEqual(legalErrors, []);
    assertClean(errors);
  });

  test("mobile navigation, search and recovery layout", async (t) => {
    const app = await openApp(t, { viewport: { width: 390, height: 844 } });
    const { page, errors } = app;
    await page.click(".mobile-menu");
    assert.equal(await page.locator(".sidebar.is-open").count(), 1);
    await page.click('.nav-item[data-page="points"]');
    await page.waitForSelector("#page-points.active-page");
    assert.equal(await page.locator(".sidebar.is-open").count(), 0);

    await page.click("#global-search-button");
    await page.waitForSelector("#global-search-overlay:not(.is-hidden)");
    await page.fill("#global-search-input", "Aeroport");
    await page.waitForTimeout(200);
    assert.ok(await page.locator(".global-search-result").count() > 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    await page.keyboard.press("Escape");

    await page.goto(`${BASE}/#error`, { waitUntil: "networkidle" });
    await page.waitForSelector(".error-view:not(.is-hidden)");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 390);
    assert.equal(await page.locator("#error-primary").isVisible(), true);
    assertClean(errors);
  });

  test("visible controls have accessible names and pages do not overflow", async (t) => {
    const app = await openApp(t);
    const { page, errors } = app;
    const pages = ["overview", "points", "tours", "attention", "users", "debug", "admins"];
    const audit = async () => page.evaluate(() => {
      const controls = [...document.querySelectorAll("button, a[href], select")].filter((element) => {
        if (element.offsetParent === null) return false;
        if (element.getAttribute("aria-hidden") === "true") return false;
        return true;
      });
      const missing = controls.map((element) => {
        const labelledBy = element.getAttribute("aria-labelledby");
        const labelledText = labelledBy
          ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent || "").join(" ")
          : "";
        const labels = element.labels ? [...element.labels].map((label) => label.textContent).join(" ") : "";
        const name = element.getAttribute("aria-label") || labelledText || labels || element.textContent || "";
        return { name: name.trim(), html: element.outerHTML.slice(0, 120) };
      }).filter((entry) => !entry.name);
      return {
        missing,
        overflow: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    for (const name of pages) {
      await goTo(page, name);
      const result = await audit();
      assert.deepEqual(result.missing, [], `${name} has unlabeled controls`);
      assert.equal(result.overflow, false, `${name} overflows horizontally`);
    }
    await page.click("#account-switcher");
    await page.click('#account-menu [data-menu-action="settings"]');
    await page.waitForSelector("#page-settings.active-page");
    const settingsAudit = await audit();
    assert.deepEqual(settingsAudit.missing, [], "settings has unlabeled controls");
    assert.equal(settingsAudit.overflow, false, "settings overflows horizontally");
    assertClean(errors);
  });
});
