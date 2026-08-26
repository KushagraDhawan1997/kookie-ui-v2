// Public surface of @kookie-ui/react. Every export here is a decision (ENGINEERING.md §1.6).
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, type AlertDialogProps, type AlertDialogTriggerProps, type AlertDialogContentProps, type AlertDialogTitleProps, type AlertDialogDescriptionProps, type AlertDialogCancelProps, type AlertDialogActionProps } from "./components/alert-dialog/alert-dialog.tsx";
export { Badge, type BadgeProps } from "./components/badge/badge.tsx";
export { Blockquote, type BlockquoteProps } from "./components/blockquote/blockquote.tsx";
export { Box, type BoxProps } from "./components/box/box.tsx";
export { Button, type ButtonProps } from "./components/button/button.tsx";
export { Card, type CardProps } from "./components/card/card.tsx";
export { Checkbox, type CheckboxProps } from "./components/checkbox/checkbox.tsx";
export { Code, type CodeProps } from "./components/code/code.tsx";
export { Field, FieldItem, FieldLabel, FieldDescription, FieldError, type FieldProps, type FieldItemProps, type FieldLabelProps, type FieldDescriptionProps, type FieldErrorProps } from "./components/field/field.tsx";
export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, type DialogProps, type DialogTriggerProps, type DialogContentProps, type DialogTitleProps, type DialogDescriptionProps, type DialogCloseProps } from "./components/dialog/dialog.tsx";
// The overlay family's `onOpenChange` second argument, forwarded 2026-08-26 (ultracode audit).
// `dialog.tsx` re-exports these two expressly to make them public and the barrel did not carry
// them, so the generated reference printed `(open: boolean, details: OverlayOpenChangeDetails)
// => void` on the Dialog and AlertDialog pages while naming a type nobody could import — the
// exports map has one entry by design (ENGINEERING §1.6, "no deep imports"), so the only route
// was `Parameters<NonNullable<DialogProps["onOpenChange"]>>[1]`. They live on their own line
// because they are the OVERLAY family's, not Dialog's: AlertDialog's signature names them too.
export type { OverlayOpenChangeReason, OverlayOpenChangeDetails } from "./system/floating.tsx";
export { Heading, type HeadingProps } from "./components/heading/heading.tsx";
export { Kbd, type KbdProps } from "./components/kbd/kbd.tsx";
export { Link, type LinkProps } from "./components/link/link.tsx";
export { Menu, MenuTrigger, MenuContent, MenuItem, MenuGroup, MenuLabel, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSub, MenuSubTrigger, MenuSubContent, type MenuProps, type MenuTriggerProps, type MenuContentProps, type MenuItemProps, type MenuGroupProps, type MenuLabelProps, type MenuCheckboxItemProps, type MenuRadioGroupProps, type MenuRadioItemProps, type MenuSubProps, type MenuSubTriggerProps, type MenuSubContentProps } from "./components/menu/menu.tsx";
export { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectLabel, type SelectProps, type SelectTriggerProps, type SelectContentProps, type SelectItemProps, type SelectGroupProps, type SelectLabelProps } from "./components/select/select.tsx";
export {
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  type ComposerProps,
  type ComposerInputProps,
  type ComposerRowProps,
  type ComposerSendProps,
  type ComposerStatus,
} from "./components/composer/composer.tsx";
export { Notice, type NoticeProps } from "./components/notice/notice.tsx";
export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose, type PopoverProps, type PopoverTriggerProps, type PopoverContentProps, type PopoverTitleProps, type PopoverDescriptionProps, type PopoverCloseProps } from "./components/popover/popover.tsx";
export { Progress, type ProgressProps } from "./components/progress/progress.tsx";
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./components/radio/radio.tsx";
export { Separator, type SeparatorProps } from "./components/separator/separator.tsx";
export { SegmentedControl, SegmentedItem, type SegmentedControlProps, type SegmentedItemProps } from "./components/segmented-control/segmented-control.tsx";
export { Row, type RowProps } from "./components/row/row.tsx";
export { Tree, NavTree, type TreeProps, type NavTreeProps, type TreeNode } from "./components/tree/tree.tsx";
export { ScrollArea, type ScrollAreaProps } from "./components/scroll-area/scroll-area.tsx";
export {
  Shell,
  ShellHeader,
  ShellRail,
  ShellSidebar,
  ShellContent,
  ShellInspector,
  ShellBottom,
  ShellScroll,
  ShellRailItem,
  ShellRailList,
  ShellNavGroup,
  ShellNavItem,
  ShellTrigger,
  type ShellProps,
  type ShellHeaderProps,
  type ShellRailProps,
  type ShellSidebarProps,
  type ShellContentProps,
  type ShellInspectorProps,
  type ShellBottomProps,
  type ShellScrollProps,
  type ShellRailItemProps,
  type ShellRailListProps,
  type ShellNavGroupProps,
  type ShellNavItemProps,
  type ShellTriggerProps,
  type ShellPaneTarget,
  type ShellPresentation,
} from "./components/shell/shell.tsx";
export { Slider, type SliderProps } from "./components/slider/slider.tsx";
export { Switch, type SwitchProps } from "./components/switch/switch.tsx";
export { Tabs, TabsList, TabsTab, TabsPanel, type TabsProps, type TabsListProps, type TabsTabProps, type TabsPanelProps } from "./components/tabs/tabs.tsx";
export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, type TooltipProps, type TooltipProviderProps, type TooltipTriggerProps, type TooltipContentProps } from "./components/tooltip/tooltip.tsx";
export { Text, type TextProps, type TypeSize, type Weight } from "./components/text/text.tsx";
export { TextArea, type TextAreaProps } from "./components/text-area/text-area.tsx";
export { TextField, type TextFieldProps } from "./components/text-field/text-field.tsx";
export { Spinner, type SpinnerProps } from "./components/spinner/spinner.tsx";
export { Surface, type SurfaceProps } from "./components/surface/surface.tsx";
export { Flex, type FlexProps } from "./components/flex/flex.tsx";
export { Grid, type GridProps } from "./components/grid/grid.tsx";
export { Stack, type StackProps } from "./components/stack/stack.tsx";
export {
  Theme,
  useTheme,
  useMaterial,
  themeDefaults,
  themeAxes,
  type ThemeProps,
} from "./theme/theme.tsx";
export { useWindowClass, windowClassQueries, type WindowClass } from "./system/window.ts";
export { componentAxes } from "./system/axes.ts";
export type { Emphasis, Material, Size, Tone } from "./system/axes.ts";
export type { Responsive } from "./system/resolve.ts";
// The tier TABLE beside its type (2026-08-19, the componentAxes sentence for §2's axis):
// the builder's tier chips and its canvas width readout derive names and boundaries from
// this one home, instead of restating 30/48/64rem where they would go stale.
// The stroke every glyph is drawn at (2026-08-23). §8 ships no icon set, so the glyphs beside
// ours belong to whatever set the app installed — and a chevron drawn lighter than the icon in
// the button next to it is the one mismatch a consumer cannot fix from the outside. The system
// states the weight it draws at; the app passes it to its own set. `iconGrid` names the
// viewBox that number is for, so a set drawn on a different grid can convert.
export { iconStroke, iconGrid } from "./tokens/config.ts";
export { tiers, tierNames } from "./system/props.ts";
export type { Tier } from "./system/props.ts";
// The lens bench's regeneration seam (2026-08-24), NOT API — the dunder is the fence. The
// bench judges the lip's width, the glass depth and the profile, which are baked into each
// pane's displacement map; without this handle those three were only ever judgeable by
// editing refraction.tsx and reloading, which is why the lab's locked refraction went two
// months unjudged in the package. It holds bench multipliers and re-measures mounted lenses;
// nothing in the package calls it, an app that never imports it tree-shakes it away, and the
// laws read the shipped constants it never mutates.
export { __retuneLens, type LensTuning } from "./system/refraction.tsx";
