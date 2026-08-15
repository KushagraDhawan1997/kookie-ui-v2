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

// backdrop-filter must reach Chromium unprefixed in the artifact (§24, found live
// 2026-08-10): a hand-written `-webkit-backdrop-filter` beside the standard property parses
// as the SAME logical property, and Lightning keeps the last spelling — the scrim shipped
// webkit-only, which Chromium ignores, so the app never blurred while every browser law read
// the committed source and stayed green. Three assertions, one per way it can regress.
//
// 1. Sources never hand-prefix: Lightning owns prefixing per browserslist.
const cssWalk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) cssWalk(full);
    else if (entry.name.endsWith(".css")) {
      const body = readFileSync(full, "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");
      if (/-webkit-backdrop-filter/.test(body)) {
        console.error(`build: hand-written -webkit-backdrop-filter in ${relative(srcRoot, full)} — Lightning owns prefixing, and the hand-written pair is how the scrim shipped broken`);
        process.exit(1);
      }
    }
  }
};
const srcRoot = join(root, "../src");
cssWalk(srcRoot);
// 2. No artifact block is prefix-only: wherever the webkit spelling appears, the standard
//    one stands beside it (matching source selectors verbatim is a losing game — the
//    minifier respells attribute quotes — so the artifact is audited block by block).
for (const m of css.matchAll(/\{[^{}]*\}/g)) {
  if (/-webkit-backdrop-filter/.test(m[0]) && !/[^-]backdrop-filter:/.test(m[0])) {
    console.error(`build: prefix-only backdrop-filter block in the artifact: ${m[0].slice(0, 120)}`);
    process.exit(1);
  }
}
// 3. And the scrim's own declaration survives, verbatim — the stacking frame's shape, for
//    the rule that actually shipped broken.
if (!/\.kui-dialog-backdrop\{[^{}]*[^-]backdrop-filter:var\(--scrim-filter/.test(css)) {
  console.error("build: the scrim lost its unprefixed backdrop-filter in the artifact (§24)");
  process.exit(1);
}
console.log("build: backdrop-filter reaches the artifact unprefixed");

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
