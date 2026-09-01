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
import { iconStroke } from "@kookie-ui/react";
import {
  Alert02Icon,
  BlocksIcon as HugeBlocksIcon,
  BlurIcon,
  BrowserIcon,
  CheckListIcon,
  ColorsIcon,
  CompassIcon as HugeCompassIcon,
  Cursor01Icon,
  Download01Icon,
  File01Icon,
  DraftingCompassIcon,
  IdeaIcon as HugeIdeaIcon,
  Layers01Icon,
  Layout01Icon,
  Megaphone01Icon,
  MotionIcon as HugeMotionIcon,
  RadiusIcon as HugeRadiusIcon,
  Rocket01Icon,
  RulerIcon,
  ShapesIcon,
  SmartPhone01Icon,
  Structure01Icon,
  SwatchIcon,
  TextFontIcon,
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  ArrowLeft02Icon,
  ArrowUp02Icon,
  Attachment01Icon,
  Cancel01Icon,
  Copy01Icon,
  Delete02Icon,
  EyeIcon,
  FlashIcon,
  GridViewIcon,
  LayerIcon,
  PaintBoardIcon,
  ChartLineData01Icon,
  Folder01Icon,
  Home01Icon,
  Mail01Icon,
  Mic01Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  PlusSignIcon,
  ReloadIcon,
  Search01Icon,
  Settings02Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SquareLock02Icon,
  StopIcon,
  Tick02Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

/**
 * One shape for every glyph below: decorative by default (the control that owns it carries the
 * accessible name), stroke 1.5, and no size — the slot's box is the system's.
 *
 * The stroke is the PACKAGE's (2026-08-23). It was 1.5 stated here, which is the same literal
 * the package's own chevrons carry — and they did not match, because those are drawn on a 16
 * viewBox and Hugeicons on a 24, so one number painted 1.5px there and 1.0px here. `iconStroke`
 * is the number for the 24 grid, and the package converts it for its own. It is not absolute:
 * `absoluteStrokeWidth` would rescale the stroke against the `size` prop, and this file never
 * passes one — the box comes from CSS, so there is nothing for it to scale against and the
 * flag would silently do nothing.
 */
const glyph = (icon: IconSvgElement) =>
  function Glyph() {
    return <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />;
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
export const ArrowLeftIcon = glyph(ArrowLeft02Icon);
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
export const PanelLeftIcon = glyph(SidebarLeftIcon);
export const PanelRightIcon = glyph(SidebarRightIcon);
export const CopyIcon = glyph(Copy01Icon);
/* The code sample's NAME button (2026-08-28). It copies a path, so its glyph names the object
   rather than the verb — the copy mark is the code button's, one pane-width away. */
export const FileIcon = glyph(File01Icon);
export const TrashIcon = glyph(Delete02Icon);
/* The composer's four (2026-08-23). The send button is one control with four meanings, so the
   three it can turn into are named for the meaning rather than the drawing: a filled square is
   the universal stop, and a reload is a retry. `MicIcon` is dictation, which the composer does
   not own — the app draws that button, which is exactly why these live here. */
export const BoltIcon = glyph(FlashIcon);
export const MicIcon = glyph(Mic01Icon);
export const StopSquareIcon = glyph(StopIcon);
export const RetryIcon = glyph(ReloadIcon);

export const WarnIcon = glyph(Alert02Icon);

/* The sidebar's Workbench rows (2026-08-26). Only that group carries icons: its four rows are
   destinations of different KINDS, which is what a glyph can tell apart — the chapter and
   component rows are lists of like things, where per-row metaphors are noise and a leading
   slot's indent would misalign any row without one. Named for the destination's meaning. */
export const BoardIcon = glyph(PaintBoardIcon);
export const MatrixIcon = glyph(GridViewIcon);
export const BlocksIcon = glyph(HugeBlocksIcon);

/* The chapter rows (2026-08-26, Kushagra: the guideline chapters carry icons; the component
   list does not — those rows are a list of like things, and a glyph per component would be an
   invented metaphor thirty-one times). One glyph per chapter, named for the chapter's SUBJECT
   so the nav map in docs-nav.tsx reads as a table of contents. */
export const InstallIcon = glyph(Download01Icon);
export const ThemeIcon = glyph(SwatchIcon);
export const RocketIcon = glyph(Rocket01Icon);
export const IdeaIcon = glyph(HugeIdeaIcon);
export const FamiliesIcon = glyph(ShapesIcon);
/* Not the scales of justice, which is what this was until 2026-08-28 (Kushagra). Those read
   as law and as a balance between two sides, and the chapter argues the opposite: some rules
   are types you cannot write incorrectly, some are checked automatically, and the rest are
   judgments — evidence, not arbitration. A microscope was tried and failed the small size:
   this glyph appears in the nav on every page at 16px, where its detail collapsed into a
   smudge. The drafting compass is the instrument of exact construction, and its silhouette is
   two legs and a point, which survives 16px and does not join the four circular glyphs already
   in that column. */
export const RulesIcon = glyph(DraftingCompassIcon);
export const ColorIcon = glyph(ColorsIcon);
export const TypeIcon = glyph(TextFontIcon);
export const LayoutIcon = glyph(Layout01Icon);
export const SizeIcon = glyph(RulerIcon);
export const RadiusIcon = glyph(HugeRadiusIcon);
export const MaterialIcon = glyph(BlurIcon);
export const DepthIcon = glyph(Layers01Icon);
export const MotionIcon = glyph(HugeMotionIcon);
export const CursorIcon = glyph(Cursor01Icon);
export const DeviceIcon = glyph(SmartPhone01Icon);
export const StructureIcon = glyph(Structure01Icon);
export const FormIcon = glyph(CheckListIcon);
export const WindowIcon = glyph(BrowserIcon);
export const CompassIcon = glyph(HugeCompassIcon);
export const MegaphoneIcon = glyph(Megaphone01Icon);
