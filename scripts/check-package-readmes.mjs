import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const homepage = "https://wifilabel.com/";
const packages = [
  "packages/spec",
  "packages/zpl",
  "packages/epl2",
  "packages/transport",
  "packages/transport-webusb",
  "packages/transport-box",
];

let failed = false;

for (const dir of packages) {
  const pkgPath = join(root, dir, "package.json");
  const readmePath = join(root, dir, "README.md");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
  const problems = [];
  if (!readme.includes(`# ${pkg.name}`)) problems.push("README.md is missing the package heading");
  if (pkg.homepage !== homepage) {
    problems.push(`homepage is ${JSON.stringify(pkg.homepage)}`);
  }
  if (!Array.isArray(pkg.keywords) || pkg.keywords.length === 0) {
    problems.push("keywords is empty");
  }
  if (problems.length > 0) {
    failed = true;
    console.error(`${pkg.name ?? dir}: ${problems.join("; ")}`);
  }
}

if (failed) process.exit(1);
