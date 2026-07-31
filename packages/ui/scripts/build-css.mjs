// Builds dist/styles.css from src/styles/index.css via Lightning CSS
// (bundle + minify + nesting/prefix transpilation per browserslist targets),
// then asserts the tsdown output the exports map promises actually exists.
import browserslist from "browserslist";
import { browserslistToTargets, bundle } from "lightningcss";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const entry = join(root, "../src/styles/index.css");
const out = join(root, "../dist/styles.css");

const targets = browserslistToTargets(browserslist());
const { code } = bundle({ filename: entry, minify: true, targets });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, code);
if (code.length === 0) {
  // Legitimate until the token pipeline lands (§14 step 2); a hard failure after that.
  console.warn("build-css: styles.css is empty");
}
console.log(`styles.css: ${code.length} bytes (raw)`);

// Publish-correctness assertions: the exports map points here; a rename or hashed
// filename from a toolchain change must fail the build, not the consumer.
for (const file of ["../dist/index.js", "../dist/index.d.ts"]) {
  if (!existsSync(join(root, file))) {
    console.error(`build: expected output missing: ${file.replace("../", "")}`);
    process.exit(1);
  }
}
