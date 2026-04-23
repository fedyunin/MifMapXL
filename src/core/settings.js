const fs = require('fs')
const path = require('path')

function getDefaultSettings() {
  return {
    language: 'en',
    inputMode: 'folder',
    inputFolder: '',
    outputFolder: '',
    selectedFiles: [],
    recursive: true,
    skipBlack: true,
    paintRows: true,
    combineIntoOneWorkbook: false,
    includeCsv: false,
    includeColorColumn: true,
    freezeHeader: true,
    autofilter: true,
  }
}

function loadSettings(settingsPath) {
  try {
    if (!fs.existsSync(settingsPath)) {
      return getDefaultSettings()
    }

    const raw = fs.readFileSync(settingsPath, 'utf8')
    const parsed = JSON.parse(raw)
    return { ...getDefaultSettings(), ...parsed }
  } catch (error) {
    return getDefaultSettings()
  }
}

function saveSettings(settingsPath, settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')
}

module.exports = {
  getDefaultSettings,
  loadSettings,
  saveSettings,
}
