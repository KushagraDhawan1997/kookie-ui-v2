import { Button, Dialog, DialogContent, DialogTitle, Field, FieldLabel, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

// No DialogClose: a touch screen reader user has no button to leave by.
export default function App() {
  return (
    <Dialog>
      <DialogContent>
        <Stack gap="4">
          <DialogTitle>Invite a teammate</DialogTitle>
          <Field><FieldLabel>Email address</FieldLabel><TextField /></Field>
          <Button tone="accent" emphasis="loud">Send invite</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
