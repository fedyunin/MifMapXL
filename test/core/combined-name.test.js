const test = require('node:test')
const assert = require('node:assert')

const { resolveCombinedWorkbookName, resolveColorColumnName } = require('../../src/core/convert')

test('resolveCombinedWorkbookName falls back to mapinfo-converted.xlsx for empty input', () => {
  assert.strictEqual(resolveCombinedWorkbookName(''), 'mapinfo-converted.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName(null), 'mapinfo-converted.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName(undefined), 'mapinfo-converted.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName('   '), 'mapinfo-converted.xlsx')
})

test('resolveCombinedWorkbookName appends .xlsx when missing', () => {
  assert.strictEqual(resolveCombinedWorkbookName('report'), 'report.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName('2026 Q1'), '2026 Q1.xlsx')
})

test('resolveCombinedWorkbookName keeps .xlsx when already present', () => {
  assert.strictEqual(resolveCombinedWorkbookName('report.xlsx'), 'report.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName('report.XLSX'), 'report.XLSX')
})

test('resolveCombinedWorkbookName strips path separators and filesystem-forbidden characters', () => {
  assert.strictEqual(resolveCombinedWorkbookName('bad/name.xlsx'), 'badname.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName('a\\b:c*d?e"f<g>h|i.xlsx'), 'abcdefghi.xlsx')
})

test('resolveCombinedWorkbookName collapses names that reduce to nothing', () => {
  assert.strictEqual(resolveCombinedWorkbookName('///'), 'mapinfo-converted.xlsx')
  assert.strictEqual(resolveCombinedWorkbookName('.'), 'mapinfo-converted.xlsx')
})

test('resolveColorColumnName falls back to region_color_hex for empty input', () => {
  assert.strictEqual(resolveColorColumnName(''), 'region_color_hex')
  assert.strictEqual(resolveColorColumnName(null), 'region_color_hex')
  assert.strictEqual(resolveColorColumnName('   '), 'region_color_hex')
})

test('resolveColorColumnName trims whitespace and accepts any non-empty string', () => {
  assert.strictEqual(resolveColorColumnName('  Color  '), 'Color')
  assert.strictEqual(resolveColorColumnName('Цвет региона'), 'Цвет региона')
  assert.strictEqual(resolveColorColumnName('Fill #hex'), 'Fill #hex')
})
