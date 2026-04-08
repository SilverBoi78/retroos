import { apiFetch } from './api'

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
