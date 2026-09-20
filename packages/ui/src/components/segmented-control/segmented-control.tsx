"use client";

import type { ComponentRefusals } from "../../system/refused.ts";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import * as React from "react";

import { useLensRef } from "../../system/refraction.tsx";
import type { Size } from "../../system/axes.ts";
import { GlassScope, useMaterial } from "../../theme/theme.tsx";
import { useSize } from "../../system/size.ts";

export type SegmentedControlProps = ComponentRefusals & Omit<
  React.ComponentPropsWithoutRef<typeof BaseRadioGroup>,
  // Refused with Radio's own (LOG 2026-08-06): the platform has no read-only selection
  // control, and a segmented control is a selection control wearing a different box.
  "readOnly" | "className"
> & {
  /**
   * The size step of the control, from `1` to `4`. It is as tall as a `Button` at the same step.
   * Set it here, not on each segment. All segments use this size.
   */
  size?: Size;
  /** A class name for the control. For space around it, wrap it in a `Box` with `m`. */
  className?: string;
  /**
   * Set `backdrop` when the control sits over other content, such as an image. It then uses the
   * theme's material. Unset, it follows the nearest `<Box backdrop>`.
   */
  backdrop?: boolean;
  ref?: React.Ref<HTMLDivElement>;
};

export type SegmentedItemProps = ComponentRefusals & Omit<
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
  /** A class name for the segment. */
  className?: string;
};

/**
 * THE THUMB's measurement (§26). Base UI's Tabs measures its active tab for you and
 * `RadioGroup` does not, so this component measures the chosen segment itself and writes the two
 * lengths the stylesheet places the grip with.
 *
 * **It is JS, and it is a bounded exception to §8's "no JS at interaction time"** — beside the
 * lens, and Tabs' own re-measure. Bounded the same way: it runs when the SELECTION changes and
 * when a BOX RESIZES — the track's or any seat's, which are two different events (2026-08-26) —
 * never on hover, press, focus or scroll, and it writes two lengths rather than driving a frame
 * loop. The sibling gets this free because Base UI already does it; nothing about a radio group
 * offers to.
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
 */
function useThumb(track: React.RefObject<HTMLDivElement | null>) {
  React.useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const thumb = el.querySelector<HTMLElement>(":scope > .kui-segment-thumb");
    if (!thumb) return;

    /* A SCALED BOX IS NOT ITS OWN SIZE (2026-09-01, Kushagra: "theres an overlap between two
       values").

       `getBoundingClientRect` reports the VISUAL box, so a scaled ancestor scales every number
       read here — and this control's two lengths are written back as LAYOUT insets, where they
       mean something the browser never scales. Measured inside an ancestor at 0.95, the insets
       came out at 0.95 of their true values and the grip sat 5.9px wider than its seat, lapping
       its neighbour. The resize observers cannot see it and are right not to: a scale resizes
       nothing — one is the box, the other is a picture of it.

       So the scale is measured and divided back out, and the measurement is EXACT rather than
       toleranced. `offsetWidth` was the first spelling and it is an integer: on a track whose
       layout width is 156.31 it answers 156, which is a phantom scale of 1.002 that shifted
       every resting inset by a fifth of a pixel — the rounding scar the comment above already
       records, arriving through the back door. `getComputedStyle` reports used values in
       fractional pixels, so the border box rebuilt from them is the layout box to the decimal,
       the ratio is exactly 1 wherever nothing is scaling, and no tolerance has to be chosen. */
    const visualScale = (box: DOMRect, edges: CSSStyleDeclaration) => {
      // `width` resolves to the used value, which is the CONTENT box under `content-box` and
      // the border box under `border-box` — so the box model is asked rather than assumed. The
      // first spelling added the paddings unconditionally and measured a scale of 1.02 on a
      // resting control, which pulled the grip 3px narrower than its seat and failed six laws.
      const layout =
        edges.boxSizing === "border-box"
          ? parseFloat(edges.width)
          : parseFloat(edges.width) +
            parseFloat(edges.paddingLeft) +
            parseFloat(edges.paddingRight) +
            parseFloat(edges.borderLeftWidth) +
            parseFloat(edges.borderRightWidth);
      return layout > 0 ? box.width / layout : 1;
    };

    const place = () => {
      const chosen = el.querySelector<HTMLElement>(".kui-segment[data-checked]");
      if (!chosen) {
        // Nothing chosen: no thumb. Hidden rather than left at a stale position.
        thumb.hidden = true;
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
      const scale = visualScale(box, edges);
      const left = (seat.left - box.left) / scale - parseFloat(edges.borderLeftWidth);
      const right = (box.right - seat.right) / scale - parseFloat(edges.borderRightWidth);
      thumb.hidden = false;
      thumb.style.setProperty("--kui-seg-left", `${left}px`);
      thumb.style.setProperty("--kui-seg-right", `${right}px`);
    };

    place();

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
    const selection = new MutationObserver(() => place());
    selection.observe(el, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-checked"],
    });

    /* A resize re-places the thumb: the box moved, the choice did not. At mount the observer's
       free callback writes what is already there, and on a real resize the seat genuinely
       moved, so re-placing is correct in every case and the callback carries no guard. */
    /* AND IT WATCHES THE SEATS, NOT ONLY THE TRACK (2026-08-26, audit). Observing the track
       alone answers "the control changed size", and that is not the only way a seat moves: the
       segments are `flex: 1 1 0` with a `min-width: auto` floor, so inside a track whose width
       its container fixes — a grid cell, a `flex: 1` toolbar, a narrow window where the track
       is already clamped — a label that grows takes room from its neighbours and every seat
       moves while the TRACK's box never changes. Measured, the grip stayed on the old
       geometry: a resize the observer could not see, and no re-render to fall back on (the
       value lives inside Base UI's RadioGroup, which is the whole reason this hook exists).
       Base UI's Tabs registers a resize observer per TAB for the same reason, one component
       over; this is that answer, on the element that has no primitive to give it.

       One observer for both, because both mean the same thing here — the box moved, the choice
       did not. The observer fires once per newly observed element by design, and at mount that
       free callback writes what is already there; the WeakSet keeps a later childList sync
       from re-observing a seat it already holds. */
    const size = new ResizeObserver(() => place());
    size.observe(el);
    const watched = new WeakSet<Element>();
    const watchSeats = () => {
      for (const seat of el.querySelectorAll<HTMLElement>(":scope > .kui-segment")) {
        if (watched.has(seat)) continue;
        watched.add(seat);
        size.observe(seat);
      }
    };
    watchSeats();
    // A segment added or removed later is a seat nothing is watching yet. Its own arrival is a
    // resize of every sibling, so the placement is already correct by the time this runs; what
    // this buys is that the NEW seat is watched from then on.
    const seats = new MutationObserver(watchSeats);
    seats.observe(el, { childList: true });

    return () => {
      selection.disconnect();
      size.disconnect();
      seats.disconnect();
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
  const size = useSize(sizeProp);
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
  useThumb(track);
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
      {/* THE THUMB — the grip, placed under the chosen segment (§26). Rendered FIRST, but that
          is NOT what puts it under the labels: an absolutely positioned box paints after every
          static sibling whatever the document order says, and the first spelling of this
          shipped a chosen label painted white on the white grip (measured with
          `elementFromPoint`, 2026-08-23). What orders the two is `position: relative` on the
          segment — see segmented-control.css. Rendering it first is still right, because with
          both positioned the tie-break IS document order.

          `hidden` until the first measurement, so a group with no value paints no thumb and a
          server-rendered one does not flash at the track's start before the layout effect
          runs. This gate is the only guard against an unmeasured paint. Not exported and not a
          part: it is structure, the same call TabsList makes
          about its indicator. */}
      <span className="kui-segment-thumb" aria-hidden="true" hidden />
      <GlassScope material={material}>{children}</GlassScope>
    </BaseRadioGroup>
  );
}

/**
 * One segment (§26) — a control hosted in a control, and the system already has that rule.
 *
 * The grip is not this element: SegmentedControl renders one thumb and places it under the
 * chosen segment, so a segment paints only its label and, when unchosen, its hover step.
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
