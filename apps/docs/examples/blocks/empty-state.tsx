import { Button } from "@kookie-ui/react";

import { EmptyState } from "../../blocks/empty-state";

export default function Example() {
  return (
    <EmptyState
      title="No projects yet"
      description="A project holds your files, your team and everything they ship."
      action={<Button emphasis="loud">New project</Button>}
      secondary={<Button emphasis="quiet">Import from GitHub</Button>}
    />
  );
}
