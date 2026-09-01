"use client";

import * as React from "react";

import { composeRender, type RenderElement } from "../../system/render.ts";
import { resolveBoxProps, type BoxStyleProps } from "../../system/resolve.ts";
import { BackdropContext } from "../../theme/theme.tsx";
import { DEV } from "../../system/dev.ts";


export type BoxProps = BoxStyleProps &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof BoxStyleProps> & {
    /** Render into an element you already have, instead of adding a wrapper. */
    render?: RenderElement;
    ref?: React.Ref<HTMLElement>;
    /**
     * Make this Box measurable. Responsive values such as `{ initial, sm, md, lg }` on anything
     * inside it then resolve against this Box's width instead of against the nearest measurable
     * ancestor, which is the Theme root when there is nothing nearer.
     *
     * CSS imposes a trade here: a measurable box can never size itself around its contents, so its
     * width has to come from outside. Put `container` on things the layout already sizes, such as a
     * sidebar with a width, a main column that grows, or a grid cell. Or state `width`, `flexGrow`
     * or `flexBasis` yourself. A container Box left to shrink-wrap, for example as a plain flex-row
     * item, renders zero pixels wide, and a development build warns you when that happens.
     */
    container?: boolean;
    /**
     * Marks a region where content passes behind the components inside it, such as a toolbar
     * over a canvas or a panel over a hero image. Every glass-capable component within it
     * (buttons, fields, cards, selects) then resolves the theme's material instead of solid.
     * Say it once for the region rather than on every control. `backdrop={false}` marks a
     * sub-region as plain again. Layout is untouched: this is a React context, not a style.
     */
    backdrop?: boolean;
  };

/**
 * The layout engine, and the escape the system sanctions.
 *
 * Box takes the whole prop set, container props included, so a responsive switch from flex to
 * grid is expressible. Flex, Grid and Stack are Box with a fixed `display` and a shorter prop
 * list. It is also where one-off spacing lives: a control owns no outer spacing, so
 * `<Box m="4"><Button/></Box>` is how you write a positioning decision. It is a wrapper a
 * reviewer can see, rather than a margin buried on a control.
 *
 * Anything outside the prop table is one `style={{ }}` away, and your `style` merges last. An
 * escape that loses to the default is not an escape.
 */
export function Box(props: BoxProps) {
  const { ref, render, className, style: userStyle, container, backdrop, ...rest } = props;
  const { style, rest: domProps } = resolveBoxProps(rest);

  // Dev-only: a container Box whose width was worked out from its contents is 0px wide —
  // the one composition the opt-in cannot save (§2). The check fires at the moment it
  // breaks, which docs cannot; stripped from production builds.
  const probeRef = React.useRef<HTMLElement | null>(null);
  const composedRef = React.useCallback(
    (node: HTMLElement | null) => {
      probeRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    },
    [ref],
  );
  React.useEffect(() => {
    if (!DEV || !container) return;
    const el = probeRef.current;
    if (!el) return;
    let warned = false;
    const check = () => {
      // A Box that is not LAID OUT is not a collapsed Box — its rect is 0 because nothing
      // measured it (a closed accordion, an inactive tab panel, a hidden dialog). Reading
      // `display` cannot see that: CSS display does not inherit, so an element under a
      // display:none ancestor still computes its own `block` and the old guard let the
      // false warning through (audit 2026-08-08).
      const laidOut =
        typeof el.checkVisibility === "function"
          ? el.checkVisibility()
          : el.offsetParent !== null || getComputedStyle(el).position === "fixed";
      if (warned || !laidOut || !el.hasChildNodes()) return;
      if (el.getBoundingClientRect().width !== 0) return;
      warned = true;
      console.warn(
        "[kookie-ui] A <Box container> rendered 0px wide. A container can't size itself " +
          "around its contents — give it `width`, `flexGrow`, or a definite grid track, " +
          "or let a column/stack stretch it.",
      );
    };
    check();
    // A collapse is not only a mount-time event: content arrives from a fetch, or the
    // parent becomes a flex row later. One shot at mount was silent for both (audit
    // 2026-08-08) — the size observer catches the second, the child observer the first,
    // and neither ships (DEV is stripped).
    const resize = new ResizeObserver(check);
    resize.observe(el);
    const children = new MutationObserver(check);
    children.observe(el, { childList: true });
    return () => {
      resize.disconnect();
      children.disconnect();
    };
  }, [container]);

  const merged = {
    ref: DEV && container ? composedRef : ref,
    className: className ? `kui-box ${className}` : "kui-box",
    style: { ...style, ...userStyle },
    ...(container ? { "data-container": "" } : null),
    ...domProps,
  };

  const node = render ? (
    composeRender(render, merged as never)
  ) : (
    <div {...(merged as React.ComponentPropsWithRef<"div">)} />
  );

  // The region mark rides context, not the DOM: components resolve their material in React
  // (useMaterial), so an attribute would be a second, unread home for the same fact.
  if (backdrop === undefined) return node;
  return <BackdropContext.Provider value={backdrop}>{node}</BackdropContext.Provider>;
}
