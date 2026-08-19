/**
 * The docs' glyphs — Hugeicons, one named wrapper per glyph (2026-08-10, Kushagra: "The docs
 * app should only use hugeicons").
 *
 * This is not a hole in "no third-party UI". That stance is about COMPONENTS: a design system
 * whose docs run on someone else's buttons argues against itself. §8 says the opposite about
 * icons in as many words — the package ships no icon dependency, icons are `ReactNode` slots,
 * and *the app installs its own set*. The hand-drawn strokes that were here were the app
 * declining to install one, which was fine while three glyphs were enough and stopped being
 * fine the day the playground started showing real screens: a toolbar, a member row and a
 * composer are made of glyphs, and drawing them badly makes the composition the thing under
 * judgement instead of the system.
 *
 * `@hugeicons/react` + `@hugeicons/core-free-icons`, both MIT.
 *
 * Wrappers rather than re-exports, for two reasons. The call sites say what the glyph MEANS
 * (`SearchIcon`) rather than which drawing was picked (`Search01Icon`), so swapping a drawing
 * is one edit here. And the props that must be right every time — `aria-hidden`, and NOT
 * passing `size` — are set once. Size is deliberately absent: the control layer sizes a slot's
 * svg through `--kui-ct-icon` (recipes.css), and `size` would emit width/height attributes
 * that the CSS then has to beat. It does beat them, presentation attributes losing to any
 * declaration, but relying on that is a mechanism nobody wrote down.
 */
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  ArrowUp02Icon,
  Attachment01Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  LayerIcon,
  ChartLineData01Icon,
  Folder01Icon,
  Home01Icon,
  Mail01Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  PlusSignIcon,
  Search01Icon,
  Settings02Icon,
  SquareLock02Icon,
  Tick02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

/**
 * One shape for every glyph below: decorative by default (the control that owns it carries the
 * accessible name), stroke 1.5, and no size — the slot's box is the system's.
 *
 * 1.5 is stated once here rather than per call site (Kushagra, 2026-08-10). It is not
 * absolute: `absoluteStrokeWidth` would rescale the stroke against the `size` prop, and this
 * file never passes one — the box comes from CSS, so there is nothing for it to scale against
 * and the flag would silently do nothing.
 */
const glyph = (icon: IconSvgElement) =>
  function Glyph() {
    return <HugeiconsIcon icon={icon} strokeWidth={1.5} aria-hidden />;
  };

export const SearchIcon = glyph(Search01Icon);
export const PlusIcon = glyph(PlusSignIcon);
export const XIcon = glyph(Cancel01Icon);
export const CheckIcon = glyph(Tick02Icon);
export const MailIcon = glyph(Mail01Icon);
export const LockIcon = glyph(SquareLock02Icon);
export const BellIcon = glyph(Notification02Icon);
export const MoreIcon = glyph(MoreHorizontalIcon);
export const ArrowUpIcon = glyph(ArrowUp02Icon);
export const PaperclipIcon = glyph(Attachment01Icon);
export const HomeIcon = glyph(Home01Icon);
export const FolderIcon = glyph(Folder01Icon);
export const ChartIcon = glyph(ChartLineData01Icon);
export const SettingsIcon = glyph(Settings02Icon);
export const UsersIcon = glyph(UserMultiple02Icon);

/* The builder's editor chrome (2026-08-20). Named for the JOB, like every glyph above:
   the toolbar says undo, not "arrow turning backward". */
export const UndoIcon = glyph(ArrowTurnBackwardIcon);
export const RedoIcon = glyph(ArrowTurnForwardIcon);
export const PreviewIcon = glyph(EyeIcon);
export const LayersIcon = glyph(LayerIcon);
export const CopyIcon = glyph(Copy01Icon);
export const TrashIcon = glyph(Delete02Icon);
export const WarnIcon = glyph(Alert02Icon);
