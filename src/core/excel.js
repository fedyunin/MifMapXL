function addSheet(workbook, sheetName, headers, rows, brushColors, options) {
  const includeColorColumn = options.includeColorColumn !== false
  const colorColumnName = options.colorColumnName || 'region_color_hex'
  const finalHeaders = includeColorColumn ? [...headers, colorColumnName] : [...headers]
  const sheet = workbook.addWorksheet(sheetName)

  sheet.addRow(finalHeaders)
  styleHeaderRow(sheet.getRow(1))

  for (let i = 0; i < rows.length; i += 1) {
    const sourceRow = rows[i]
    const regionColorHex = brushColors[i] || ''
    const rowValues = includeColorColumn ? [...sourceRow, regionColorHex] : [...sourceRow]
    const row = sheet.addRow(rowValues)

    if (options.paintRows && isPaintableHex(regionColorHex, options.skipBlack)) {
      applyRowFill(row, regionColorHex, finalHeaders.length)
    }
  }

  setColumnWidths(sheet, finalHeaders, rows, brushColors, includeColorColumn)

  if (options.autofilter) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: Math.max(1, sheet.rowCount), column: finalHeaders.length },
    }
  }

  if (options.freezeHeader) {
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
  }

  return sheet
}

function styleHeaderRow(row) {
  row.font = { bold: true }
  row.alignment = { vertical: 'middle', horizontal: 'center' }

  for (let col = 1; col <= row.cellCount; col += 1) {
    const cell = row.getCell(col)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFEFEF' },
    }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD8D8D8' } },
      left: { style: 'thin', color: { argb: 'FFD8D8D8' } },
      bottom: { style: 'thin', color: { argb: 'FFD8D8D8' } },
      right: { style: 'thin', color: { argb: 'FFD8D8D8' } },
    }
  }
}

function setColumnWidths(sheet, headers, rows, colors, includeColorColumn) {
  const dataRows = includeColorColumn
    ? rows.map((row, index) => [...row, colors[index] || ''])
    : rows.map((row) => [...row])

  sheet.columns = headers.map((header, colIndex) => {
    let maxLength = String(header).length

    for (const row of dataRows) {
      const value = row[colIndex] == null ? '' : String(row[colIndex])
      if (value.length > maxLength) {
        maxLength = value.length
      }
    }

    return {
      width: Math.min(Math.max(maxLength + 2, 12), 40),
    }
  })
}

function applyRowFill(row, hexColor, columnCount) {
  const argb = `FF${hexColor.replace('#', '').toUpperCase()}`

  for (let col = 1; col <= columnCount; col += 1) {
    const cell = row.getCell(col)
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    }
  }
}

function isPaintableHex(value, skipBlack) {
  if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return false
  }

  if (skipBlack && value.toUpperCase() === '#000000') {
    return false
  }

  return true
}

function safeSheetName(baseName, workbook) {
  const cleaned = baseName.replace(/[\\/*?:\[\]]/g, '_').slice(0, 31) || 'Sheet'

  if (!workbook) {
    return cleaned
  }

  let name = cleaned
  let counter = 1

  while (workbook.getWorksheet(name)) {
    const suffix = `_${counter}`
    name = `${cleaned.slice(0, 31 - suffix.length)}${suffix}`
    counter += 1
  }

  return name
}

module.exports = {
  addSheet,
  safeSheetName,
}
