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
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Flex,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Toolbar,
  ToolbarButton,
  ToolbarTitle,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

export default function Invite() {
  return (
    <Dialog>
      <DialogTrigger render={<Button>Invite teammate</Button>} />
      <DialogContent>
        <Toolbar>
          <ToolbarTitle render={<DialogTitle />}>Invite a teammate</ToolbarTitle>
          <DialogClose
            render={
              <ToolbarButton iconOnly aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={iconStroke} aria-hidden />
              </ToolbarButton>
            }
          />
        </Toolbar>
        <Stack gap="6">
          <DialogDescription>They get an email with a link to join.</DialogDescription>

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
