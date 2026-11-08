"use strict";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4WQAAAAASUVORK5CYII=",
  "base64",
);

const QA = "[TEST QA]";
const SUPERADMIN = {
  id: 1,
  username: "admin",
  email: "admin@aradlens.local",
  role: "superadmin",
  is_active: true,
};
const REGULAR = {
  id: 2,
  username: "qa-admin",
  email: "qa-admin@aradlens.local",
  role: "Administrator",
  is_active: true,
};

function json(route, status, body) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function safeBody(request) {
  try {
    return request.postDataJSON();
  } catch {
    return null;
  }
}

function createMockApi({ role = "superadmin" } = {}) {
  const me = role === "superadmin" ? { ...SUPERADMIN } : { ...REGULAR };
  const state = {
    me,
    admins: [
      { ...SUPERADMIN },
      { ...REGULAR },
      {
        id: 3,
        username: "qa-inactive",
        email: "qa-inactive@aradlens.local",
        role: "admin",
        is_active: false,
      },
    ],
    categories: [
      { id: 1, name: `${QA} Cultură` },
      { id: 2, name: `${QA} Parcuri` },
    ],
    locations: [
      {
        id: 1,
        name: `${QA} Aeroport`,
        latitude: 46.172433,
        longitude: 21.278315,
        description: "Aeroportul de test",
        images: [],
        category: { id: 1, name: `${QA} Cultură` },
      },
      {
        id: 2,
        name: `${QA} Catedrala`,
        latitude: 46.183516,
        longitude: 21.324668,
        description: "Catedrala de test",
        images: [],
        category: { id: 1, name: `${QA} Cultură` },
      },
      {
        id: 3,
        name: `${QA} Parcul`,
        latitude: 46.17048,
        longitude: 21.31193,
        description: "Parcul de test",
        images: [],
        category: { id: 2, name: `${QA} Parcuri` },
      },
    ],
    tours: [
      {
        id: 1,
        name: `${QA} Turul Centrului`,
        description: "Traseu de test",
        location_ids: [1, 2],
        created_at: "2026-01-01T10:00:00",
        locations: [],
      },
      {
        id: 2,
        name: `${QA} Turul Parcului`,
        description: "Alt traseu de test",
        location_ids: [2, 3],
        created_at: "2026-01-02T10:00:00",
        locations: [],
      },
    ],
    invites: [
      {
        id: 1,
        code: "TEST-QA-INVITE",
        role: "admin",
        expires_at: "2026-12-31T23:59:59",
        is_revoked: false,
        used_at: null,
      },
    ],
    requests: [],
    failMeOnce: false,
  };

  async function handle(route) {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, "");
    const method = request.method();
    const body = safeBody(request);
    state.requests.push({ method, path, body });

    if (path === "/auth/login" && method === "POST") {
      if (body?.username === "admin" && body?.password === "administrare") {
        return json(route, 200, { ok: true });
      }
      return json(route, 401, { detail: "Invalid credentials." });
    }
    if (path === "/auth/me" && method === "GET") {
      if (state.failMeOnce) {
        state.failMeOnce = false;
        return route.abort("failed");
      }
      return json(route, 200, state.me);
    }
    if (path === "/auth/accounts" && method === "GET") {
      return json(route, 200, {
        accounts: [{ username: state.me.username, active: true }],
        active: state.me.username,
      });
    }
    if (path === "/auth/logout" && method === "POST") return json(route, 200, { ok: true, active: null });
    if (path === "/auth/switch" && method === "POST") return json(route, 200, { ok: true, active: state.me.username });
    if (path === "/auth/change-password" && method === "POST") return json(route, 200, { ok: true });
    if (path === "/auth/register" && method === "POST") return json(route, 200, { ok: true });
    if (path === "/health" && method === "GET") return json(route, 200, { status: "ok" });

    if (path === "/admins" && method === "GET") return json(route, 200, state.admins);
    if (path === "/admins/me" && method === "PATCH") {
      Object.assign(state.me, body || {});
      state.admins = state.admins.map((admin) => (admin.id === state.me.id ? { ...admin, ...state.me } : admin));
      return json(route, 200, state.me);
    }
    const adminMatch = /^\/admins\/(\d+)$/.exec(path);
    if (adminMatch) {
      const id = Number(adminMatch[1]);
      const admin = state.admins.find((item) => item.id === id);
      if (!admin) return json(route, 404, { detail: "Administrator not found." });
      if (method === "GET") return json(route, 200, admin);
      if (method === "PUT") {
        Object.assign(admin, body || {});
        return json(route, 200, admin);
      }
      if (method === "DELETE") {
        state.admins = state.admins.filter((item) => item.id !== id);
        return json(route, 200, { ok: true });
      }
    }

    if (path === "/invites" && method === "GET") return json(route, 200, state.invites);
    if (path === "/invites" && method === "POST") {
      const invite = {
        id: Math.max(0, ...state.invites.map((item) => item.id)) + 1,
        code: `TEST-QA-${state.invites.length + 1}`,
        role: body?.role || "admin",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        is_revoked: false,
        used_at: null,
      };
      state.invites.push(invite);
      return json(route, 200, invite);
    }
    const inviteMatch = /^\/invites\/(\d+)$/.exec(path);
    if (inviteMatch && method === "DELETE") {
      state.invites = state.invites.filter((invite) => invite.id !== Number(inviteMatch[1]));
      return json(route, 200, { ok: true });
    }

    if (path === "/locations" && method === "GET") return json(route, 200, state.locations);
    if (path === "/locations" && method === "POST") {
      const category = state.categories.find((item) => String(item.id) === String(body?.category_id));
      const location = {
        id: Math.max(0, ...state.locations.map((item) => item.id)) + 1,
        name: body?.name || `${QA} New place`,
        latitude: body?.latitude ?? null,
        longitude: body?.longitude ?? null,
        description: body?.description || "",
        images: [],
        category: category ? { id: category.id, name: category.name } : null,
      };
      state.locations.push(location);
      return json(route, 200, location);
    }
    const locationMatch = /^\/locations\/(\d+)$/.exec(path);
    if (locationMatch && method === "GET") {
      const location = state.locations.find((item) => item.id === Number(locationMatch[1]));
      return location ? json(route, 200, location) : json(route, 404, { detail: "Location not found." });
    }
    if (locationMatch && ["PATCH", "PUT"].includes(method)) {
      const location = state.locations.find((item) => item.id === Number(locationMatch[1]));
      if (!location) return json(route, 404, { detail: "Location not found." });
      Object.assign(location, body || {});
      const category = state.categories.find((item) => String(item.id) === String(body?.category_id));
      if (category) location.category = { id: category.id, name: category.name };
      return json(route, 200, location);
    }
    if (locationMatch && method === "DELETE") {
      state.locations = state.locations.filter((item) => item.id !== Number(locationMatch[1]));
      return json(route, 200, { ok: true });
    }
    const locationImageMatch = /^\/locations\/images\/(\d+)$/.exec(path);
    if (locationImageMatch && method === "GET") {
      return route.fulfill({ status: 200, contentType: "image/png", body: PNG });
    }
    const locationImagesMatch = /^\/locations\/(\d+)\/images$/.exec(path);
    if (locationImagesMatch && method === "POST") return json(route, 200, { id: 1, images: [1] });
    const locationImageDeleteMatch = /^\/locations\/(\d+)\/images\/(\d+)$/.exec(path);
    if (locationImageDeleteMatch && method === "DELETE") return json(route, 200, { ok: true });

    if (path === "/categories" && method === "GET") return json(route, 200, state.categories);
    if (path === "/categories" && method === "POST") {
      const category = {
        id: Math.max(0, ...state.categories.map((item) => item.id)) + 1,
        name: body?.name || `${QA} New category`,
      };
      state.categories.push(category);
      return json(route, 200, category);
    }
    const categoryMatch = /^\/categories\/(\d+)$/.exec(path);
    if (categoryMatch) {
      const category = state.categories.find((item) => item.id === Number(categoryMatch[1]));
      if (!category) return json(route, 404, { detail: "Category not found." });
      if (method === "GET") return json(route, 200, category);
      if (["PATCH", "PUT"].includes(method)) {
        Object.assign(category, body || {});
        return json(route, 200, category);
      }
      if (method === "DELETE") {
        state.categories = state.categories.filter((item) => item.id !== category.id);
        return json(route, 200, { ok: true });
      }
    }

    if (path === "/tours" && method === "GET") return json(route, 200, state.tours);
    if (path === "/tours" && method === "POST") {
      const tour = {
        id: Math.max(0, ...state.tours.map((item) => item.id)) + 1,
        name: body?.name || `${QA} New tour`,
        description: body?.description || "",
        location_ids: body?.location_ids || [],
        created_at: new Date().toISOString(),
        locations: [],
      };
      state.tours.push(tour);
      return json(route, 200, tour);
    }
    const tourMatch = /^\/tours\/(\d+)$/.exec(path);
    if (tourMatch) {
      const tour = state.tours.find((item) => item.id === Number(tourMatch[1]));
      if (!tour) return json(route, 404, { detail: "Tour not found." });
      if (method === "GET") return json(route, 200, tour);
      if (["PATCH", "PUT"].includes(method)) {
        Object.assign(tour, body || {});
        return json(route, 200, tour);
      }
      if (method === "DELETE") {
        state.tours = state.tours.filter((item) => item.id !== tour.id);
        return json(route, 200, { ok: true });
      }
    }

    if (path === "/geocode/search" && method === "GET") {
      return json(route, 200, [
        {
          name: `${QA} Arad`,
          display_name: `${QA} Arad, România`,
          lat: "46.1753793",
          lon: "21.3196342",
        },
      ]);
    }
    if (path === "/geocode/reverse" && method === "GET") {
      return json(route, 200, { display_name: `${QA} Arad, România` });
    }
    if (path === "/route/walk" && method === "GET") {
      return json(route, 200, {
        coordinates: [
          [46.172433, 21.278315],
          [46.175, 21.3],
          [46.183516, 21.324668],
        ],
        distance: 1234,
      });
    }
    if (path === "/capture-links" && method === "POST") {
      return json(route, 200, {
        url: "http://localhost/capture/test-qa",
        expires_at: new Date(Date.now() + 86400000).toISOString(),
        lan: false,
      });
    }

    return json(route, 404, { detail: `No mock for ${method} ${path}` });
  }

  return { state, handle };
}

module.exports = { createMockApi, QA, PNG };
