"use client";

import { Input as BaseInput } from "@base-ui/react/input";
import * as React from "react";

import type { Size } from "../../system/axes.ts";
import { useMergedRefs } from "../../system/render.ts";
import { useLensRef } from "../../system/refraction.tsx";
import { useMaterial } from "../../theme/theme.tsx";
import { useSize } from "../../system/size.ts";

export type TextAreaProps = Omit<
  React.ComponentPropsWithoutRef<"textarea">,
  // `children` is not the API even though a <textarea> can technically hold text: React's own
  // contract for form elements is `defaultValue`/`value`, and accepting both spellings for one
  // fact is the drift ENGINEERING §3 forbids.
  //
  // `cols` is the same character-count width hack the field's native `size` attribute is —
  // it predates CSS and collides with it. Width belongs to layout (`style`, or the Box that
  // owns the relationship). `rows` stays: it states content height in the content's own unit,
  // which is exactly what a multi-line control's initial height should be.
  "color" | "children" | "cols" | "className" | "style"
> & {
  /**
   * The control index, minus the one part a growing box cannot take. The padding, the corner, the
   * type and the border all come from it. The height does not, because the content decides that
   * through `rows`. The block padding IS the side padding — one inset on all four sides — so a
   * `rows={1}` textarea sits TALLER than a TextField at the same index; the control height
   * survives as a floor, never a ceiling.
   */
  size?: Size;
  /**
   * Says content passes behind this control, so the theme's material can show. Unset, it follows
   * the surrounding `<Box backdrop>` region.
   */
  backdrop?: boolean;
  /** Applied to the wrapper, which is the element that is the control (TextField's rule). */
  className?: string;
  /**
   * Applied to the wrapper, so a `width` sizes the box rather than the text inside it — and so
   * `resize: "none"` still reaches the handle, which the wrapper carries.
   */
  style?: React.CSSProperties;
  /** Reaches the TEXTAREA, not the wrapper — `.focus()`, `.select()`, the value. */
  ref?: React.Ref<HTMLTextAreaElement>;
};

/**
 * A multi-line text field (§4, §11). The visible control is the WRAPPER since 2026-08-25 —
 * the one-element spelling (2026-08-05) was priced before the material existed, and glass is
 * the forcing case it never saw: a form control renders no generated content and a mask on the
 * element takes the text with it, so a bare <textarea> could never paint the material's band
 * and every approximation of it was judged short of parity (Kushagra: "Still doesnt have full
 * parity"). With the wrapper, the glass arrives through the field family's existing rules —
 * identical to TextField by construction — and the flat-band approximation is deleted whole.
 * The peers that carry real treatment on the box all made the same move (Radix Themes, MUI,
 * Spectrum, Ant); the bare element remains the platform's spelling, not a design system's.
 *
 * Unlike TextField the wrapper hosts no slots — an adornment floating over a scrolling
 * paragraph is still not a designed position — so none of the slot debts (caret redirect,
 * slot layout, hosted focus) exist here. The wrapper carries the box: border, fill, padding,
 * the corner, the minimum height, and the RESIZE handle — on the wrapper so the documented
 * `style={{ resize: "none" }}` escape keeps reaching it now that `style` dresses the wrapper.
 * The inner textarea is bare: it scrolls, takes the caret, holds the value, and floors its
 * own font at the zoom threshold exactly as TextField's input does.
 *
 * Height is where a textarea leaves the control family: §4's height ladder is for fixed-height
 * controls, and this box grows with its content — `rows` sizes the inner textarea and the
 * wrapper hugs it; the control height survives as a floor (`min-height`), never a ceiling.
 *
 * No emphasis, no tone, for TextField's reason verbatim: loudness ranks actions, and a form
 * where one input is louder than the next names nothing. No `render` escape either — there are
 * two elements now and neither can move (TextField's own sentence): the wrapper exists to hold
 * the paint a textarea cannot, and the inner element must stay a <textarea> or the platform
 * wiring this component exists to preserve (labelling, form association, selection, IME) goes
 * with it. Refused by the type, which is the law.
 *
 * Validity is state (`aria-invalid` standalone, Base UI's `data-invalid` inside a Field.Root)
 * and lands on the INNER textarea; the shared layer's `:has()` arm — the same one TextField
 * rides — carries it to the wrapper that paints. Disabled likewise: whichever route sets it,
 * it lands as the native attribute on the textarea, and the wrapper reads it structurally.
 */
export function TextArea({
  size: sizeProp,
  backdrop,
  disabled,
  className,
  style,
  ref,
  ...props
}: TextAreaProps) {
  // §28 — a Field states the whole unit's index; an explicit prop here always wins.
  const size = useSize(sizeProp);
  // §10 — the app's material, or on-glass inside a glass ancestor (2026-08-16).
  const material = useMaterial(backdrop === undefined ? undefined : { backdrop });
  // §10 — the lens on the WRAPPER, which is the pane; on-glass never filters, so it never bends.
  const lensRef = useLensRef<HTMLSpanElement>(material, undefined);

  // The component's OWN textarea, held so the caret redirect below cannot land somewhere else.
  // The forwarded ref still reaches the same node — neither wins (§3).
  const areaRef = React.useRef<HTMLTextAreaElement>(null);

  /**
   * HIT-TARGET UNIFICATION, the wrapper's one debt (2026-08-26; TextField's own, §4).
   *
   * The wrapper became the control on 2026-08-25 and it carries the box's padding on all four
   * sides and paints `cursor: var(--cursor-text)` over the whole band — but a `<span>` is not
   * focusable, so a press in that band moved focus nowhere and the caret never arrived. The
   * pointer promised a text control and the click did nothing, which is the defect the field's
   * redirect exists to prevent, arriving one component over the day the anatomy moved.
   *
   * Simpler than the field's: there are no slots, so there is no focusability list to protect —
   * anything that is not the textarea is the wrapper's own padding. The textarea itself is left
   * alone, which is also what keeps the RESIZE handle (drawn by the inner element) draggable:
   * `preventDefault` on a grip press would cancel the drag before it started.
   */
  const focusArea = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    const area = areaRef.current;
    if (!area) return;
    // Stops the browser moving focus to the wrapper first, which would blur and refocus the
    // textarea and collapse any selection the caller had set.
    event.preventDefault();
    area.focus();
  }, []);

  // Memoised on the caller's ref: a fresh callback ref every render would be detached with
  // null and reattached on each one, and Base UI reads the node in effects that would then run
  // against a momentarily empty ref (TextField's own note, same mechanism).
  const setArea = useMergedRefs(ref, areaRef) as React.Ref<HTMLInputElement>;

  return (
    <span
      ref={lensRef}
      onMouseDown={focusArea}
      className={className ? `kui-control kui-textarea ${className}` : "kui-control kui-textarea"}
      style={style}
      data-size={size}
      // Fixed identity, not API (the field's pattern): the tone indirection needs a family to
      // resolve --tone-border against, and the box is always bordered — the border is the
      // affordance.
      data-tone="neutral"
      data-bordered
      // Solid is the absence of a material, so it writes no attribute (§10).
      data-material={material === "solid" ? undefined : material}
      // Half the answer, same as TextField: inside a `Field.Root disabled` the flag reaches
      // the textarea without passing through this component, so the shared layer also reads
      // the state off the child with `:has()`. The two are OR'd, never compared.
      data-disabled={disabled || undefined}
    >
      <BaseInput
        ref={setArea}
        render={<textarea />}
        className="kui-textarea-input"
        disabled={disabled}
        // The props are textarea-shaped and Base UI's Input is typed over <input>; the render
        // swap above is what reconciles them at runtime (Base UI forwards everything to the
        // rendered element), so the cast asserts what the render prop already made true.
        {...(props as unknown as React.ComponentPropsWithoutRef<"input">)}
      />
    </span>
  );
}
