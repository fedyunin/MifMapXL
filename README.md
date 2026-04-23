# MifMapXL

Desktop app on Electron for converting MapInfo `.mif/.mid` pairs into `.xlsx` with a new `region_color_hex` column and optional row fill.

## Features

- choose either a folder or specific files
- recursive folder scan
- export one xlsx per source file or one combined workbook
- optional csv export
- optional row fill from `Brush(...)`
- skip black fill `#000000`
- remembers settings between launches
- log window with processing output

## Install

```bash
npm install
```

## Run in development

```bash
npm run dev
```

## Build Windows exe

```bash
npm run dist
```

The build output will be in the `dist` folder.

## Notes

- the app reads column names from the `Columns` section in `.mif`
- the app reads row data from `.mid`
- the app extracts fill color from `Brush(pattern,color,bg)` lines in `.mif`
- if a row has no matching brush color, the `region_color_hex` cell is left empty
- if `Skip black color` is enabled, `#000000` rows are not painted

## Project structure

- `src/main/main.js` — Electron main process, dialogs, settings IPC, worker orchestration
- `src/main/preload.js` — context-isolated renderer bridge
- `src/main/worker.js` — `worker_threads` entry; runs the conversion off the main process
- `src/renderer/index.html` · `renderer.js` · `styles.css` — UI
- `src/core/convert.js` — orchestration of scan → parse → export
- `src/core/mif.js` · `mid.js` — MapInfo MIF/MID parsers
- `src/core/excel.js` · `csv.js` — output writers
- `src/core/files.js` — folder scan, MIF/MID pairing, output path resolution
- `src/core/encoding.js` — charset detection and decoding via `iconv-lite`
- `src/core/settings.js` — defaults and settings persistence helpers
