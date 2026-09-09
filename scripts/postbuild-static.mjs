// Prepares the prerendered build output for static hosting on GitHub Pages:
// - .nojekyll so files/folders starting with "_" are served
// - 404.html fallback so unknown/deep links still boot the app
import { existsSync } from "node:fs";
import { copyFile, writeFile } from "node:fs/promises";
import path from "node:path";

const candidates = [".output/public", "dist/client", "dist"];
const outDir = candidates.find((dir) => existsSync(path.join(dir, "index.html")));

if (!outDir) {
  console.error(
    "[postbuild-static] No index.html found in build output. Checked: " + candidates.join(", "),
  );
  process.exit(1);
}

await writeFile(path.join(outDir, ".nojekyll"), "");
await copyFile(path.join(outDir, "index.html"), path.join(outDir, "404.html"));

console.log(`[postbuild-static] Static output ready in ${outDir} (index.html, 404.html, .nojekyll)`);
