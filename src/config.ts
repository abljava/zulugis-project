export const ZULU_BASE_URL = (import.meta as any).env?.VITE_ZULU_BASE_URL || 'http://zs.zulugis.ru:6473';
export const ZULU_WS_URL = `${ZULU_BASE_URL.replace(/\/$/, '')}/ws`;
export const DEFAULT_WMS_LAYER = (import.meta as any).env?.VITE_DEFAULT_LAYER || 'mo:vo';
export const AUTH_BASIC = (import.meta as any).env?.VITE_AUTH_BASIC || '';

export function getAuthHeaders(): HeadersInit | undefined {
  if (!AUTH_BASIC) return undefined;
  const token = typeof window !== 'undefined' ? btoa(AUTH_BASIC) : Buffer.from(AUTH_BASIC).toString('base64');
  return { Authorization: `Basic ${token}` };
}

