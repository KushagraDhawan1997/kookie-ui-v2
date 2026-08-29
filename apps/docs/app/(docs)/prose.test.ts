/**
 * The register laws (2026-08-25).
 *
 * Every chapter on this site was rewritten because the prose had drifted into a register only
 * the people who built the system could read: verdicts instead of teaching, riddles, two
 * abstractions equated, components acting like people, invented terms nobody had introduced,
 * and prose that never once said "you". `content/AUTHORING.md` now states all six.
 *
 * A STYLE GUIDE THAT NOBODY CHECKS IS THE THING THAT FAILED. `AUTHORING.md` already said "do
 * not use metaphors", "do not use filler" and "use the active voice" while all three were being
 * broken on every page, because nothing read it. So the checkable half is checked here.
 *
 * WHAT THIS CAN AND CANNOT DO, stated because a law nobody knows the limits of gets trusted
 * past them. It catches VOCABULARY and MARKERS: a banned word, a date, an unearned qualifier,
 * prose that never addresses you. It cannot catch a riddle, a verdict, or two abstractions
 * equated, because those are shapes rather than strings — "The mark ladder is the line box" is
 * six ordinary words in an ordinary order. That half stays in AUTHORING.md, where a person
 * applies it, and it is the half worth reading the guide for.
 *
 * FALSIFIED AGAINST THE PROSE THAT CAUSED THIS. Every threshold below was measured on the
 * pre-rewrite chapters (`git show 152804f:apps/docs/content/...`) and the current ones, and
 * every check separates them:
 *
 *   invented vocabulary   41 → 0     unearned qualifiers    1 → 0
 *   invented verbs         5 → 0     third-person reader   15 → 0
 *   filler                 2 → 0     you/your per chapter   0 → 5 (thinnest)
 *
 * A threshold that both corpora passed would be a check that never had anything to say.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const contentRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../content");

/** Every chapter, as [name, prose]. AUTHORING.md is the guide, not a chapter: it quotes the
    banned words in order to ban them, so scanning it would fail on its own examples. */
function chapters(): [string, string][] {
  const out: [string, string][] = [];
  for (const section of readdirSync(contentRoot, { withFileTypes: true })) {
    if (!section.isDirectory()) continue;
    for (const file of readdirSync(join(contentRoot, section.name))) {
      if (!file.endsWith(".mdx")) continue;
      out.push([
        `${section.name}/${file}`,
        readFileSync(join(contentRoot, section.name, file), "utf8"),
      ]);
    }
  }
  return out;
}

/**
 * Prose only. A fence is code, and code legitimately contains the words prose may not — a
 * `--radius-mark-2` token, a `dress` variable. Scanning fences would make the law fire on the
 * examples it exists to protect.
 */
function prose(source: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  let inFence = false;
  source.split("\n").forEach((text, index) => {
    if (text.trimStart().startsWith("```")) inFence = !inFence;
    else if (!inFence) out.push({ line: index + 1, text });
  });
  return out;
}

const ALL = chapters();

/**
 * Words this system uses internally and a reader cannot decode.
 *
 * Each one is on the list because it shipped and had to be removed, not because it sounds
 * jargonish: "the mark ladder", "the reading ramp", "the handheld type band", "the surface
 * seal", "a rung of the ink ladder". `DECISIONS.md` may use all of them. A chapter may not.
 *
 * One home, because two corpora read it: the chapters below, and the pages outside `content/`
 * that carry reader prose in TypeScript. A second copy is a second list to widen and one to
 * forget.
 */
const BANNED: [RegExp, string][] = [
  [/\b(rungs?|veils?|ladders?|ramps?|postures?)\b/i, "an internal noun a reader has not met"],
  [/\bthe seal\b/i, "an internal noun a reader has not met"],
  [/\b(prices|priced|rides|owes|stands down|re-picks|re-scopes)\b/i,
    "a component acting like a person"],
  [/\bby (construction|design|derivation)\b/i,
    "a qualifier that asserts something is necessarily true without showing why"],
  [/\b(simply|of course|it turns out|said plainly)\b/i, "filler"],
  [/\ba call site\b|\bthe reader\b/i, "the third person, where the chapter means you"],
  [/\b20\d\d-\d\d-\d\d\b/, "a date — development history belongs in docs/LOG.md"],

  /**
   * The sales register (2026-08-27).
   *
   * A different fault from the six above, and it arrived on the front door the day the front
   * door was rewritten: "these pages are honest about what that costs you", and one paragraph
   * down, "rather than taking them on trust". Both assert the document's own virtue, which is
   * the one claim a reader has no way to check and the one a document cannot make about itself.
   * Honest writing states the cost — this page now names it, in words a reader can hold the
   * system to: fewer ways out, and a twentieth screen that costs what the second one did.
   *
   * The marketing adjectives are here because they say nothing that survives a question. There
   * is no measurement behind "powerful", and STE already refuses the metaphors ("under the
   * hood"). Every pattern was checked against all 26 reader-facing files first: zero hits, so
   * nothing on the list is a word this corpus was already using for a real reason.
   */
  [/\b(honest about|we believe|we think|on trust)\b/i,
    "the document praising itself — state the fact and let a reader judge it"],
  [/\b(carefully|thoughtfully) (crafted|designed|built)\b/i,
    "the document praising itself — state the fact and let a reader judge it"],
  [/\b(seamless|powerful|robust|elegant|delightful|beautiful|intuitive|blazing)\w*\b/i,
    "a marketing adjective with no measurement behind it"],
  [/\b(out of the box|best of both|at its core|under the hood|first-class|batteries included)\b/i,
    "a marketing phrase"],
  [/\b(not just a|isn't just|is not just|more than just)\b/i,
    "the \"not just X\" construction, which promises a lot and states nothing"],
];

describe("the chapters are written to a reader (AUTHORING.md: the register)", () => {
  it("found the chapters at all — an empty walk audits nothing", () => {
    // The vacuity guard every loop below needs. A renamed content directory would otherwise
    // turn this whole file into twenty passing tests over nothing.
    expect(ALL.length).toBeGreaterThan(15);
  });

  for (const [name, source] of ALL) {
    it(`${name} uses no word a reader cannot decode`, () => {
      const found: string[] = [];
      for (const { line, text } of prose(source)) {
        for (const [pattern, why] of BANNED) {
          const hit = pattern.exec(text);
          if (hit) found.push(`  line ${line}: "${hit[0]}" — ${why}\n    ${text.trim()}`);
        }
      }
      expect(found.join("\n"), `${name}\n${found.join("\n")}`).toBe("");
    });
  }

  /**
   * The positive half, and the one that actually measures register rather than vocabulary.
   *
   * A banned-word list only ever removes things. This is the check that a chapter is addressed
   * to somebody: Apple writes "Use a slider when you want people to choose a value", and the
   * old chapters wrote "a call site cannot work the mapping out". Five is the floor because the
   * thinnest chapter now carries five and the thinnest before carried none — motion.mdx, 905
   * words about how a control behaves under your own finger, which never once said "you".
   */
  for (const [name, source] of ALL) {
    it(`${name} addresses the person reading it`, () => {
      const text = prose(source).map((l) => l.text).join(" ");
      const uses = text.match(/\byou\b|\byour\b/gi)?.length ?? 0;
      expect(uses, `${name} says "you" ${uses} times — it is written about the system, not to a person`)
        .toBeGreaterThanOrEqual(5);
    });
  }
});

/**
 * The same register, for the reader prose that does NOT live in `content/`.
 *
 * WHY THIS EXISTS. The walk above reads `content/*.mdx` and nothing else, so the front door,
 * the two indexes and every blurb in `chapters.ts` and `registry.ts` were unchecked — and that
 * is exactly where the register kept coming back. `registry.ts` already carried a header
 * telling writers these rules; nothing read it, which is the failure `AUTHORING.md` itself was
 * written about, one layer up.
 *
 * WHAT IT CANNOT DO, stated because the limit is the point. It catches the WORD half only. The
 * fault these pages actually failed on was ALTITUDE — a landing page that opened on "there is
 * no colour prop and no variant prop", which is six ordinary words about a real API and is
 * unreadable to somebody who arrived thirty seconds ago. No string can catch that. It stays in
 * `AUTHORING.md` under "The front door and the indexes", where a person applies it.
 *
 * COMMENTS ARE STRIPPED FIRST. These files are source, and their comments are written to the
 * next maintainer, who may legitimately say "the mark ladder" — the package's own stylesheet
 * laws learned this and strip comments for the same reason. The strip leaves `https://` alone
 * by refusing a `//` that follows a colon, so a URL in a string is never mistaken for a comment.
 */
const SURFACES = [
  "page.tsx",
  "chapters.ts",
  "components/page.tsx",
  "components/registry.ts",
  "blocks/page.tsx",
] as const;

const here = fileURLToPath(new URL(".", import.meta.url));

function withoutComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

describe("the pages outside content/ are written to the same reader", () => {
  it("found every surface — a renamed file must fail here, not go unread", () => {
    // The vacuity guard. Without it, renaming `page.tsx` would silently drop the front door
    // from the audit and this whole block would pass over nothing.
    for (const name of SURFACES) {
      expect(existsSync(join(here, name)), `${name} is not where this law expects it`).toBe(true);
    }
    expect(SURFACES.length).toBeGreaterThan(4);
  });

  for (const name of SURFACES) {
    it(`${name} uses no word a reader cannot decode`, () => {
      const source = withoutComments(readFileSync(join(here, name), "utf8"));
      const found: string[] = [];
      source.split("\n").forEach((text, index) => {
        for (const [pattern, why] of BANNED) {
          const hit = pattern.exec(text);
          if (hit) found.push(`  line ${index + 1}: "${hit[0]}" — ${why}\n    ${text.trim()}`);
        }
      });
      expect(found.join("\n"), `${name}\n${found.join("\n")}`).toBe("");
    });
  }
});
