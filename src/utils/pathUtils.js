export function resolvePath(cwd, inputPath) {
  if (!inputPath) return cwd

  const parts = inputPath.startsWith('/')
    ? inputPath.split('/').filter(Boolean)
    : [...cwd.split('/').filter(Boolean), ...inputPath.split('/').filter(Boolean)]

  const resolved = []
  for (const part of parts) {
    if (part === '.') continue
    if (part === '..') {
      resolved.pop()
    } else {
      resolved.push(part)
    }
  }

  return '/' + resolved.join('/')
}

export function getFileName(path) {
  const parts = path.split('/').filter(Boolean)
  return parts.length > 0 ? parts[parts.length - 1] : ''
}

export function getParentPath(path) {
  const parts = path.split('/').filter(Boolean)
  if (parts.length <= 1) return '/'
  parts.pop()
  return '/' + parts.join('/')
}

export function joinPath(...segments) {
  const parts = segments.join('/').split('/').filter(Boolean)
  return '/' + parts.join('/')
}
