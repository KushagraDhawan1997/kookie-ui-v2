import { Button, Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger, Field, FieldLabel, TextField } from "@kushagradhawan/kookie-ui-react";

// modality.md:65: a type-to-confirm field makes the panel a Dialog, not an alert.
export default function App() {
  return (
    <Dialog>
      <DialogTrigger render={<Button tone="destructive">Delete project</Button>} />
      <DialogContent>
        <DialogTitle>Delete this project?</DialogTitle>
        <Field>
          <FieldLabel>Type the project name to confirm</FieldLabel>
          <TextField />
        </Field>
        <DialogClose render={<Button>Keep it</Button>} />
        <Button tone="destructive" emphasis="loud">Delete project</Button>
      </DialogContent>
    </Dialog>
  );
}
