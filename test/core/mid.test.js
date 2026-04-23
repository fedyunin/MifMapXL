const test = require('node:test')
const assert = require('node:assert')

const { parseMid, normalizeRowLength } = require('../../src/core/mid')

test('parseMid splits simple rows on commas', () => {
  assert.deepStrictEqual(
    parseMid('a,b,c\nd,e,f\n'),
    [['a', 'b', 'c'], ['d', 'e', 'f']],
  )
})

test('parseMid preserves commas inside quoted values', () => {
  assert.deepStrictEqual(
    parseMid('"a, b","c"\n"d","e, f"'),
    [['a, b', 'c'], ['d', 'e, f']],
  )
})

test('parseMid un-escapes doubled quotes inside quoted values', () => {
  assert.deepStrictEqual(
    parseMid('"hello ""world""","plain"'),
    [['hello "world"', 'plain']],
  )
})

test('parseMid keeps newlines inside quoted values', () => {
  assert.deepStrictEqual(
    parseMid('"first\nsecond","b"\n"c","d"'),
    [['first\nsecond', 'b'], ['c', 'd']],
  )
})

test('parseMid skips blank lines between records', () => {
  assert.deepStrictEqual(
    parseMid('"a","b"\n\n"c","d"\n'),
    [['a', 'b'], ['c', 'd']],
  )
})

test('parseMid handles CRLF line endings', () => {
  assert.deepStrictEqual(
    parseMid('"a","b"\r\n"c","d"\r\n'),
    [['a', 'b'], ['c', 'd']],
  )
})

test('normalizeRowLength pads short rows with empty strings', () => {
  assert.deepStrictEqual(normalizeRowLength(['a'], 3), ['a', '', ''])
})

test('normalizeRowLength truncates rows longer than expected', () => {
  assert.deepStrictEqual(normalizeRowLength(['a', 'b', 'c', 'd'], 2), ['a', 'b'])
})

test('normalizeRowLength returns a copy when length already matches', () => {
  const row = ['a', 'b']
  const result = normalizeRowLength(row, 2)
  assert.deepStrictEqual(result, ['a', 'b'])
  assert.notStrictEqual(result, row)
})
