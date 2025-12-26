export async function apiFetch(path, { method = 'GET', token, body } = {}) {
  const base = import.meta.env.VITE_API_BASE_URL;
  const url = `${base}${path}`;

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = payload && payload.error ? payload.error : 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}
