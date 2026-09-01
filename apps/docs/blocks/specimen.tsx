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

import { CodeSampleView } from "./code-sample";
import { CopyButton } from "./copy-button";
import { FileTabs, type TabbedFile } from "./file-tabs";
import { plainText, tokenize, type Lang } from "./highlight";

/** One file in the figure's code half. Several of them get a tab bar; one gets none. */
export type SpecimenSource = {
  /**
   * What a reader calls this file. Required once there are several, because it is the tab's
   * label; optional for a single source, where the figure shows no name at all (a docs example's
   * path is a fact about this repo and tells a reader nothing about where the code goes).
   */
  name?: string;
  code: string;
  /** The fence language, as `code-sample` spells them (`tsx`, `ts`, `css`, `bash`, …). */
  lang: string;
};

export type SpecimenProps = {
  /** The live thing. Rendered first, on paper, above its own source. */
  children: React.ReactNode;
  /**
   * The source shown beneath it. A LIST since 2026-09-01 (Kushagra: "it has multiple files,
   * which means our specimen's code area must support segmented control or tabs"), because a
   * block is allowed to be several files and a figure that can only show one of them makes the
   * page choose between showing the thing and showing what to copy.
   *
   * One entry is the old arrangement exactly — no tab bar, because a bar with one tab is
   * furniture that says nothing. Strings rather than paths: this block does not read files.
   */
  sources: readonly SpecimenSource[];
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
  /** One index for the whole figure: the ground, the paper, the code step and the chrome. */
  size?: Size;
  /**
   * Does the specimen bring its own pane? `false` puts the children straight onto the ground,
   * for a Card, a Surface or anything else that already draws a box — wrapping one in paper is
   * the pane-in-pane fault this block exists on the right side of.
   */
  pane?: boolean;
  /**
   * Does the subject take the stage's whole measure? (2026-09-02, Kushagra: "it can easily fit
   * 3 cols, so why restrict at 2".)
   *
   * The stage centres what it holds, which is right for a control and wrong for a REGION. A
   * footer, a page section, an app frame — anything whose own layout answers to how much room it
   * has — is a flex item under that centring, so it shrink-wraps to its content and then decides
   * its layout against the width it just chose. Measured on this block's own page before the
   * prop existed: the footer demos came out 454px and 230px wide inside a 684px stage, and their
   * column count followed the smaller number — two columns in a figure with room for three, with
   * nothing on the page to say why.
   *
   * So the stage stretches its subject on the inline axis and keeps centring it on the block
   * one, which is the same stage with one axis released rather than a second arrangement.
   * Stated by the caller for `pane`'s own reason: whether a subject is a region is a fact about
   * the subject, and this file has only a rendered element to look at.
   */
  fill?: boolean;
  /**
   * Number the code's lines. ON by default in a figure (2026-09-02, Kushagra: "I need numbers on
   * both, and I want them on"), which is the one place this block differs from the standalone
   * code sample beneath it: a figure's source is a whole file or a whole example, and a reader
   * pointing at it — in a comment, in a message, in their own head — needs somewhere to point.
   * A fence inside a sentence is usually two lines with nothing to count.
   *
   * CSS counters all the way down, so the digits are never in the markup, never in a selection
   * and never in what the copy button hands over — `code.css` carries that, and this prop only
   * decides whether the class is on.
   */
  lineNumbers?: boolean;
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

export async function Specimen({ sources, ...view }: SpecimenProps) {
  const files = await Promise.all(
    sources.map(async (source) => {
      const { lines, focused, diff } = await tokenize(source.code, source.lang as Lang);
      return {
        ...(source.name === undefined ? {} : { name: source.name }),
        lines,
        focused,
        diff,
        copyText: plainText(lines),
        lang: source.lang,
      };
    }),
  );
  return <SpecimenView files={files} {...view} />;
}

export type SpecimenViewProps = Omit<SpecimenProps, "sources"> & {
  /** Already tokenized — see `CodeSample`'s own split for why the two halves exist. */
  files: readonly (Omit<TabbedFile, "name"> & { name?: string })[];
};

export function SpecimenView({
  children,
  files,
  controls,
  stageBackground,
  size = "2",
  pane = true,
  fill = false,
  lineNumbers = true,
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
  /* A BACKDROP REACHES THE PANE'S EDGE (2026-09-01, Kushagra: "when backdrop is enabled, it
     should bleed fully into the card edge to edge").

     The stage is an ordinary child of the paper, so it took the paper's reading inset like any
     content — which is right for the subject and wrong for the ground behind it. A photograph
     sitting inside a band of white pane is a picture ON the paper, and what `backdrop` says is
     that content passes BEHIND it: the figure was drawing the opposite of the thing the knob
     turns on. `m="bleed"` cancels the paper's own inset (§3, §10) and the pane clips it to its
     corner, so the photograph is the paper's whole face and the specimen floats on it.

     ONLY WHEN THERE IS A BACKDROP. Bleeding an unbacked stage would delete the paper's padding
     around the subject, which is the one thing the paper is there to provide.

     WHICH SIDES DEPENDS ON WHAT HOLDS IT, and that is the same sentence rather than an exception.
     A stage on paper is the paper's only child, so it reaches all four walls. A stage with no
     paper — a Card or a Composer documenting itself — is one child of the GROUND, between the
     chrome row above it and the source below, so only its inline axis faces a wall: bleeding the
     block axis would run the photograph under the buttons and up against the code. Either way
     the backdrop reaches the edge it HAS, which is what stops one page's figure being a photo
     edge to edge and the next one's a band floating in a margin. */
  const bleed = Boolean(stageBackground);
  /* AND THE FIGURE KEEPS ITS HEIGHT (2026-09-01, Kushagra: "card changes its height when bg is
     on"). Measured: 290px of paper without the backdrop and 258 with it. The floor is written on
     the STAGE, and a stage that has eaten the paper's inset is a stage that stops paying for it —
     the paper's own box is the floor plus two paddings when the stage sits inside them, and the
     floor alone when it does not. So a knob that is supposed to change what is BEHIND the subject
     was moving the figure on the page, and a reader flipping it watched the code jump.

     What the floor means is the PAPER's height, so the bled stage puts back exactly what its
     margins took: the same expression the bleed itself is written in, with the sign the other way
     round. Both states then compute one number rather than agreeing by a value picked twice.

     Only the block axis, and only where the block axis bled — the paneless case bleeds inline
     alone, so its floor is untouched. */
  const floor = bleed && pane ? `calc(${minHeight} + 2 * var(--kui-sf-p, 0px))` : minHeight;
  /* One axis released, not a second stage (see `fill`): a column with `justify="center"` centres
     on the block axis exactly as the row's `align` did, and `align="stretch"` is what hands the
     subject the width it is supposed to be answering to. */
  const stage = (
    <Flex
      {...(fill
        ? { direction: "column" as const, justify: "center" as const, align: "stretch" as const }
        : { align: "center" as const, justify: "center" as const })}
      {...(bleed ? (pane ? { m: "bleed" as const } : { mx: "bleed" as const }) : {})}
      style={{ minBlockSize: floor, ...(stageBackground ? { background: stageBackground } : {}) }}
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
            {/* The end wall holds the row on its own: one child and `space-between` pushes it to
                the wrong one. The filename left this row on 2026-09-01 with the copy button —
                see below — so what is on the reading wall now is nothing at all. */}
            <span />
            <Flex gap="2" align="center">
              {controls}
              {/* THE COPY BUTTON IS HERE ONLY WHILE THERE IS ONE FILE (2026-09-01). With
                  several, the button has to hand over the one you are LOOKING AT, and which one
                  that is is state — so it travels down to the tab bar, which is the element that
                  holds that state. A button up here would copy whichever file the server
                  happened to put first, which is the kind of wrong that looks right. */}
              {files.length === 1 ? (
                <CopyButton code={files[0]!.copyText} size={size} iconOnly />
              ) : null}
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
        {/* ONE FILE OR SEVERAL, and the difference is a tab bar (2026-09-01). A bar with one tab
            is furniture that says nothing, so a single source renders exactly as it always did:
            no row of its own, the copy button up in the figure's chrome.

            HOSTED either way, because the figure IS the well. A code sample draws a ground of
            its own, and a ground inside a ground is one colour twice with a hairline between
            saying nothing (Kushagra, 2026-08-29). The pane above it is a Card — an OBJECT on
            this ground — which is the pair §10 separates and the reason only one of the two
            halves wears paper. */}
        {files.length === 1 ? (
          <CodeSampleView
            lines={files[0]!.lines}
            focused={files[0]!.focused}
            diff={files[0]!.diff}
            lang={files[0]!.lang}
            size={size}
            {...(lineNumbers ? { lineNumbers: true } : {})}
            {...(maxLines === undefined ? {} : { maxLines })}
            hosted
            bare
          />
        ) : (
          <FileTabs
            files={files.map((file, index) => ({
              ...file,
              // A tab needs a label. The type makes the name optional for the single-file case
              // and there is no honest label to invent here, so an unnamed file in a set is a
              // call site's mistake and says so rather than rendering an empty tab.
              name: file.name ?? `File ${index + 1}`,
            }))}
            size={size}
            {...(lineNumbers ? { lineNumbers: true } : {})}
            {...(maxLines === undefined ? {} : { maxLines })}
          />
        )}
      </Stack>
    </Surface>
  );
}
