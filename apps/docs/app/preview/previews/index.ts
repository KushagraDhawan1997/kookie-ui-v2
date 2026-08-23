/**
 * The per-component preview registry — the one list both routes read (2026-08-19).
 *
 * /preview renders every entry inline; /preview/<slug> renders one standalone. Both come
 * from THIS array, so the collection and the detail pages cannot drift apart. A component
 * ports into this registry during its manual audit; until then its section stays in
 * specimens.tsx, and the structure law only governs what has ported.
 */
import type { ComponentPreview } from "./types";
import { alertDialogPreview } from "./alert-dialog";
import { cardPreview } from "./card";
import { composerPreview } from "./composer";
import { dialogPreview } from "./dialog";
import { menuPreview } from "./menu";
import { selectPreview } from "./select";

export const COMPONENT_PREVIEWS: readonly ComponentPreview[] = [
  alertDialogPreview,
  cardPreview,
  composerPreview,
  dialogPreview,
  menuPreview,
  selectPreview,
];
