const test = require('node:test')
const assert = require('node:assert')

const { resolveCombinedWorkbookName } = require('../../src/core/convert')

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
