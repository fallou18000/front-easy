const API_URL = import.meta.env.VITE_API_URL;

export async function api(path, options = {}) {
  const res = await fetch(API_URL + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Erreur'), { status: res.status });
  return data;
}

console.log("ENVIRONNEMENT :", import.meta.env.MODE);
console.log("VARIABLE API :", import.meta.env.VITE_API_URL);