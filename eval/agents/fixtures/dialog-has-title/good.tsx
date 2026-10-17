import { Button, Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger, Field, FieldLabel, Flex, Select, SelectContent, SelectItem, SelectTrigger, Stack, TextField } from "@kushagradhawan/kookie-ui-react";

export default function App() {
  return (
    <Dialog>
      <DialogTrigger render={<Button tone="accent" emphasis="loud">Invite teammates</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join.</DialogDescription>
          </Stack>
          <Stack gap="4">
            <Field>
              <FieldLabel>Email address</FieldLabel>
              <TextField type="email" />
            </Field>
            <Field>
              <FieldLabel>Role</FieldLabel>
              <Select defaultValue="member">
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Stack>
          <Flex justify="flex-end" gap="3">
            <DialogClose render={<Button>Cancel</Button>} />
            <Button tone="accent" emphasis="loud">Send invite</Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
