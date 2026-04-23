# MifMapXL

[![Latest release](https://img.shields.io/github/v/release/fedyunin/MifMapXL)](https://github.com/fedyunin/MifMapXL/releases/latest)
[![Tests](https://github.com/fedyunin/MifMapXL/actions/workflows/test.yml/badge.svg)](https://github.com/fedyunin/MifMapXL/actions/workflows/test.yml)

Desktop app on Electron for converting MapInfo `.mif/.mid` pairs into `.xlsx` with a new `region_color_hex` column and optional row fill.

## Download

The links below always point to the latest published release.

| Platform | File |
| --- | --- |
| **Windows** — installer | [MifMapXL-win-x64-setup.exe](https://github.com/fedyunin/MifMapXL/releases/latest/download/MifMapXL-win-x64-setup.exe) |
| **Windows** — portable | [MifMapXL-win-x64-portable.exe](https://github.com/fedyunin/MifMapXL/releases/latest/download/MifMapXL-win-x64-portable.exe) |
| **macOS** — Apple Silicon | [MifMapXL-mac-arm64.dmg](https://github.com/fedyunin/MifMapXL/releases/latest/download/MifMapXL-mac-arm64.dmg) |
| **Linux** — Debian/Ubuntu | [MifMapXL-linux-amd64.deb](https://github.com/fedyunin/MifMapXL/releases/latest/download/MifMapXL-linux-amd64.deb) |
| **Linux** — AppImage | [MifMapXL-linux-x86_64.AppImage](https://github.com/fedyunin/MifMapXL/releases/latest/download/MifMapXL-linux-x86_64.AppImage) |

All builds from the [releases page](https://github.com/fedyunin/MifMapXL/releases).

### macOS first run

Builds are unsigned. macOS will refuse to open the app with “MifMapXL.app is damaged”. Remove the quarantine attribute once:

```bash
xattr -dr com.apple.quarantine /Applications/MifMapXL.app
```

### Windows SmartScreen

Unsigned Windows builds may show “Windows protected your PC”. Click **More info → Run anyway**.

## Features

- choose either a folder or specific files
- recursive folder scan
- export one xlsx per source file or one combined workbook
- optional csv export
- optional row fill from `Brush(...)`
- skip black fill `#000000`
- remembers settings between launches
- log window with processing output

## Build from source

```bash
npm install
npm run dev           # run in development
npm test              # run the test suite
npm run dist:mac      # DMG + zip (macOS)
npm run dist:linux    # AppImage + deb (Linux)
npm run dist:win      # portable + NSIS installer (Windows)
npm run dist          # build for the host platform
```

Artifacts are written to `dist/`.

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
