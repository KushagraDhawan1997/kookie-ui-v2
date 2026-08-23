// Public surface of @kookie-ui/react. Every export here is a decision (ENGINEERING.md §1.6).
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, type AlertDialogProps, type AlertDialogTriggerProps, type AlertDialogContentProps, type AlertDialogTitleProps, type AlertDialogDescriptionProps, type AlertDialogCancelProps, type AlertDialogActionProps } from "./components/alert-dialog/alert-dialog.tsx";
export { Blockquote, type BlockquoteProps } from "./components/blockquote/blockquote.tsx";
export { Box, type BoxProps } from "./components/box/box.tsx";
export { Button, type ButtonProps } from "./components/button/button.tsx";
export { Card, type CardProps } from "./components/card/card.tsx";
export { Checkbox, type CheckboxProps } from "./components/checkbox/checkbox.tsx";
export { Code, type CodeProps } from "./components/code/code.tsx";
export { Field, FieldItem, FieldLabel, FieldDescription, FieldError, type FieldProps, type FieldItemProps, type FieldLabelProps, type FieldDescriptionProps, type FieldErrorProps } from "./components/field/field.tsx";
export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose, type DialogProps, type DialogTriggerProps, type DialogContentProps, type DialogTitleProps, type DialogDescriptionProps, type DialogCloseProps } from "./components/dialog/dialog.tsx";
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
export { Progress, type ProgressProps } from "./components/progress/progress.tsx";
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./components/radio/radio.tsx";
export { Separator, type SeparatorProps } from "./components/separator/separator.tsx";
export { SegmentedControl, SegmentedItem, type SegmentedControlProps, type SegmentedItemProps } from "./components/segmented-control/segmented-control.tsx";
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
export { tiers, tierNames } from "./system/props.ts";
export type { Tier } from "./system/props.ts";
