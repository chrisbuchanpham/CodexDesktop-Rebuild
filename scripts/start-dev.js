#!/usr/bin/env node
/**
 * Smart development startup script.
 * Detects host platform and launches Electron with a staged Codex CLI binary.
 */

const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

const platform = process.platform;
const arch = os.arch();

const platformMap = {
  darwin: {
    x64: "darwin-x64",
    arm64: "darwin-arm64",
  },
  linux: {
    x64: "linux-x64",
    arm64: "linux-arm64",
  },
  win32: {
    x64: "win32-x64",
  },
};

const binDir = platformMap[platform]?.[arch];
if (!binDir) {
  console.error(`Unsupported platform/arch: ${platform}/${arch}`);
  process.exit(1);
}

const cliName = platform === "win32" ? "codex.exe" : "codex";
const cliPath = path.join(__dirname, "..", "resources", "bin", binDir, cliName);

if (!fs.existsSync(cliPath)) {
  console.error(`CLI not found at: ${cliPath}`);
  console.error("Run: npm run stage:host");
  process.exit(1);
}

const pathSeparator = platform === "win32" ? ";" : ":";
const existingPath = process.env.PATH || "";
const mergedPath = existingPath
  ? `${path.dirname(cliPath)}${pathSeparator}${existingPath}`
  : path.dirname(cliPath);

console.log(`[start-dev] Platform: ${platform}, Arch: ${arch}`);
console.log(`[start-dev] CLI Path: ${cliPath}`);

const electronBin = require("electron");
const child = spawn(electronBin, ["."], {
  cwd: path.join(__dirname, ".."),
  stdio: "inherit",
  env: {
    ...process.env,
    CODEX_CLI_PATH: cliPath,
    PATH: mergedPath,
    BUILD_FLAVOR: process.env.BUILD_FLAVOR || "dev",
    ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL || "app://-/index.html",
  },
});

child.on("close", (code) => {
  process.exit(code);
});
