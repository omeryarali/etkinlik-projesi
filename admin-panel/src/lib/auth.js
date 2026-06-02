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

  if (!userRaw) {
    return null;
  }

  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

export function isAdminLoggedIn() {
  const token = getAdminToken();
  const user = getAdminUser();

  return !!token && user?.role === "Admin";
}

export function logoutAdmin() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  window.location.href = "/login";
}

export function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  window.location.href = "/login";
}