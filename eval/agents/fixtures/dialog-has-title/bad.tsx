import { Button, Dialog, DialogClose, DialogContent, Field, FieldLabel, Heading, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// A Heading looks like a title, but the dialog has no DialogTitle to be announced by.
export default function App() {
  return (
    <Dialog>
      <DialogContent>
        <Stack gap="4">
          <Heading size="6">Invite a teammate</Heading>
          <Field><FieldLabel>Email address</FieldLabel><TextField /></Field>
          <DialogClose render={<Button>Cancel</Button>} />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
