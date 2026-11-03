"use client";

import * as React from "react";

/**
 * THE TITLE A PANEL NAMES ITSELF WITH (2026-11-02, the Navigator).
 *
 * A Dialog, a Popover and a Sheet each own a title part that sets its step for the panel's size
 * and wires the panel's accessible name. Content that does not know which panel it is in — a
 * Navigator's screen — asks for the part here instead of drawing a heading of its own, so its
 * title is the panel's title, at the panel's step. Outside a panel there is no part, and the
 * caller draws its own.
 */
export const HostTitleContext = React.createContext<React.ComponentType<{ children: React.ReactNode }> | null>(null);

/** The panel's own close part, so a Navigator's band can place a close button that really
    closes the panel. Absent outside a panel. */
export const HostCloseContext = React.createContext<React.ComponentType<{ render: React.ReactElement }> | null>(null);
