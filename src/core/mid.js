function parseMid(midText) {
  const lines = splitLinesPreserveQuoted(midText)
  const rows = []

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    rows.push(parseCsvLine(line))
  }

  return rows
}

function splitLinesPreserveQuoted(text) {
  const lines = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '""'
        i += 1
        continue
      }

      inQuotes = !inQuotes
      current += char
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.length) {
        lines.push(current.replace(/\r$/, ''))
        current = ''
      }

      if (char === '\r' && next === '\n') {
        i += 1
      }

      continue
    }

    current += char
  }

  if (current.length) {
    lines.push(current)
  }

  return lines
}

function parseCsvLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
        continue
      }

      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      continue
    }

    current += char
  }

  result.push(current)
  return result
}

function normalizeRowLength(row, expectedLength) {
  const result = [...row]

  while (result.length < expectedLength) {
    result.push('')
  }

  if (result.length > expectedLength) {
    return result.slice(0, expectedLength)
  }

  return result
}

module.exports = {
  parseMid,
  normalizeRowLength,
}
