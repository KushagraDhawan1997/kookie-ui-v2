// The CI budget gate (DECISIONS.md §2): dist/styles.css gzipped must stay at or under
// the recorded baseline (regression gate) and under the hard ceiling. Growing the CSS
// intentionally means re-recording baselineGzipBytes in budget.json in the same commit.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// pako, not node:zlib (2026-08-06): the gate compares against a recorded number, so the
// compressor must be part of the lockfile, not the runtime. Node vendors zlib, and two Node
// releases emit different (equally valid) gzip streams for identical input — CI on Node 22
// measured +20 bytes over a baseline recorded on Node 25, with dist/styles.css byte-identical.
// A law that moves when the runner's Node moves is measuring the environment, not the
// stylesheet. pako is pure JS and pinned exactly, so the number is the same everywhere.
import { gzip } from "pako";

const root = dirname(fileURLToPath(import.meta.url));
const { ceilingGzipBytes, baselineGzipBytes } = JSON.parse(
  readFileSync(join(root, "../budget.json"), "utf8"),
);

let css;
try {
  css = readFileSync(join(root, "../dist/styles.css"));
} catch {
  console.error("measure-css: dist/styles.css missing — run build first");
  process.exit(1);
}

const gzipped = gzip(css, { level: 9 }).length;
console.log(
  `css: ${gzipped} gzipped / baseline ${baselineGzipBytes} / ceiling ${ceilingGzipBytes}`,
);

if (gzipped > ceilingGzipBytes) {
  console.error(`CEILING EXCEEDED by ${gzipped - ceilingGzipBytes} bytes`);
  process.exit(1);
}
if (gzipped > baselineGzipBytes) {
  console.error(
    `REGRESSION: +${gzipped - baselineGzipBytes} bytes over baseline. If intentional, re-record baselineGzipBytes in budget.json in this commit.`,
  );
  process.exit(1);
}
// AND THE OTHER DIRECTION (2026-08-26, audit). budget.json defines the field as "last accepted
// gzipped size" — an equality invariant — and only one side of it was checked, so a CSS
// DELETION quietly left the baseline sitting above the artifact and loosened the ratchet by
// exactly the bytes it saved. The next regression then had free headroom to grow into before
// anything failed, which is the gate silently ceasing to be one. Both directions now demand
// the same deliberate act: re-record the number in the same commit.
if (gzipped < baselineGzipBytes) {
  console.error(
    `SLACK: ${baselineGzipBytes - gzipped} bytes UNDER baseline. A reduction is good — re-record baselineGzipBytes downward in budget.json in this commit so the ratchet stays tight.`,
  );
  process.exit(1);
}
