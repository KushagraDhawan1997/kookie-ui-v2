import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@kushagradhawan/kookie-ui-react";

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Stack gap="6">
          <Stack gap="2">
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>They get an email with a link to join.</DialogDescription>
          </Stack>

          <Field>
            <FieldLabel>Email</FieldLabel>
            <TextField type="email" placeholder="mira@kookie.dev" />
            <FieldDescription>Use their work address.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Role</FieldLabel>
            <RadioGroup defaultValue="editor">
              <Stack gap="4">
                <FieldItem>
                  <Radio value="viewer" />
                  <FieldLabel>Viewer</FieldLabel>
                  <FieldDescription>Can read and comment.</FieldDescription>
                </FieldItem>
                <FieldItem>
                  <Radio value="editor" />
                  <FieldLabel>Editor</FieldLabel>
                  <FieldDescription>Can change content.</FieldDescription>
                </FieldItem>
                <FieldItem>
                  <Radio value="admin" />
                  <FieldLabel>Admin</FieldLabel>
                  <FieldDescription>Can manage people and billing.</FieldDescription>
                </FieldItem>
              </Stack>
            </RadioGroup>
          </Field>

          <Flex gap="3" justify="flex-end">
            <DialogClose render={<Button emphasis="quiet">Cancel</Button>} />
            <Button emphasis="loud">Send invite</Button>
          </Flex>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
