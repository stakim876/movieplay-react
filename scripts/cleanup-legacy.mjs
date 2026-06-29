import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src");

/** FSD 마이그레이션 후 사용하지 않는 레거시 트리 */
const legacyDirs = [
  "pages",
  "components",
  "routes",
  "hooks",
  "utils",
  "constants",
  "types",
  "services",
];

const legacyFiles = [
  "App.tsx",
  "stores/StoreBootstrap.tsx",
  "stores/initStores.ts",
];

for (const dir of legacyDirs) {
  const p = path.join(root, dir);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("removed dir:", dir);
  }
}

for (const file of legacyFiles) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { force: true });
    console.log("removed file:", file);
  }
}

console.log("legacy cleanup done");
