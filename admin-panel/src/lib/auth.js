const ADMIN_SESSION_EVENT = "admin-session-change";
const SERVER_ADMIN_SESSION_SNAPSHOT = Object.freeze({
  checked: false,
  isAuthenticated: false,
  adminUser: null,
});
const UNAUTHENTICATED_ADMIN_SESSION_SNAPSHOT = Object.freeze({
  checked: true,
  isAuthenticated: false,
  adminUser: null,
});

let lastAdminSessionSignature = "__unauthenticated__";
let lastAdminSessionSnapshot = UNAUTHENTICATED_ADMIN_SESSION_SNAPSHOT;

function sanitizeAdminUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const { token: _token, ...safeUser } = user;
  return safeUser;
}

function parseAdminUser(userRaw) {
  if (!userRaw) {
    return null;
  }

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

function emitAdminSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

export function getAdminToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("adminToken");
}

export function getAdminUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const userRaw = localStorage.getItem("adminUser");
  const user = parseAdminUser(userRaw);

  if (!user && userRaw) {
    clearAdminSession();
  }

  return user;
}

export function isAdminLoggedIn() {
  if (typeof window === "undefined") {
    return false;
  }

  const token = localStorage.getItem("adminToken");
  const user = parseAdminUser(localStorage.getItem("adminUser"));

  return !!token && user?.role === "Admin";
}

export function getAdminSessionSnapshot() {
  if (typeof window === "undefined") {
    return SERVER_ADMIN_SESSION_SNAPSHOT;
  }

  const token = localStorage.getItem("adminToken");
  const userRaw = localStorage.getItem("adminUser");
  const user = parseAdminUser(userRaw);

  if (!token || user?.role !== "Admin") {
    lastAdminSessionSignature = "__unauthenticated__";
    lastAdminSessionSnapshot = UNAUTHENTICATED_ADMIN_SESSION_SNAPSHOT;
    return lastAdminSessionSnapshot;
  }

  const nextSignature = `${token}::${userRaw}`;

  if (nextSignature === lastAdminSessionSignature) {
    return lastAdminSessionSnapshot;
  }

  lastAdminSessionSignature = nextSignature;
  lastAdminSessionSnapshot = {
    checked: true,
    isAuthenticated: true,
    adminUser: user,
  };

  return lastAdminSessionSnapshot;
}

export function getServerAdminSessionSnapshot() {
  return SERVER_ADMIN_SESSION_SNAPSHOT;
}

export function subscribeAdminSession(listener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(ADMIN_SESSION_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(ADMIN_SESSION_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function saveAdminSession(token, user) {
  if (typeof window === "undefined") {
    return;
  }

  const safeUser = sanitizeAdminUser(user);

  if (!token || !safeUser) {
    clearAdminSession();
    return;
  }

  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(safeUser));
  emitAdminSessionChange();
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  emitAdminSessionChange();
}

export function logoutAdmin() {
  if (typeof window === "undefined") {
    return;
  }

  clearAdminSession();
  window.location.href = "/login";
}

export function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  clearAdminSession();
  window.location.href = "/login";
}
