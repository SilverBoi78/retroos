function parsePath(path) {
  return path.split('/').filter(Boolean)
}

function getNode(fs, path) {
  if (path === '/') return fs
  let node = fs
  for (const part of parsePath(path)) {
    if (!node || node.type !== 'directory' || !node.children[part]) {
      return null
    }
    node = node.children[part]
  }
  return node
}

function getParentAndName(fs, path) {
  const parts = parsePath(path)
  if (parts.length === 0) return { parent: null, name: null }
  const name = parts.pop()
  const parent = getNode(fs, '/' + parts.join('/'))
  return { parent, name }
}

export function createFileSystem({ initialTree, api }) {
  const fs = initialTree

  function readDir(path) {
    const node = getNode(fs, path)
    if (!node || node.type !== 'directory') return null
    return Object.entries(node.children).map(([name, child]) => ({
      name,
      type: child.type,
      modifiedAt: child.modifiedAt || null,
      size: child.type === 'file' ? (child.content || '').length : null,
    }))
  }

  function readFile(path) {
    const node = getNode(fs, path)
    if (!node || node.type !== 'file') return null
    return node.content
  }

  function writeFile(path, content) {
    const { parent, name } = getParentAndName(fs, path)
    if (!parent || parent.type !== 'directory') return false
    const now = new Date().toISOString()
    if (parent.children[name] && parent.children[name].type === 'file') {
      parent.children[name].content = content
      parent.children[name].modifiedAt = now
    } else {
      parent.children[name] = { type: 'file', content, createdAt: now, modifiedAt: now }
    }
    api.writeFile(path, content).catch(err => console.error('[FS sync]', err.message))
    return true
  }

  function createDir(path) {
    const { parent, name } = getParentAndName(fs, path)
    if (!parent || parent.type !== 'directory') return false
    if (parent.children[name]) return false
    parent.children[name] = { type: 'directory', children: {} }
    api.createDir(path).catch(err => console.error('[FS sync]', err.message))
    return true
  }

  function deleteNode(path) {
    if (path === '/') return false
    const { parent, name } = getParentAndName(fs, path)
    if (!parent || parent.type !== 'directory' || !parent.children[name]) return false
    delete parent.children[name]
    api.deleteNode(path).catch(err => console.error('[FS sync]', err.message))
    return true
  }

  function rename(path, newName) {
    const { parent, name } = getParentAndName(fs, path)
    if (!parent || !parent.children[name]) return false
    if (parent.children[newName]) return false
    parent.children[newName] = parent.children[name]
    delete parent.children[name]
    api.rename(path, newName).catch(err => console.error('[FS sync]', err.message))
    return true
  }

  function exists(path) {
    return getNode(fs, path) !== null
  }

  function getNodeType(path) {
    const node = getNode(fs, path)
    return node ? node.type : null
  }

  return { readDir, readFile, writeFile, createDir, deleteNode, rename, exists, getNodeType }
}
