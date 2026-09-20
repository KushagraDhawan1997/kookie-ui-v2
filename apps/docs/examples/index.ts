/**
 * The example registry — one entry per component page's live specimen.
 *
 * Each example is a REAL FILE that is consumed twice: imported here and rendered, and read
 * off disk and shown as source (`example.tsx`). That is the whole design. A docs site whose
 * snippets are strings written beside the thing they claim to show is a drift machine, and
 * this repo has spent most of its audits on exactly that shape — two homes for one fact. One
 * file cannot disagree with itself.
 *
 * It also means `tsc` type-checks every sample the site publishes. A snippet in a fence is
 * text nobody compiles; these are modules in the app's own program, so an example using a
 * prop that no longer exists fails `pnpm run lint` rather than misleading a reader. That is
 * the same mechanism that caught a documented prop which had never existed (2026-08-08).
 *
 * The file name IS the component's slug — convention rather than a mapping field, so there
 * is no third place for the pairing to go wrong. A law walks both directions.
 */
import type * as React from "react";

import AlertDialogExample from "./alert-dialog";
import AttachmentExample from "./attachment";
import CommandExample from "./command";
import AccordionExample from "./accordion";
import PageExample from "./page";
import QuickstartExample from "./quickstart";
import PrinciplesLookalikesExample from "./principles.lookalikes";
import QuickstartContainersExample from "./quickstart.containers";
import QuickstartGroupExample from "./quickstart.group";
import QuickstartActionsExample from "./quickstart.actions";
import ToolbarExample from "./toolbar";
/* VARIANTS (2026-09-05, Kushagra, against shadcn's page: "I can't learn that RTL is handled by
   looking at a gear icon"). A knob sweeps an AXIS — nobody sends a colleague to size 3 — and a
   variant shows a behaviour or a composition, which is a thing worth linking to. The file name
   is still the identity: `<slug>.<variant>.tsx`, so `readExampleSource` and the coverage law
   need no mapping field, and the registry names which variants a page offers. */
import AccordionDisabledExample from "./accordion.disabled";
import AccordionRtlExample from "./accordion.rtl";
import AttachmentComposerExample from "./attachment.composer";
import AttachmentMessageExample from "./attachment.message";
import AttachmentFormExample from "./attachment.form";
import MenuDisabledExample from "./menu.disabled";
import MenuRtlExample from "./menu.rtl";
import SelectDisabledExample from "./select.disabled";
import SelectRtlExample from "./select.rtl";
import AvatarExample from "./avatar";
import AvatarGroupExample from "./avatar-group";
import BadgeExample from "./badge";
import ChipExample from "./chip";
import BlockquoteExample from "./blockquote";
import BoxExample from "./box";
import BreadcrumbExample from "./breadcrumb";
import ButtonExample from "./button";
import CardExample from "./card";
import CheckboxExample from "./checkbox";
import CodeExample from "./code";
import CodeBlockExample from "./code-block";
import ComboboxExample from "./combobox";
import ContextMenuExample from "./context-menu";
import DialogExample from "./dialog";
import FieldExample from "./field";
import FlexExample from "./flex";
import GridExample from "./grid";
import HeadingExample from "./heading";
import KbdExample from "./kbd";
import LinkExample from "./link";
import ListExample from "./list";
import MenuExample from "./menu";
import ComposerExample from "./composer";
import NoticeExample from "./notice";
import NumberFieldExample from "./number-field";
import PopoverExample from "./popover";
import ProgressExample from "./progress";
import RadioGroupExample from "./radio-group";
import RadioExample from "./radio";
import RowExample from "./row";
import MessageScrollerExample from "./message-scroller";
import ScrollAreaExample from "./scroll-area";
import SegmentedControlExample from "./segmented-control";
import SelectExample from "./select";
import SeparatorExample from "./separator";
import SheetExample from "./sheet";
import ShellExample from "./shell";
import SliderExample from "./slider";
import SpinnerExample from "./spinner";
import StackExample from "./stack";
import SurfaceExample from "./surface";
import SwitchExample from "./switch";
import TableExample from "./table";
import ToggleExample from "./toggle";
import SplitButtonExample from "./split-button";
import ButtonGroupExample from "./button-group";
import CarouselExample from "./carousel";
import TabsExample from "./tabs";
import TextAreaExample from "./text-area";
import TextFieldExample from "./text-field";
import TextExample from "./text";
import TooltipExample from "./tooltip";
import NavTreeExample from "./nav-tree";
import TreeExample from "./tree";
import ThemeExample from "./theme";

import AccordionSizesExample from "./accordion.sizes";
import AccordionMultipleExample from "./accordion.multiple";
import AccordionControlledExample from "./accordion.controlled";
import AccordionInACardExample from "./accordion.in-a-card";
import AlertDialogSizesExample from "./alert-dialog.sizes";
import AlertDialogTonesExample from "./alert-dialog.tones";
import AlertDialogControlledExample from "./alert-dialog.controlled";
import AlertDialogFromAMenuExample from "./alert-dialog.from-a-menu";
import AlertDialogRtlExample from "./alert-dialog.rtl";
import AttachmentStatesExample from "./attachment.states";
import AttachmentSizesExample from "./attachment.sizes";
import AttachmentLiveUploadExample from "./attachment.live-upload";
import AvatarGroupSizesExample from "./avatar-group.sizes";
import AvatarGroupOverflowExample from "./avatar-group.overflow";
import AvatarGroupWithALabelExample from "./avatar-group.with-a-label";
import AvatarSizesExample from "./avatar.sizes";
import AvatarFallbacksExample from "./avatar.fallbacks";
import AvatarBadgesExample from "./avatar.badges";
import AvatarWithANameExample from "./avatar.with-a-name";
import AvatarWithControlsExample from "./avatar.with-controls";
import AvatarInAButtonExample from "./avatar.in-a-button";
import BadgeCountsExample from "./badge.counts";
import BadgeDotsExample from "./badge.dots";
import BadgeTonesExample from "./badge.tones";
import BadgeSizesExample from "./badge.sizes";
import BadgeOnAnAvatarExample from "./badge.on-an-avatar";
import BadgeInTabsExample from "./badge.in-tabs";
import BadgeInAListExample from "./badge.in-a-list";
import BadgeConditionalExample from "./badge.conditional";
import BlockquoteSizesExample from "./blockquote.sizes";
import BlockquoteEmphasisExample from "./blockquote.emphasis";
import BlockquoteTonesExample from "./blockquote.tones";
import BlockquoteWithAttributionExample from "./blockquote.with-attribution";
import BlockquoteInAnArticleExample from "./blockquote.in-an-article";
import BoxPaddingExample from "./box.padding";
import BoxSpacingAControlExample from "./box.spacing-a-control";
import BoxResponsiveExample from "./box.responsive";
import BoxContainerExample from "./box.container";
import BoxBleedExample from "./box.bleed";
import BoxBackdropExample from "./box.backdrop";
import BoxRenderExample from "./box.render";
import BreadcrumbSizesExample from "./breadcrumb.sizes";
import BreadcrumbShortPathExample from "./breadcrumb.short-path";
import BreadcrumbCollapsedLevelsExample from "./breadcrumb.collapsed-levels";
import BreadcrumbPageHeaderExample from "./breadcrumb.page-header";
import BreadcrumbRtlExample from "./breadcrumb.rtl";
import ButtonGroupSizesExample from "./button-group.sizes";
import ButtonGroupIconOnlyExample from "./button-group.icon-only";
import ButtonGroupBorderedExample from "./button-group.bordered";
import ButtonGroupPaginationExample from "./button-group.pagination";
import ButtonEmphasisExample from "./button.emphasis";
import ButtonTonesExample from "./button.tones";
import ButtonSizesExample from "./button.sizes";
import ButtonWithIconsExample from "./button.with-icons";
import ButtonIconOnlyExample from "./button.icon-only";
import ButtonStatesExample from "./button.states";
import ButtonDoneExample from "./button.done";
import ButtonAsLinkExample from "./button.as-link";
import ButtonInAFormExample from "./button.in-a-form";
import CardSizesExample from "./card.sizes";
import CardAsALinkExample from "./card.as-a-link";
import CardAsAButtonExample from "./card.as-a-button";
import CardChoiceExample from "./card.choice";
import CardDisabledExample from "./card.disabled";
import CardResponsiveGridExample from "./card.responsive-grid";
import CardSettingsExample from "./card.settings";
import CarouselWithIconsExample from "./carousel.with-icons";
import CarouselLabelledByHeadingExample from "./carousel.labelled-by-heading";
import CarouselButtonsAtTheEndsExample from "./carousel.buttons-at-the-ends";
import CarouselRtlExample from "./carousel.rtl";
import CheckboxSizesExample from "./checkbox.sizes";
import CheckboxInAFormExample from "./checkbox.in-a-form";
import CheckboxSelectAllExample from "./checkbox.select-all";
import CheckboxDisabledExample from "./checkbox.disabled";
import CheckboxControlledExample from "./checkbox.controlled";
import CheckboxInACardExample from "./checkbox.in-a-card";
import ChipTonesExample from "./chip.tones";
import ChipSizesExample from "./chip.sizes";
import ChipBesideAHeadingExample from "./chip.beside-a-heading";
import ChipInATableExample from "./chip.in-a-table";
import CodeBlockWithTopbarExample from "./code-block.with-topbar";
import CodeBlockMaxLinesExample from "./code-block.max-lines";
import CodeBlockWithFooterExample from "./code-block.with-footer";
import CodeBlockSizesExample from "./code-block.sizes";
import CodeBlockInACardExample from "./code-block.in-a-card";
import CodeInheritedSizeExample from "./code.inherited-size";
import CodeTonesExample from "./code.tones";
import CodeEmphasisExample from "./code.emphasis";
import CodeInATableExample from "./code.in-a-table";
import ComboboxGroupsExample from "./combobox.groups";
import ComboboxObjectOptionsExample from "./combobox.object-options";
import ComboboxControlledExample from "./combobox.controlled";
import ComboboxInAFormExample from "./combobox.in-a-form";
import ComboboxDisabledExample from "./combobox.disabled";
import ComboboxWithIconExample from "./combobox.with-icon";
import ComboboxSizesExample from "./combobox.sizes";
import CommandFlatExample from "./command.flat";
import CommandKeyboardShortcutExample from "./command.keyboard-shortcut";
import CommandPlacesExample from "./command.places";
import CommandAppFilteringExample from "./command.app-filtering";
import CommandStaysOpenExample from "./command.stays-open";
import ComposerWithNoticesExample from "./composer.with-notices";
import ComposerConfirmationExample from "./composer.confirmation";
import ComposerWithContextExample from "./composer.with-context";
import ComposerRequestStatesExample from "./composer.request-states";
import ComposerDisabledExample from "./composer.disabled";
import ComposerWithSelectExample from "./composer.with-select";
import ContextMenuGroupsExample from "./context-menu.groups";
import ContextMenuShortcutsExample from "./context-menu.shortcuts";
import ContextMenuCheckableExample from "./context-menu.checkable";
import ContextMenuSubmenuExample from "./context-menu.submenu";
import ContextMenuDisabledExample from "./context-menu.disabled";
import ContextMenuPerRowExample from "./context-menu.per-row";
import DialogInAFormExample from "./dialog.in-a-form";
import DialogControlledExample from "./dialog.controlled";
import DialogScrollingContentExample from "./dialog.scrolling-content";
import DialogUnsavedChangesExample from "./dialog.unsaved-changes";
import DialogFromAMenuExample from "./dialog.from-a-menu";
import FieldRequiredExample from "./field.required";
import FieldValidationExample from "./field.validation";
import FieldServerErrorExample from "./field.server-error";
import FieldDisabledExample from "./field.disabled";
import FieldCheckboxesExample from "./field.checkboxes";
import FieldWithSelectExample from "./field.with-select";
import FieldWithTextAreaExample from "./field.with-text-area";
import FlexSpaceBetweenExample from "./flex.space-between";
import FlexWrapExample from "./flex.wrap";
import FlexGrowExample from "./flex.grow";
import FlexResponsiveExample from "./flex.responsive";
import FlexBaselineExample from "./flex.baseline";
import FlexInlineExample from "./flex.inline";
import GridResponsiveExample from "./grid.responsive";
import GridAreasExample from "./grid.areas";
import GridSpanningExample from "./grid.spanning";
import GridGapAxesExample from "./grid.gap-axes";
import GridInAFormExample from "./grid.in-a-form";
import GridContainerExample from "./grid.container";
import HeadingSizesExample from "./heading.sizes";
import HeadingLevelsExample from "./heading.levels";
import HeadingEmphasisExample from "./heading.emphasis";
import HeadingTonesExample from "./heading.tones";
import HeadingInACardExample from "./heading.in-a-card";
import KbdSizesExample from "./kbd.sizes";
import KbdCombinationsExample from "./kbd.combinations";
import KbdInAMenuExample from "./kbd.in-a-menu";
import KbdShortcutListExample from "./kbd.shortcut-list";
import LinkSizesExample from "./link.sizes";
import LinkTonesExample from "./link.tones";
import LinkExternalExample from "./link.external";
import LinkStandaloneExample from "./link.standalone";
import ListOrderedExample from "./list.ordered";
import ListResumedExample from "./list.resumed";
import ListSizesExample from "./list.sizes";
import ListEmphasisExample from "./list.emphasis";
import ListTonesExample from "./list.tones";
import ListInACardExample from "./list.in-a-card";
import MenuSizesExample from "./menu.sizes";
import MenuWithIconsExample from "./menu.with-icons";
import MenuCheckboxItemsExample from "./menu.checkbox-items";
import MenuRadioItemsExample from "./menu.radio-items";
import MenuSubmenuExample from "./menu.submenu";
import MenuLinksExample from "./menu.links";
import MenuPlacementExample from "./menu.placement";
import MessageScrollerStreamingExample from "./message-scroller.streaming";
import MessageScrollerOpenAtStartExample from "./message-scroller.open-at-start";
import MessageScrollerJumpToMessageExample from "./message-scroller.jump-to-message";
import MessageScrollerCustomButtonExample from "./message-scroller.custom-button";
import NavTreeInASidebarExample from "./nav-tree.in-a-sidebar";
import NavTreeSizesExample from "./nav-tree.sizes";
import NavTreeWithIconsExample from "./nav-tree.with-icons";
import NavTreeControlledExample from "./nav-tree.controlled";
import NavTreeRouterLinksExample from "./nav-tree.router-links";
import NavTreeRtlExample from "./nav-tree.rtl";
import NoticeTonesExample from "./notice.tones";
import NoticeWithIconExample from "./notice.with-icon";
import NoticeDismissibleExample from "./notice.dismissible";
import NoticeSizesExample from "./notice.sizes";
import NoticeConfirmationExample from "./notice.confirmation";
import NoticeAboveARegionExample from "./notice.above-a-region";
import NumberFieldSizesExample from "./number-field.sizes";
import NumberFieldFormatExample from "./number-field.format";
import NumberFieldStepsExample from "./number-field.steps";
import NumberFieldControlledExample from "./number-field.controlled";
import NumberFieldStatesExample from "./number-field.states";
import NumberFieldInAFormExample from "./number-field.in-a-form";
import PageOutsideAFrameExample from "./page.outside-a-frame";
import PageTitleOnlyExample from "./page.title-only";
import PageWithMarkExample from "./page.with-mark";
import PageBandInFlowExample from "./page.band-in-flow";
import PopoverPlacementExample from "./popover.placement";
import PopoverSizesExample from "./popover.sizes";
import PopoverFilterPanelExample from "./popover.filter-panel";
import PopoverControlledExample from "./popover.controlled";
import PopoverDetailsExample from "./popover.details";
import ProgressLabelledExample from "./progress.labelled";
import ProgressIndeterminateExample from "./progress.indeterminate";
import ProgressRangeExample from "./progress.range";
import ProgressInACardExample from "./progress.in-a-card";
import RadioGroupHorizontalExample from "./radio-group.horizontal";
import RadioGroupControlledExample from "./radio-group.controlled";
import RadioGroupInAFormExample from "./radio-group.in-a-form";
import RadioGroupDisabledExample from "./radio-group.disabled";
import RadioSizesExample from "./radio.sizes";
import RadioWithDescriptionsExample from "./radio.with-descriptions";
import RadioDisabledExample from "./radio.disabled";
import RadioWrappingLabelExample from "./radio.wrapping-label";
import RowSizesExample from "./row.sizes";
import RowLeadingAndTrailingExample from "./row.leading-and-trailing";
import RowLinksExample from "./row.links";
import RowHighlightedExample from "./row.highlighted";
import RowReadOnlyExample from "./row.read-only";
import RowDestructiveExample from "./row.destructive";
import ScrollAreaFadeExample from "./scroll-area.fade";
import ScrollAreaHorizontalExample from "./scroll-area.horizontal";
import ScrollAreaInACardExample from "./scroll-area.in-a-card";
import ScrollAreaNamedRegionExample from "./scroll-area.named-region";
import SegmentedControlWithIconsExample from "./segmented-control.with-icons";
import SegmentedControlIconOnlyExample from "./segmented-control.icon-only";
import SegmentedControlControlledExample from "./segmented-control.controlled";
import SegmentedControlDisabledExample from "./segmented-control.disabled";
import SegmentedControlInAToolbarExample from "./segmented-control.in-a-toolbar";
import SelectInAFormExample from "./select.in-a-form";
import SelectControlledExample from "./select.controlled";
import SelectPlaceholderExample from "./select.placeholder";
import SelectDisabledControlExample from "./select.disabled-control";
import SelectLongListExample from "./select.long-list";
import SelectBesideATextFieldExample from "./select.beside-a-text-field";
import SeparatorInAToolbarExample from "./separator.in-a-toolbar";
import SeparatorLabelledExample from "./separator.labelled";
import SeparatorInACardExample from "./separator.in-a-card";
import SheetBottomExample from "./sheet.bottom";
import SheetInlineStartExample from "./sheet.inline-start";
import SheetControlledExample from "./sheet.controlled";
import SheetLongContentExample from "./sheet.long-content";
import SheetRtlExample from "./sheet.rtl";
import ShellHeaderExample from "./shell.header";
import ShellRailExample from "./shell.rail";
import ShellInspectorExample from "./shell.inspector";
import ShellBottomPaneExample from "./shell.bottom-pane";
import ShellFloatingExample from "./shell.floating";
import ShellGroundedExample from "./shell.grounded";
import ShellResizableExample from "./shell.resizable";
import ShellControlledExample from "./shell.controlled";
import SliderRangeExample from "./slider.range";
import SliderControlledExample from "./slider.controlled";
import SliderStepsExample from "./slider.steps";
import SliderDisabledExample from "./slider.disabled";
import SliderInAFormExample from "./slider.in-a-form";
import SliderRtlExample from "./slider.rtl";
import SpinnerInAButtonExample from "./spinner.in-a-button";
import SpinnerWithALabelExample from "./spinner.with-a-label";
import SpinnerColourExample from "./spinner.colour";
import SpinnerSizesExample from "./spinner.sizes";
import SplitButtonSizesExample from "./split-button.sizes";
import SplitButtonEmphasisExample from "./split-button.emphasis";
import SplitButtonTonesExample from "./split-button.tones";
import SplitButtonWithIconExample from "./split-button.with-icon";
import SplitButtonDisabledExample from "./split-button.disabled";
import SplitButtonMenuGroupsExample from "./split-button.menu-groups";
import StackGapExample from "./stack.gap";
import StackAlignmentExample from "./stack.alignment";
import StackNestedGroupsExample from "./stack.nested-groups";
import StackWithSeparatorsExample from "./stack.with-separators";
import StackResponsiveExample from "./stack.responsive";
import StackRenderExample from "./stack.render";
import SurfaceSizesExample from "./surface.sizes";
import SurfaceHoldingCardsExample from "./surface.holding-cards";
import SurfaceInACardExample from "./surface.in-a-card";
import SurfaceAsALayoutExample from "./surface.as-a-layout";
import SurfaceBleedExample from "./surface.bleed";
import SwitchSizesExample from "./switch.sizes";
import SwitchControlledExample from "./switch.controlled";
import SwitchDisabledExample from "./switch.disabled";
import SwitchWithDescriptionExample from "./switch.with-description";
import SwitchSettingsCardExample from "./switch.settings-card";
import SwitchInAFormExample from "./switch.in-a-form";
import TableSizesExample from "./table.sizes";
import TableAlignmentExample from "./table.alignment";
import TableWideExample from "./table.wide";
import TableLabelledByHeadingExample from "./table.labelled-by-heading";
import TableWithActionsExample from "./table.with-actions";
import TableInACardExample from "./table.in-a-card";
import TabsWithPanelsExample from "./tabs.with-panels";
import TabsSizesExample from "./tabs.sizes";
import TabsControlledExample from "./tabs.controlled";
import TabsDisabledExample from "./tabs.disabled";
import TabsAsLinksExample from "./tabs.as-links";
import TabsInACardExample from "./tabs.in-a-card";
import TextAreaSizesExample from "./text-area.sizes";
import TextAreaInAFormExample from "./text-area.in-a-form";
import TextAreaControlledExample from "./text-area.controlled";
import TextAreaInvalidExample from "./text-area.invalid";
import TextAreaDisabledAndReadOnlyExample from "./text-area.disabled-and-read-only";
import TextAreaResizeExample from "./text-area.resize";
import TextFieldSizesExample from "./text-field.sizes";
import TextFieldWithIconsExample from "./text-field.with-icons";
import TextFieldPasswordExample from "./text-field.password";
import TextFieldControlledExample from "./text-field.controlled";
import TextFieldInAFormExample from "./text-field.in-a-form";
import TextFieldInvalidExample from "./text-field.invalid";
import TextFieldDisabledExample from "./text-field.disabled";
import TextSizesExample from "./text.sizes";
import TextWeightsExample from "./text.weights";
import TextEmphasisExample from "./text.emphasis";
import TextTonesExample from "./text.tones";
import TextParagraphsExample from "./text.paragraphs";
import TextInlineElementsExample from "./text.inline-elements";
import ThemeAppearanceExample from "./theme.appearance";
import ThemeDensityExample from "./theme.density";
import ThemeRadiusExample from "./theme.radius";
import ThemeDepthExample from "./theme.depth";
import ThemeContrastExample from "./theme.contrast";
import ThemeSizeExample from "./theme.size";
import ThemeNestedExample from "./theme.nested";
import ToggleSizesExample from "./toggle.sizes";
import ToggleIconOnlyExample from "./toggle.icon-only";
import ToggleWithIconsExample from "./toggle.with-icons";
import ToggleTonesExample from "./toggle.tones";
import ToggleBorderedExample from "./toggle.bordered";
import ToggleControlledExample from "./toggle.controlled";
import ToggleDisabledExample from "./toggle.disabled";
import ToggleVerticalExample from "./toggle.vertical";
import ToolbarGroupsExample from "./toolbar.groups";
import ToolbarSizesExample from "./toolbar.sizes";
import ToolbarVerticalExample from "./toolbar.vertical";
import ToolbarOverflowExample from "./toolbar.overflow";
import ToolbarWithMenuExample from "./toolbar.with-menu";
import ToolbarDisabledExample from "./toolbar.disabled";
import TooltipIconButtonsExample from "./tooltip.icon-buttons";
import TooltipShortcutsExample from "./tooltip.shortcuts";
import TooltipSidesExample from "./tooltip.sides";
import TooltipInAToolbarExample from "./tooltip.in-a-toolbar";
import TooltipControlledExample from "./tooltip.controlled";
import TreeWithIconsExample from "./tree.with-icons";
import TreeSingleSelectExample from "./tree.single-select";
import TreeControlledExample from "./tree.controlled";
import TreeSizesExample from "./tree.sizes";
import TreeRichLabelsExample from "./tree.rich-labels";
import TreeRtlExample from "./tree.rtl";

export const EXAMPLES: Record<string, React.ComponentType> = {
  "alert-dialog": AlertDialogExample,
  "accordion": AccordionExample,
  "page": PageExample,
  quickstart: QuickstartExample,
  "principles.lookalikes": PrinciplesLookalikesExample,
  "quickstart.containers": QuickstartContainersExample,
  "quickstart.group": QuickstartGroupExample,
  "quickstart.actions": QuickstartActionsExample,
  "toolbar": ToolbarExample,
  attachment: AttachmentExample,
  "avatar": AvatarExample,
  "avatar-group": AvatarGroupExample,
  "badge": BadgeExample,
  "chip": ChipExample,
  "blockquote": BlockquoteExample,
  "box": BoxExample,
  "breadcrumb": BreadcrumbExample,
  "button": ButtonExample,
  "card": CardExample,
  "checkbox": CheckboxExample,
  "code": CodeExample,
  command: CommandExample,
  "code-block": CodeBlockExample,
  "combobox": ComboboxExample,
  "context-menu": ContextMenuExample,
  "dialog": DialogExample,
  "flex": FlexExample,
  "grid": GridExample,
  "heading": HeadingExample,
  "kbd": KbdExample,
  "link": LinkExample,
  "list": ListExample,
  "menu": MenuExample,
  "accordion.disabled": AccordionDisabledExample,
  "accordion.rtl": AccordionRtlExample,
  "attachment.composer": AttachmentComposerExample,
  "attachment.message": AttachmentMessageExample,
  "attachment.form": AttachmentFormExample,
  "menu.disabled": MenuDisabledExample,
  "menu.rtl": MenuRtlExample,
  "select.disabled": SelectDisabledExample,
  "select.rtl": SelectRtlExample,
  "composer": ComposerExample,
  "notice": NoticeExample,
  "number-field": NumberFieldExample,
  "popover": PopoverExample,
  "progress": ProgressExample,
  "radio-group": RadioGroupExample,
  "radio": RadioExample,
  "row": RowExample,
  "message-scroller": MessageScrollerExample,
  "scroll-area": ScrollAreaExample,
  "segmented-control": SegmentedControlExample,
  "select": SelectExample,
  "field": FieldExample,
  "separator": SeparatorExample,
  "sheet": SheetExample,
  "shell": ShellExample,
  "slider": SliderExample,
  "spinner": SpinnerExample,
  "stack": StackExample,
  "surface": SurfaceExample,
  "switch": SwitchExample,
  "table": TableExample,
  "toggle": ToggleExample,
  "split-button": SplitButtonExample,
  "button-group": ButtonGroupExample,
  carousel: CarouselExample,
  "tabs": TabsExample,
  "text-area": TextAreaExample,
  "text-field": TextFieldExample,
  "text": TextExample,
  "tooltip": TooltipExample,
  "nav-tree": NavTreeExample,
  "tree": TreeExample,
  "theme": ThemeExample,
  "accordion.sizes": AccordionSizesExample,
  "accordion.multiple": AccordionMultipleExample,
  "accordion.controlled": AccordionControlledExample,
  "accordion.in-a-card": AccordionInACardExample,
  "alert-dialog.sizes": AlertDialogSizesExample,
  "alert-dialog.tones": AlertDialogTonesExample,
  "alert-dialog.controlled": AlertDialogControlledExample,
  "alert-dialog.from-a-menu": AlertDialogFromAMenuExample,
  "alert-dialog.rtl": AlertDialogRtlExample,
  "attachment.states": AttachmentStatesExample,
  "attachment.sizes": AttachmentSizesExample,
  "attachment.live-upload": AttachmentLiveUploadExample,
  "avatar-group.sizes": AvatarGroupSizesExample,
  "avatar-group.overflow": AvatarGroupOverflowExample,
  "avatar-group.with-a-label": AvatarGroupWithALabelExample,
  "avatar.sizes": AvatarSizesExample,
  "avatar.fallbacks": AvatarFallbacksExample,
  "avatar.badges": AvatarBadgesExample,
  "avatar.with-a-name": AvatarWithANameExample,
  "avatar.with-controls": AvatarWithControlsExample,
  "avatar.in-a-button": AvatarInAButtonExample,
  "badge.counts": BadgeCountsExample,
  "badge.dots": BadgeDotsExample,
  "badge.tones": BadgeTonesExample,
  "badge.sizes": BadgeSizesExample,
  "badge.on-an-avatar": BadgeOnAnAvatarExample,
  "badge.in-tabs": BadgeInTabsExample,
  "badge.in-a-list": BadgeInAListExample,
  "badge.conditional": BadgeConditionalExample,
  "blockquote.sizes": BlockquoteSizesExample,
  "blockquote.emphasis": BlockquoteEmphasisExample,
  "blockquote.tones": BlockquoteTonesExample,
  "blockquote.with-attribution": BlockquoteWithAttributionExample,
  "blockquote.in-an-article": BlockquoteInAnArticleExample,
  "box.padding": BoxPaddingExample,
  "box.spacing-a-control": BoxSpacingAControlExample,
  "box.responsive": BoxResponsiveExample,
  "box.container": BoxContainerExample,
  "box.bleed": BoxBleedExample,
  "box.backdrop": BoxBackdropExample,
  "box.render": BoxRenderExample,
  "breadcrumb.sizes": BreadcrumbSizesExample,
  "breadcrumb.short-path": BreadcrumbShortPathExample,
  "breadcrumb.collapsed-levels": BreadcrumbCollapsedLevelsExample,
  "breadcrumb.page-header": BreadcrumbPageHeaderExample,
  "breadcrumb.rtl": BreadcrumbRtlExample,
  "button-group.sizes": ButtonGroupSizesExample,
  "button-group.icon-only": ButtonGroupIconOnlyExample,
  "button-group.bordered": ButtonGroupBorderedExample,
  "button-group.pagination": ButtonGroupPaginationExample,
  "button.emphasis": ButtonEmphasisExample,
  "button.tones": ButtonTonesExample,
  "button.sizes": ButtonSizesExample,
  "button.with-icons": ButtonWithIconsExample,
  "button.icon-only": ButtonIconOnlyExample,
  "button.states": ButtonStatesExample,
  "button.done": ButtonDoneExample,
  "button.as-link": ButtonAsLinkExample,
  "button.in-a-form": ButtonInAFormExample,
  "card.sizes": CardSizesExample,
  "card.as-a-link": CardAsALinkExample,
  "card.as-a-button": CardAsAButtonExample,
  "card.choice": CardChoiceExample,
  "card.disabled": CardDisabledExample,
  "card.responsive-grid": CardResponsiveGridExample,
  "card.settings": CardSettingsExample,
  "carousel.with-icons": CarouselWithIconsExample,
  "carousel.labelled-by-heading": CarouselLabelledByHeadingExample,
  "carousel.buttons-at-the-ends": CarouselButtonsAtTheEndsExample,
  "carousel.rtl": CarouselRtlExample,
  "checkbox.sizes": CheckboxSizesExample,
  "checkbox.in-a-form": CheckboxInAFormExample,
  "checkbox.select-all": CheckboxSelectAllExample,
  "checkbox.disabled": CheckboxDisabledExample,
  "checkbox.controlled": CheckboxControlledExample,
  "checkbox.in-a-card": CheckboxInACardExample,
  "chip.tones": ChipTonesExample,
  "chip.sizes": ChipSizesExample,
  "chip.beside-a-heading": ChipBesideAHeadingExample,
  "chip.in-a-table": ChipInATableExample,
  "code-block.with-topbar": CodeBlockWithTopbarExample,
  "code-block.max-lines": CodeBlockMaxLinesExample,
  "code-block.with-footer": CodeBlockWithFooterExample,
  "code-block.sizes": CodeBlockSizesExample,
  "code-block.in-a-card": CodeBlockInACardExample,
  "code.inherited-size": CodeInheritedSizeExample,
  "code.tones": CodeTonesExample,
  "code.emphasis": CodeEmphasisExample,
  "code.in-a-table": CodeInATableExample,
  "combobox.groups": ComboboxGroupsExample,
  "combobox.object-options": ComboboxObjectOptionsExample,
  "combobox.controlled": ComboboxControlledExample,
  "combobox.in-a-form": ComboboxInAFormExample,
  "combobox.disabled": ComboboxDisabledExample,
  "combobox.with-icon": ComboboxWithIconExample,
  "combobox.sizes": ComboboxSizesExample,
  "command.flat": CommandFlatExample,
  "command.keyboard-shortcut": CommandKeyboardShortcutExample,
  "command.places": CommandPlacesExample,
  "command.app-filtering": CommandAppFilteringExample,
  "command.stays-open": CommandStaysOpenExample,
  "composer.with-notices": ComposerWithNoticesExample,
  "composer.confirmation": ComposerConfirmationExample,
  "composer.with-context": ComposerWithContextExample,
  "composer.request-states": ComposerRequestStatesExample,
  "composer.disabled": ComposerDisabledExample,
  "composer.with-select": ComposerWithSelectExample,
  "context-menu.groups": ContextMenuGroupsExample,
  "context-menu.shortcuts": ContextMenuShortcutsExample,
  "context-menu.checkable": ContextMenuCheckableExample,
  "context-menu.submenu": ContextMenuSubmenuExample,
  "context-menu.disabled": ContextMenuDisabledExample,
  "context-menu.per-row": ContextMenuPerRowExample,
  "dialog.in-a-form": DialogInAFormExample,
  "dialog.controlled": DialogControlledExample,
  "dialog.scrolling-content": DialogScrollingContentExample,
  "dialog.unsaved-changes": DialogUnsavedChangesExample,
  "dialog.from-a-menu": DialogFromAMenuExample,
  "field.required": FieldRequiredExample,
  "field.validation": FieldValidationExample,
  "field.server-error": FieldServerErrorExample,
  "field.disabled": FieldDisabledExample,
  "field.checkboxes": FieldCheckboxesExample,
  "field.with-select": FieldWithSelectExample,
  "field.with-text-area": FieldWithTextAreaExample,
  "flex.space-between": FlexSpaceBetweenExample,
  "flex.wrap": FlexWrapExample,
  "flex.grow": FlexGrowExample,
  "flex.responsive": FlexResponsiveExample,
  "flex.baseline": FlexBaselineExample,
  "flex.inline": FlexInlineExample,
  "grid.responsive": GridResponsiveExample,
  "grid.areas": GridAreasExample,
  "grid.spanning": GridSpanningExample,
  "grid.gap-axes": GridGapAxesExample,
  "grid.in-a-form": GridInAFormExample,
  "grid.container": GridContainerExample,
  "heading.sizes": HeadingSizesExample,
  "heading.levels": HeadingLevelsExample,
  "heading.emphasis": HeadingEmphasisExample,
  "heading.tones": HeadingTonesExample,
  "heading.in-a-card": HeadingInACardExample,
  "kbd.sizes": KbdSizesExample,
  "kbd.combinations": KbdCombinationsExample,
  "kbd.in-a-menu": KbdInAMenuExample,
  "kbd.shortcut-list": KbdShortcutListExample,
  "link.sizes": LinkSizesExample,
  "link.tones": LinkTonesExample,
  "link.external": LinkExternalExample,
  "link.standalone": LinkStandaloneExample,
  "list.ordered": ListOrderedExample,
  "list.resumed": ListResumedExample,
  "list.sizes": ListSizesExample,
  "list.emphasis": ListEmphasisExample,
  "list.tones": ListTonesExample,
  "list.in-a-card": ListInACardExample,
  "menu.sizes": MenuSizesExample,
  "menu.with-icons": MenuWithIconsExample,
  "menu.checkbox-items": MenuCheckboxItemsExample,
  "menu.radio-items": MenuRadioItemsExample,
  "menu.submenu": MenuSubmenuExample,
  "menu.links": MenuLinksExample,
  "menu.placement": MenuPlacementExample,
  "message-scroller.streaming": MessageScrollerStreamingExample,
  "message-scroller.open-at-start": MessageScrollerOpenAtStartExample,
  "message-scroller.jump-to-message": MessageScrollerJumpToMessageExample,
  "message-scroller.custom-button": MessageScrollerCustomButtonExample,
  "nav-tree.in-a-sidebar": NavTreeInASidebarExample,
  "nav-tree.sizes": NavTreeSizesExample,
  "nav-tree.with-icons": NavTreeWithIconsExample,
  "nav-tree.controlled": NavTreeControlledExample,
  "nav-tree.router-links": NavTreeRouterLinksExample,
  "nav-tree.rtl": NavTreeRtlExample,
  "notice.tones": NoticeTonesExample,
  "notice.with-icon": NoticeWithIconExample,
  "notice.dismissible": NoticeDismissibleExample,
  "notice.sizes": NoticeSizesExample,
  "notice.confirmation": NoticeConfirmationExample,
  "notice.above-a-region": NoticeAboveARegionExample,
  "number-field.sizes": NumberFieldSizesExample,
  "number-field.format": NumberFieldFormatExample,
  "number-field.steps": NumberFieldStepsExample,
  "number-field.controlled": NumberFieldControlledExample,
  "number-field.states": NumberFieldStatesExample,
  "number-field.in-a-form": NumberFieldInAFormExample,
  "page.outside-a-frame": PageOutsideAFrameExample,
  "page.title-only": PageTitleOnlyExample,
  "page.with-mark": PageWithMarkExample,
  "page.band-in-flow": PageBandInFlowExample,
  "popover.placement": PopoverPlacementExample,
  "popover.sizes": PopoverSizesExample,
  "popover.filter-panel": PopoverFilterPanelExample,
  "popover.controlled": PopoverControlledExample,
  "popover.details": PopoverDetailsExample,
  "progress.labelled": ProgressLabelledExample,
  "progress.indeterminate": ProgressIndeterminateExample,
  "progress.range": ProgressRangeExample,
  "progress.in-a-card": ProgressInACardExample,
  "radio-group.horizontal": RadioGroupHorizontalExample,
  "radio-group.controlled": RadioGroupControlledExample,
  "radio-group.in-a-form": RadioGroupInAFormExample,
  "radio-group.disabled": RadioGroupDisabledExample,
  "radio.sizes": RadioSizesExample,
  "radio.with-descriptions": RadioWithDescriptionsExample,
  "radio.disabled": RadioDisabledExample,
  "radio.wrapping-label": RadioWrappingLabelExample,
  "row.sizes": RowSizesExample,
  "row.leading-and-trailing": RowLeadingAndTrailingExample,
  "row.links": RowLinksExample,
  "row.highlighted": RowHighlightedExample,
  "row.read-only": RowReadOnlyExample,
  "row.destructive": RowDestructiveExample,
  "scroll-area.fade": ScrollAreaFadeExample,
  "scroll-area.horizontal": ScrollAreaHorizontalExample,
  "scroll-area.in-a-card": ScrollAreaInACardExample,
  "scroll-area.named-region": ScrollAreaNamedRegionExample,
  "segmented-control.with-icons": SegmentedControlWithIconsExample,
  "segmented-control.icon-only": SegmentedControlIconOnlyExample,
  "segmented-control.controlled": SegmentedControlControlledExample,
  "segmented-control.disabled": SegmentedControlDisabledExample,
  "segmented-control.in-a-toolbar": SegmentedControlInAToolbarExample,
  "select.in-a-form": SelectInAFormExample,
  "select.controlled": SelectControlledExample,
  "select.placeholder": SelectPlaceholderExample,
  "select.disabled-control": SelectDisabledControlExample,
  "select.long-list": SelectLongListExample,
  "select.beside-a-text-field": SelectBesideATextFieldExample,
  "separator.in-a-toolbar": SeparatorInAToolbarExample,
  "separator.labelled": SeparatorLabelledExample,
  "separator.in-a-card": SeparatorInACardExample,
  "sheet.bottom": SheetBottomExample,
  "sheet.inline-start": SheetInlineStartExample,
  "sheet.controlled": SheetControlledExample,
  "sheet.long-content": SheetLongContentExample,
  "sheet.rtl": SheetRtlExample,
  "shell.header": ShellHeaderExample,
  "shell.rail": ShellRailExample,
  "shell.inspector": ShellInspectorExample,
  "shell.bottom-pane": ShellBottomPaneExample,
  "shell.floating": ShellFloatingExample,
  "shell.grounded": ShellGroundedExample,
  "shell.resizable": ShellResizableExample,
  "shell.controlled": ShellControlledExample,
  "slider.range": SliderRangeExample,
  "slider.controlled": SliderControlledExample,
  "slider.steps": SliderStepsExample,
  "slider.disabled": SliderDisabledExample,
  "slider.in-a-form": SliderInAFormExample,
  "slider.rtl": SliderRtlExample,
  "spinner.in-a-button": SpinnerInAButtonExample,
  "spinner.with-a-label": SpinnerWithALabelExample,
  "spinner.colour": SpinnerColourExample,
  "spinner.sizes": SpinnerSizesExample,
  "split-button.sizes": SplitButtonSizesExample,
  "split-button.emphasis": SplitButtonEmphasisExample,
  "split-button.tones": SplitButtonTonesExample,
  "split-button.with-icon": SplitButtonWithIconExample,
  "split-button.disabled": SplitButtonDisabledExample,
  "split-button.menu-groups": SplitButtonMenuGroupsExample,
  "stack.gap": StackGapExample,
  "stack.alignment": StackAlignmentExample,
  "stack.nested-groups": StackNestedGroupsExample,
  "stack.with-separators": StackWithSeparatorsExample,
  "stack.responsive": StackResponsiveExample,
  "stack.render": StackRenderExample,
  "surface.sizes": SurfaceSizesExample,
  "surface.holding-cards": SurfaceHoldingCardsExample,
  "surface.in-a-card": SurfaceInACardExample,
  "surface.as-a-layout": SurfaceAsALayoutExample,
  "surface.bleed": SurfaceBleedExample,
  "switch.sizes": SwitchSizesExample,
  "switch.controlled": SwitchControlledExample,
  "switch.disabled": SwitchDisabledExample,
  "switch.with-description": SwitchWithDescriptionExample,
  "switch.settings-card": SwitchSettingsCardExample,
  "switch.in-a-form": SwitchInAFormExample,
  "table.sizes": TableSizesExample,
  "table.alignment": TableAlignmentExample,
  "table.wide": TableWideExample,
  "table.labelled-by-heading": TableLabelledByHeadingExample,
  "table.with-actions": TableWithActionsExample,
  "table.in-a-card": TableInACardExample,
  "tabs.with-panels": TabsWithPanelsExample,
  "tabs.sizes": TabsSizesExample,
  "tabs.controlled": TabsControlledExample,
  "tabs.disabled": TabsDisabledExample,
  "tabs.as-links": TabsAsLinksExample,
  "tabs.in-a-card": TabsInACardExample,
  "text-area.sizes": TextAreaSizesExample,
  "text-area.in-a-form": TextAreaInAFormExample,
  "text-area.controlled": TextAreaControlledExample,
  "text-area.invalid": TextAreaInvalidExample,
  "text-area.disabled-and-read-only": TextAreaDisabledAndReadOnlyExample,
  "text-area.resize": TextAreaResizeExample,
  "text-field.sizes": TextFieldSizesExample,
  "text-field.with-icons": TextFieldWithIconsExample,
  "text-field.password": TextFieldPasswordExample,
  "text-field.controlled": TextFieldControlledExample,
  "text-field.in-a-form": TextFieldInAFormExample,
  "text-field.invalid": TextFieldInvalidExample,
  "text-field.disabled": TextFieldDisabledExample,
  "text.sizes": TextSizesExample,
  "text.weights": TextWeightsExample,
  "text.emphasis": TextEmphasisExample,
  "text.tones": TextTonesExample,
  "text.paragraphs": TextParagraphsExample,
  "text.inline-elements": TextInlineElementsExample,
  "theme.appearance": ThemeAppearanceExample,
  "theme.density": ThemeDensityExample,
  "theme.radius": ThemeRadiusExample,
  "theme.depth": ThemeDepthExample,
  "theme.contrast": ThemeContrastExample,
  "theme.size": ThemeSizeExample,
  "theme.nested": ThemeNestedExample,
  "toggle.sizes": ToggleSizesExample,
  "toggle.icon-only": ToggleIconOnlyExample,
  "toggle.with-icons": ToggleWithIconsExample,
  "toggle.tones": ToggleTonesExample,
  "toggle.bordered": ToggleBorderedExample,
  "toggle.controlled": ToggleControlledExample,
  "toggle.disabled": ToggleDisabledExample,
  "toggle.vertical": ToggleVerticalExample,
  "toolbar.groups": ToolbarGroupsExample,
  "toolbar.sizes": ToolbarSizesExample,
  "toolbar.vertical": ToolbarVerticalExample,
  "toolbar.overflow": ToolbarOverflowExample,
  "toolbar.with-menu": ToolbarWithMenuExample,
  "toolbar.disabled": ToolbarDisabledExample,
  "tooltip.icon-buttons": TooltipIconButtonsExample,
  "tooltip.shortcuts": TooltipShortcutsExample,
  "tooltip.sides": TooltipSidesExample,
  "tooltip.in-a-toolbar": TooltipInAToolbarExample,
  "tooltip.controlled": TooltipControlledExample,
  "tree.with-icons": TreeWithIconsExample,
  "tree.single-select": TreeSingleSelectExample,
  "tree.controlled": TreeControlledExample,
  "tree.sizes": TreeSizesExample,
  "tree.rich-labels": TreeRichLabelsExample,
  "tree.rtl": TreeRtlExample,
};
