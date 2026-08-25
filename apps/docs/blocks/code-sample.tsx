/**
 * The code-sample BLOCK: a labelled, copyable, annotatable code figure. The first entry in
 * the blocks registry (`blocks/index.tsx`), and the one the docs themselves consume — every
 * MDX fence and every example's source renders through this file, so the block ships with a
 * real consumer rather than a demo.
 *
 * WHAT A BLOCK IS HERE (2026-08-26, reconciled against THESIS §6): copied source, not
 * published code — and copy-paste is only safe when the copied file makes no design decisions
 * of its own. shadcn's copy-paste is centerless *by construction* because the decisions travel
 * in the copy; here every colour, distance and step resolves through the package, so the
 * center stays in the dependency and the copy carries only arrangement and behaviour.
 * Behaviour is allowed (the copy button's state, the expand control); invented values are not.
 *
 * THE FIVE JOBS (the 2026-08-26 spec): show (the element), name (the header's label or
 * title), take (the copy button), point (the author's annotations — line and word highlight,
 * focus, diff, error marks), and bound (`maxLines`, scroll-not-clip, expand as convenience).
 * Everything else the ecosystem ships is another component wearing this one's name (code
 * groups are Tabs; preview is the Example frame) or decoration (window chrome, icons).
 *
 * THE CHROME'S SETTLED SHAPE (2026-08-26, Kushagra, after three passes): the NAME sits
 * outside, a sibling row aligned to the code with the pane's own inset token
 * (`--surface-p-N`); the ACTIONS float over the pane — copy top-right, expand bottom-centre — as
 * GLASS (`backdrop`, the theme's material: the docs Theme runs `material="regular"`), at
 * Button's own medium default, because a floating control over content is exactly what the
 * material defends. No gradient — a scrollable well with a scrollbar already says "more".
 * SIZE PRICES EVERYTHING — pane, code step, label, copy and expand buttons all ride one
 * index — the ownership rule (§25, §30).
 *
 * WHAT THE COPY BUTTON HANDS OVER IS THE STRIPPED SOURCE — `plainText(lines)`, the code with
 * every `[!code …]` annotation removed, derived from the same tokens the paint renders, so
 * the clipboard and the pixels cannot disagree. Diff markers are real spans (a pseudo cannot
 * coexist with the line-number counter) but `aria-hidden` and `user-select: none`, so neither
 * assistive technology nor a drag-selection ever meets them.
 *
 * Async, and therefore server-only: tokenizing is build-time work, so a code fence costs the
 * reader nothing but the markup it produces. The client components are the copy button and,
 * only when the bound binds, the expand control.
 */
import * as React from "react";
import { Box, Code, Flex, Stack, Text, type Size } from "@kookie-ui/react";

import { CodeBlock } from "./code-block";
import { CopyButton } from "./copy-button";
import { Expandable } from "./expandable";
import {
  isLang,
  plainText,
  tokenize,
  type CodeLine,
  type Lang,
} from "./highlight";

/** What the header row calls each language. The grammar's id is a tool's name for it
    (`tsx`, `bash`); this is the reader's. */
const LANG_LABEL: Record<Lang, string> = {
  tsx: "TSX",
  ts: "TypeScript",
  jsx: "JSX",
  js: "JavaScript",
  css: "CSS",
  json: "JSON",
  bash: "Terminal",
  html: "HTML",
  mdx: "MDX",
};

export type CodeSampleProps = {
  code: string;
  lang: string;
  /** One index for the whole figure: the pane, the code step, the label and both buttons. */
  size?: Size;
  /** A file path, when the sample IS a file. Replaces the language label, because where the
      code lives is more use than what it is written in once you can see it. */
  title?: string;
  /** Suppress the header row. For the rare fence that is one word long, where a label and a
      copy button are more chrome than content. */
  bare?: boolean;
  /** Fence meta for Shiki's own directives — `{1,3-5}` highlights lines, `/word/` highlights
      a word. The chrome facts (`title`, `lineNumbers`, `maxLines`, `bare`) are real props;
      the MDX fence adapter parses them out of the meta string with `parseMeta`. */
  meta?: string;
  /** Number the lines. CSS counters — never markup, so never in a selection or the copy. */
  lineNumbers?: boolean;
  /** Bound the well to this many lines. Bounded means scrollable (see the element); an
      expand button appears only when the code actually exceeds the bound. */
  maxLines?: number;
};

/** One rendered line: a block-level span carrying the author's flags as classes, so the
    theme (`code.css`) owns every colour and this file owns none. */
function Line({ line, marker }: { line: CodeLine; marker: boolean }) {
  const classes = ["kd-line"];
  if (line.highlight) classes.push("kd-line-highlight");
  if (line.add) classes.push("kd-line-add");
  if (line.remove) classes.push("kd-line-remove");
  if (line.focus) classes.push("kd-line-focus");
  if (line.level) classes.push(`kd-line-${line.level}`);
  return (
    <span className={classes.join(" ")}>
      {marker ? (
        // A real span rather than a pseudo — the ::before slot belongs to the line-number
        // counter. Hidden from AT and from selection; the copy path never sees it because
        // copy text is derived from tokens, and this is not one.
        <span className="kd-line-marker" aria-hidden>
          {line.add ? "+" : line.remove ? "−" : ""}
        </span>
      ) : null}
      {line.tokens.map((token, index) => (
        <span
          key={index}
          className={token.word ? "kd-word" : undefined}
          style={{
            color: token.color,
            ...(token.italic ? { fontStyle: "italic" } : null),
          }}
        >
          {token.text}
        </span>
      ))}
    </span>
  );
}

export async function CodeSample({
  code,
  lang,
  size = "2",
  title,
  bare,
  meta,
  lineNumbers,
  maxLines,
}: CodeSampleProps) {
  // An unlisted language would tokenize as plain text, which renders exactly like a fence
  // nobody got round to labelling — a silent downgrade. The docs law walks fences against
  // LANGS so this throw is a backstop rather than the enforcement, but a backstop that says
  // which fence and which language is worth the two lines.
  if (!isLang(lang)) {
    throw new Error(
      `Unknown code language "${lang}". Add it to LANGS in highlight.ts, or fix the fence.\n${code.slice(0, 80)}`,
    );
  }
  const { lines, focused, diff } = await tokenize(code, lang, meta);
  const copyText = plainText(lines);

  const paneClasses = [
    lineNumbers ? "kd-numbered" : null,
    focused ? "kd-focused" : null,
  ].filter(Boolean);
  const className = paneClasses.length ? paneClasses.join(" ") : undefined;

  const content = lines.map((line, index) => (
    <Line key={index} line={line} marker={diff} />
  ));

  // The bound binds only when the code exceeds it — decided here, from the line count the
  // renderer already holds, never by measuring the DOM (v1's defect class).
  const bounded = maxLines !== undefined && lines.length > maxLines;

  // The copy button FLOATS top-right over the pane, as glass (Kushagra, 2026-08-26): a
  // floating control over content takes `backdrop`. It hangs from a positioned wrapper
  // OUTSIDE the pane (inside, it broke the scroller's bleed — see the element), offset by
  // the same inset token the pane pads with, so it rests exactly one inset off the corner.
  const well = (
    <Box style={{ position: "relative" }}>
      {bounded ? (
        <Expandable size={size} maxLines={maxLines} lineCount={lines.length} className={className}>
          {content}
        </Expandable>
      ) : (
        <CodeBlock size={size} {...(className ? { className } : {})}>
          {content}
        </CodeBlock>
      )}
      <Flex
        style={{
          position: "absolute",
          insetBlockStart: `var(--surface-p-${size})`,
          insetInlineEnd: `var(--surface-p-${size})`,
        }}
      >
        <CopyButton code={copyText} size={size} />
      </Flex>
    </Box>
  );

  if (bare) return well;
  return (
    <Stack gap="3">
      {/* The NAME stays outside (Kushagra: "file name is ok outside"), indented to the code:
          the row states the pane's own inset token, so the label's first character sits over
          the code's first column at every size and density. */}
      <Flex align="center" style={{ paddingInline: `var(--surface-p-${size})` }}>
        {/* A title is a file path — code vocabulary, so it wears the inline code atom; a
            language label is a word and stays prose. Content decides the dress. LOUD
            (Kushagra, 2026-08-26, after a day at quiet and an hour at medium): the label
            names the figure — it is this pane's title, not a group caption — and §15 rests
            reading text loud. Size and the atom's dress do the ranking; the ink does not. */}
        {title ? (
          <Code size={size} emphasis="loud">
            {title}
          </Code>
        ) : (
          <Text size={size} emphasis="loud">
            {LANG_LABEL[lang]}
          </Text>
        )}
      </Flex>
      {well}
    </Stack>
  );
}
