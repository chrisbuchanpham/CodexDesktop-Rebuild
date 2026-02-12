# Codex Desktop Rebuild (Maintained Fork)

This repository is a maintained fork of [Haleclipse's CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild) for cross-platform Codex Desktop packaging and releases. The Codex CLI itself originates from [OpenAI](https://github.com/openai/codex).

## Original Author Credit (Primary)

Massive credit goes to **Haleclipse / Cometix** for creating the original cross-platform desktop rebuild, packaging flow, and release foundation this fork depends on.

- Original rebuild repository: [Haleclipse/CodexDesktop-Rebuild](https://github.com/Haleclipse/CodexDesktop-Rebuild)
- Original author profile: [Haleclipse](https://github.com/Haleclipse)
- Upstream Codex CLI by OpenAI: [openai/codex](https://github.com/openai/codex)

This fork builds directly on that work and continues maintenance, updates, and public release delivery.

## Download (End Users)

- Latest release page: [chrisbuchanpham/CodexDesktop-Rebuild/releases/latest](https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/latest)
- Windows installer naming pattern: `Codex-<version>.Setup.exe`
- Current Windows installer example: [Codex-1.0.4.Setup.exe](https://github.com/chrisbuchanpham/CodexDesktop-Rebuild/releases/download/v1.0.4/Codex-1.0.4.Setup.exe)

Quick install:

1. Download the latest `.exe` installer from Releases.
2. Run the installer.
3. Launch Codex from the Start menu/desktop shortcut.

Security note: release binaries are built in GitHub Actions from tagged source and uploaded as release assets.

## What This Fork Maintains

- Pinned stable Codex dependency: `@openai/codex` (`0.99.0` in this repo at release time).
- Multi-target binary staging under `resources/bin/<platform-arch>`.
- Packaging updates that include runtime helpers (`codex-command-runner`, sandbox setup executable, and `rg`).
- Automated cross-platform release artifacts (`.exe`, `.zip`, `.dmg`, `.deb`, `.rpm`).

## Current Platform Support

| Platform | Architectures | Primary Installers | Additional Artifacts |
| --- | --- | --- | --- |
| Windows | x64 | `.exe` (Squirrel setup) | `.zip` |
| macOS | x64, arm64 | `.dmg` | `.zip` |
| Linux | x64, arm64 | `.deb`, `.rpm` | `.zip` |

## Quick Start (Developers)

```bash
npm install
npm run stage:host
npm run dev
```

`stage:host` is required so the local runtime binaries are present before starting the app.

## Build Commands

Core build commands:

```bash
npm run build
npm run build:win-x64
npm run build:mac-x64
npm run build:mac-arm64
npm run build:linux-x64
npm run build:linux-arm64
npm run build:all
```

Staging commands:

```bash
npm run stage:host
npm run stage:all
npm run stage:win32-x64
npm run stage:darwin-x64
npm run stage:darwin-arm64
npm run stage:linux-x64
npm run stage:linux-arm64
```

## Release Workflow

- Tagging with `v*` triggers the **Build & Release** GitHub Actions workflow.
- The workflow builds Windows, macOS, and Linux artifacts.
- Release assets include `.exe`, `.zip`, `.dmg`, `.deb`, and `.rpm` outputs.
- Releases may be created as draft first and then published after verification.

## Project Lineage & Acknowledgments

- **Primary original rebuild author:** [Haleclipse / Cometix](https://github.com/Haleclipse)
- **Codex CLI upstream:** [OpenAI Codex](https://github.com/openai/codex)
- **Build/publish toolchain:** [Electron Forge](https://www.electronforge.io/)

This fork exists because of the upstream groundwork and continues in that spirit.

## License & Attribution

The Codex CLI from OpenAI is licensed under Apache-2.0.

This fork preserves upstream attribution and licensing context for the original rebuild and related dependencies.
