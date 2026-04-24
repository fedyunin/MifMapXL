const fs = require('fs')
const path = require('path')
const ExcelJS = require('exceljs')

const { detectCharsetFromBuffer, detectCharsetFromText, decodeBuffer } = require('./encoding')
const { parseMif, buildFallbackHeaders } = require('./mif')
const { parseMid, normalizeRowLength } = require('./mid')
const { collectTargets, resolveOutputFolder } = require('./files')
const { addSheet, safeSheetName } = require('./excel')
const { writeCsvFile } = require('./csv')

async function runConversion(config, listeners) {
  const { log, progress } = normalizeListeners(listeners)

  validateConfig(config)

  const targets = collectTargets(config, log)

  if (!targets.length) {
    throw new Error('No valid MIF files found')
  }

  const total = targets.length
  const summary = {
    processed: 0,
    skipped: 0,
    outputs: [],
    errors: [],
    outputFolder: resolveOutputFolder(config),
  }

  progress({ total, done: 0, currentFile: '' })

  if (config.combineIntoOneWorkbook) {
    const workbook = new ExcelJS.Workbook()

    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i]
      progress({ total, done: i, currentFile: target.mifPath })

      try {
        const result = processPair(target.mifPath, target.midPath, config, workbook, log)
        summary.processed += 1
        summary.outputs.push(...result.outputs)
      } catch (error) {
        summary.errors.push({ file: target.mifPath, error: error.message })
        summary.skipped += 1
        log(`ERROR: ${target.mifPath} -> ${error.message}`)
      }

      progress({ total, done: i + 1, currentFile: target.mifPath })
    }

    if (workbook.worksheets.length) {
      const baseName = resolveCombinedWorkbookName(config.combinedName)
      const outputPath = path.join(resolveOutputFolder(config), baseName)
      await workbook.xlsx.writeFile(outputPath)
      summary.outputs.push(outputPath)
      log(`Created combined workbook: ${outputPath}`)
    }
  } else {
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i]
      progress({ total, done: i, currentFile: target.mifPath })

      try {
        const workbook = new ExcelJS.Workbook()
        const result = processPair(target.mifPath, target.midPath, config, workbook, log)
        const xlsxPath = result.xlsxPath
        await workbook.xlsx.writeFile(xlsxPath)
        summary.processed += 1
        summary.outputs.push(...result.outputs)
        log(`Created: ${xlsxPath}`)
      } catch (error) {
        summary.errors.push({ file: target.mifPath, error: error.message })
        summary.skipped += 1
        log(`ERROR: ${target.mifPath} -> ${error.message}`)
      }

      progress({ total, done: i + 1, currentFile: target.mifPath })
    }
  }

  log(`Done. Processed: ${summary.processed}, Skipped: ${summary.skipped}`)
  return summary
}

function normalizeListeners(listeners) {
  if (typeof listeners === 'function') {
    return { log: listeners, progress: () => {} }
  }

  return {
    log: (listeners && listeners.log) || (() => {}),
    progress: (listeners && listeners.progress) || (() => {}),
  }
}

function resolveCombinedWorkbookName(raw) {
  const requested = String(raw || '').trim()
  const stripped = requested.replace(/[\\/:*?"<>|]+/g, '').replace(/^\.+/, '').trim()
  const base = stripped || 'mapinfo-converted'
  return /\.xlsx$/i.test(base) ? base : `${base}.xlsx`
}

function resolveColorColumnName(raw) {
  const requested = String(raw || '').trim()
  return requested || 'region_color_hex'
}

function validateConfig(config) {
  if (config.inputMode === 'folder' && !config.inputFolder) {
    throw new Error('Select input folder')
  }

  if (config.inputMode === 'files' && (!config.selectedFiles || !config.selectedFiles.length)) {
    throw new Error('Select files to process')
  }
}

function processPair(mifPath, midPath, config, workbook, log) {
  log(`Processing: ${mifPath}`)

  const mifBuffer = fs.readFileSync(mifPath)
  const mifText = decodeBuffer(mifBuffer, detectCharsetFromBuffer(mifBuffer))

  const midBuffer = fs.readFileSync(midPath)
  const midText = decodeBuffer(midBuffer, detectCharsetFromText(mifText))

  const mifInfo = parseMif(mifText)
  const midRows = parseMid(midText)
  const headers = mifInfo.columns.length ? mifInfo.columns : buildFallbackHeaders(midRows)
  const totalRows = midRows.length

  if (!totalRows) {
    throw new Error('MID file contains no rows')
  }

  if (mifInfo.brushColors.length !== totalRows) {
    log(`WARN: ${path.basename(mifPath)} — MIF objects (${mifInfo.brushColors.length}) != MID rows (${totalRows}). Colors may be misaligned.`)
  }

  const normalizedRows = midRows.map((row) => normalizeRowLength(row, headers.length))
  const worksheetName = safeSheetName(path.basename(mifPath, path.extname(mifPath)), workbook)

  addSheet(workbook, worksheetName, headers, normalizedRows, mifInfo.brushColors, {
    paintRows: config.paintRows,
    skipBlack: config.skipBlack,
    autofilter: config.autofilter,
    freezeHeader: config.freezeHeader,
    includeColorColumn: config.includeColorColumn !== false,
    colorColumnName: resolveColorColumnName(config.colorColumnName),
  })

  const outputs = []
  let xlsxPath = ''

  if (!config.combineIntoOneWorkbook) {
    xlsxPath = path.join(resolveOutputFolder(config), `${path.basename(mifPath, path.extname(mifPath))}.xlsx`)
    outputs.push(xlsxPath)
  }

  if (config.includeCsv) {
    const csvPath = path.join(resolveOutputFolder(config), `${path.basename(mifPath, path.extname(mifPath))}.csv`)
    writeCsvFile(csvPath, headers, normalizedRows, mifInfo.brushColors, {
      includeColorColumn: config.includeColorColumn !== false,
      colorColumnName: resolveColorColumnName(config.colorColumnName),
    })
    outputs.push(csvPath)
    log(`Created: ${csvPath}`)
  }

  return {
    outputs,
    xlsxPath,
  }
}

module.exports = {
  runConversion,
  resolveCombinedWorkbookName,
  resolveColorColumnName,
}
