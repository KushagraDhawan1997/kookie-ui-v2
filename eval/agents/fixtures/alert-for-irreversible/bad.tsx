import { Button, Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@kushagradhawan/kookie-ui-react";

// A permanent delete confirmed in a plain Dialog.
export default function App() {
  return (
    <Dialog>
      <DialogTrigger render={<Button tone="destructive">Delete project</Button>} />
      <DialogContent>
        <DialogTitle>Delete this project?</DialogTitle>
        <DialogClose render={<Button>Keep it</Button>} />
        <Button tone="destructive" emphasis="loud">Delete project</Button>
      </DialogContent>
    </Dialog>
  );
}
