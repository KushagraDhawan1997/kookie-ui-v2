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
import { CodeSample } from "./code-sample";
import { CopyButton } from "./copy-button";

export type SpecimenProps = {
  /** The live thing. Rendered first, on paper, above its own source. */
  children: React.ReactNode;
  /** The source shown beneath it. One string — this block does not read files. */
  code: string;
  /** The fence language, as `code-sample` spells them (`tsx`, `ts`, `css`, `bash`, …). */
  lang: string;
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
  /** Bound the code to this many lines. Bounded means scrollable, with an expand control. */
  maxLines?: number;
};

export async function Specimen({
  children,
  code,
  lang,
  title,
  size = "2",
  pane = true,
  maxLines,
}: SpecimenProps) {
  return (
    <Surface size={size}>
      <Stack gap="4">
        {/* THE NAME IS THE FIGURE'S, NOT THE LISTING'S (2026-08-29, Kushagra: "should the copy
            and file name etc be on top, above preview card?").

            `examples/grid.tsx` is the source of the RUNNING component as much as of the text
            under it, so naming it inside the code half labels one of the two halves with a fact
            about both — and sitting between them it read as a divider rather than a title.

            THE COPY BUTTON DOES NOT FOLLOW IT, and that is the half of the question worth
            answering: it copies the CODE. Above the specimen it would act on something two
            regions away, and it would lose the reason it is glass — the material exists so that
            lines can pass behind it while the well scrolls, and there is nothing passing behind
            it up here. The system already keeps the two apart for a related reason: a path is
            copyable and a language is not, so they were never one component, only one row.

            Wrapped, because a Stack stretches its children and a name is not a full-width bar —
            what is copyable here is the path, so it stays the same CopyButton it was. */}
        {title ? (
          <Flex>
            <CopyButton code={title} label={title} size={size} icon={<FileIcon />} />
          </Flex>
        ) : null}
        {pane ? <Card size="4">{children}</Card> : children}
        {/* AWAITED, not rendered as an element, and that is the async-server-component
            pattern this repo already uses (`blocks/index.tsx`): resolving it here means the
            tree handed to a caller — including the laws' `renderToStaticMarkup` — is sync
            components only, so a figure can be rendered by a test the same way the page
            renders it. */}
        {await CodeSample({
          code,
          lang,
          size,
          // HOSTED, because the figure IS the well. A code sample draws a ground of its own,
          // and a ground inside a ground is one colour twice with a hairline between saying
          // nothing (Kushagra, 2026-08-29). The pane above it is a Card — an OBJECT on this
          // ground — which is the pair §10 separates and the reason only one of the two halves
          // wears paper.
          hosted: true,
          // The figure named itself above; what stays over the code is the button that copies
          // it. `named: false` is exactly that split — see the prop.
          named: false,
          ...(maxLines === undefined ? {} : { maxLines }),
        })}
      </Stack>
    </Surface>
  );
}
