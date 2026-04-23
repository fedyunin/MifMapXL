const iconv = require('iconv-lite')

const CHARSET_MAP = {
  windowscyrillic: 'windows-1251',
  cyrillic: 'windows-1251',
  windowslatin1: 'windows-1252',
  windowslatin2: 'windows-1250',
  windowsgreek: 'windows-1253',
  windowsturkish: 'windows-1254',
  windowshebrew: 'windows-1255',
  windowsarabic: 'windows-1256',
  windowsbaltic: 'windows-1257',
  windowsvietnamese: 'windows-1258',
  neutral: 'utf-8',
  macroman: 'macintosh',
}

function detectCharsetFromBuffer(buffer) {
  const text = buffer.toString('latin1', 0, Math.min(buffer.length, 4096))
  const match = text.match(/Charset\s+"([^"]+)"/i)

  if (!match) {
    return 'utf-8'
  }

  return normalizeCharset(match[1])
}

function detectCharsetFromText(mifText) {
  const match = mifText.match(/Charset\s+"([^"]+)"/i)

  if (!match) {
    return 'utf-8'
  }

  return normalizeCharset(match[1])
}

function normalizeCharset(value) {
  const charset = String(value).trim().toLowerCase()
  return CHARSET_MAP[charset] || 'utf-8'
}

function decodeBuffer(buffer, encoding) {
  const normalized = String(encoding || 'utf-8').toLowerCase()

  if (iconv.encodingExists(normalized)) {
    return iconv.decode(buffer, normalized)
  }

  try {
    return new TextDecoder(normalized).decode(buffer)
  } catch (error) {
    return buffer.toString('utf8')
  }
}

module.exports = {
  detectCharsetFromBuffer,
  detectCharsetFromText,
  normalizeCharset,
  decodeBuffer,
}
