const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL tanımlı değil.");
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }

    throw new Error("Oturum süresi doldu. Lütfen tekrar giriş yapın.");
  }

  if (response.status === 403) {
    throw new Error("Bu işlem için yetkiniz yok.");
  }

  const contentType = response.headers.get("content-type");

  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (typeof data === "string") {
      throw new Error(data || "İstek başarısız oldu.");
    }

    if (data?.message) {
      throw new Error(data.message);
    }

    if (data?.title) {
      throw new Error(data.title);
    }

    throw new Error("İstek başarısız oldu.");
  }

  return data;
}