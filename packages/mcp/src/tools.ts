/**
 * What each tool answers, as four pure functions of their arguments.
 *
 * Separate from `index.ts` so the answers can be MEASURED. The size ceiling is this server's
 * one hard constraint, and a law that proved it by starting a process and calling one tool
 * would be a law about the example it happened to pick; these functions let the law sweep every
 * component, every family and the widest token query there is.
 */
import { checkUsage } from "./check.ts";
import { data, resolveComponent } from "./data.ts";

/**
 * The ceiling, in characters.
 *
 * A budget in characters rather than tokens, because a server cannot tokenize the client's
 * model. Three characters to a token is the pessimistic end for prose with code in it, so
 * 60,000 characters sits under a 25,000-token cap with room the estimate cannot eat. The
 * largest answer this server can give today is the Shell reference at about 23,000 characters,
 * so nothing reaches the ceiling; it exists because a page that grows past it later must be
 * trimmed HERE, where the trim can say so, rather than by a client that cannot.
 */
export const CEILING = 60_000;

const trimNote = (dropped: number): string =>
  `\n\n[Trimmed here: ${dropped} more characters. Ask for one part of this rather than the whole thing.]`;

/**
 * Trimmed to the ceiling, and honest when it trims.
 *
 * THE NOTICE IS RESERVED OUT OF THE BUDGET, not appended to it. The first spelling sliced to
 * the ceiling and then added the sentence, which put the result 95 characters PAST the limit
 * the function exists to keep — a trim that overflows. The reserve is measured against the
 * larger number, so the sentence that actually gets written can only be shorter.
 */
export function budgeted(text: string): string {
  if (text.length <= CEILING) return text;
  const keep = CEILING - trimNote(text.length).length;
  return `${text.slice(0, keep)}${trimNote(text.length - keep)}`;
}

/** The provenance line an answer carries. A reader who doubts it can open the file. */
const from = (...keys: string[]): string =>
  `\n\nSource: ${keys.map((key) => data().sources[key] ?? key).join(", ")}`;

/**
 * The families, taken from the components themselves.
 *
 * A LIST HERE WOULD BE A SECOND HOME. The registry states each entry's family and nothing else
 * does; a copy would keep agreeing right up to the day a sixth family lands, which is the day
 * the tool's own filter would stop reaching it — and no law would say so, because a shorter
 * list is just a shorter walk. First-seen order, so the enum a client reads is the order
 * `list_components` prints its headings in.
 */
export const families = (): [string, ...string[]] =>
  [...new Set(data().components.map((row) => row.family))] as [string, ...string[]];

/** A family name, open at the type level because the values are a runtime derivation; the
    tool's schema closes it against the list above, which is the check that cannot go stale. */
export type Family = string;

export function listComponents({
  family,
  query,
}: {
  /* `| undefined` written out because `exactOptionalPropertyTypes` is on and zod hands an
     optional field over as exactly that: present, and possibly undefined. */
  family?: Family | undefined;
  query?: string | undefined;
}): string {
  const rows = data().components;
  const want = query?.trim().toLowerCase();
  const matched = rows.filter(
    (row) =>
      (!family || row.family === family) &&
      (!want || row.name.toLowerCase().includes(want) || row.abstract.toLowerCase().includes(want)),
  );
  if (!matched.length) {
    return budgeted(
      `Nothing matched. ${rows.length} components exist; call this tool with no arguments to see them all.`,
    );
  }
  const body = [...new Set(matched.map((row) => row.family))]
    .map((name) => {
      const listed = matched
        .filter((row) => row.family === name)
        .map((row) => `- **${row.name}** — ${row.abstract}`)
        .join("\n");
      return `## ${name}\n\n${listed}`;
    })
    .join("\n\n");
  return budgeted(`${matched.length} of ${rows.length} components.\n\n${body}${from("registry")}`);
}

export function getComponent({ name }: { name: string }): string {
  const found = resolveComponent(name);
  if ("candidates" in found) {
    const near = found.candidates
      .slice(0, 20)
      .map((row) => `- ${row.name} — ${row.abstract}`)
      .join("\n");
    return budgeted(
      `KookieUI exports no \`${name}\`.\n\nThe nearest names:\n\n${near}\n\n` +
        `If you are looking for a toast, a banner, an inline alert or a callout: this system ships none of them. ` +
        `Call get_component("Notice") for the one that takes layout space, and get_component("Dialog") for the one that interrupts.`,
    );
  }
  return budgeted(`${data().markdown[found.row.slug]}${from("twin", "registry", "api")}`);
}

export function checkCode({ code }: { code: string }): string {
  const { findings, foreign, spread } = checkUsage(code);
  const notes: string[] = [];
  if (spread) {
    notes.push(
      `${spread} spread${spread === 1 ? "" : "s"} in this code. A spread hides the props it carries, so nothing in it was checked.`,
    );
  }
  if (foreign.length) notes.push(`Not KookieUI, so not checked: ${foreign.join(", ")}.`);
  const tail = notes.length ? `\n\n${notes.map((note) => `Note: ${note}`).join("\n")}` : "";
  const source = from("refusals", "registry", "axes");

  if (!findings.length) {
    return budgeted(
      `Nothing refused. This reads opening tags and literal values only, so a clean result means ` +
        `nothing visible here breaks a rule — it does not mean the code compiles.${tail}${source}`,
    );
  }
  const body = findings
    .map((finding) => {
      const where = finding.prop
        ? `\`${finding.prop}\` on \`<${finding.tag}>\``
        : `\`<${finding.tag}>\``;
      return `### line ${finding.line} — ${finding.severity}: ${where}\n\n${finding.message}`;
    })
    .join("\n\n");
  const errors = findings.filter((finding) => finding.severity === "error").length;
  return budgeted(
    `${findings.length} finding${findings.length === 1 ? "" : "s"}, ${errors} of them refused outright.\n\n${body}${tail}${source}`,
  );
}

export function getTokens({
  query,
  limit = 60,
}: {
  query: string;
  limit?: number | undefined;
}): string {
  const tokens = data().tokens;
  const want = query.trim().toLowerCase().replace(/^-+/, "");
  const matched = tokens.filter((token) => token.name.toLowerCase().includes(want));
  if (!matched.length) {
    // The families are READ OFF THE TOKEN NAMES. The first spelling listed fifteen of them by
    // hand and was wrong on the day it shipped: it named `size`, which heads no token, and
    // left out fifty-one that do — so the one message whose whole job is to say what to ask
    // for next was pointing away from most of the answers.
    const heads = [...new Set(tokens.map((token) => token.name.replace(/^--/, "").split("-")[0]))];
    return budgeted(
      `No token name contains \`${query}\`. ${tokens.length} tokens exist, and a name begins ` +
        `with one of these: ${heads.sort().join(", ")}.`,
    );
  }
  const shown = matched.slice(0, limit);
  const rows = shown
    .map((token) => {
      const scopes = token.scopes?.length
        ? ` _(redeclared under ${token.scopes.slice(0, 4).join(", ")}${token.scopes.length > 4 ? ", …" : ""})_`
        : "";
      return `| \`${token.name}\` | \`${token.value}\` |${scopes} |`;
    })
    .join("\n");
  const more =
    matched.length > shown.length
      ? `\n\n${matched.length - shown.length} more matched. Narrow the query or raise \`limit\`.`
      : "";
  return budgeted(
    `${shown.length} of ${matched.length} matching tokens. The value shown is the one at \`:root\`.\n\n` +
      `| Token | Value at :root | |\n| --- | --- | --- |\n${rows}${more}${from("tokens")}`,
  );
}
