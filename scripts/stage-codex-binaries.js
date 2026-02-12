#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");
const { spawnSync } = require("child_process");

const SCRIPT_DIR = __dirname;
const REPO_ROOT = path.join(SCRIPT_DIR, "..");
const TARGETS_PATH = path.join(SCRIPT_DIR, "codex-targets.json");
const STAGE_ROOT = path.join(REPO_ROOT, "resources", "bin");
const PACKAGE_NAME = "@openai/codex";

function parseArgs(argv) {
  const out = {
    all: false,
    host: false,
    force: false,
    platform: null,
    arch: null,
    version: null,
  };

  for (const arg of argv) {
    if (arg === "--all") {
      out.all = true;
      continue;
    }
    if (arg === "--host") {
      out.host = true;
      continue;
    }
    if (arg === "--force") {
      out.force = true;
      continue;
    }
    if (arg.startsWith("--platform=")) {
      out.platform = arg.slice("--platform=".length);
      continue;
    }
    if (arg.startsWith("--arch=")) {
      out.arch = arg.slice("--arch=".length);
      continue;
    }
    if (arg.startsWith("--version=")) {
      out.version = arg.slice("--version=".length);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return out;
}

function readTargetsConfig() {
  return JSON.parse(fs.readFileSync(TARGETS_PATH, "utf8"));
}

function hostArch() {
  if (process.arch === "x64") return "x64";
  if (process.arch === "arm64") return "arm64";
  throw new Error(`Unsupported host architecture: ${process.arch}`);
}

function resolveTargetKeys(args, targets) {
  if (args.all) {
    return Object.keys(targets);
  }

  let platform = args.platform;
  let arch = args.arch;

  if (args.host || platform === "host" || arch === "host") {
    platform = process.platform;
    arch = hostArch();
  }

  if (!platform || !arch) {
    throw new Error(
      "Specify --all, --host, or both --platform=<platform> and --arch=<arch>.",
    );
  }

  const key = `${platform}-${arch}`;
  if (!targets[key]) {
    throw new Error(`Unsupported target: ${key}`);
  }

  return [key];
}

function httpsRequestBuffer(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      const statusCode = res.statusCode || 0;
      if ([301, 302, 307, 308].includes(statusCode) && res.headers.location) {
        res.resume();
        resolve(httpsRequestBuffer(res.headers.location));
        return;
      }

      if (statusCode < 200 || statusCode >= 300) {
        reject(new Error(`Request failed (${statusCode}): ${url}`));
        res.resume();
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
    });

    request.on("error", reject);
  });
}

async function getTarballUrl(packageVersion) {
  const encodedPackage = encodeURIComponent(PACKAGE_NAME);
  const url = `https://registry.npmjs.org/${encodedPackage}/${packageVersion}`;
  const body = await httpsRequestBuffer(url);
  const metadata = JSON.parse(body.toString("utf8"));

  if (!metadata?.dist?.tarball) {
    throw new Error(`No tarball found for ${PACKAGE_NAME}@${packageVersion}`);
  }

  return metadata.dist.tarball;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function removeDirIfExists(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function copyFilesFlat(sourceDir, destinationDir) {
  if (!fs.existsSync(sourceDir)) return [];

  const copied = [];
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const src = path.join(sourceDir, entry.name);
    const dst = path.join(destinationDir, entry.name);
    fs.copyFileSync(src, dst);
    copied.push(dst);
  }
  return copied;
}

function runTarExtract(tarPath, destDir) {
  const result = spawnSync("tar", ["-xzf", tarPath, "-C", destDir], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      `Failed to extract tarball with tar.\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
    );
  }
}

function getExpectedBinaryNames(platform) {
  if (platform === "win32") {
    return {
      codex: "codex.exe",
      ripgrep: "rg.exe",
    };
  }

  return {
    codex: "codex",
    ripgrep: "rg",
  };
}

function readStageManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

function shouldSkipStage({
  manifestPath,
  packageVersion,
  targetTriple,
  destinationDir,
  expectedCodex,
  expectedRipgrep,
  force,
}) {
  if (force) return false;

  const manifest = readStageManifest(manifestPath);
  if (!manifest) return false;
  if (manifest.packageVersion !== packageVersion) return false;
  if (manifest.targetTriple !== targetTriple) return false;

  return (
    fs.existsSync(path.join(destinationDir, expectedCodex)) &&
    fs.existsSync(path.join(destinationDir, expectedRipgrep))
  );
}

function writeManifest(manifestPath, packageVersion, targetTriple) {
  const payload = {
    packageName: PACKAGE_NAME,
    packageVersion,
    targetTriple,
    stagedAt: new Date().toISOString(),
  };

  fs.writeFileSync(manifestPath, `${JSON.stringify(payload, null, 2)}\n`);
}

function chmodExecutables(copiedFiles, platform) {
  if (platform === "win32") return;

  for (const filePath of copiedFiles) {
    fs.chmodSync(filePath, 0o755);
  }
}

async function stageTarget(targetKey, targetConfig, version, force) {
  const [platform] = targetKey.split("-");
  const expectedNames = getExpectedBinaryNames(platform);
  const packageVersion = `${version}-${targetConfig.packageSuffix}`;
  const destinationDir = path.join(STAGE_ROOT, targetKey);
  const manifestPath = path.join(destinationDir, ".codex-stage.json");

  if (
    shouldSkipStage({
      manifestPath,
      packageVersion,
      targetTriple: targetConfig.triple,
      destinationDir,
      expectedCodex: expectedNames.codex,
      expectedRipgrep: expectedNames.ripgrep,
      force,
    })
  ) {
    console.log(`[stage] ${targetKey}: up to date (${packageVersion})`);
    return;
  }

  console.log(`[stage] ${targetKey}: downloading ${PACKAGE_NAME}@${packageVersion}`);
  const tarballUrl = await getTarballUrl(packageVersion);
  const tarballData = await httpsRequestBuffer(tarballUrl);

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "codex-stage-"));
  const tarPath = path.join(tempRoot, "codex.tgz");
  const extractDir = path.join(tempRoot, "extract");
  ensureDir(extractDir);
  fs.writeFileSync(tarPath, tarballData);

  try {
    runTarExtract(tarPath, extractDir);

    const packageRoot = path.join(extractDir, "package");
    const codexSourceDir = path.join(
      packageRoot,
      "vendor",
      targetConfig.triple,
      "codex",
    );
    const ripgrepSourceDir = path.join(
      packageRoot,
      "vendor",
      targetConfig.triple,
      "path",
    );

    if (!fs.existsSync(codexSourceDir)) {
      throw new Error(`Missing codex directory in tarball: ${codexSourceDir}`);
    }
    if (!fs.existsSync(ripgrepSourceDir)) {
      throw new Error(`Missing ripgrep directory in tarball: ${ripgrepSourceDir}`);
    }

    removeDirIfExists(destinationDir);
    ensureDir(destinationDir);

    const copiedFiles = [
      ...copyFilesFlat(codexSourceDir, destinationDir),
      ...copyFilesFlat(ripgrepSourceDir, destinationDir),
    ];
    chmodExecutables(copiedFiles, platform);
    writeManifest(manifestPath, packageVersion, targetConfig.triple);

    const codexPath = path.join(destinationDir, expectedNames.codex);
    const ripgrepPath = path.join(destinationDir, expectedNames.ripgrep);
    if (!fs.existsSync(codexPath)) {
      throw new Error(`Missing staged codex binary: ${codexPath}`);
    }
    if (!fs.existsSync(ripgrepPath)) {
      throw new Error(`Missing staged ripgrep binary: ${ripgrepPath}`);
    }

    console.log(
      `[stage] ${targetKey}: staged ${path.basename(codexPath)} and ${path.basename(ripgrepPath)}`,
    );
  } finally {
    removeDirIfExists(tempRoot);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readTargetsConfig();
  const version = args.version || config.codexVersion;
  const targetKeys = resolveTargetKeys(args, config.targets);

  ensureDir(STAGE_ROOT);
  for (const targetKey of targetKeys) {
    await stageTarget(targetKey, config.targets[targetKey], version, args.force);
  }
}

main().catch((error) => {
  console.error(`[stage] Failed: ${error.message}`);
  process.exit(1);
});
