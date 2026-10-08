import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const API_BASE_URL = 'http://localhost:8080';

// Initialize from cookies on startup
let authToken: string | null = getCookie('auth_token');
let currentUsername: string = getCookie('auth_username') || 'admin';
let currentUserRole: string = getCookie('auth_role') || 'ROLE_USER';

export function setAuthToken(token: string | null, username?: string, role?: string) {
  authToken = token;
  if (token) {
    setCookie('auth_token', token);
  } else {
    deleteCookie('auth_token');
  }

  if (username) {
    currentUsername = username;
    setCookie('auth_username', username);
  } else {
    deleteCookie('auth_username');
  }

  if (role) {
    currentUserRole = role;
    setCookie('auth_role', role);
  } else {
    deleteCookie('auth_role');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function requestApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Usuario-Id': currentUsername,
    'X-Usuario-Role': currentUserRole,
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
