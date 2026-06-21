#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const inputRoot = path.join(root, "local", "original-images");
const outputRoot = path.join(root, "local", "image-variants");
const imagePattern = /\.(webp|jpe?g|png)$/i;
const concurrency = Math.max(1, Math.min(Number(process.env.IMAGE_JOBS) || Math.floor(os.cpus().length / 2), 6));
const variants = [
  { name: "small", maxDimension: 1280, quality: 80 },
  { name: "large", maxDimension: 2560, quality: 86 },
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile() || !imagePattern.test(entry.name) || entry.name === ".DS_Store") return [];
    return [fullPath];
  });
}

function outputPathFor(inputPath, variant) {
  const relative = path.relative(inputRoot, inputPath);
  return path.join(outputRoot, variant.name, relative.replace(/\.[^.]+$/, ".webp"));
}

function needsUpdate(inputPath, outputPath) {
  return !fs.existsSync(outputPath) || fs.statSync(inputPath).mtimeMs > fs.statSync(outputPath).mtimeMs;
}

function convert(task) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(task.output), { recursive: true });
    const args = [
      task.input,
      "-auto-orient",
      "-resize",
      `${task.variant.maxDimension}x${task.variant.maxDimension}>`,
      "-strip",
      "-define",
      "webp:method=6",
      "-quality",
      String(task.variant.quality),
      task.output,
    ];
    const child = spawn("magick", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${task.input}: ${stderr.trim() || `ImageMagick exited with ${code}`}`));
    });
  });
}

async function runPool(tasks) {
  let next = 0;
  let completed = 0;
  async function worker() {
    while (next < tasks.length) {
      const task = tasks[next++];
      await convert(task);
      completed += 1;
      if (completed % 20 === 0 || completed === tasks.length) {
        console.log(`Generated ${completed}/${tasks.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
}

async function main() {
  if (!fs.existsSync(inputRoot)) throw new Error(`Input directory not found: ${inputRoot}`);
  const inputs = walk(inputRoot);
  const tasks = inputs.flatMap((input) =>
    variants
      .map((variant) => ({ input, output: outputPathFor(input, variant), variant }))
      .filter((task) => needsUpdate(task.input, task.output))
  );

  console.log(`${inputs.length} source images; ${tasks.length} variants need generation; ${concurrency} workers.`);
  if (tasks.length) await runPool(tasks);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
