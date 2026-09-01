/**
 * The specimen BLOCK: a live component and its source, as ONE figure (2026-08-29, Kushagra —
 * "the preview and the code should belong to same surface, inside one surface").
 *
 * WHAT IT REPLACES, AND WHY THAT WAS WRONG. The docs shipped this pairing from 2026-08-21 as
 * two siblings with a gap between them: a Card holding the specimen, then a code well, and a
 * comment explaining that the gap was what made them "one figure". It did not. Two boxes a
 * step apart are two boxes, and the reader has to be told they belong together — which is what
 * a written comment doing the eye's job always means. The argument recorded against a single
 * container was that "two wells stacked read as one region rather than as a thing and its
 * source", and that argument is sound about two WELLS; it never considered one pane holding
 * both, which is what every peer ships and what this is.
 *
 * THE ARRANGEMENT IS THE SYSTEM'S OWN SENTENCE (§10): a Card is an object, a Surface is what
 * an object sits on. So the figure is a GROUND — it holds things, it is not one — carrying the
 * specimen on paper and its source beneath. The nesting is Apple's grouped-background pattern
 * and the one the builder's canvas already uses; the surface size join reads the OVERLAY band,
 * so the ground out-rounds the Card inside it by construction rather than by a number picked
 * here.
 *
 * IT IS A BLOCK AND NOT A DOCS COMPONENT, which took one change to be true. The pairing lived
 * in `app/(docs)/example.tsx` and could not be copied, because it read its source off disk
 * with `process.cwd()` — a docs-app assumption no copied file can carry. That read stays in
 * the docs app; this file takes `children` and a `code` string, which is the whole difference
 * between a block and a page component. `Example` is now a thin wrapper that does the reading.
 *
 * WHOSE PANE IS THE SPECIMEN'S: a component that IS a pane (Card, Surface, Composer) must not
 * be wrapped in another one — the docs shipped card-inside-card on four component pages for
 * weeks because nothing static could see it. The caller states it with `pane={false}` rather
 * than this file guessing, because the answer lives in the caller's own subject: the docs
 * derive it from the example's source, and a consumer knows what they are passing.
 */
import * as React from "react";
import { Card, Flex, Stack, Surface, type Size } from "@kookie-ui/react";

import { FileIcon } from "../app/icons";
import { CodeSampleView } from "./code-sample";
import { CopyButton } from "./copy-button";
import { plainText, tokenize, type CodeLine } from "./highlight";

export type SpecimenProps = {
  /** The live thing. Rendered first, on paper, above its own source. */
  children: React.ReactNode;
  /** The source shown beneath it. One string — this block does not read files. */
  code: string;
  /** The fence language, as `code-sample` spells them (`tsx`, `ts`, `css`, `bash`, …). */
  lang: string;
  /**
   * A control for the figure, placed beside the copy button (2026-08-30).
   *
   * A NODE rather than a schema, because what a control IS belongs to whatever is driving the
   * specimen — this block draws a figure and has no opinion about what can be tuned in it. The
   * docs pass a trigger that opens their knobs; a copied one may pass nothing and lose not a
   * line.
   *
   * IT SITS IN THE CHROME ROW, and the figure's body is left alone. Two arrangements were built
   * and judged out first: knobs inline in this row (they wrapped into three lines and pushed the
   * specimen down the figure) and a panel column beside the stage (it took a third of the width
   * from the thing the page is about, and left an empty column under itself on every page with
   * two knobs). What both were paying for is a promise nobody asked for — that every axis is
   * visible at rest. The axes are already written out in the page's own Axes section; the figure
   * is where you TRY them.
   */
  controls?: React.ReactNode;
  /**
   * Paint something behind the specimen — a CSS `background` shorthand.
   *
   * It exists for the glass case: `backdrop` says content passes BEHIND a pane, so a glass
   * specimen over a flat ground has nothing to refract and the material reads as switched off.
   * The VALUE comes from the caller because a copied block may not depend on this site's own
   * photograph.
   */
  stageBackground?: string;
  /** A file path, when the code IS a file. Names the sample and becomes its copy payload. */
  title?: string;
  /** One index for the whole figure: the ground, the paper, the code step and the chrome. */
  size?: Size;
  /**
   * Does the specimen bring its own pane? `false` puts the children straight onto the ground,
   * for a Card, a Surface or anything else that already draws a box — wrapping one in paper is
   * the pane-in-pane fault this block exists on the right side of.
   */
  pane?: boolean;
  /** Bound the code to this many lines. Bounded means scrollable, with an expand control.
      Unset, the well's own `CODE_MAX_LINES` applies — a figure whose source runs long bounds
      itself, which is the fault no call site remembers to fix. */
  maxLines?: number;
  /**
   * The floor under the specimen's half of the figure. A CSS length, so a figure whose subject
   * is genuinely tall can say so.
   *
   * It exists because most subjects are small (2026-08-29, Kushagra: "specimen's card is too
   * short, we need a min height to let the thing in focus be properly visible"). A single
   * switch or a row of chips makes a pane barely taller than the control, and the figure then
   * reads as a caption strip rather than as a stage — and a page of them has no rhythm at all,
   * because every figure is a different height for reasons the reader cannot see.
   */
  minHeight?: string;
};

/* The double tokenize is GONE (2026-08-30). This block used to tokenize once for the paint and
   again for the clipboard, which was two renderings of one list held together by a comment; the
   split into wrapper and view made the wrapper the one place that tokenizes, so `plainText` now
   reads the same `lines` the view paints and the guarantee is structural rather than argued. */

export async function Specimen({ code, lang, ...view }: SpecimenProps) {
  const { lines, focused, diff } = await tokenize(code, lang as never);
  return (
    <SpecimenView lines={lines} focused={focused} diff={diff} copyText={plainText(lines)} {...view} />
  );
}

export type SpecimenViewProps = Omit<SpecimenProps, "code" | "lang"> & {
  /** Already tokenized — see `CodeSample`'s own split for why the two halves exist. */
  lines: readonly CodeLine[];
  focused: boolean;
  diff: boolean;
  /** What the copy button hands over: the source with every annotation stripped. */
  copyText: string;
};

export function SpecimenView({
  children,
  lines,
  focused,
  diff,
  copyText,
  controls,
  stageBackground,
  title,
  size = "2",
  pane = true,
  maxLines,
  // Two steps of the palette's gutter band. The specimen bed is CHROME, so the number is
  // allowed to be arithmetic on a token rather than a designed step in its own right — the
  // rule a block may not break is inventing a value, and a multiple of a layout step is the
  // same spelling the code element's own chrome band already uses.
  minHeight = "calc(2 * var(--layout-space-12))",
}: SpecimenViewProps) {
  /* CENTRED ON BOTH AXES, which is the other half of the floor being useful. A floor alone
     just puts a small control at the top of a tall box with a field of empty pane under it;
     what makes the stage read as a stage is the subject sitting in the middle of it. */
  const stage = (
    <Flex
      align="center"
      justify="center"
      style={{ minBlockSize: minHeight, ...(stageBackground ? { background: stageBackground } : {}) }}
    >
      {children}
    </Flex>
  );
  return (
    <Surface size={size}>
      {/* TWO DISTANCES, NOT ONE (2026-08-29, Kushagra: "increase gap between code preview and
          code block"). The figure has a label and two halves, and one gap for all of it made
          the name look like a third part rather than a title. §15 asks a group and its siblings
          to differ by at least two steps: the name sits close to what it names, and the wider
          distance is what separates the running thing from its source — which is the only seam
          in the figure a reader has to notice, now that neither half draws a box of its own. */}
      <Stack gap="6">
        <Stack gap="0">
          {/* THE NAME IS THE FIGURE'S, NOT THE LISTING'S (2026-08-29, Kushagra: "should the copy
              and file name etc be on top, above preview card?").

              `examples/grid.tsx` is the source of the RUNNING component as much as of the text
              under it, so naming it inside the code half labels one of the two halves with a fact
              about both — and sitting between them it read as a divider rather than a title.

              THE COPY BUTTON CAME WITH IT (Kushagra, same session, overruling my argument that it
              should stay over the code because that is what it copies). What actually killed that
              argument is the hosted well: the button floated as GLASS so that lines could pass
              behind it while the well scrolled, and a hosted well has no pane of its own for it to
              float over — the material was defending against a backdrop that is now just the
              figure's ground. One chrome row at the top, naming the figure on one side and acting
              on it from the other, is what is left when that job disappears.

              So the code half is `bare`: no row, no floating chrome, nothing over the first line.
              The empty `<span/>` holds the end position when there is no name, which is the same
              fault `justify` answers inside the code sample — one child and `space-between`
              pushes it to the wrong wall. */}
          {/* IT REACHES THE WALL AND PUTS THE SMALLER NUMBER BACK (2026-08-30, Kushagra: "why is
              the padding different as far as buttons go between specimen and code sample").
              Measured before changing it: this row sat 25px from the ground's wall and the code
              sample's identical row sat 13px from its pane's.

              Both were obeying the same rule and disagreeing anyway. Chrome sits closer to the
              wall than reading matter does — but the code sample's row is absolutely positioned,
              so it takes the chrome inset, while this one is an ordinary child of the ground and
              took the ground's READING inset like any content. The row is the same two buttons
              doing the same job in both, so it is chrome in both: `m="bleed"` undoes the ground's
              own inset and `p` puts the chrome number back, which is the standalone's spelling
              said in flow.

              `mx`, NOT `m` (2026-08-30). The first spelling bled all four sides, so the BLOCK
              margins came back too and pulled the specimen up under the buttons — measured, the
              card's top edge sat 4px ABOVE the button's bottom. Only the inline axis faces a
              wall here; the block axis faces the figure's own rhythm.

              THREE SIDES, NOT TWO (2026-08-30, Kushagra: "the top, left and right should be
              identical in both, while preserving gap from what follows"). Bleeding only the
              inline axis left the row's TOP at the ground's 24 while its sides sat at 12, so the
              same row that lined up with the code sample's horizontally sat twice as far down
              from its own pane's top edge.

              The code sample's row is `inset: 0` with one padding, so its top, left and right
              are one number by construction. `mt` + `mx` is that said in flow: three sides reach
              the wall, `p` puts the chrome number back on all four, and the fourth side — the
              one facing the specimen — keeps its margin, so the row's own bottom padding is the
              gap to what follows. Which is the code sample's arrangement exactly: the band under
              its row is the same inset, and the first line begins where it ends. */}
          <Flex align="center" justify="space-between" gap="3" mt="bleed" mx="bleed" p="4">
            {/* The name, or nothing. The knobs moved out of this row on 2026-08-30 and took the
                only reason it ever held two things; what is left is a filename where there is
                one, and the empty span holding the end position where there is not. */}
            {title ? (
              <CopyButton code={title} label={title} size={size} icon={<FileIcon />} />
            ) : (
              <span />
            )}
            <Flex gap="2" align="center">
              {controls}
              <CopyButton code={copyText} size={size} iconOnly />
            </Flex>
          </Flex>
          {/* THE FIGURE'S OWN INDEX (2026-08-30, Kushagra: "dont pass size 4 on card"). It was a
              literal 4 while the ground around it took `size`, so one prop priced the ground, the
              code and the chrome and stopped at the paper in the middle — an accident, not a
              decision. The paper is part of the FRAME, not part of the specimen: the figure draws
              it, so the figure prices it, and what it holds is priced by nobody here. Which is
              §24's line read straight — a component prices what it owns. */}
          {pane ? <Card size={size}>{stage}</Card> : stage}
        </Stack>
        <CodeSampleView
          lines={lines}
          focused={focused}
          diff={diff}
          lang="tsx"
          size={size}
          {...(maxLines === undefined ? {} : { maxLines })}
          // HOSTED, because the figure IS the well. A code sample draws a ground of its own,
          // and a ground inside a ground is one colour twice with a hairline between saying
          // nothing (Kushagra, 2026-08-29). The pane above it is a Card — an OBJECT on this
          // ground — which is the pair §10 separates and the reason only one of the two halves
          // wears paper.
          hosted
          // No chrome at all: the figure's own row above carries both the knobs and the copy.
          bare
        />
      </Stack>
    </Surface>
  );
}
