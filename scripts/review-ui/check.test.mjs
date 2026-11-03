/* The check's own laws: each rule must catch the mistake it exists for.

     node --test scripts/review-ui/check.test.mjs   (needs the docs site on :1403)

   Each case opens the Navigator's upgrade dialog, breaks one rule by hand the way an agent did
   on 2 Nov 2026, and asserts that rule's count rises. Comparing against the page's own baseline
   keeps the laws about the CHECK, not about whatever the page currently gets right or wrong. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { probeHover } from "./probe.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire(join(here, "../../packages/ui/package.json"))("playwright");
// The rules' words come from the list the builder reads too; the check holds only detection.
const ruleList = readFileSync(join(here, "../../apps/docs/app/builder/rules.json"), "utf8");
const check = `window.__kuiRuleList = ${ruleList};\n${readFileSync(join(here, "check.js"), "utf8")}`;
const URL = process.env.KUI_REVIEW_URL ?? "http://localhost:1403/components/navigator?tab=examples";

let browser;
let baseline;
before(async () => {
  browser = await chromium.launch();
  baseline = await counts();
});
after(async () => browser?.close());

async function counts(sabotage) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Upgrade" }).first().click();
    await page.locator('[role="dialog"]').waitFor();
    // Other examples on the page hold closed dialogs too, so mark the open one.
    await page.evaluate(() =>
      [...document.querySelectorAll('[role="dialog"]')]
        .filter((d) => d.checkVisibility())
        .at(-1)
        .setAttribute("data-under-test", ""),
    );
    if (sabotage) await page.evaluate(sabotage);
    await page.addScriptTag({ content: check });
    await probeHover(page);
    const { findings } = await page.evaluate(() => window.__kuiReview());
    return findings.reduce((n, f) => ({ ...n, [f.rule]: (n[f.rule] ?? 0) + 1 }), {});
  } finally {
    await page.close();
  }
}


// A Shell pane with a band and one line of content, the band pulled out by `pull` px. Built
// as a string, since a page.evaluate function can't close over `pull`.
const pane = (pull) => {
  const pane = document.createElement("div");
  pane.className = "kui-surface kui-shell-pane";
  pane.style.cssText = "padding: 24px; inline-size: 400px";
  const header = document.createElement("div");
  header.className = "kui-pane-header";
  header.style.cssText = `display: flex; justify-content: space-between; margin-inline: -${pull}px`;
  for (const name of ["Toggle navigation", "Share"]) {
    const b = document.createElement("button");
    b.className = "kui-control kui-button";
    b.textContent = name;
    header.append(b);
  }
  const text = document.createElement("p");
  text.className = "kui-type kui-text";
  text.textContent = "The slow way to Porto";
  pane.append(header, text);
  document.querySelector("[data-under-test]").append(pane);
};
const paneWith = (pull) => `(${pane.toString()})(${pull})`;

const cases = {
  // The dialog shipped with no close button.
  "panel-close": () =>
    document
      .querySelectorAll('[data-under-test] button[aria-label="Close"]')
      .forEach((b) => b.remove()),
  // A band built by hand: the same buttons, no Toolbar.
  "hand-built-band": () => {
    const bar = document.querySelector('[data-under-test] .kui-toolbar');
    const style = getComputedStyle(bar);
    const row = { display: style.display, gap: style.gap, alignItems: style.alignItems, justifyContent: style.justifyContent, padding: style.padding };
    bar.classList.remove("kui-toolbar");
    bar.removeAttribute("role");
    Object.assign(bar.style, row);
  },
  // A pinned pane band level with its content (the reviewer's catch on Typography).
  "band-inset ": paneWith(0),
  // The X too close to the content: the band pushed in past the content's padding.
  "band-inset": () => {
    document.querySelector('[data-under-test] .kui-toolbar').style.paddingInline = "64px";
  },
  // A flow's main action not full width.
  "flow-cta-width": () => {
    const loud = [...document.querySelectorAll('[data-under-test] .kui-button')].find(
      (b) => !b.closest(".kui-toolbar") && b.checkVisibility(),
    );
    loud.dataset.emphasis = "loud";
    loud.style.inlineSize = "120px";
  },
  // A solid Surface inside the glass dialog.
  "opaque-in-glass": () => {
    const s = document.createElement("div");
    s.className = "kui-surface";
    s.textContent = "Pro";
    s.style.cssText = "background: rgb(255 255 255); block-size: 40px; backdrop-filter: none";
    const host =
      document.querySelector('[data-under-test] .kui-navigator-screen:not([hidden])') ??
      document.querySelector('[data-under-test]');
    host.append(s);
  },
  // Two loud actions on one screen.
  "one-figure": () => {
    const b = document.querySelector('[data-under-test] .kui-button');
    for (let i = 0; i < 2; i++) {
      const c = b.cloneNode(true);
      c.dataset.emphasis = "loud";
      c.setAttribute("aria-label", `Extra ${i}`);
      b.parentElement.append(c);
    }
  },
  "size-1-retired": () => {
    document.querySelector('[data-under-test] .kui-type').dataset.size = "1";
  },
  // Buttons side by side at two sizes.
  "mixed-control-sizes": () => {
    const row = document.createElement("div");
    row.style.display = "flex";
    for (const h of ["32px", "44px"]) {
      const b = document.createElement("button");
      b.className = "kui-control kui-button";
      b.textContent = "Act";
      b.style.blockSize = h;
      row.append(b);
    }
    document.querySelector('[data-under-test]').append(row);
  },
  // Back and a plain heading, not a ToolbarTitle, clustered in the band.
  "band-wrapper": () => {
    const bar = document.querySelector('[data-under-test] .kui-toolbar');
    const wrap = document.createElement("div");
    wrap.className = "kui-box";
    wrap.style.cssText = "--kui-d: flex; --kui-g: var(--layout-space-2); display: flex; gap: 8px";
    const b = document.createElement("button");
    b.className = "kui-control kui-button";
    b.textContent = "Back";
    const h = document.createElement("h2");
    h.className = "kui-type kui-heading";
    h.textContent = "Payment";
    wrap.append(b, h);
    bar.prepend(wrap);
  },
  // Facts glued with a middle dot.
  "dot-separator": () => {
    document.querySelector("[data-under-test] .kui-type").textContent = "Friday · Flights land at 9:40";
  },
  // A list of pressable rows divided by lines.
  "hover-with-separators": () => {
    const style = document.createElement("style");
    style.textContent = ".probe-row { background: transparent; border: 0 } .probe-row:hover { background: rgb(200 200 200) }";
    document.head.append(style);
    const list = document.createElement("div");
    for (const [i, name] of ["Travel", "Work"].entries()) {
      if (i) list.append(Object.assign(document.createElement("div"), { className: "kui-separator", role: "separator" }));
      const b = document.createElement("button");
      b.className = "probe-row";
      b.textContent = name;
      list.append(b);
    }
    list.querySelector(".kui-separator").setAttribute("role", "separator");
    list.querySelector(".kui-separator").style.cssText = "block-size: 1px; background: gray";
    document.querySelector("[data-under-test]").append(list);
  },
  // Row text pushed in past the separators by a fill's padding.
  "text-axis": () => {
    const list = document.createElement("div");
    for (const [i, name] of ["Lisbon trip", "Packing list"].entries()) {
      if (i) {
        const sep = document.createElement("div");
        sep.className = "kui-separator";
        sep.style.cssText = "block-size: 1px; background: gray";
        list.append(sep);
      }
      const row = document.createElement("div");
      row.className = "kui-row";
      row.style.paddingInlineStart = "16px";
      row.textContent = name;
      list.append(row);
    }
    document.querySelector("[data-under-test]").append(list);
  },
  "accessible-name": () => {
    const b = document.createElement("button");
    b.className = "kui-control kui-button";
    b.style.cssText = "inline-size: 32px; block-size: 32px";
    document.querySelector('[data-under-test]').append(b);
  },
};

for (const [key, sabotage] of Object.entries(cases)) {
  const rule = key.trim();
  test(`${rule} catches its mistake${key === rule ? "" : " in a pane band"}`, async () => {
    const broken = await counts(sabotage);
    assert.ok(
      (broken[rule] ?? 0) > (baseline[rule] ?? 0),
      `${rule}: ${baseline[rule] ?? 0} before, ${broken[rule] ?? 0} after`,
    );
  });
}

// What a rule must NOT flag. Each was a false alarm a thread reported; the page's own count must
// not rise when the good shape is added.
const allowed = {
  // A field: a label and a Select. Bordered and pressable, but not a list (2 Nov 2026).
  "hover-with-separators: a field": () => {
    const group = document.createElement("div");
    group.className = "kui-field-group";
    const label = document.createElement("label");
    label.className = "kui-type kui-text";
    label.textContent = "Country";
    const trigger = document.createElement("button");
    trigger.className = "kui-control kui-field";
    trigger.textContent = "United States";
    trigger.style.cssText = "border: 1px solid gray";
    group.append(label, trigger);
    document.querySelector("[data-under-test]").append(group);
  },
  // A cluster in a band, `<Flex gap>{back}{title}</Flex>`, with a real ToolbarTitle: the way
  // toolbar.css says a band is written.
  "band-wrapper: a cluster with a ToolbarTitle": () => {
    const bar = document.querySelector("[data-under-test] .kui-toolbar");
    const wrap = document.createElement("div");
    wrap.className = "kui-box";
    wrap.style.cssText = "--kui-d: flex; --kui-g: var(--layout-space-2); display: flex; gap: 8px";
    const back = document.createElement("button");
    back.className = "kui-control kui-button";
    back.textContent = "Back";
    const title = document.createElement("span");
    title.className = "kui-toolbar-title";
    title.innerHTML = '<h2 class="kui-type kui-heading">Payment</h2>';
    wrap.append(back, title);
    bar.prepend(wrap);
  },
  // A toolbar's vertical rule between groups of buttons is not a list of rows.
  "hover-with-separators: a toolbar's vertical rule": () => {
    const bar = document.createElement("div");
    bar.className = "kui-toolbar";
    bar.setAttribute("role", "toolbar");
    bar.style.display = "flex";
    for (const [i, name] of ["Bold", "Insert"].entries()) {
      if (i) {
        const sep = document.createElement("div");
        sep.className = "kui-separator";
        sep.setAttribute("role", "separator");
        sep.setAttribute("aria-orientation", "vertical");
        sep.style.cssText = "inline-size: 1px; block-size: 20px; background: gray";
        bar.append(sep);
      }
      const b = document.createElement("button");
      b.className = "kui-control kui-button";
      b.textContent = name;
      bar.append(b);
    }
    document.querySelector("[data-under-test]").append(bar);
  },
  // A pane band one step outside its content.
  "band-inset: a pane band one step out": paneWith(8),
  // Pressable rows between dividers that don't light up on hover (RowGroup, 2 Nov 2026).
  "hover-with-separators: pressable rows with no hover fill": () => {
    const list = document.createElement("div");
    for (const [i, name] of ["Change password", "Sign out"].entries()) {
      if (i) {
        const sep = document.createElement("div");
        sep.className = "kui-separator";
        sep.setAttribute("role", "separator");
        sep.style.cssText = "block-size: 1px; background: gray";
        list.append(sep);
      }
      const b = document.createElement("button");
      b.style.cssText = "background: transparent; border: 0; display: block";
      b.textContent = name;
      list.append(b);
    }
    document.querySelector("[data-under-test]").append(list);
  },
  // A ToolbarGroup at the band's end: its own edge stands a step out, though its first button
  // sits well inside (Search, in the Icons figure).
  "band-inset: a group whose outer edge is a step out": `(${((pull) => {
    const pane = document.createElement("div");
    pane.className = "kui-surface kui-shell-pane";
    pane.style.cssText = "padding: 24px; inline-size: 400px";
    const header = document.createElement("div");
    header.className = "kui-pane-header";
    header.style.cssText = `display: flex; justify-content: flex-end; margin-inline: -${pull}px`;
    const group = document.createElement("div");
    group.className = "kui-control kui-toolbar-group";
    group.style.display = "flex";
    for (const name of ["Search", "New note"]) {
      const b = document.createElement("button");
      b.className = "kui-control kui-button";
      b.textContent = name;
      group.append(b);
    }
    header.append(group);
    const text = document.createElement("p");
    text.className = "kui-type kui-text";
    text.textContent = "Lisbon trip";
    pane.append(header, text);
    document.querySelector("[data-under-test]").append(pane);
  }).toString()})(4)`,
  // Two bordered buttons side by side are a pair of controls, not a list with lines.
  "hover-with-separators: two bordered buttons side by side": () => {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; gap: 8px";
    for (const name of ["Cancel", "Keep"]) {
      const b = document.createElement("button");
      b.className = "kui-control kui-button";
      b.style.cssText = "border: 1px solid gray; background: transparent";
      b.textContent = name;
      row.append(b);
    }
    document.querySelector("[data-under-test]").append(row);
  },
  // Text past the edge of a scroller is there when you scroll; it isn't cut.
  "clipped-text: text you can scroll to": () => {
    const box = document.createElement("div");
    box.style.cssText = "overflow: auto; block-size: 40px; inline-size: 200px";
    const t = document.createElement("p");
    t.className = "kui-type kui-text";
    t.style.cssText = "margin: 0; padding-block-start: 60px";
    t.textContent = "Two deploys finished this morning";
    box.append(t);
    document.querySelector("[data-under-test]").append(box);
  },
  // A tree's rows step in by level.
  "text-axis: a tree's levels": () => {
    const tree = document.createElement("div");
    tree.className = "kui-tree";
    tree.setAttribute("role", "tree");
    for (const [i, name] of ["Page", "Card", "Button"].entries()) {
      const row = document.createElement("div");
      row.className = "kui-row";
      row.style.paddingInlineStart = `${i * 16}px`;
      row.textContent = name;
      tree.append(row);
    }
    document.querySelector("[data-under-test]").append(tree);
  },
};

for (const [key, good] of Object.entries(allowed)) {
  const [rule, shape] = key.split(": ");
  test(`${rule} leaves ${shape} alone`, async () => {
    const after = await counts(good);
    assert.equal(after[rule] ?? 0, baseline[rule] ?? 0, `${rule}: ${baseline[rule] ?? 0} before, ${after[rule] ?? 0} after`);
  });
}
