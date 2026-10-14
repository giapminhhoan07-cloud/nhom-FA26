export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiBaseUrl(location = globalThis.location, configuredUrl = globalThis.STUDYSPHERE_API_URL) {
  if (configuredUrl) return String(configuredUrl).replace(/\/$/, "");
  if (["localhost", "127.0.0.1"].includes(location?.hostname)) return "http://localhost:3000";
  return "";
}

export function createApiClient({
  baseUrl = getApiBaseUrl(),
  fetcher = (...args) => globalThis.fetch(...args),
} = {}) {
  async function request(resource, options = {}) {
    if (!baseUrl) throw new ApiError("JSON-server chưa được cấu hình cho website này.");

    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body !== undefined) headers.set("Content-Type", "application/json");

    let response;
    try {
      response = await fetcher(`${baseUrl}/${String(resource).replace(/^\//, "")}`, {
        ...options,
        headers,
      });
    } catch {
      throw new ApiError("Không kết nối được JSON-server tại http://localhost:3000.");
    }

    if (!response.ok) {
      throw new ApiError(`JSON-server trả về lỗi HTTP ${response.status}.`, response.status);
    }
    if (response.status === 204) return null;

    try {
      return await response.json();
    } catch {
      throw new ApiError("JSON-server trả về dữ liệu không hợp lệ.", response.status);
    }
  }

  return {
    request,
    list(resource, filters = {}) {
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== null),
      ).toString();
      return request(`${resource}${query ? `?${query}` : ""}`);
    },
    create(resource, record) {
      return request(resource, { method: "POST", body: JSON.stringify(record) });
    },
    update(resource, id, changes) {
      return request(`${resource}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
    },
  };
}

export const apiClient = createApiClient();