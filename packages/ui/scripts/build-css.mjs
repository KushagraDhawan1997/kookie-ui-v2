// Builds dist/styles.css from src/styles/index.css via Lightning CSS
// (bundle + minify + nesting/prefix transpilation per browserslist targets),
// then asserts the tsdown output the exports map promises actually exists.
import browserslist from "browserslist";
import { browserslistToTargets, bundle } from "lightningcss";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
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

// The stacking frame (§20) must survive minification. The browser laws read the COMMITTED
// sheets, so nothing else proves the Lightning path — a toolchain upgrade that mangled or
// dropped the `:not()` selector would pass every law while shipping a frame that never
// isolates. Lightning may respell whitespace but not the selector or declaration.
const css = code.toString();
if (!/\.kui-theme:not\(\.kui-theme \*\)\s*\{\s*isolation:\s*isolate/.test(css)) {
  console.error("build: the stacking frame rule did not survive minification (§20)");
  process.exit(1);
}

// Publish-correctness assertions: the exports map points here; a rename or hashed
// filename from a toolchain change must fail the build, not the consumer.
for (const file of ["../dist/index.js", "../dist/index.d.ts"]) {
  if (!existsSync(join(root, file))) {
    console.error(`build: expected output missing: ${file.replace("../", "")}`);
    process.exit(1);
  }
}

// Every module whose source declares "use client" must still declare it after the build.
// Bundlers drop directives silently, and the failure only appears in a consumer's RSC app.
const srcDir = join(root, "../src");
const outDir = join(root, "../dist");
const clientSources = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry.name) && readFileSync(full, "utf8").startsWith('"use client"')) {
      clientSources.push(relative(srcDir, full).replace(/\.tsx?$/, ""));
    }
  }
};
walk(srcDir);

for (const name of clientSources) {
  const out = join(outDir, `${name}.js`);
  if (!existsSync(out) || !readFileSync(out, "utf8").startsWith('"use client"')) {
    console.error(`build: "use client" lost for ${name} — this breaks RSC consumers silently`);
    process.exit(1);
  }
}
console.log(`build: "use client" preserved on ${clientSources.length} modules`);
