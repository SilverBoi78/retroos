const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || res.statusText)
  }
  return res.json()
}

export const fsApi = {
  loadTree: () => apiFetch('/fs/tree'),
  writeFile: (path, content) => apiFetch(`/fs/write-file?path=${encodeURIComponent(path)}`, {
    method: 'PUT', body: JSON.stringify({ content }),
  }),
  createDir: (path) => apiFetch(`/fs/create-dir?path=${encodeURIComponent(path)}`, { method: 'POST' }),
  deleteNode: (path) => apiFetch(`/fs/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
  rename: (path, newName) => apiFetch(`/fs/rename?path=${encodeURIComponent(path)}`, {
    method: 'PATCH', body: JSON.stringify({ newName }),
  }),
}
