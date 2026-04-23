const test = require('node:test')
const assert = require('node:assert')
const ExcelJS = require('exceljs')

const { addSheet, safeSheetName } = require('../../src/core/excel')

function defaultOptions(overrides) {
  return {
    paintRows: true,
    skipBlack: true,
    autofilter: false,
    freezeHeader: false,
    includeColorColumn: true,
    ...overrides,
  }
}

function buildSheet(options) {
  const workbook = new ExcelJS.Workbook()
  const sheet = addSheet(
    workbook,
    'test',
    ['a', 'b'],
    [['1', '2'], ['3', '4']],
    ['#FF0000', '#000000'],
    defaultOptions(options),
  )
  return { workbook, sheet }
}

test('addSheet appends region_color_hex column by default', () => {
  const { sheet } = buildSheet()
  assert.deepStrictEqual(sheet.getRow(1).values.slice(1), ['a', 'b', 'region_color_hex'])
  assert.deepStrictEqual(sheet.getRow(2).values.slice(1), ['1', '2', '#FF0000'])
  assert.deepStrictEqual(sheet.getRow(3).values.slice(1), ['3', '4', '#000000'])
})

test('addSheet omits the color column when includeColorColumn is false', () => {
  const { sheet } = buildSheet({ includeColorColumn: false })
  assert.deepStrictEqual(sheet.getRow(1).values.slice(1), ['a', 'b'])
  assert.deepStrictEqual(sheet.getRow(2).values.slice(1), ['1', '2'])
})

test('addSheet fills cells with the region color when paintRows is enabled', () => {
  const { sheet } = buildSheet()
  assert.strictEqual(sheet.getRow(2).getCell(1).fill.fgColor.argb, 'FFFF0000')
  assert.strictEqual(sheet.getRow(2).getCell(2).fill.fgColor.argb, 'FFFF0000')
})

test('addSheet skips fill for black rows when skipBlack is enabled', () => {
  const { sheet } = buildSheet()
  assert.strictEqual(sheet.getRow(3).getCell(1).fill, undefined)
})

test('addSheet fills black rows when skipBlack is disabled', () => {
  const { sheet } = buildSheet({ skipBlack: false })
  assert.strictEqual(sheet.getRow(3).getCell(1).fill.fgColor.argb, 'FF000000')
})

test('addSheet does not fill any data row when paintRows is disabled', () => {
  const { sheet } = buildSheet({ paintRows: false })
  assert.strictEqual(sheet.getRow(2).getCell(1).fill, undefined)
  assert.strictEqual(sheet.getRow(3).getCell(1).fill, undefined)
})

test('addSheet row fill continues to work even when the color column is hidden', () => {
  const { sheet } = buildSheet({ includeColorColumn: false })
  assert.strictEqual(sheet.getRow(2).getCell(1).fill.fgColor.argb, 'FFFF0000')
  assert.strictEqual(sheet.getRow(3).getCell(1).fill, undefined)
})

test('addSheet enables autofilter across header and data when requested', () => {
  const { sheet } = buildSheet({ autofilter: true })
  assert.deepStrictEqual(sheet.autoFilter, {
    from: { row: 1, column: 1 },
    to: { row: 3, column: 3 },
  })
})

test('addSheet freezes the header row when requested', () => {
  const { sheet } = buildSheet({ freezeHeader: true })
  assert.deepStrictEqual(sheet.views, [{ state: 'frozen', ySplit: 1 }])
})

test('safeSheetName strips illegal characters and truncates to 31 characters', () => {
  const raw = 'a/b\\c*d?e:f[g]h'.repeat(5)
  const name = safeSheetName(raw, null)
  assert.ok(!/[\\/*?:\[\]]/.test(name), `found illegal chars in ${name}`)
  assert.ok(name.length <= 31, `name too long: ${name.length}`)
})

test('safeSheetName substitutes a default when cleaning yields an empty string', () => {
  assert.strictEqual(safeSheetName('', null), 'Sheet')
})

test('safeSheetName appends _N suffixes to avoid duplicate worksheet names', () => {
  const workbook = new ExcelJS.Workbook()
  workbook.addWorksheet('layer')
  workbook.addWorksheet('layer_1')
  assert.strictEqual(safeSheetName('layer', workbook), 'layer_2')
})
