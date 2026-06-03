import { API_BASE_URL } from "../config/api";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

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