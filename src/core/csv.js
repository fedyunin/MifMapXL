const fs = require('fs')

function writeCsvFile(filePath, headers, rows, colors, options) {
  const includeColorColumn = !options || options.includeColorColumn !== false
  const finalHeaders = includeColorColumn ? [...headers, 'region_color_hex'] : [...headers]
  const lines = [finalHeaders.map(escapeCsvValue).join(',')]

  for (let i = 0; i < rows.length; i += 1) {
    const row = includeColorColumn ? [...rows[i], colors[i] || ''] : [...rows[i]]
    lines.push(row.map(escapeCsvValue).join(','))
  }

  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8')
}

function escapeCsvValue(value) {
  const stringValue = value == null ? '' : String(value)

  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

module.exports = {
  writeCsvFile,
}
