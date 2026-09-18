import * as React from "react";

/**
 * What a ScrollArea renders its viewport AS. Null is a `<div>`, which is every ScrollArea there
 * has ever been.
 *
 * A message scroller has to BE the element that scrolls: its whole job is reading and writing
 * that element's scroll position while content streams in. The scroll element a pane already has
 * is the ScrollArea's viewport, and a second scroll container inside it would be two scrollers
 * fighting over one axis. So the scroller does not bring a viewport of its own; it names the
 * component the existing viewport should render as, and the ScrollArea composes it in place of
 * the div, one element wearing both libraries' refs and listeners. Internal: nothing outside the
 * package sets this, and the name never reaches a prop.
 */
export const ViewportAsContext = React.createContext<React.ElementType<
  React.ComponentPropsWithRef<"div">
> | null>(null);
