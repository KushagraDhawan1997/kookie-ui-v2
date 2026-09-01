"use client";

/**
 * A specimen you can drive (2026-08-30, Kushagra: "we need more controls for preview").
 *
 * The controls sit in the figure's chrome row, on the side the filename used to occupy — which
 * is the slot's real meaning: what this figure is ABOUT, opposite the action you can take on it.
 *
 * THE CODE MOVES WITH THEM, and that is the whole reason this component exists rather than a
 * row of knobs bolted above a static listing. A page that changed the specimen while its source
 * kept saying `size="2"` would contradict itself in the one place a reader is most likely to
 * copy from.
 *
 * IT DOES NOT RE-TOKENIZE, and cannot: Shiki is server work, and this is a page that has already
 * been sent. The source is tokenized ONCE with a placeholder standing where each control's value
 * goes (`inlineControls`), and a control change rewrites that one token's TEXT. Syntax colour is
 * a property of the grammar rather than of the value — a string literal is a string literal
 * whatever it says — so the paint stays right without the highlighter ever running again.
 *
 * The client cost is the control row and one string swap. No highlighter reaches the browser.
 */
import * as React from "react";
import {
  Button,
  Grid,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Switch,
  Text,
} from "@kookie-ui/react";

import { CodeSampleView } from "../../blocks/code-sample";
import { CopyButton } from "../../blocks/copy-button";
import { SpecimenView } from "../../blocks/specimen";
import { plainText, type CodeLine, type HighlightedCode } from "../../blocks/highlight";
import { bed } from "../preview/beds";
import { SettingsIcon } from "../icons";
import { humanLabel } from "./label";
import { CONTROLLED } from "./controlled-examples";
import { sentinel, slotKey, type Control, type ControlValues } from "./controls";

/**
 * The tokens with every placeholder replaced by what the reader has chosen.
 *
 * A shallow rewrite: only the token whose text IS the placeholder changes, so nothing else about
 * the line — its flags, its other tokens, its colour — is touched. The map is rebuilt per render
 * rather than mutated, because these objects are what the view paints and React compares.
 */
function withValues(lines: readonly CodeLine[], values: ControlValues): readonly CodeLine[] {
  const swap = Object.entries(values).map(([name, value]) => [sentinel(name), String(value)] as const);
  if (swap.length === 0) return lines;
  return lines.map((line) => ({
    ...line,
    tokens: line.tokens.map((token) => {
      // SUBSTRING, not equality. A grammar tokenizes `size="__KD_SIZE__"` as one string literal
      // INCLUDING its quotes, so an exact match never fired — measured: the specimen moved and
      // the code kept showing the placeholder. Which quotes belong to which token is the
      // grammar's business, so the swap works inside whatever it produced.
      const hit = swap.find(([token_]) => token.text.includes(token_));
      return hit ? { ...token, text: token.text.replaceAll(hit[0], hit[1]) } : token;
    }),
  }));
}

/**
 * Does this knob show its options side by side, or behind a trigger? (2026-09-01, Kushagra:
 * "lets make weight a select or dropdown".)
 *
 * A segmented control's whole argument is that every option is readable at once, and that is
 * only worth a row's full width when the options are SHORT. `weight` is three words —
 * regular, medium, semibold — and laid out flat it set the panel's width for every other row
 * in it; `size` is four digits and costs almost nothing.
 *
 * So the test is both halves, and neither alone is right: a count with no length makes a
 * segmented control out of three long words, and a length with no count makes one out of the
 * type ladder's nine digits. Nothing here names a prop — a rule that said "except weight"
 * would be a list that grows every time a page gains an axis, and the next long trio would
 * ship laid out flat because nobody remembered to add it.
 */
const laidOut = (values: readonly string[]) =>
  values.length <= 4 && values.every((value) => value.length <= 2);

export function Playground({
  slug,
  controls,
  pane,
  variants,
}: {
  /**
   * Which example to drive. A NAME rather than the component itself, because a component does
   * not cross the RSC boundary — the server can say which one, and only the client can hold it.
   */
  slug: string;
  controls: readonly Control[];
  /**
   * Does the example root its own paper? Decided by the SERVER, from the same predicate the
   * static path uses — see `rootsOwnPane`. It is passed rather than re-derived because the
   * client holds the component and not its source, and because one predicate with two callers
   * is the arrangement; two predicates would be the bug this prop exists to fix.
   */
  pane: boolean;
  /**
   * The tokenized source, one per slot state, keyed by `slotKey`. A slot is presence rather
   * than a value — a `<Badge>` is in the code or it is not — so it cannot ride a placeholder:
   * the server tokenizes each state once and the client picks, then swaps the value knobs'
   * placeholders inside whichever it picked.
   */
  variants: Record<string, HighlightedCode>;
}) {
  const Component = CONTROLLED[slug];
  if (!Component) {
    // Loud rather than a dead page. This fires when a slug offers controls in `controls.ts` and
    // was never added to the client map — the one way the two tables can disagree.
    throw new Error(`No controllable example for "${slug}". Add it to CONTROLLED.`);
  }
  const [values, setValues] = React.useState<ControlValues>(() =>
    Object.fromEntries(controls.map((control) => [control.name, control.initial])),
  );

  const variant = variants[slotKey(controls, values)];
  if (!variant) throw new Error(`No tokenized source for slot state "${slotKey(controls, values)}".`);
  const { lines, focused, diff } = variant;
  const shown = React.useMemo(() => withValues(lines, values), [lines, values]);

  /* A PHOTO BEHIND THE GLASS when the backdrop knob is on (Kushagra: "if they support backdrop,
     we expose that, and when its on, of course use an image bg"). `backdrop` says content passes
     BEHIND this pane, and a pane over a flat ground has nothing to refract — the material would
     be switched on and invisible, which teaches the opposite of what the control is for. The
     photograph is the docs app's own, passed IN rather than reached for by the block: a copied
     file may not depend on this site's assets.

     FROM THE BED SET, NOT A PATH TYPED HERE (2026-09-01, Kushagra: "use the blue purple one we
     have in preview beds"). `beds.tsx` is where this app states which grounds it judges material
     over, and a second copy of an asset path here is one more place for the set to be edited and
     this page to keep pointing at a file nobody looks at any more. `bed()` throws on a name that
     left the set, so the build fails rather than the figure rendering a bare stage.

     THE PATTERN, and the set's own note says why it is the one to judge against ("blur and
     refraction are invisible over smooth gradients; this is where they show"). The blue flow was
     here for an hour and it is a smooth gradient: a lens bending it produces a slightly different
     gradient, so the material's whole argument went unphotographed. Flat shapes with hard edges
     are what a displacement map has something to displace. */
  const glass = values["backdrop"] === true;

  return (
    <SpecimenView
      pane={pane}
      lines={shown}
      focused={focused}
      diff={diff}
      copyText={plainText(shown)}
      {...(glass ? { stageBackground: `url('${bed("pattern").image}') center / cover` } : {})}
      controls={
        controls.length === 0 ? null : (
          /* BEHIND A TRIGGER, BESIDE THE COPY BUTTON (2026-08-30, Kushagra: "we can probably try
             this in a dropdown menu with its trigger next to copy button no?").

             Two arrangements were built and judged out on the way here — inline in the chrome row,
             then a panel beside the stage — and both were paying for the same unasked-for promise:
             that every axis is visible at rest. It costs the figure either a wrapping row or a
             third of its width, on a page whose Axes section already lists every one of them in
             prose. The figure is not where a reader LEARNS the axes; it is where they try them.

             A POPOVER, NOT A MENU. A menu's items are actions or a choice among them, announced
             as `menuitem`; this is a small form of several independent controls, which is the one
             thing a popover is for (§31 — the floating member whose content the system does not
             own). Putting a segmented control and two switches inside a menu would announce a
             form as a list of commands.

             The property list itself is unchanged and its alignment is the reason it survived the
             move: name on the left, control on the right, one rhythm, sized to content. */
          <Popover>
            <PopoverTrigger
              // No size: the figure's own chrome index is 2 and so is Button's default, which is
              // what keeps this trigger level with the copy button beside it.
              render={
                <Button iconOnly aria-label="Props" backdrop>
                  <SettingsIcon />
                </Button>
              }
            />
            {/* NAMED, because the panel has no visible title: a popover announces itself as
                "dialog" and nothing else without one, and the package warns about exactly this
                in development. */}
            <PopoverContent aria-label="Props">
              {/* EVERY ROW IS ONE CONTROL TALL, and the controls sit against the END WALL
                  (2026-08-31, Kushagra: "that switch isn't further to the edge, and every row
                  in this configurator should be same height, right now switch or checkbox row
                  is smaller").

                  Both faults came from the same place: the grid was sized by its contents. A
                  Select row was one control tall and a Switch row was one mark tall, so the
                  rhythm changed halfway down a list of four; and `max-content` sized the
                  control column to the WIDEST control, which left every narrower one — the
                  switch, always — floating in the middle of a column the select had set.

                  `gridAutoRows` states the row, so the list has one rhythm whatever is in it,
                  and `justifyItems: end` puts every control on the wall. The height is the
                  control ladder's own step at this figure's index, which the file already
                  states above: the chrome is 2, so the rows are the 2. `align="center"` then
                  centres a short control in the row rather than stretching it.

                  A SWITCH, NOT A CHECKBOX, and it was worth asking. A checkbox is a value in a
                  form you submit; a switch is a setting that takes effect at once. Every knob
                  here rewrites the specimen and its source on the spot — there is nothing to
                  submit — so a switch is what it is. */}
              <Grid
                columns="auto max-content"
                gapX="4"
                gapY="3"
                align="center"
                style={{ gridAutoRows: "var(--control-height-2)", justifyItems: "end" }}
              >
                {controls.map((control) => (
                  <React.Fragment key={control.name}>
                    {/* The label is the one cell that reads left. */}
                    <Text
                      size="2"
                      emphasis="medium"
                      render={<label htmlFor={`ctl-${control.name}`} />}
                      style={{ justifySelf: "start" }}
                    >
                      {humanLabel(control.name)}
                    </Text>
                    {control.kind === "boolean" || control.kind === "slot" ? (
                      <Switch
                        id={`ctl-${control.name}`}
                        checked={values[control.name] === true}
                        onCheckedChange={(next) => setValues((v) => ({ ...v, [control.name]: next }))}
                      />
                    ) : laidOut(control.values) ? (
                      <SegmentedControl
                        aria-label={humanLabel(control.name)}
                        value={String(values[control.name])}
                        onValueChange={(next) => setValues((v) => ({ ...v, [control.name]: String(next) }))}
                      >
                        {control.values.map((value) => (
                          <SegmentedItem key={value} value={value}>
                            {value}
                          </SegmentedItem>
                        ))}
                      </SegmentedControl>
                    ) : (
                      <Select
                        value={String(values[control.name])}
                        onValueChange={(next) => setValues((v) => ({ ...v, [control.name]: String(next) }))}
                        items={Object.fromEntries(control.values.map((v) => [v, v]))}
                      >
                        <SelectTrigger aria-label={humanLabel(control.name)} />
                        <SelectContent>
                          {control.values.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </React.Fragment>
                ))}
              </Grid>
            </PopoverContent>
          </Popover>
        )
      }
    >
      <Component {...values} />
    </SpecimenView>
  );
}

/** Re-exported so a page needs one import for the pair. */
export { CodeSampleView, CopyButton };
