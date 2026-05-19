const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3333/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
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

export const tripsApi = {
  list: () => request("/trips"),
  create: (trip) => request("/trips", { method: "POST", body: JSON.stringify(trip) }),
  update: (id, trip) => request(`/trips/${id}`, { method: "PUT", body: JSON.stringify(trip) }),
  finalize: (id) => request(`/trips/${id}/finalize`, { method: "PATCH" }),
  remove: (id) => request(`/trips/${id}`, { method: "DELETE" })
};
