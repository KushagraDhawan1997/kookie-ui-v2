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
 */
import { describe, expect, it } from "vitest";

import { raw, walkFiles } from "./stylesheets.ts";

/** What a gesture causes, and therefore what may not be read in the statement after one. */
const STATE = /(getAttribute|querySelector|\.matches\(|isConnected|activeElement|hasAttribute|textContent|\.length)/;
const GESTURE = /await\s+userEvent\.(click|dblClick|keyboard|hover|unhover|tab|fill|type|selectOptions|upload)\b/;
const EXEMPT = /SETTLED-BY-DESIGN:\s*(.+)/;

type Finding = { file: string; line: number; gesture: string; read: string };

function scan(): { findings: Finding[]; gestures: number; exemptions: string[] } {
  const findings: Finding[] = [];
  const exemptions: string[] = [];
  let gestures = 0;
  // WALKED, never listed: a law file added tomorrow is held to this tomorrow.
  for (const path of walkFiles(".", ".browser.test.tsx")) {
    const lines = raw(path).split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!GESTURE.test(lines[i]!)) continue;
      gestures += 1;
      // The next line that says anything — comments and blanks are not statements.
      let j = i + 1;
      while (j < lines.length) {
        const t = lines[j]!.trim();
        if (t && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*")) break;
        j += 1;
      }
      const next = lines[j]?.trim() ?? "";
      if (!next.startsWith("expect(") || !STATE.test(next)) continue;
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
        gesture: lines[i]!.trim().slice(0, 70),
        read: next.slice(0, 90),
      });
    }
  }
  return { findings, gestures, exemptions };
}

describe("a driver gesture resolving is not the browser having settled (2026-08-21)", () => {
  const { findings, gestures, exemptions } = scan();

  it("the walk found gestures — an empty walk forbids nothing", () => {
    // The negative control this file cannot do without: if the walk or the pattern breaks,
    // the claim below passes by finding nothing, which is the exact shape it guards against.
    expect(gestures).toBeGreaterThan(20);
  });

  it("no law reads what a gesture causes in the statement after it", () => {
    const report = findings
      .map((f) => `  ${f.file}:${f.line}\n    after: ${f.gesture}\n    reads: ${f.read}`)
      .join("\n");
    expect(
      findings,
      `wait for the state instead (\`await until(() => …)\`), or mark a NON-event claim with ` +
        `\`// SETTLED-BY-DESIGN: <why>\`:\n${report}`,
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
