const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

const { parseMif, buildFallbackHeaders } = require('../../src/core/mif')

function loadFixture(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8')
}

test('parseMif extracts column names in declaration order', () => {
  const { columns } = parseMif(loadFixture('simple-colors.mif'))
  assert.deepStrictEqual(columns, ['name', 'code', 'note'])
})

test('parseMif extracts brush foreground colors as #RRGGBB for each object', () => {
  const { brushColors } = parseMif(loadFixture('simple-colors.mif'))
  assert.deepStrictEqual(brushColors, ['#FF0000', '#000000', '#00FF00'])
})

test('parseMif returns empty color for non-polygon objects without Brush(...)', () => {
  const { brushColors } = parseMif(loadFixture('mixed-geometry.mif'))
  assert.deepStrictEqual(brushColors, ['#0000FF', '', ''])
})

test('parseMif ignores Brush(...) encountered before the first object keyword', () => {
  const mif = [
    'Version 300',
    'Charset "Neutral"',
    'Columns 1',
    '  name Char(10)',
    'Data',
    '',
    '    Brush (2,65280,16777215)',
    'Region 1',
    '  4',
    '  0 0',
    '  1 0',
    '  1 1',
    '  0 0',
    '    Brush (2,16711680,16777215)',
  ].join('\n')

  const { brushColors } = parseMif(mif)
  assert.deepStrictEqual(brushColors, ['#FF0000'])
})

test('parseMif strips quotes around column names', () => {
  const mif = [
    'Version 300',
    'Charset "Neutral"',
    'Columns 2',
    '  "quoted name" Char(10)',
    '  plain Integer',
    'Data',
    '',
  ].join('\n')

  const { columns } = parseMif(mif)
  assert.deepStrictEqual(columns, ['quoted name', 'plain'])
})

test('buildFallbackHeaders produces field_N headers matching the widest row', () => {
  assert.deepStrictEqual(
    buildFallbackHeaders([['a', 'b'], ['c', 'd', 'e']]),
    ['field_1', 'field_2', 'field_3'],
  )
})

test('buildFallbackHeaders returns an empty array when no rows are given', () => {
  assert.deepStrictEqual(buildFallbackHeaders([]), [])
})
