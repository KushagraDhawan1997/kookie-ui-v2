/**
 * Syntax highlighting, in the system's own colours (2026-08-21; LOG).
 *
 * Shiki is the Base UI relationship one layer over: TextMate grammars are decades of
 * accumulated correctness nobody should rewrite, they are behaviour rather than appearance,
 * and they are invisible until someone paints them. So the grammars are theirs and every
 * colour is ours.
 *
 * The mechanism is Shiki's CSS-variables theme: instead of baking hexes, the tokenizer emits
 * `var(--kd-code-token-*)` and `prose.css` resolves those names against the ten tones' SOLVED
 * ink ladder (§15, 2026-08-10). That is the load-bearing part. A stock highlight theme is a
 * second colour system living inside the first — the one place on a site made of KookieUI
 * where the pixels would not be KookieUI's — and it would also be the only text on the page
 * held to no contrast target at all. Reading through `--{tone}-ink` means every token colour
 * is a value the generator solved against the surface it sits on, in both appearances, and a
 * re-judged palette moves the code samples with it.
 *
 * BOLD IS DROPPED, ITALIC IS KEPT, and the asymmetry is the type system's (§15, 2026-08-09:
 * `bold` is refused package-wide, and a value left reachable is one every call site can
 * re-introduce). Shiki's markdown scopes ask for bold; a weight this system does not ship
 * would be synthesized by the browser, which is the font faking a token we deleted on
 * purpose. Italic is not a weight and stays — it is the one signal separating a comment from
 * the code around it that does not spend a colour.
 */
import { createCssVariablesTheme, createHighlighter } from "shiki";

/**
 * The languages the docs actually contain. Listed rather than bundled: Shiki loads grammars
 * on demand, and a docs build that pulls every grammar it ships pays for languages this
 * system has no samples in. A law walks the code fences against this list, so an unlisted
 * language fails the build instead of silently rendering as plain text (which is Shiki's
 * fallback, and reads exactly like a fence nobody got round to labelling).
 */
export const LANGS = ["tsx", "ts", "jsx", "js", "css", "json", "bash", "html", "mdx"] as const;

export type Lang = (typeof LANGS)[number];

export const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

/** Named once. `createCssVariablesTheme` types its result's `name` as optional, so reading it
    back at the call site is a nullable string the highlighter will not accept — the constant
    is what makes registering the theme and selecting it the same fact. */
const THEME_NAME = "kookie";

const theme = createCssVariablesTheme({
  name: THEME_NAME,
  variablePrefix: "--kd-code-",
  // No defaults. A `var()` with a fallback would paint SOMETHING when a name is unresolved,
  // which is how a token that prose.css forgot ends up looking deliberate — the material
  // edge's `initial` argument (§10), one system over. Unresolved here means invalid at
  // computed-value time, so the token falls back to the block's own foreground and the miss
  // is visible rather than plausible.
  variableDefaults: {},
  fontStyle: true,
});

/**
 * One highlighter for the whole build. Shiki's setup cost is grammar parsing, which is
 * per-process rather than per-call, so a module-level promise is the difference between
 * paying it once and paying it per code fence on a site that is mostly code fences.
 */
let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;

const getHighlighter = () => {
  highlighterPromise ??= createHighlighter({ themes: [theme], langs: [...LANGS] });
  return highlighterPromise;
};

/** One token as the renderer needs it: the text, the colour to paint it, and whether it is
    the italic kind. Shiki's own richer token shape stops here on purpose — everything past
    these three fields is a decision this file has already made. */
export type CodeToken = { text: string; color?: string | undefined; italic: boolean };

/**
 * Tokenize, and return LINES OF TOKENS rather than a string of HTML.
 *
 * Shiki will happily return `codeToHtml`, and taking it would mean `dangerouslySetInnerHTML`
 * on every code sample in the docs. Tokens render as real React elements instead: nothing is
 * trusted as markup, the bold-dropping above is a filter rather than a regex over emitted
 * HTML, and line-level affordances (numbers, a highlighted range) stay open without parsing
 * the thing we just generated.
 */
export async function tokenize(code: string, lang: Lang): Promise<CodeToken[][]> {
  const highlighter = await getHighlighter();
  const { tokens } = highlighter.codeToTokens(code.replace(/\n+$/, ""), {
    lang,
    theme: THEME_NAME,
  });
  return tokens.map((line) =>
    line.map((token) => ({
      text: token.content,
      color: token.color,
      // `fontStyle` is a bitmask: 1 italic, 2 bold, 4 underline. Only the first survives,
      // per the header. Underline is dropped with bold — in a code block it reads as a link.
      italic: (token.fontStyle ?? 0) === 1 || ((token.fontStyle ?? 0) & 1) === 1,
    })),
  );
}
