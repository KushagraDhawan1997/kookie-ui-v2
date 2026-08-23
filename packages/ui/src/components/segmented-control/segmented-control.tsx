"use client";

import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";

import { useLensRef } from "../../system/refraction.tsx";
import type { Size } from "../../system/axes.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { useControlSize } from "../../system/control-size.ts";

export type SegmentedControlProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  // Refused with Radio's own (LOG 2026-08-06): the platform has no read-only selection
  // control, and a segmented control is a selection control wearing a different box.
  "readOnly" | "className"
> & {
  /**
   * The control height ladder, set on the track, because the track is the control: a segmented
   * control stands level with a Button of the same size in the toolbar beside it. Each segment
   * derives its own box from that channel, which is the track minus a fixed inset, and states no
   * index of its own, so the two boxes cannot disagree. It sits on the root, never on a segment: a
   * bar of mixed sizes is not a thing anyone means.
   */
  size?: Size;
  /** Dresses the track. Outer spacing is the caller's Box, never this (the non-negotiable). */
  className?: string;
  /**
   * Says content passes behind this control, so it shows the theme's material instead of resolving
   * solid. A `<Box backdrop>` region answers this for a whole toolbar. This is the one-off escape,
   * and it is Button's own prop.
   */
  backdrop?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export type SegmentedItemProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadio.Root>,
  // `tone` and `emphasis` are refused for the binary controls' reason (§11): the family has
  // ONE tone as an identity, and a segment that is louder than its neighbours is not a
  // segmented control. `readOnly` inherits Radio's refusal.
  //
  // `nativeButton` and `render` are closed by the same argument radio.tsx, checkbox.tsx and
  // switch.tsx all state, and reopening them here was never argued anywhere — code, §26, LOG
  // or registry (audit 2026-08-19, D10). `nativeButton` was measured breaking the control it
  // is set on: `<SegmentedItem nativeButton>` renders `type="button"` on a span and that
  // segment can no longer be chosen with Space or Enter, which is audit D10 reproduced on the
  // same Base UI primitive it was closed on. `render` measured harmless — the hidden input,
  // the role and keyboard selection all survive `render={<div/>}` — and is closed anyway,
  // because the one element must stay Base UI's root, which owns the input and the group
  // membership. `children` is the one the family refuses that this component keeps, and that
  // one IS argued, below.
  "readOnly" | "className" | "nativeButton" | "render"
> & {
  /** Dresses the segment. Outer spacing is the caller's Box, never this. */
  className?: string;
};

/**
 * THE TRAVELING THUMB's measurement (§8, §26, 2026-08-23) — the "measuring hook" the component
 * shipped without and named in advance.
 *
 * The absence of an indicator was the design for as long as no motion wanted one: Base UI's
 * Tabs measures its active tab for you and `RadioGroup` does not, so a gliding thumb here meant
 * writing a measurement whose only consumer would have been a motion nobody had designed — the
 * curtain's lesson (deleted 2026-08-17). That premise is spent. Kushagra designed the motion in
 * the "Clip vs Physics" bench and asked for it, so the measurement now has the consumer it was
 * waiting for, and this is the door the file's own comment left open rather than a reversal.
 *
 * **It is JS, and it is the FOURTH bounded exception to §8's "no JS at interaction time"** —
 * beside the flight's measurement, the lens, and Tabs' own re-measure. Bounded the same way:
 * it runs when the SELECTION changes and when the box RESIZES, never on hover, press, focus or
 * scroll, and it writes two lengths rather than driving a frame loop. The sibling gets this
 * free because Base UI already does it; nothing about a radio group offers to.
 *
 * **Arithmetic over an index was the alternative and it is wrong, measured.** `flex: 1 1 0`
 * gives every segment an identical share while the track sizes itself — three labels of three
 * different lengths measured 425.3 / 425.3 / 425.3 — so `index × width / count` would look
 * right in every ordinary specimen. Constrain the track below its natural width and the
 * `min-width: auto` floor binds on the longest label: the same three measured 62.0 / 62.0 /
 * 72.0 in a 200px box, where the arithmetic answers 65.3 and puts the grip ten pixels off its
 * seat. A squeezed track is a toolbar on a narrow window, which is not an exotic case.
 *
 * The two lengths are read off `getBoundingClientRect` and corrected by `clientLeft`/
 * `clientWidth` rather than taken from `offsetLeft`/`offsetWidth`, because an absolutely
 * positioned child resolves its insets against the track's PADDING box and that is exactly what
 * those two properties describe. `offsetLeft` agrees today only because the track's border is
 * stood down to zero — reading it would be one silent dependency on a declaration made for an
 * unrelated reason (audit 2026-08-19, D2, is that dependency going the other way).
 *
 * Direction wears Base UI's own vocabulary, `data-activation-direction`, so both traveling
 * highlights in this package are keyed and read identically; `none` means "place it, do not
 * fly it" and covers the first paint, a resize and a selection that did not move.
 */
function useTravelingThumb(track: React.RefObject<HTMLDivElement | null>) {
  const previousLeft = React.useRef<number | null>(null);
  React.useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const thumb = el.querySelector<HTMLElement>(":scope > .kui-segment-thumb");
    if (!thumb) return;

    const place = (flying: boolean) => {
      const chosen = el.querySelector<HTMLElement>(".kui-segment[data-checked]");
      if (!chosen) {
        // Nothing chosen: no thumb. Hidden rather than left at a stale position, and the
        // remembered edge is cleared so the next choice PLACES instead of flying out of a box
        // that has not been on screen.
        thumb.hidden = true;
        previousLeft.current = null;
        return;
      }
      // Both edges measured in FRACTIONAL space, against the track's padding box, which is what
      // an absolutely positioned child resolves its insets against. `clientWidth`/`clientLeft`
      // describe the same box and were the first spelling — but they are integers, so the right
      // edge inherited a rounding error the left edge did not and the thumb measured 0.5px
      // narrower than its seat on the trailing side alone. Border widths off the computed style
      // keep the whole chain fractional; they are zero today (the track stands its border down)
      // and reading them costs nothing to be right if that ever changes.
      const box = el.getBoundingClientRect();
      const seat = chosen.getBoundingClientRect();
      const edges = getComputedStyle(el);
      const left = seat.left - (box.left + parseFloat(edges.borderLeftWidth));
      const right = box.right - parseFloat(edges.borderRightWidth) - seat.right;
      const from = previousLeft.current;
      thumb.hidden = false;
      thumb.dataset.activationDirection =
        !flying || from === null || from === left
          ? "none"
          : left > from
            ? "right"
            : "left";
      thumb.style.setProperty("--kui-seg-left", `${left}px`);
      thumb.style.setProperty("--kui-seg-right", `${right}px`);
      previousLeft.current = left;
    };

    place(false);

    /* THE SELECTION IS WATCHED, NOT RE-RENDERED INTO (measured, 2026-08-23).
     *
     * The first spelling was a layout effect with no dependency array, on the reasoning that it
     * then runs after every render and a selection change is a render. It is not one HERE: the
     * value lives inside Base UI's `RadioGroup`, so an uncontrolled group re-renders its radios
     * and never this component, and the effect fired exactly once in a component's life.
     * Measured, the thumb held 56.9px across six frames while "Three" was genuinely checked.
     *
     * `data-checked` is the stamp Base UI moves, so that is what is watched — the same shape
     * the floating layer uses for `data-open`, and the only one that is correct for controlled
     * groups, uncontrolled groups and a value changed from outside alike. A MutationObserver's
     * callback runs at the microtask checkpoint, before paint, so the placement lands on the
     * same frame the stamp did and nothing flashes at the old seat. */
    const selection = new MutationObserver(() => place(true));
    selection.observe(el, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-checked"],
    });

    /* A resize re-places without flying: the box moved, the choice did not, and a thumb that
       glided to a new width because a window was dragged would be reporting a change nobody
       made.
    
       IT CARRIES NO GUARD, and that is a decision with a scar behind it. The first spelling of
       this hook re-ran on every render, so it re-observed on every render, and `ResizeObserver`
       fires the moment you observe — the free callback landed one frame after every selection
       change and rewrote the direction to `none`, which removes the transition. Measured, the
       thumb teleported: 56.9 → 68.4px in a single frame, flat across six samples, with the
       whole recipe correct behind it. A width comparison was added to tell the free callback
       from a real resize, and it worked.
    
       Then the effect stopped being keyed on renders at all (the MutationObserver above), which
       fixed the same defect at its cause — and the guard became something no law could
       distinguish from its absence. Three sabotage passes tried: deleting it changed nothing in
       38 laws, and the one case that would have separated them (an observer firing without a
       width change) could not be constructed, because a padding change does not move the
       content box the observer watches. So it is gone rather than kept as a comfort. Every case
       that remains is one where re-placing is simply correct: at mount it writes what is
       already there, and on a real resize the seat genuinely moved. */
    const size = new ResizeObserver(() => place(false));
    size.observe(el);

    return () => {
      selection.disconnect();
      size.disconnect();
    };
  }, [track]);
}

/**
 * A segmented control (§26) — one choice among a few, shown all at once.
 *
 * **It is a RADIO GROUP, and that is the load-bearing decision.** Base UI offers two
 * primitives that could carry this box: `ToggleGroup`, which announces `role="group"` holding
 * `aria-pressed` buttons, and `RadioGroup`, which announces `role="radiogroup"`. A view
 * switcher is picking one of several, which is what a radio group IS — and the arrow keys
 * then select as they move, which is the behaviour every platform's segmented control has.
 * The multi-select formatting case (bold / italic / underline) is genuinely a set of toggle
 * buttons and is genuinely a DIFFERENT component: §11 lists Toggle Button on its own row.
 *
 * It also closes the question the 2026-08-06 audit deferred — how selection state is spelled
 * on a control the system did not have yet. The docs' own pickers convey a choice through
 * tone alone, so the accessibility tree is byte-identical before and after it changes. This
 * is the answer: a real role, from the primitive, not an aria attribute bolted on.
 *
 * The TRACK is the control (§4): it rides the height ladder, so a segmented control stands
 * level with a Button of the same size beside it in a toolbar, and each segment derives its
 * box from the channel — the switch's sentence one control over, and §4's hosted-control rule
 * with N hosts rather than one.
 */
export function SegmentedControl({
  size: sizeProp,
  className,
  backdrop,
  ref,
  children,
  ...props
}: SegmentedControlProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useControlSize(sizeProp);
  // §10 — the TRACK is the pane, and the only pane here. It expresses the theme's material
  // where a backdrop exists and resolves solid everywhere else (selectivity, 2026-08-17), and
  // it scopes its subtree, so every segment inside a glass track resolves `on-glass`: the
  // veil's alpha, no second backdrop-filter, no second lens. One glass per stack, structurally
  // — nobody types anything, and a segmented control cannot be built wrong here.
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // Our own handle on the track, composed with the caller's rather than competing with it:
  // `useLensRef` forwards exactly one ref, so the thumb's measurement has to ride through it.
  const track = React.useRef<HTMLDivElement>(null);
  const compose = React.useCallback(
    (node: HTMLDivElement | null) => {
      track.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );
  const lensRef = useLensRef<HTMLDivElement>(material, compose);
  useTravelingThumb(track);
  return (
    <BaseRadioGroup
      ref={lensRef}
      className={
        className
          ? `kui-control kui-segmented ${className}`
          : "kui-control kui-segmented"
      }
      data-size={size}
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // NEUTRAL, and stamped rather than omitted (audit 2026-08-19, D5). It shipped as
      // `accent` on the stated reason that the chosen segment's rule needed a family to
      // resolve against — measured, that rule reads `--color-thumb`, `--color-thumb-label`
      // and `--grip-cast`, no tone role at all, and flipping the attribute left the chosen
      // segment byte-identical. What the stamp actually reached was the quiet rung on every
      // segment: an unchosen one hovered accent blue, and in dark it inverted the direction
      // of the state change entirely — a light wash going to a near-opaque navy block, on a
      // component whose type refuses `tone` because the family has one identity.
      //
      // Omitting it is not the fix either: `--tone-*` exists only inside a `[data-tone]`
      // block, so a bare segment's hover source resolves to nothing and the hover disappears
      // — which is the sibling's own defect, measured the same day (Tabs, D3).
      data-tone="neutral"
      {...props}
    >
      {/* THE THUMB — one object gliding between homes (§26, §8). Rendered FIRST so it paints
          under the segments without a stacking rule: the labels of the chosen segment sit on
          top of it in document order, which is the whole reason it needs no `z-index` and the
          segments need no `position` of their own.

          `hidden` until the first measurement, so a group with no value paints no thumb and a
          server-rendered one does not flash at the track's start before the layout effect
          runs. Not exported and not a part: it is structure, the same call TabsList makes
          about its indicator. */}
      <span className="kui-segment-thumb" aria-hidden="true" hidden />
      <GlassScope material={material}>{children}</GlassScope>
    </BaseRadioGroup>
  );
}

/**
 * One segment (§26) — a control hosted in a control, and the system already has that rule.
 *
 * There is no separate indicator element, and the absence is deliberate. Base UI's Tabs ships
 * one because it measures the active tab for you; RadioGroup ships none, so a gliding thumb
 * here would mean writing the measurement ourselves — a mechanism whose only consumer is a
 * motion that has not been designed yet, which is the entropy this repo keeps paying for (the
 * curtain, deleted 2026-08-17). The selected segment paints its own box: no JS at interaction
 * time, and the honest thing to draw when nothing travels. When the motion pass wants one
 * object gliding between homes, the measuring hook arrives with it and this stays internal.
 *
 * `children` is OPEN, where every mark refuses it: a mark sits beside its label and a segment
 * CONTAINS its own, which is the whole difference between the two boxes.
 */
export function SegmentedItem({ className, ...props }: SegmentedItemProps) {
  return (
    <BaseRadio.Root
      // Quiet is the resting rung: bare at rest, entering the ramp at hover — the same rung a
      // tab wears, and for the same reason. The chosen segment re-sources the fill below.
      data-emphasis="quiet"
      className={
        className ? `kui-control kui-segment ${className}` : "kui-control kui-segment"
      }
      {...props}
    />
  );
}
