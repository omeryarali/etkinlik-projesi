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
    if (__DEV__) {
      console.log("API ERROR URL:", url);
      console.log("API ERROR STATUS:", response.status);
      console.log("API ERROR DATA:", data);
    }

    if (typeof data === "string") {
      throw new Error(data || `İstek başarısız oldu. Status: ${response.status}`);
    }

    if (data?.message) {
      throw new Error(data.message);
    }

    if (data?.title) {
      throw new Error(data.title);
    }

    if (data?.errors) {
      const firstKey = Object.keys(data.errors)[0];
      const firstError = data.errors[firstKey]?.[0];

      if (firstError) {
        throw new Error(firstError);
      }
    }

    throw new Error(`İstek başarısız oldu. Status: ${response.status}`);
  }

  return data;
}
