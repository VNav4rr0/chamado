const API_BASE_URL = 'http://localhost:8080';

let authToken: string | null = null;
let currentUsername: string = 'admin';

export function setAuthToken(token: string | null, username?: string) {
  authToken = token;
  if (username) currentUsername = username;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Usuario-Id': currentUsername,
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na API (${response.status}): ${errText || response.statusText}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}
