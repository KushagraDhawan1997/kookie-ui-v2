import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ComputerIcon,
  PlayIcon,
  Redo02Icon,
  Search01Icon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SmartPhone01Icon,
  SourceCodeIcon,
  Undo02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import {
  Box,
  Button,
  Card,
  Field,
  FieldLabel,
  Flex,
  Heading,
  SegmentedControl,
  SegmentedItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Shell,
  ShellContent,
  ShellInspector,
  ShellPaneFooter,
  ShellPaneHeader,
  ShellScroll,
  ShellSidebar,
  Slider,
  Stack,
  Text,
  TextField,
  Theme,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarTitle,
  Tree,
  iconStroke,
  type TreeNode,
} from "@kushagradhawan/kookie-ui-react";

/**
 * THE FRONT PAGE'S HERO (2026-10-22, Kushagra: "Just like we added hero in flow docs"). A real
 * builder, laid out like this site's own: layers on the left, the canvas with floating toolbars,
 * the inspector on the right. It is the same figure as kushagradhawan.com's Kookie UI page, set on
 * the line grid, running to the content pane's top, left and right edges like the Kookie Flow
 * docs' hero. The window's bottom is cropped by the band.
 */
const glyph = (icon: typeof Search01Icon) =>
  function Glyph() {
    return <HugeiconsIcon icon={icon} strokeWidth={iconStroke} aria-hidden />;
  };

const SearchIcon = glyph(Search01Icon);
const SidebarLeftGlyph = glyph(SidebarLeftIcon);
const SidebarRightGlyph = glyph(SidebarRightIcon);
const DesktopIcon = glyph(ComputerIcon);
const PhoneIcon = glyph(SmartPhone01Icon);
const PlayGlyphIcon = glyph(PlayIcon);
const UndoIcon = glyph(Undo02Icon);
const RedoIcon = glyph(Redo02Icon);
const EyeIcon = glyph(ViewIcon);
const CodeIcon = glyph(SourceCodeIcon);

const LAYERS: readonly TreeNode[] = [
  {
    id: "page",
    label: "Page",
    children: [
      {
        id: "card",
        label: "Card",
        children: [
          { id: "heading", label: "Heading" },
          { id: "intro", label: "Text" },
          { id: "email", label: "Field", children: [{ id: "email-label", label: "FieldLabel" }, { id: "email-input", label: "TextField" }] },
          { id: "password", label: "Field", children: [{ id: "password-input", label: "TextField" }] },
          { id: "actions", label: "Flex", children: [{ id: "cancel", label: "Button" }, { id: "submit", label: "Button" }] },
        ],
      },
    ],
  },
];

/** The side panes' widths go on the Shell, not as `width` props, so the reach the floating canvas
 *  toolbars clear is the pane's real width (the builder does the same). */
const PANE_WIDTHS = { "--shell-sidebar-w": "232px", "--shell-inspector-w": "272px" } as React.CSSProperties;

/** A complex editor in a real Shell, laid out like the Kookie UI builder: layers on the left,
 *  the canvas in the middle with toolbars floating over it, the inspector on the right. The side
 *  panes sit flush with the window edge. */
function Builder() {
  return (
    <Theme size="1" className="kd-hero-window">
      <Shell contained size="1" className="kd-hero-shell" style={PANE_WIDTHS}>
        <ShellSidebar aria-label="Layers" defaultOpen presentation="fixed" flush>
          <ShellPaneHeader>
            <Toolbar backdrop>
              <SegmentedControl defaultValue="layers" aria-label="Panel">
                <SegmentedItem value="layers">Layers</SegmentedItem>
                <SegmentedItem value="add">Add</SegmentedItem>
              </SegmentedControl>
              <ToolbarButton iconOnly aria-label="Search">
                <SearchIcon />
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll fade>
            <Tree
              items={LAYERS}
              aria-label="Layers"
              defaultExpandedIds={["page", "card", "email", "actions"]}
              defaultSelectedIds={["submit"]}
            />
          </ShellScroll>
        </ShellSidebar>
        <ShellContent>
          <ShellPaneHeader float>
            <Toolbar backdrop>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Layers">
                  <SidebarLeftGlyph />
                </ToolbarButton>
                <ToolbarTitle>Sign in</ToolbarTitle>
              </Flex>
              <Flex align="center" gap="2">
                <ToolbarGroup>
                  <ToolbarButton iconOnly aria-label="Desktop">
                    <DesktopIcon />
                  </ToolbarButton>
                  <ToolbarButton iconOnly aria-label="Phone">
                    <PhoneIcon />
                  </ToolbarButton>
                </ToolbarGroup>
                <ToolbarButton iconOnly aria-label="Preview">
                  <PlayGlyphIcon />
                </ToolbarButton>
                <ToolbarButton emphasis="loud">Export</ToolbarButton>
                <ToolbarButton iconOnly aria-label="Inspector">
                  <SidebarRightGlyph />
                </ToolbarButton>
              </Flex>
            </Toolbar>
          </ShellPaneHeader>
          <div className="kd-hero-canvas">
            <Card size="3" className="kd-hero-composition">
              <Stack gap="5">
                <Stack gap="2">
                  <Heading size="6">Sign in</Heading>
                  <Text size="3" emphasis="medium">
                    Use the email for your workspace.
                  </Text>
                </Stack>
                <Stack gap="4">
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <TextField defaultValue="ada@kookie.studio" />
                  </Field>
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <TextField type="password" defaultValue="kookie-ui" />
                  </Field>
                </Stack>
                <Flex gap="2" justify="end">
                  <Button emphasis="quiet">Cancel</Button>
                  <Button emphasis="loud" className="kd-hero-selected">
                    Continue
                  </Button>
                </Flex>
              </Stack>
            </Card>
          </div>
          <ShellPaneFooter float>
            <Toolbar backdrop>
              <ToolbarGroup>
                <ToolbarButton iconOnly aria-label="Undo">
                  <UndoIcon />
                </ToolbarButton>
                <ToolbarButton iconOnly aria-label="Redo">
                  <RedoIcon />
                </ToolbarButton>
              </ToolbarGroup>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Show outlines">
                  <EyeIcon />
                </ToolbarButton>
                <ToolbarButton>100%</ToolbarButton>
              </Flex>
            </Toolbar>
          </ShellPaneFooter>
        </ShellContent>
        <ShellInspector aria-label="Inspector" defaultOpen presentation="fixed" flush>
          <ShellPaneHeader>
            <Toolbar backdrop>
              <ToolbarTitle>Button</ToolbarTitle>
              <ToolbarButton iconOnly aria-label="Show code">
                <CodeIcon />
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll fade>
            <Stack gap="5">
              <Field>
                <FieldLabel>Label</FieldLabel>
                <TextField defaultValue="Continue" />
              </Field>
              <Field>
                <FieldLabel>Size</FieldLabel>
                <SegmentedControl defaultValue="2" aria-label="Size">
                  <SegmentedItem value="1">1</SegmentedItem>
                  <SegmentedItem value="2">2</SegmentedItem>
                  <SegmentedItem value="3">3</SegmentedItem>
                  <SegmentedItem value="4">4</SegmentedItem>
                </SegmentedControl>
              </Field>
              <Field>
                <FieldLabel>Emphasis</FieldLabel>
                <Select defaultValue="loud" items={{ quiet: "Quiet", medium: "Medium", loud: "Loud" }}>
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="quiet">Quiet</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="loud">Loud</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Tone</FieldLabel>
                <Select defaultValue="accent" items={{ accent: "Accent", neutral: "Neutral", destructive: "Destructive" }}>
                  <SelectTrigger />
                  <SelectContent>
                    <SelectItem value="accent">Accent</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="destructive">Destructive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Gap</FieldLabel>
                <Slider defaultValue={40} aria-label="Gap" />
              </Field>
            </Stack>
          </ShellScroll>
        </ShellInspector>
      </Shell>
    </Theme>
  );
}

/**
 * The hero has two places. On a phone it sits under the title and the intro, so the first screen
 * says what the page is (Kushagra, 2026-10-22); on a wider window it runs to the pane's top edge.
 * The page renders both and CSS shows one per width.
 */
export function Hero({ placement = "top" }: { placement?: "top" | "inline" }) {
  const inline = placement === "inline";
  return (
    <Box
      {...(inline ? {} : { mt: "bleed" as const })}
      mx="bleed"
      className="kd-hero"
      data-placement={placement}
      aria-hidden
      inert
    >
      <div className="kd-hero-stage">
        <Builder />
      </div>
    </Box>
  );
}
