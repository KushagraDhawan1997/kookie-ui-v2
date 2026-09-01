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
/* THE STYLESHEET IS IMPORTED BY THE FILE THAT EMITS ITS CLASSES (2026-09-01). It used to be
   imported at the top of the local `code-block.tsx`, and when that stub was deleted for the
   package's own element nothing pulled `code.css` in any more — so `.kd-line` stopped being a
   block, every line of every fence on the site ran together onto one line, and the whole suite
   stayed green. The classes below are this file's, so the import is this file's; a law in
   `blocks.test.tsx` now pairs the two. */
import "./code.css";

import * as React from "react";
import { Chip, CodeBlock, Flex, type Size } from "@kookie-ui/react";

import { FileIcon } from "../app/icons";
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

/**
 * How many lines a well shows before it bounds itself (2026-08-31, Kushagra: "large code
 * blocks should automatically get the show-x-more-lines across docs").
 *
 * It is a DEFAULT rather than a per-call-site prop because the fault it fixes is the one
 * nobody remembers to fix: a fence or an example runs long, the page becomes a mile of
 * scrolling code, and the author who wrote it never sees the page it landed on. The blocks
 * route was the one place that had judged a number and stated it by hand — a bound is not a
 * property of that route, so the number moves here and that call site drops it.
 *
 * NOT SILENT: bounded means SCROLLABLE, and the expand control names what it is holding back
 * ("Show all N lines"), so nothing is hidden without saying how much.
 *
 * An unbounded well is `maxLines={Infinity}` — deliberately awkward, because wanting one is
 * rare and the reason should be visible at the call site.
 */
export const CODE_MAX_LINES = 24;

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
      expand button appears only when the code actually exceeds the bound. Defaults to
      `CODE_MAX_LINES`; `Infinity` opts out. */
  maxLines?: number;
  /** The sample is already inside a pane, so the well draws none of its own — see the element.
      A well inside a ground is the same ground twice. */
  hosted?: boolean;
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

/**
 * Tokenize, then render. The split exists because tokenizing is SERVER work and rendering is
 * not (2026-08-30): a docs page with live controls rewrites one token's text when a control
 * moves, and it cannot call Shiki to do it — so the view below takes lines that are already
 * tokenized and is an ordinary synchronous component that a client component may render.
 *
 * One renderer, not two. The alternative was a second component painting `.kd-line` markup for
 * the live case, which is the shape this repo's own rule forbids: a mechanism with two
 * implementations owes a law that they agree, and the cheaper answer is to have one.
 */
export async function CodeSample({ code, lang, meta, ...view }: CodeSampleProps) {
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
  return <CodeSampleView lines={lines} focused={focused} diff={diff} lang={lang} {...view} />;
}

export type CodeSampleViewProps = Omit<CodeSampleProps, "code" | "meta"> & {
  /** Already tokenized. The one thing the view cannot do for itself. */
  lines: readonly CodeLine[];
  /** Some line said `[!code focus]`, so the rest stand down. */
  focused: boolean;
  /** Some line is an add or a remove, so every line gets a marker gutter. */
  diff: boolean;
};

export function CodeSampleView({
  lines,
  focused,
  diff,
  lang,
  size = "2",
  title,
  bare,
  lineNumbers,
  maxLines = CODE_MAX_LINES,
  hosted,
}: CodeSampleViewProps) {
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
  const bounded = lines.length > maxLines;

  // The copy button FLOATS top-right over the pane, as glass (Kushagra, 2026-08-26): a
  // floating control over content takes `backdrop`. It hangs from a positioned wrapper
  // OUTSIDE the pane (inside, it broke the scroller's bleed — see the element), offset by
  // the same inset token the pane pads with, so it rests exactly one inset off the corner.
  /* The NAME FLOATS OVER THE PANE (2026-08-28, Kushagra: "I dont like how the filename
     appears… so that it can stay floating above content behind"). It sat outside until now, a
     sibling row indented to the code — his own 2026-08-26 call, reversed here. What it is now
     is the mirror of the copy button: same corner, same inset, opposite side, same material.

     A PATH IS COPIABLE AND A LANGUAGE IS NOT, so the two are not one component. `examples/
     dialog.tsx` is a thing you want in your clipboard — it is how you find the file — so it is
     the same `CopyButton` the code uses, with the path as both its label and its payload. A
     language name is a caption: there is nothing to copy and nothing to press, so it stays an
     inert `Chip`. They look different because they DO different things, which is this
     system's own rule rather than an inconsistency to tidy away.

     The chip keeps `backdrop` and the button takes it by construction, so both resolve the
     theme's material — and since 2026-08-28 the atom family paints the same ring and rim the
     button does, which is what makes the two read as one kind of chrome. */
  /* A LANGUAGE IS LABELLED ONLY WHERE THE LABEL CHANGES WHAT YOU DO (2026-08-30, Kushagra:
     "isn't it obvious? This is a react app, it will always be tsx").

     Every fence on this site that is not a shell command is source you paste into a file, and
     `TSX` on a React library's docs is a label that is always true — it says nothing, and it
     was saying it 63 times. `Terminal` is the one that survives: it tells a reader the lines go
     in a shell rather than in their editor, which is the only thing here a reader could get
     wrong. CSS, JSON and HTML are unlabelled for the same reason as TSX — a stylesheet looks
     like a stylesheet, and knowing which file it belongs in is a question the prose around it
     answers, not a chip.

     Keyed on `bash` rather than on a list, so adding a language does not silently add a label:
     a new one has to argue its way in here. */
  const name = title ? (
    <CopyButton code={title} label={title} size={size} icon={<FileIcon />} />
  ) : lang === "bash" ? (
    <Chip size={size} backdrop>
      {LANG_LABEL[lang]}
    </Chip>
  ) : null;

  /* ONE ROW, FLOATING OVER THE CODE (2026-08-28, Kushagra: "the content doesnt float behind
     buttons now? It needs to float, else whats the point of glass").
     
     It was moved into FLOW for an hour and that was the wrong repair. The row overlapped the
     first line, I read the overlap as the defect and deleted the float — but a translucent
     control exists to be legible with content passing behind it, so a glass row with nothing
     behind it is decoration wearing a material's name. What was actually wrong was that the
     first line had nowhere to rest, and the answer to that is an inset, not flow: this is the
     platform pattern, where a scroll view holds a top contentInset and its content passes
     under a translucent toolbar. The band is a safe area, not an apology.

     IT SPANS THE PANE AND PADS ITSELF (his call, kept from the in-flow cut). The pane's inset
     is a READING measure — the distance a line of code needs from a wall — and chrome is not
     reading matter, so `inset-inline` reaches both walls and `p` puts a smaller number back.
     The buttons sit closer to the edge than the code does, which is what says they belong to
     the pane rather than to the text.

     THIS WAS BRIEFLY UNDONE AND PUT BACK (2026-08-29): the specimen figure's hosted sample had
     chrome sitting FURTHER from the wall than its code, and I read that as the two arrangements
     disagreeing and aligned both to the code. Wrong repair — one of them was right. A hosted
     sample's own box IS the code column, so `inset-inline: 0` starts at the host's inset and
     any padding adds to it; the fix is for the chrome to REACH the host's wall, which is the
     line below, not for the standalone to give up the relationship.

     `z-index` is deliberately absent, and the row is rendered AFTER the scroller instead —
     see code-block.tsx. An earlier note here claimed paint order handled it because the row
     is positioned and the code is not; that was wrong, since `.kui-scroll-area` is positioned
     too, so the two settled it on DOM order and the code won. Order is the whole fix: a
     z-index would be the number ladder §20 exists to avoid. */
  /* AND A ROW WITH NO NAME RESERVES NOTHING (2026-08-31, Kushagra: "the one with no filename...
     the top left just looks weird").

     The band under this row is a safe area for chrome that reaches BOTH walls: a name at one
     and the copy button at the other cover the whole of line 1, so line 1 needs somewhere else
     to be. An unlabelled fence has only the button, and reserving a pane's width of clearance
     for a control that occupies one corner of it is what put a hand's width of nothing in the
     top-left. The rule is now stated where the row is built — the well takes `band` and this
     file decides it — so the two cases differ in exactly the fact that differs between them.

     `space-between` with ONE child pushes it to the START, so the justification flips too: the
     row means "name at one wall, action at the other", and with no name there is only the
     action, which takes the end. */
  const topbar = (
    <Flex align="center" justify={name ? "space-between" : "end"} gap="3">
      {name}
      <CopyButton code={copyText} size={size} iconOnly />
    </Flex>
  );

  const well = (
    <>
      {bounded ? (
        <Expandable
          size={size}
          maxLines={maxLines}
          lineCount={lines.length}
          topbar={bare ? undefined : topbar}
          {...(!bare && name ? { band: true } : {})}
          {...(hosted ? { hosted } : {})}
          className={className}
        >
          {content}
        </Expandable>
      ) : (
        <CodeBlock
          size={size}
          {...(bare ? {} : { topbar })}
          {...(!bare && name ? { band: true } : {})}
          {...(hosted ? { hosted } : {})}
          {...(className ? { className } : {})}
        >
          {content}
        </CodeBlock>
      )}
    </>
  );

  /* One element now. The figure used to be a Stack of a header row and the pane, which is
     what the wrapping Stack existed for; with the name inside the pane there is nothing left
     to stack, and `bare` stops being a different SHAPE — it is the same well with the label
     suppressed. */
  return well;
}
