# Codex Desktop Rebuild

Cross-platform Electron build for the OpenAI Codex Desktop app.

## Codex Version

This repo is pinned to **OpenAI Codex 0.99.0**.

## Supported Platforms

| Platform | Architecture | Status |
|----------|--------------|--------|
| macOS    | x64, arm64   | Yes |
| Windows  | x64          | Yes |
| Linux    | x64, arm64   | Yes |

## Build

```bash
# Install dependencies
npm install

# Build for current host target
npm run build

# Build for specific target
npm run build:mac-x64
npm run build:mac-arm64
npm run build:win-x64
npm run build:linux-x64
npm run build:linux-arm64

# Build all targets
npm run build:all
```

## Development

```bash
npm run dev
```

## Binary Staging

Codex binaries are staged into `resources/bin/<platform-arch>/` from pinned npm artifacts before builds.

```bash
# Stage host target
npm run stage:host

# Stage all supported targets
npm run stage:all
```

The staging script also stages helper executables and `rg` for each target.

## Bumping Codex Version

1. Update `scripts/codex-targets.json` -> `codexVersion`.
2. Update `package.json` -> `optionalDependencies["@openai/codex"]`.
3. Run `npm install` to refresh `package-lock.json`.
4. Re-run staging for affected targets.
5. Build and smoke test target outputs.

## Project Structure

- `src/.vite/build/` (main process bundle)
- `src/webview/` (renderer bundle)
- `resources/` (icons/sounds + staged binaries)
- `scripts/stage-codex-binaries.js` (target binary staging)
- `scripts/patch-copyright.js`
- `scripts/patch-i18n.js`
- `scripts/patch-process-polyfill.js`
- `forge.config.js`
- `package.json`

## CI/CD

GitHub Actions builds on:
- Push to `master` or `main`
- Tag `v*` (draft release)

## Credits

- [OpenAI Codex](https://github.com/openai/codex) - Original Codex CLI (Apache-2.0)
- [Cometix Space](https://github.com/Haleclipse) - Cross-platform rebuild
- [Electron Forge](https://www.electronforge.io/) - Build toolchain

## License

This project rebuilds the Codex Desktop app for cross-platform distribution.
Original Codex CLI by OpenAI is licensed under Apache-2.0.
