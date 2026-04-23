const OBJECT_KEYWORDS = [
  'point',
  'line',
  'pline',
  'region',
  'arc',
  'text',
  'rectangle',
  'roundrect',
  'ellipse',
  'multipoint',
  'collection',
  'none',
]

const OBJECT_START_RE = new RegExp(`^(?:${OBJECT_KEYWORDS.join('|')})\\b`, 'i')
const COLUMN_TYPE_RE = /^(.+?)\s+(Char|Integer|SmallInt|LargeInt|Decimal|Float|Numeric|Date|Logical|Time|DateTime)\b/i
const BRUSH_RE = /Brush\s*\(\s*\d+\s*(?:,\s*(\d+))?/i

function parseMif(mifText) {
  const lines = mifText.split(/\r?\n/)
  const columns = []
  const objectColors = []

  let inColumns = false
  let columnsToRead = 0
  let inData = false
  let currentObjectIndex = -1

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      continue
    }

    if (!inData) {
      if (!inColumns) {
        const columnsMatch = line.match(/^Columns\s+(\d+)/i)

        if (columnsMatch) {
          inColumns = true
          columnsToRead = Number(columnsMatch[1])
          continue
        }
      } else if (columnsToRead > 0) {
        const colMatch = line.match(COLUMN_TYPE_RE)

        if (colMatch) {
          columns.push(cleanColumnName(colMatch[1]))
          columnsToRead -= 1
          continue
        }
      }

      if (/^Data\b/i.test(line)) {
        inData = true
      }

      continue
    }

    if (OBJECT_START_RE.test(line)) {
      objectColors.push('')
      currentObjectIndex = objectColors.length - 1
      continue
    }

    if (currentObjectIndex < 0) {
      continue
    }

    const brushMatch = line.match(BRUSH_RE)

    if (brushMatch && brushMatch[1] != null) {
      objectColors[currentObjectIndex] = decimalColorToHex(Number(brushMatch[1]))
    }
  }

  return {
    columns,
    brushColors: objectColors,
  }
}

function cleanColumnName(value) {
  return value.replace(/^"(.*)"$/, '$1').trim()
}

function decimalColorToHex(value) {
  const safe = Number.isFinite(value) ? value : 0
  return `#${safe.toString(16).toUpperCase().padStart(6, '0')}`
}

function buildFallbackHeaders(rows) {
  const maxLen = rows.reduce((acc, row) => Math.max(acc, row.length), 0)
  const headers = []

  for (let i = 0; i < maxLen; i += 1) {
    headers.push(`field_${i + 1}`)
  }

  return headers
}

module.exports = {
  parseMif,
  buildFallbackHeaders,
}
