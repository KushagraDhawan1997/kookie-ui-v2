// Watch build for local consumers. tsdown rebuilds the JS (then build-css and sync on success),
// but it only watches files in the module graph, and no module imports the CSS. So a second
// watcher reruns build-css and sync when any .css under src changes. sync.mjs copies the result
// into each sibling project's installed copy. Token sources are not watched:
// run `pnpm tokens` after editing them, and the regenerated tokens.css triggers a rebuild here.
import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) => spawn(cmd, args, { cwd: root, stdio: "inherit" });

const tsdown = run("pnpm", ["exec", "tsdown", "--watch", "src", "--on-success", "node scripts/build-css.mjs && node scripts/sync.mjs"]);

let timer;
let building = false;
let queued = false;
const buildCss = () => {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  run("sh", ["-c", "node scripts/build-css.mjs && node scripts/sync.mjs"]).on("exit", () => {
    building = false;
    if (queued) {
      queued = false;
      buildCss();
    }
  });
};

watch(join(root, "src"), { recursive: true }, (_event, file) => {
  if (!file?.endsWith(".css")) return;
  clearTimeout(timer);
  timer = setTimeout(buildCss, 100);
});

const stop = () => {
  tsdown.kill();
  process.exit();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
tsdown.on("exit", (code) => process.exit(code ?? 0));
