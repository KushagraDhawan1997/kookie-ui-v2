import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Flex,
  ScrollArea,
  Stack,
  Text,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const CHANGES = [
  "Projects can now have a custom domain.",
  "Invoices download as PDF from the billing page.",
  "Search finds archived projects.",
  "Teams can require single sign-on.",
  "The activity log keeps 90 days of history.",
  "API keys can expire on a date you choose.",
  "Comments support mentions of whole teams.",
  "Exports include file attachments.",
  "Workspace owners can transfer ownership.",
  "Notifications can be paused for a week.",
  "Deploy previews get their own URL.",
  "Dark mode follows your system setting.",
];

// Set a `maxHeight` on DialogContent and put a ScrollArea inside it. The
// list scrolls, and the title and the button stay in view.
export default function Example() {
  return (
    <Dialog>
      <DialogTrigger render={<Button emphasis="medium">What’s new</Button>} />
      <DialogContent style={{ maxHeight: "28rem" }}>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>What’s new</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <DialogDescription>Twelve changes shipped this month.</DialogDescription>
        <ScrollArea>
          <Stack gap="3">
            {CHANGES.map((change) => (
              <Text key={change}>{change}</Text>
            ))}
          </Stack>
        </ScrollArea>
        <Flex justify="flex-end">
          <DialogClose render={<Button emphasis="loud">Got it</Button>} />
        </Flex>
      </DialogContent>
    </Dialog>
  );
}
