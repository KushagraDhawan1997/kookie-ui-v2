/**
 * A DRIVER GESTURE RESOLVING IS NOT THE BROWSER HAVING SETTLED (2026-08-21).
 *
 * This is the defect that would not stop coming back. Five separate CI failures across two
 * days were one shape: `await userEvent.click(...)` and then, on the very next line, an
 * `expect` reading DOM state the gesture is supposed to cause — an attribute React commits in
 * a render, a popup Base UI unmounts when its exit animations settle, a `:hover` the browser
 * answers for an element something may still be covering. Each such line asserts that the
 * effect is SYNCHRONOUS, which is a claim about the machine rather than about the component,
 * and it is true on an idle laptop and false on a starved runner.
 *
 * Fixing them one at a time did not work, because the shape kept arriving in NEW laws written
 * by people who had not read the last repair — the overlay work of 2026-08-21 shipped three
 * fresh ones the same week the previous eight were swept. So the rule is enforced here rather
 * than remembered: a law written this way fails at once, on any machine, with the line in the
 * message.
 *
 * THE REPAIR IS ALWAYS THE SAME: wait for the state (`until`), then assert it. Nothing is lost
 * — a state that never arrives expires the deadline into the same assertion, with the same
 * value in the message — and what is gained is that the law stops being a bet.
 *
 * THE ONE HONEST EXCEPTION is a claim about a NON-event: "this gesture did NOT close it".
 * There is nothing to wait for, and waiting would only delay a correct answer — a slow machine
 * makes such a law pass more easily, never less. Those carry `// SETTLED-BY-DESIGN: <why>` on
 * the line above, and the reason has to be a sentence.
 *
 * TWO BLIND SPOTS, BOTH CLOSED 2026-08-26 — and both were the same defect this file exists to
 * forbid, wearing the file's own name. The rule it declares above is "the statement after a
 * gesture may not read what the gesture causes"; the walk enforced something narrower.
 *
 * 1. THE READ HAD TO BE SPELLED `expect(`. A bare `const popup = document.querySelector(…)`
 *    on the line after a click is the identical claim about the machine — the value is simply
 *    captured before it is asserted on — and it fails WORSE, with "the panel never mounted"
 *    instead of a value in a message. The gate reads state-without-waiting now, whatever the
 *    statement is spelled as.
 *
 * 2. A GESTURE HAD TO BE SPELLED `await userEvent.…`. A local helper around one — `press()`
 *    in the menu laws, `openByClick()` in both overlay files — is a gesture at every call
 *    site, and eleven of them were invisible. A wrapper counts unless the wrapper itself
 *    WAITS, which is also where the repair belongs: put the `until` in the helper and every
 *    call site settles at once.
 *
 * The vacuity guards moved with them. "The walk found gestures" proves the walk ran; it does
 * not prove the two arms of the pattern still match the spellings the suite is written in, or
 * that the read half matches anything at all — so each arm is counted, and a census of
 * gesture-then-state pairs (waits included) is what says the read half is alive.
 */
import { describe, expect, it } from "vitest";

import { raw, walkFiles } from "./stylesheets.ts";

/** What a gesture causes, and therefore what may not be read in the statement after one. */
const STATE = /(getAttribute|querySelector|\.matches\(|isConnected|activeElement|hasAttribute|textContent|\.length)/;
const GESTURE = /await\s+userEvent\.(click|dblClick|keyboard|hover|unhover|tab|fill|type|selectOptions|upload)\b/;
const EXEMPT = /SETTLED-BY-DESIGN:\s*(.+)/;
/** What makes a statement — or a helper — settled rather than a bet. `until` is the harness's;
 *  `expect.poll` is vitest's own spelling of it. A raw frame yield is deliberately NOT here:
 *  "one frame is enough" is the bet, restated. */
const WAITS = /\b(until|expect\.poll)\s*\(/;
/** A local helper declared in the same law file: `async function press(…)` or
 *  `const openByClick = async (…) =>`. */
const HELPER = /(?:async\s+function\s+(\w+)|const\s+(\w+)\s*=\s*async\s*(?:<[^>]*>)?\s*\()/g;

/** The helper's body, brace-matched from its opening `{`. Paren depth is tracked so a
 *  destructured parameter list cannot be mistaken for the body. */
function bodyOf(source: string, from: number): string {
  let parens = 0;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "(") parens += 1;
    else if (ch === ")") parens -= 1;
    else if (ch === "{" && parens <= 0) {
      let depth = 0;
      for (let j = i; j < source.length; j += 1) {
        if (source[j] === "{") depth += 1;
        else if (source[j] === "}") {
          depth -= 1;
          if (depth === 0) return source.slice(i, j + 1);
        }
      }
      return source.slice(i);
    }
  }
  return "";
}

/** The local helpers in one file that perform a gesture, split by whether they WAIT for its
 *  effect. An unsettled one makes `await thatHelper(…)` a gesture at every call site, exactly
 *  like the click inside it — and putting the wait in the helper settles all of them at once,
 *  which is why the split is here rather than at the call site. */
function gestureHelpers(source: string): { all: string[]; unsettled: string[] } {
  const all: string[] = [];
  const unsettled: string[] = [];
  for (const match of source.matchAll(HELPER)) {
    const name = match[1] ?? match[2];
    if (!name) continue;
    const body = bodyOf(source, match.index);
    if (!GESTURE.test(body)) continue;
    all.push(name);
    if (!WAITS.test(body)) unsettled.push(name);
  }
  return { all, unsettled };
}

type Finding = { file: string; line: number; via: "userEvent" | "helper"; gesture: string; read: string };

function scan(): {
  findings: Finding[];
  direct: number;
  viaHelper: number;
  helpers: number;
  unsettled: number;
  stateReads: number;
  exemptions: string[];
} {
  const findings: Finding[] = [];
  const exemptions: string[] = [];
  let direct = 0;
  let viaHelper = 0;
  let helpers = 0;
  let unsettledCount = 0;
  let stateReads = 0;
  // WALKED, never listed: a law file added tomorrow is held to this tomorrow.
  for (const path of walkFiles(".", ".browser.test.tsx")) {
    const source = raw(path);
    const lines = source.split("\n");
    const { all, unsettled } = gestureHelpers(source);
    helpers += all.length;
    unsettledCount += unsettled.length;
    const viaWrapper =
      unsettled.length > 0
        ? new RegExp(`await\\s+(?:${unsettled.join("|")})\\s*(?:<[^>]*>)?\\s*\\(`)
        : null;
    for (let i = 0; i < lines.length; i++) {
      const isDirect = GESTURE.test(lines[i]!);
      const isHelper = !isDirect && viaWrapper !== null && viaWrapper.test(lines[i]!);
      if (!isDirect && !isHelper) continue;
      if (isDirect) direct += 1;
      else viaHelper += 1;
      // The next line that says anything — comments and blanks are not statements.
      let j = i + 1;
      while (j < lines.length) {
        const t = lines[j]!.trim();
        if (t && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*")) break;
        j += 1;
      }
      const next = lines[j]?.trim() ?? "";
      if (!STATE.test(next)) continue;
      stateReads += 1;
      // Anything awaited is not a synchronous read — `await until(…)`, `await expect.poll(…)`
      // and every other yield are the repair, not the defect.
      if (/\bawait\b/.test(next)) continue;
      // An exemption is claimed on one of the comment lines between the two.
      const between = lines.slice(i + 1, j).join("\n");
      const claimed = EXEMPT.exec(between);
      if (claimed) {
        exemptions.push(claimed[1]!.trim());
        continue;
      }
      findings.push({
        file: path,
        line: j + 1,
        via: isHelper ? "helper" : "userEvent",
        gesture: lines[i]!.trim().slice(0, 70),
        read: next.slice(0, 90),
      });
    }
  }
  return { findings, direct, viaHelper, helpers, unsettled: unsettledCount, stateReads, exemptions };
}

describe("a driver gesture resolving is not the browser having settled (2026-08-21)", () => {
  const { findings, direct, viaHelper, helpers, unsettled, stateReads, exemptions } = scan();

  it("the walk found gestures — an empty walk forbids nothing", () => {
    // The negative control this file cannot do without: if the walk or the pattern breaks,
    // the claim below passes by finding nothing, which is the exact shape it guards against.
    expect(direct, "the direct `await userEvent.…` arm matched almost nothing").toBeGreaterThan(20);
  });

  it("BOTH arms of the pattern are live, and so is the read half", () => {
    // Widened 2026-08-26. Counting gestures proved the walk ran; it did not prove that the
    // pattern still matches the spellings the suite is written in. The helper arm was blind
    // for as long as it did not exist, with 20 call sites in the tree and the count above
    // comfortably over its floor the whole time.
    expect(
      helpers,
      "no gesture helper found in any law file — either the suite stopped wrapping gestures " +
        "(delete this arm on purpose) or `HELPER`/`bodyOf` stopped matching one",
    ).toBeGreaterThan(0);
    // Conditional on purpose, so the guard does not fail on a suite that got BETTER: the day
    // every helper waits, `unsettled` is 0 and there is correctly nothing for the arm to
    // examine. While any helper does not wait, its call sites have to be found — otherwise the
    // arm is dead and says so by finding nothing, which is this file's own subject.
    if (unsettled > 0) {
      expect(
        viaHelper,
        `${unsettled} gesture helper(s) do not wait, and the arm matched none of their call sites`,
      ).toBeGreaterThan(0);
    }
    // And the read half: if STATE or the next-statement locator broke, every claim below
    // passes by examining nothing. This counts the pairs it examined, waits included.
    expect(
      stateReads,
      "no gesture in the suite is followed by a statement that reads DOM state — the STATE " +
        "pattern or the next-statement walk is broken",
    ).toBeGreaterThan(20);
  });

  it("no law reads what a gesture causes in the statement after it", () => {
    const report = findings
      .map(
        (f) =>
          `  ${f.file}:${f.line}\n    after: ${f.gesture}${f.via === "helper" ? "   ← a local gesture helper that does not wait" : ""}\n    reads: ${f.read}`,
      )
      .join("\n");
    expect(
      findings,
      `wait for the state instead (\`await until(() => …)\`) — and when the gesture is a local ` +
        `helper, the wait belongs INSIDE the helper, which settles every call site at once — ` +
        `or mark a NON-event claim with \`// SETTLED-BY-DESIGN: <why>\`:\n${report}`,
    ).toEqual([]);
  });

  it("every exemption says why, rather than just claiming one", () => {
    // The cheapest way past a rule is a marker with nothing behind it (the component
    // reference's anti-rot clause, 2026-08-08).
    for (const why of exemptions) {
      expect(why.length, `a SETTLED-BY-DESIGN reason is too short to be one: "${why}"`).toBeGreaterThan(30);
    }
  });
});
