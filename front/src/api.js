const localApiHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_URL = import.meta.env.VITE_API_URL || `http://${localApiHost}:3333/api`;

async function request(path, options = {}) {
  const { token, headers = {}, ...rest } = options;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...rest
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erro inesperado" }));
    throw new Error(error.message || "Erro inesperado");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const authApi = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: (token) => request("/auth/me", { token }),
  logout: () => request("/auth/logout", { method: "POST" }),
  updateMe: (payload) => request("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }),
  resendVerification: () => request("/auth/email-verification/resend", { method: "POST" }),
  confirmEmail: (token) => request("/auth/confirm-email", { method: "POST", body: JSON.stringify({ token }) })
};

export const tripsApi = {
  list: (token) => request("/trips", { token }),
  get: (id, token) => request(`/trips/${id}`, { token }),
  create: (trip, token) => request("/trips", { method: "POST", body: JSON.stringify(trip), token }),
  update: (id, trip, token) => request(`/trips/${id}`, { method: "PUT", body: JSON.stringify(trip), token }),
  finalize: (id, token) => request(`/trips/${id}/finalize`, { method: "PATCH", token }),
  remove: (id, token) => request(`/trips/${id}`, { method: "DELETE", token }),
  diaryList: (tripId, token) => request(`/trips/${tripId}/diary`, { token }),
  diaryCreate: (tripId, entry, token) =>
    request(`/trips/${tripId}/diary`, { method: "POST", body: JSON.stringify(entry), token }),
  diaryUpdate: (tripId, entryId, entry, token) =>
    request(`/trips/${tripId}/diary/${entryId}`, { method: "PUT", body: JSON.stringify(entry), token }),
  diaryRemove: (tripId, entryId, token) => request(`/trips/${tripId}/diary/${entryId}`, { method: "DELETE", token })
};
