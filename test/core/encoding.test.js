const test = require('node:test')
const assert = require('node:assert')
const iconv = require('iconv-lite')

const {
  detectCharsetFromBuffer,
  detectCharsetFromText,
  normalizeCharset,
  decodeBuffer,
} = require('../../src/core/encoding')

test('normalizeCharset maps MapInfo names to iconv-lite encodings', () => {
  assert.strictEqual(normalizeCharset('WindowsCyrillic'), 'windows-1251')
  assert.strictEqual(normalizeCharset('windowscyrillic'), 'windows-1251')
  assert.strictEqual(normalizeCharset('WindowsLatin2'), 'windows-1250')
  assert.strictEqual(normalizeCharset('Neutral'), 'utf-8')
})

test('normalizeCharset falls back to utf-8 for unknown values', () => {
  assert.strictEqual(normalizeCharset('Klingon'), 'utf-8')
  assert.strictEqual(normalizeCharset(''), 'utf-8')
})

test('detectCharsetFromText reads Charset header', () => {
  const text = 'Version 300\nCharset "WindowsCyrillic"\nColumns 1'
  assert.strictEqual(detectCharsetFromText(text), 'windows-1251')
})

test('detectCharsetFromText defaults to utf-8 when header is missing', () => {
  assert.strictEqual(detectCharsetFromText('no charset here'), 'utf-8')
})

test('detectCharsetFromBuffer reads Charset header from raw bytes', () => {
  const buffer = Buffer.from('Charset "WindowsLatin2"\nData', 'latin1')
  assert.strictEqual(detectCharsetFromBuffer(buffer), 'windows-1250')
})

test('decodeBuffer round-trips windows-1251 Cyrillic', () => {
  const original = 'Москва, Санкт-Петербург'
  const bytes = iconv.encode(original, 'windows-1251')
  assert.strictEqual(decodeBuffer(bytes, 'windows-1251'), original)
})

test('decodeBuffer falls back to utf-8 for an unknown encoding label', () => {
  const bytes = Buffer.from('hello', 'utf8')
  assert.strictEqual(decodeBuffer(bytes, 'not-a-real-encoding'), 'hello')
})
