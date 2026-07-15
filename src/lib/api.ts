/**
 * Custom Fetch Helper to proxy requests safely in sandboxed environments.
 */

const buildTimeBaseUrl = (import.meta.env.VITE_JHORA_API_URL || '').replace(/\/$/, '');

const getBaseUrl = (): string => {
  if (buildTimeBaseUrl) {
    return buildTimeBaseUrl;
  }
  
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // If we're not on localhost or the standard Cloud Run dev/pre URLs,
    // point to the Cloud Run deployment backend.
    if (hostname !== 'localhost' && 
        hostname !== '127.0.0.1' &&
        !hostname.includes('ais-dev-2solimmwztpddkhpp6vyeg-202411574583.asia-southeast1.run.app') &&
        !hostname.includes('ais-pre-2solimmwztpddkhpp6vyeg-202411574583.asia-southeast1.run.app')) {
      return 'https://ais-pre-2solimmwztpddkhpp6vyeg-202411574583.asia-southeast1.run.app';
    }
  }
  return '';
};

export const apiFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let url = input;
  if (typeof url === 'string' && url.startsWith('/api/')) {
    const activeBaseUrl = getBaseUrl();
    if (activeBaseUrl) {
      url = `${activeBaseUrl}${url}`;
    }
  }
  return window.fetch(url, init);
};
