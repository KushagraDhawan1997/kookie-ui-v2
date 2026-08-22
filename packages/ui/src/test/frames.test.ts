/**
 * THE FRAME-WATCHING LAWS ARE A CLOSED, RECORDED SET (2026-08-20).
 *
 * `watchesFrames` (test/browser.tsx) excludes a law from CI because its claim depends on WHEN
 * it looks — a transient state it must be looking at while it exists, or a series it samples
 * as an animation runs. That is a real and necessary exclusion, and it is also this repo's own
 * favourite way of not failing: the `docs:test` cache hit (2026-08-08) and turbo's filtered
 * environment starving the whole browser project (2026-08-20) were both "did not run" wearing
 * a green tick.
 *
 * So the set is pinned here. A law that reaches for the marker fails CI until someone adds it
 * below WITH the transient it has to catch — which is the moment to ask whether an instrument
 * could have made it deterministic instead (`sweep`, `catchDissolve`, `seizeFlight`, an
 * observer armed before the gesture, or a claim moved onto the setup where recipes.test.ts
 * can read it exactly).
 *
 * The reverse direction matters as much: a recorded law that stops watching frames must leave
 * this list, or the list becomes a place laws go to be forgotten.
 */
import { describe, expect, it } from "vitest";

import { raw, walkFiles } from "./stylesheets.ts";

/** Every law excluded from CI, and the transient each one must catch. */
const RECORDED: Record<string, string> = {
  "nothing jumps on the frame the flight ends — ${where}-aligned (§22)":
    "the still plateau at the end of a real flight, before the release timer strips it — " +
    "floating-ui converges in wall time, so the clocks cannot be seized. Its static half " +
    "(`the flight's pin puts the body where flow puts it`) runs on CI and catches the defect " +
    "this was written for.",
  "a panel that lands BESIDE its trigger grows out of the SEAM, not out of the row (§22)":
    "the last AIMED SEED frame — a pose that holds about two frames and is hunted by polling.",
  "a dismissal taken back MID-FLIGHT lands on the flight it interrupted (§22, 2026-08-20)":
    "a panel dismissed WHILE AIRBORNE — the premise is a window, not a state.",
  "the FIRST open flies to the settled width — the floor is inside the target (§22)":
    "`--kui-anchor-w`, which exists only while the flight does — the runner strips it at release.",
  "the entry moves neither the page nor the panel's own contents (§8, §22)":
    "the entry's opening frames, where the page offset is taken and given back.",
};

/** The marker at a call site, with the law's title exactly as it is written. */
function marked(): { title: string; file: string }[] {
  const found: { title: string; file: string }[] = [];
  // WALKED, never listed (audit D14): a law file added tomorrow is pinned tomorrow.
  for (const path of walkFiles(".", ".browser.test.tsx")) {
    const src = raw(path);
    // The quote is matched by BACKREFERENCE, and that is not fussiness: the first spelling
    // was `[^`"']+`, whose class stops at the first apostrophe of any quote kind — so a law
    // titled "…nor the panel's own contents" was extracted as "…nor the panel", and this
    // file's own two directions then disagreed about a law that was correctly marked. An
    // extractor is an instrument, and an instrument is calibrated before its output is
    // evidence (the loud-parser lesson, 2026-08-06).
    for (const m of src.matchAll(/\bwatchesFrames\(\s*(["'`])((?:\\.|(?!\1).)*?)\1/g)) {
      found.push({ title: m[2]!, file: path });
    }
  }
  return found;
}

describe("the frame-watching laws are a closed set (2026-08-20)", () => {
  const found = marked();

  it("the walk finds them — an empty walk pins nothing", () => {
    // The negative control this file cannot do without: if the walk breaks, every assertion
    // below passes by finding nothing, which is the exact shape of the defect it guards.
    expect(found.length).toBeGreaterThan(3);
  });

  it("every excluded law is recorded, with the transient it has to catch", () => {
    for (const { title, file } of found) {
      expect(
        Object.keys(RECORDED),
        `${file} excludes a law from CI that is not recorded in test/frames.test.ts: "${title}"`,
      ).toContain(title);
    }
  });

  it("every recorded law still exists and still watches frames", () => {
    const titles = found.map((f) => f.title);
    for (const title of Object.keys(RECORDED)) {
      expect(titles, `recorded but no longer marked — delete the entry: "${title}"`).toContain(title);
    }
  });

  it("each reason names a transient, rather than restating the title", () => {
    // The cheapest way to satisfy a coverage law is an entry that says nothing (the component
    // reference's own anti-rot clause, 2026-08-08). A reason has to be a sentence about WHAT
    // cannot be pinned.
    for (const [title, why] of Object.entries(RECORDED)) {
      expect(why.length, `the reason for "${title}" is too short to be one`).toBeGreaterThan(40);
      expect(why, `the reason for "${title}" just restates it`).not.toBe(title);
    }
  });
});
