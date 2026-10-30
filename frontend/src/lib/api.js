const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchJson(path) {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || `Request failed (${response.status})`);
  }

  return response.json();
}

export { API_BASE_URL };
