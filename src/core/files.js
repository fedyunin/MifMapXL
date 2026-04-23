const fs = require('fs')
const path = require('path')

function collectTargets(config, log) {
  if (config.inputMode === 'files') {
    return collectTargetsFromFiles(config.selectedFiles, log)
  }

  return collectTargetsFromFolder(config.inputFolder, config.recursive, log)
}

function collectTargetsFromFiles(selectedFiles, log) {
  const normalized = (selectedFiles || []).map((filePath) => path.resolve(filePath))
  const mifFiles = normalized.filter((filePath) => path.extname(filePath).toLowerCase() === '.mif')
  const targets = []

  for (const mifPath of mifFiles) {
    const dir = path.dirname(mifPath)
    const baseName = path.basename(mifPath, path.extname(mifPath))
    const midPath = findMatchingMid(dir, baseName)

    if (!midPath) {
      log(`Skip: MID not found for ${mifPath}`)
      continue
    }

    targets.push({ mifPath, midPath })
  }

  return targets
}

function collectTargetsFromFolder(rootDir, recursive, log) {
  const files = recursive ? getAllFiles(rootDir) : getFilesInDirectory(rootDir)
  const mifFiles = files.filter((filePath) => path.extname(filePath).toLowerCase() === '.mif')
  const targets = []

  for (const mifPath of mifFiles) {
    const dir = path.dirname(mifPath)
    const baseName = path.basename(mifPath, path.extname(mifPath))
    const midPath = findMatchingMid(dir, baseName)

    if (!midPath) {
      log(`Skip: MID not found for ${mifPath}`)
      continue
    }

    targets.push({ mifPath, midPath })
  }

  return targets
}

function getFilesInDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const result = []

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue
    }

    result.push(path.join(dirPath, entry.name))
  }

  return result
}

function getAllFiles(rootDir) {
  const result = []
  const stack = [rootDir]
  const visited = new Set()

  while (stack.length) {
    const currentDir = stack.pop()
    let realPath

    try {
      realPath = fs.realpathSync(currentDir)
    } catch (error) {
      continue
    }

    if (visited.has(realPath)) {
      continue
    }

    visited.add(realPath)

    let entries

    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true })
    } catch (error) {
      continue
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      if (entry.isSymbolicLink()) {
        continue
      }

      if (entry.isDirectory()) {
        stack.push(fullPath)
        continue
      }

      if (entry.isFile()) {
        result.push(fullPath)
      }
    }
  }

  return result
}

function findMatchingMid(dir, baseName) {
  const entries = fs.readdirSync(dir)
  const target = `${baseName}.mid`.toLowerCase()

  for (const entry of entries) {
    if (entry.toLowerCase() === target) {
      return path.join(dir, entry)
    }
  }

  return null
}

function resolveOutputFolder(config) {
  if (config.outputFolder) {
    fs.mkdirSync(config.outputFolder, { recursive: true })
    return config.outputFolder
  }

  if (config.inputMode === 'folder' && config.inputFolder) {
    return config.inputFolder
  }

  if (config.inputMode === 'files' && config.selectedFiles && config.selectedFiles.length) {
    return path.dirname(config.selectedFiles[0])
  }

  return process.cwd()
}

module.exports = {
  collectTargets,
  resolveOutputFolder,
}
