# Codex Desktop Rebuild - Maintained Fork

This is a maintained fork focused on keeping Codex Desktop builds and releases working across platforms with a simple install path for users.

## Why this fork exists

This project builds on the original cross-platform rebuild by **Haleclipse / Cometix** and continues maintaining release pipelines, binary staging, and packaging updates.

The base rebuild that made this possible lives here:
- [Haleclipse/CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild)
- [Haleclipse profile](https://github.com/Haleclipse)

## Latest release and CLI version

- Latest fork release: `v1.0.4`
- This repo is currently pinned to: `@openai/codex 0.99.0`
- Upstream npm latest `@openai/codex`: `0.101.0` (checked on February 13, 2026)

## Download

- Latest release page: [https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/latest](https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/latest)
- Windows installer example: [https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/download/v1.0.4/Codex-1.0.4.Setup.exe](https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/download/v1.0.4/Codex-1.0.4.Setup.exe)

## Quick install

1. Download the latest `.exe` from Releases.
2. Run the installer.
3. Launch Codex.

## Build from source

```bash
npm install
npm run stage:host
npm run dev
```

`npm run stage:host` is required before local startup so the runtime binaries are available.

## Build commands

- `npm run build`
- `npm run build:all`
- `npm run build:win-x64`
- `npm run build:mac-x64`
- `npm run build:mac-arm64`
- `npm run build:linux-x64`
- `npm run build:linux-arm64`
- `npm run stage:host`
- `npm run stage:all`

## Validation checks

| Status | Check |
| --- | --- |
| ✅ | `node --check forge.config.js` |
| ✅ | `node --check scripts/stage-codex-binaries.js` |
| ✅ | `node --check scripts/start-dev.js` |
| ✅ | `npm run stage:host` |
| ✅ | `GitHub Actions Build & Release (master push)` |

Checks last verified on February 13, 2026.

## Credit

Massive credit to **Haleclipse / Cometix** for the original desktop rebuild architecture and release foundation.

Upstream Codex CLI is from OpenAI:
- [OpenAI Codex](https://github.com/openai/codex)

## License

Codex CLI by OpenAI is licensed under Apache-2.0.
