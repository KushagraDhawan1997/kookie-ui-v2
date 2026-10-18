# Attachment

Attachment shows one file and the state of its upload, before or after you send it.

Job: Know. Learn the state of something. A leaf: it does one thing.

```tsx
<Attachment state="uploading" progress={0.62} icon={fileIcon} meta="2.4 MB" onRemove={remove}>
  quarterly-report.pdf
</Attachment>
```

## Overview

An attachment shows one file as a small tile with the file name, an optional second line such as the size, an icon and an optional remove button. It also shows what is happening to the file: ready, uploading, being processed on the server, or failed.

Use it wherever a file appears: in a Composer before you send a message, in the message after you send it, or under a form field. A file that is about to be sent and a file that is already sent use the same tile, which is why the tile is a separate component from the Composer.

Your app keeps the file, and the tile only shows what you tell it. It never reads a `File`, starts a timer or creates a URL. Set `state`, `progress` and `meta` from the data that your upload code already has.

Set `state="uploading"` with a `progress` from 0 to 1 to fill a ring around the icon. Without `progress`, and in the `processing` state, a short segment moves around the ring instead. For the `error` state, the tile turns red, and you should write the reason in `meta`, because colour alone does not tell people what went wrong. Without an `icon`, the tile shows a generic file icon.

The remove button appears only when you pass `onRemove`, and your app then removes the file from its own list. The button's accessible name is "Remove" followed by the file name, and you can set `removeLabel` to translate the first word.

`size` sets the padding, the corner, the icon, the remove button and the text size of the name. Set `backdrop` when content passes behind the tile, so the tile uses your Theme's material. A screen reader hears the file name as the tile's name, the second line as its description, and a busy state while the file uploads or is processed.

## Not supported

- A done state — A file that is sent looks the same as a file that is ready to send. To show the difference, change what is in the tile, such as a remove button before sending and a download link after.
- `tone` — The tile's `state` already sets its colour, and the `error` state shows it in red. A separate `tone` would let a failed upload show as a success.
- Holding the file — The tile never reads a file, uploads it or creates a URL for it, because your app already manages the file. Give the tile a name, a state and an icon.
- A built-in preview — The tile does not load or decode images. To show a thumbnail, create it in your app and pass it as an `img` in the `icon` slot.
- `emphasis` — Every tile has the same strength, because no file is more important than another. Only an `error` state makes a tile stand out.
- A shadow — A tile is content inside another surface, such as a composer or a message, so it draws no shadow. Its border marks its edge instead.
- `render` — The tile is made of several elements, including the name and the remove button, so there is no single element that `render` could replace.

## Examples

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { File01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  iconStroke,
  type AttachmentState,
  type Size,
} from "@kushagradhawan/kookie-ui-react";

// The state is yours to set from what your upload already knows. `progress` is read only
// while uploading; the other states ignore it, so it can stay written.
export default function Example({
  size = "2",
  state = "idle",
  backdrop = false,
}: {
  size?: Size;
  state?: AttachmentState;
  backdrop?: boolean;
}) {
  return (
    <Attachment
      size={size}
      state={state}
      backdrop={backdrop}
      progress={0.62}
      icon={<HugeiconsIcon icon={File01Icon} strokeWidth={iconStroke} />}
      meta="2.4 MB"
      onRemove={() => {}}
    >
      quarterly-report.pdf
    </Attachment>
  );
}
```

### Every state

One tile for each state. An `uploading` tile with a `progress` fills its ring, and one without a `progress` shows a moving segment. `processing` means the server is working on the file, and the `error` tile says why in `meta`.

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { FileZipIcon, Image01Icon, Pdf01Icon } from "@hugeicons/core-free-icons";
import { Attachment, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Set `state` from what your upload already knows. `uploading` with a `progress` fills the
// ring. Without a `progress`, the ring sweeps. `processing` means the server is working on
// the file and reports no fraction. An `error` tile says why in `meta`.
export default function Example() {
  return (
    <Stack gap="2" style={{ minWidth: "20rem" }}>
      <Attachment icon={icon(Pdf01Icon)} meta="1.2 MB" onRemove={() => {}}>
        contract-signed.pdf
      </Attachment>
      <Attachment state="uploading" progress={0.62} icon={icon(Image01Icon)} meta="62% of 4.1 MB" onRemove={() => {}}>
        office-floorplan.png
      </Attachment>
      <Attachment state="uploading" icon={icon(Image01Icon)} meta="Uploading" onRemove={() => {}}>
        team-photo.jpg
      </Attachment>
      <Attachment state="processing" icon={icon(FileZipIcon)} meta="Scanning for viruses" onRemove={() => {}}>
        assets-export.zip
      </Attachment>
      <Attachment state="error" icon={icon(Pdf01Icon)} meta="Larger than 25 MB" onRemove={() => {}}>
        annual-report.pdf
      </Attachment>
    </Stack>
  );
}
```

### Sizes

`size` sets the whole tile: its padding, its corner, the icon, the remove button and the file name. At size 2, the remove button is as tall as a size 2 Button.

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon } from "@hugeicons/core-free-icons";
import { Attachment, Stack, iconStroke } from "@kushagradhawan/kookie-ui-react";

const sizes = ["1", "2", "3", "4"] as const;

// `size` sets the whole tile: its padding, its corner, the icon, the remove button and the
// file name. At size 2 the remove button is as tall as a size 2 Button.
export default function Example() {
  return (
    <Stack gap="3" align="start">
      {sizes.map((size) => (
        <Attachment
          key={size}
          size={size}
          icon={<HugeiconsIcon icon={Pdf01Icon} strokeWidth={iconStroke} aria-hidden />}
          meta="1.2 MB"
          onRemove={() => {}}
        >
          proposal-v3.pdf
        </Attachment>
      ))}
    </Stack>
  );
}
```

### A live upload

The tile has no timer of its own. Your upload code changes `state` and `progress`, and the tile shows the values you give it. In this example, a timer stands in for a real upload.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileZipIcon } from "@hugeicons/core-free-icons";
import { Attachment, Button, Stack, iconStroke, type AttachmentState } from "@kushagradhawan/kookie-ui-react";

// The tile keeps no timer and holds no file. Your upload code updates `state` and `progress`,
// and the tile draws what you give it. A timer stands in for the upload here.
export default function Example() {
  const [state, setState] = React.useState<AttachmentState>("idle");
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (state === "uploading") {
      if (progress >= 1) {
        setState("processing");
        return;
      }
      const id = setTimeout(() => setProgress((p) => Math.min(1, p + 0.1)), 250);
      return () => clearTimeout(id);
    }
    if (state === "processing") {
      const id = setTimeout(() => setState("idle"), 1500);
      return () => clearTimeout(id);
    }
  }, [state, progress]);

  const meta =
    state === "uploading"
      ? `${Math.round(progress * 100)}% of 18 MB`
      : state === "processing"
        ? "Checking the archive"
        : "18 MB";

  return (
    <Stack gap="3" align="start" style={{ minWidth: "20rem" }}>
      <Attachment
        state={state}
        progress={progress}
        icon={<HugeiconsIcon icon={FileZipIcon} strokeWidth={iconStroke} aria-hidden />}
        meta={meta}
      >
        design-assets.zip
      </Attachment>
      <Button
        emphasis="medium"
        disabled={state !== "idle"}
        onClick={() => {
          setProgress(0);
          setState("uploading");
        }}
      >
        Upload again
      </Button>
    </Stack>
  );
}
```

### In a composer, before sending

The tiles sit in a row above the text, inside the composer, and each one has a remove button. The list belongs to your app, so removing a file means filtering your own array.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUp02Icon,
  Attachment01Icon,
  FileImageIcon,
  FileVideoIcon,
  Pdf01Icon,
} from "@hugeicons/core-free-icons";
import {
  Attachment,
  Button,
  Composer,
  ComposerInput,
  ComposerRow,
  ComposerSend,
  Flex,
  iconStroke,
  type Size,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// Before sending: the tiles sit in a strip above the text, each with a remove. The list is
// the app's, so removing one is filtering your own array.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  const [files, setFiles] = React.useState([
    { name: "brief.pdf", meta: "1.2 MB", glyph: Pdf01Icon },
    { name: "hero-final.png", meta: "3.8 MB", glyph: FileImageIcon },
    { name: "walkthrough.mp4", meta: "42% of 18 MB", glyph: FileVideoIcon, progress: 0.42 },
  ]);

  return (
    <Composer size={size} backdrop={backdrop} onSubmit={() => setFiles([])} onFiles={() => {}}>
      <Flex gap="2" wrap="wrap">
        {files.map((file) => (
          <Attachment
            key={file.name}
            size={size}
            state={file.progress === undefined ? "idle" : "uploading"}
            {...(file.progress === undefined ? {} : { progress: file.progress })}
            icon={icon(file.glyph)}
            meta={file.meta}
            onRemove={() => setFiles((rest) => rest.filter((f) => f !== file))}
          >
            {file.name}
          </Attachment>
        ))}
      </Flex>
      <ComposerInput aria-label="Message" placeholder="Add a note for the reviewer…" />
      <ComposerRow>
        <Button iconOnly aria-label="Add attachment">
          {icon(Attachment01Icon)}
        </Button>
        <ComposerSend icons={{ ready: icon(ArrowUp02Icon) }} />
      </ComposerRow>
    </Composer>
  );
}
```

### In a message, after sending

The same tile appears in a sent message, without a remove button. An image file can show its own picture in the `icon` slot.

```tsx
import { HugeiconsIcon } from "@hugeicons/react";
import { Pdf01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  Avatar,
  Card,
  Flex,
  Stack,
  Text,
  iconStroke,
  type Size,
} from "@kushagradhawan/kookie-ui-react";

// After sending: the same tile, in the message, with no remove. Nothing about it changed
// except what the app put in it. A picture file shows its own picture. The card is the pane,
// so it is what states the backdrop; the tiles inside it resolve solid.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  return (
    <Card backdrop={backdrop} style={{ maxWidth: "28rem" }}>
      <Flex gap="3" align="start">
        <Avatar size="7" fallback="SB" />
        <Stack gap="4" flexGrow="1">
          <Stack gap="2">
            <Flex gap="2" align="baseline">
              <Text weight="medium">Shruti Bhatia</Text>
              <Text size="2" emphasis="medium">
                10:42
              </Text>
            </Flex>
            <Text>Here is the brief and the final hero for tomorrow's review.</Text>
          </Stack>
          <Flex gap="2" wrap="wrap">
            <Attachment size={size} icon={<HugeiconsIcon icon={Pdf01Icon} strokeWidth={iconStroke} aria-hidden />} meta="1.2 MB">
              brief.pdf
            </Attachment>
            <Attachment size={size} icon={<img src="/backdrop.jpg" alt="" />} meta="3.8 MB">
              hero-final.png
            </Attachment>
          </Flex>
        </Stack>
      </Flex>
    </Card>
  );
}
```

### Under a field, one per line

A field that accepts files lists the files it has so far, one under the other. The failed file says why in `meta`, because the red colour alone does not explain the problem.

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Csv01Icon, FileVideoIcon, Pdf01Icon } from "@hugeicons/core-free-icons";
import {
  Attachment,
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Stack,
  iconStroke,
  type Size,
} from "@kushagradhawan/kookie-ui-react";

const icon = (glyph: typeof Pdf01Icon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

// In a form: the files a field has taken so far, one under the other. A failed one says why
// in `meta`, because the red alone is not a message.
export default function Example({ size = "2", backdrop = false }: { size?: Size; backdrop?: boolean }) {
  return (
    <Field size={size} style={{ minWidth: "22rem" }}>
      <FieldLabel>Supporting documents</FieldLabel>
      <Stack gap="2">
        <Attachment size={size} backdrop={backdrop} icon={icon(Pdf01Icon)} meta="1.2 MB" onRemove={() => {}}>
          invoice-0421.pdf
        </Attachment>
        <Attachment
          size={size}
          backdrop={backdrop}
          state="uploading"
          progress={0.35}
          icon={icon(FileVideoIcon)}
          meta="35% of 18 MB"
          onRemove={() => {}}
        >
          site-visit.mp4
        </Attachment>
        <Attachment
          size={size}
          backdrop={backdrop}
          state="error"
          icon={icon(Csv01Icon)}
          meta="Larger than 25 MB"
          onRemove={() => {}}
        >
          ledger-export.csv
        </Attachment>
      </Stack>
      <Button>Choose files</Button>
      <FieldDescription>PDF, images or video, up to 25 MB each.</FieldDescription>
    </Field>
  );
}
```

## Props

Generated from the types. It lists what this component DECLARES: a prop that arrives from a shared type or from the platform is real and is not repeated here.

| Prop | Type | What it does |
| --- | --- | --- |
| `backdrop?` | `boolean` | Set `backdrop` when the tile sits over other content, such as an image. |
| `children` | `string` | The file name. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `icon?` | `React.ReactNode` | An icon or a thumbnail for the file. |
| `meta?` | `React.ReactNode` | A second line of text, such as the file size, the file type or an error message. |
| `onRemove?` | `() => void` | Called when the user presses the remove button. |
| `progress?` | `number` | The upload progress, from 0 to 1. |
| `removeLabel?` | `string` | The accessible name of the remove button. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the tile, from `1` to `4`. |
| `state?` | `"idle" \| "uploading" \| "processing" \| "error"` | What is happening to the file: `idle`, `uploading`, `processing` or `error`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |
