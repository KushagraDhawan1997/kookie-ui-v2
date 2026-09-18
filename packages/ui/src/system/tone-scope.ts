import * as React from "react";

import type { Tone } from "./axes.ts";

/**
 * The tone of the strip a control sits in, when the control states none of its own (2026-09-19,
 * Kushagra: a neutral button inside a destructive notice "should auto trickle down").
 *
 * A notice's tone is its CATEGORY, and the action inside it acts on that category — "Try again"
 * on a failure is part of the failure. So a Button in a Notice or a Confirmation takes the
 * strip's tone unless it states one; an explicit `tone` always wins. Null means nobody supplied
 * one, and the Button rests on its own default. Only the strips provide it: a Card or a Box
 * never tints the controls placed in it. Every Theme resets it, and every portal renders a bare
 * Theme (§20), so a dialog or menu opened from a strip's action does not inherit the tone.
 */
export const ToneScopeContext = React.createContext<Tone | null>(null);
