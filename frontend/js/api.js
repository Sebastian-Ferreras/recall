const API_URL = "/api";

export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function request(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor");
  }

  if (!response.ok) {
    // el cuerpo puede venir vacio o no ser JSON, el status basta como mensaje
    const problem = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      problem?.title ?? `Error ${response.status}`,
      problem?.errors ?? {},
    );
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}
