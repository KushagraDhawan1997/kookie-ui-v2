// The CI budget gate (DECISIONS.md §2): dist/styles.css gzipped must stay at or under
// the recorded baseline (regression gate) and under the hard ceiling. Growing the CSS
// intentionally means re-recording baselineGzipBytes in budget.json in the same commit.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

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

const gzip = gzipSync(css, { level: 9 }).length;
console.log(
  `css: ${gzip} gzipped / baseline ${baselineGzipBytes} / ceiling ${ceilingGzipBytes}`,
);

if (gzip > ceilingGzipBytes) {
  console.error(`CEILING EXCEEDED by ${gzip - ceilingGzipBytes} bytes`);
  process.exit(1);
}
if (gzip > baselineGzipBytes) {
  console.error(
    `REGRESSION: +${gzip - baselineGzipBytes} bytes over baseline. If intentional, re-record baselineGzipBytes in budget.json in this commit.`,
  );
  process.exit(1);
}
