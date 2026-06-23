#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const inputRootArg = readArg("--input-root");
const inputRoot = inputRootArg ? path.resolve(inputRootArg) : path.join(root, "local", "original-images");
const concurrency = Math.max(1, Math.min(Number(process.env.IMAGE_JOBS) || Math.floor(os.cpus().length / 2), 6));

function readArg(name) {
  const prefix = `${name}=`;
  const value = args.find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : null;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile() || !/\.jpe?g$/i.test(entry.name)) return [];
    return [fullPath];
  });
}

function outputPathFor(inputPath) {
  return inputPath.replace(/\.jpe?g$/i, ".webp");
}

function convert(inputPath) {
  return new Promise((resolve, reject) => {
    const outputPath = outputPathFor(inputPath);
    const temporaryPath = `${outputPath}.tmp-${process.pid}.webp`;
    const magickArgs = [
      inputPath,
      "-auto-orient",
      "-strip",
      "-define",
      "webp:method=6",
      "-quality",
      "92",
      temporaryPath,
    ];
    const child = spawn("magick", magickArgs, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        fs.rmSync(temporaryPath, { force: true });
        reject(new Error(`${inputPath}: ${stderr.trim() || `ImageMagick exited with ${code}`}`));
        return;
      }

      try {
        fs.renameSync(temporaryPath, outputPath);
        fs.rmSync(inputPath);
        resolve(outputPath);
      } catch (error) {
        fs.rmSync(temporaryPath, { force: true });
        reject(error);
      }
    });
  });
}

async function runPool(inputs) {
  let next = 0;
  let completed = 0;

  async function worker() {
    while (next < inputs.length) {
      const input = inputs[next++];
      const output = await convert(input);
      completed += 1;
      console.log(`Converted ${path.relative(inputRoot, input)} -> ${path.relative(inputRoot, output)}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, inputs.length) }, worker));
  return completed;
}

async function main() {
  if (!fs.existsSync(inputRoot)) throw new Error(`Input directory not found: ${inputRoot}`);

  const inputs = walk(inputRoot).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!inputs.length) {
    console.log("No JPG/JPEG images need conversion.");
    return;
  }

  if (dryRun) {
    console.log(`${inputs.length} JPG/JPEG images would be converted to WebP and the source JPG/JPEG files removed:`);
    inputs.forEach((input) => {
      console.log(`  ${path.relative(inputRoot, input)} -> ${path.relative(inputRoot, outputPathFor(input))}`);
    });
    return;
  }

  console.log(`Converting ${inputs.length} JPG/JPEG images with ${concurrency} workers.`);
  const completed = await runPool(inputs);
  console.log(`Converted ${completed} images. JPG/JPEG source files were removed after successful conversion.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
