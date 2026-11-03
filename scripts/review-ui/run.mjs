#!/usr/bin/env node
/* Run the composition check on rendered pages.

     node scripts/review-ui/run.mjs <url> [<url> …] [--press "Upgrade"] [--next "Continue"] [--json]

   `--press` presses a button, radio, tab or text by its name after the page loads, to open a dialog or a menu.
   `--next` presses a button repeatedly to walk a flow, checking every screen on the way.
   `--page` checks the whole page as one screen as well, for an app (the docs site leaves it off,
   since its own chrome is not what's under review).
   `--shots <dir>` saves a screenshot of every step in both appearances, for you and for the
   ui-reviewer agent to look at. Passing the check is necessary, not sufficient: look at them.
   Exits 1 when any error-level finding remains, so a hook or a script can gate on it. A clean
   run stamps `.claude/.ui-reviewed`, which the Stop hook reads.

   Run it before you show anyone a screen (RULES.md, "How to work"). A finding names its rule;
   if you believe the rule is wrong, stop and say so. Don't change this file to pass. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { probeHover } from "./probe.mjs";

const here = dirname(fileURLToPath(import.meta.url));
// Playwright is a dev dependency of the package (its browser laws), not of the root.
const { chromium } = createRequire(join(here, "../../packages/ui/package.json"))("playwright");
// The rules' words come from the list the builder reads too; the check holds only detection.
const ruleList = readFileSync(join(here, "../../apps/docs/app/builder/rules.json"), "utf8");
const check = `window.__kuiRuleList = ${ruleList};\n${readFileSync(join(here, "check.js"), "utf8")}`;

const args = process.argv.slice(2);
const urls = [];
const presses = [];
let next = null;
let json = false;
let shots = null;
let whole = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--press") presses.push(args[++i]);
  else if (args[i] === "--next") next = args[++i];
  else if (args[i] === "--json") json = true;
  else if (args[i] === "--shots") shots = args[++i];
  else if (args[i] === "--page") whole = true;
  else urls.push(args[i]);
}
if (urls.length === 0) {
  console.error("usage: run.mjs <url> [--press <button name>] [--next <button name>] [--shots <dir>] [--page] [--json]");
  process.exit(2);
}

if (shots) mkdirSync(shots, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const url of urls) {
    for (const scheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      await page.goto(url, { waitUntil: "networkidle" });
      const review = async (step) => {
        await page.addScriptTag({ content: check });
        await probeHover(page);
        const { scopes, findings } = await page.evaluate((whole) => window.__kuiReview({ page: whole }), whole);
        const shot = shots
          ? join(shots, `${new URL(url).pathname.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home"}-${scheme}-${results.length}.png`)
          : undefined;
        if (shot) await page.screenshot({ path: shot, fullPage: true });
        results.push({ url, scheme, step, scopes, findings, shot });
      };
      // A press finds the first enabled button, radio, tab or exact text with that name. Inside
      // an open dialog it looks only there, since the page behind can hold the same names.
      const target = async (name) => {
        const dialog = page.locator('[role="dialog"]:visible');
        const root = (await dialog.count()) ? dialog.last() : page;
        for (const candidate of [
          root.getByRole("button", { name }),
          root.getByRole("radio", { name }),
          root.getByRole("tab", { name }),
          root.getByText(name, { exact: true }),
        ])
          for (const el of await candidate.filter({ visible: true }).all())
            if (await el.isEnabled().catch(() => true)) return el;
        throw new Error(`Nothing enabled named "${name}" to press.`);
      };
      for (const name of presses) {
        await (await target(name)).click({ timeout: 5000 });
        await page.waitForTimeout(300);
      }
      await review(presses.at(-1) ?? "page");
      for (let n = 0; next && n < 10; n++) {
        const button = page.getByRole("button", { name: next, exact: false }).last();
        if (!(await button.isVisible().catch(() => false)) || !(await button.isEnabled())) break;
        await button.click();
        await page.waitForTimeout(300);
        await review(`${next} ×${n + 1}`);
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const errors = results.flatMap((r) => r.findings.filter((f) => f.severity === "error"));
if (json) console.log(JSON.stringify(results, null, 2));
else {
  for (const r of results) {
    const head = `${r.url} (${r.scheme}, ${r.step}): ${r.scopes} scope${r.scopes === 1 ? "" : "s"}`;
    console.log(r.findings.length ? `\n${head}` : `${head}, clean`);
    if (r.shot) console.log(`  screenshot: ${r.shot}`);
    for (const f of r.findings) console.log(`  ${f.severity === "error" ? "✗" : "!"} [${f.rule}, ${f.ref}] ${f.message}`);
  }
  console.log(`\n${errors.length} error${errors.length === 1 ? "" : "s"}.`);
}
if (!errors.length)
  writeFileSync(join(here, "../../.claude/.ui-reviewed"), `${new Date().toISOString()} ${urls.join(" ")}\n`);
process.exit(errors.length ? 1 : 0);
