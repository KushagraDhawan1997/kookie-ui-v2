import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, Home01Icon, Menu01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Row,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  Stack,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Home01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// `side="inline-start"` opens the panel from the side where reading starts: the left in
// English. It is a common place for navigation on a narrow window.
export default function Example() {
  return (
    <Sheet side="inline-start">
      <SheetTrigger
        render={
          <Button iconOnly emphasis="quiet" aria-label="Open navigation">
            {icon(Menu01Icon)}
          </Button>
        }
      />
      <SheetContent>
        <Stack gap="5">
          <SheetTitle>Workspace</SheetTitle>
          <Stack gap="1">
            <Row current leading={icon(Home01Icon)} render={<a href="#overview" />}>
              Overview
            </Row>
            <Row leading={icon(Folder01Icon)} render={<a href="#projects" />}>
              Projects
            </Row>
            <Row leading={icon(Settings02Icon)} render={<a href="#settings" />}>
              Settings
            </Row>
          </Stack>
          <SheetClose render={<Button emphasis="quiet" bordered>Close</Button>} />
        </Stack>
      </SheetContent>
    </Sheet>
  );
}
