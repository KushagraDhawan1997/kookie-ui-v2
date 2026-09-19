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
} from "@kookie-ui/react";

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
        <Stack gap="5">
          <Stack gap="2">
            <DialogTitle>What’s new</DialogTitle>
            <DialogDescription>Twelve changes shipped this month.</DialogDescription>
          </Stack>
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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
