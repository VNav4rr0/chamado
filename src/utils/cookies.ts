import { Platform } from 'react-native';

export const setCookie = (name: string, value: string, days: number = 7) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  }
};

export const getCookie = (name: string): string | null => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
};
