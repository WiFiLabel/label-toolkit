#!/usr/bin/env node
/**
 * Render golden ZPL with the public Labelary API.
 * Not part of CI. Stays under one request per second and caches PNGs in .cache/.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache", "labelary");
const goldenDir = join(root, "test-vectors/golden");
const endpoint = "https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/";

mkdirSync(cacheDir, { recursive: true });

const files = readdirSync(goldenDir).filter((name) => name.endsWith(".zpl"));
for (const name of files) {
  const zpl = readFileSync(join(goldenDir, name));
  const hash = createHash("sha256").update(zpl).digest("hex").slice(0, 16);
  const out = join(cacheDir, `${name}.${hash}.png`);
  if (existsSync(out)) {
    console.log(`cached ${name}`);
    continue;
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "image/png" },
    body: zpl,
  });
  if (!response.ok) {
    console.error(`Labelary ${response.status} for ${name}`);
    process.exitCode = 1;
    break;
  }
  writeFileSync(out, Buffer.from(await response.arrayBuffer()));
  console.log(`wrote ${out}`);
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
