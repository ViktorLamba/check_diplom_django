// const API_BASE_URL = "http://127.0.0.1:8000";
const API_BASE_URL = "";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail || "Ошибка при выполнении запроса");
  }

  return data as T;
}
