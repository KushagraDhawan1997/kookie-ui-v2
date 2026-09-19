import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Share08Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Flex,
  Heading,
  Page,
  Shell,
  ShellContent,
  ShellPaneHeader,
  ShellScroll,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kookie-ui/react";

const icon = (glyph: typeof Share08Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

const SECTIONS = [
  { title: "Usage", words: "The project used 1.8 million requests this month, 12% more than last month." },
  { title: "Errors", words: "The error rate stayed under 0.2% on every day except the 14th." },
  { title: "Latency", words: "Median latency was 84 milliseconds. The slowest region was Mumbai." },
  { title: "Cost", words: "Compute cost $412, and storage cost $38, for a total of $450." },
];

// The header sits in flow here, without `float`. The same Page still clears it.
export default function Example() {
  return (
    <Box height="30rem" m="bleed">
      <Shell contained>
        <ShellContent>
          <ShellPaneHeader>
            <Toolbar>
              <Flex align="center" gap="2">
                <ToolbarButton iconOnly aria-label="Back to projects">
                  {icon(ArrowLeft01Icon)}
                </ToolbarButton>
                <ToolbarTitle />
              </Flex>
              <ToolbarButton iconOnly aria-label="Share report">
                {icon(Share08Icon)}
              </ToolbarButton>
            </Toolbar>
          </ShellPaneHeader>
          <ShellScroll>
            <Page title="Monthly report" description="Payments API, September.">
              {SECTIONS.map((section) => (
                <Stack key={section.title} gap="3">
                  <Heading size="6">{section.title}</Heading>
                  <Text size="3" emphasis="medium">{section.words}</Text>
                </Stack>
              ))}
            </Page>
          </ShellScroll>
        </ShellContent>
      </Shell>
    </Box>
  );
}
