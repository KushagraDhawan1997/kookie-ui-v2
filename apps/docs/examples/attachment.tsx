import { Attachment, Stack, type TypeSize } from "@kookie-ui/react";

export default function Example({ size = "3" }: { size?: TypeSize }) {
  void size;
  return (
    <Stack gap="3" maxWidth="22rem">
      <Attachment meta="2.4 MB" onRemove={() => {}}>
        quarterly-report.pdf
      </Attachment>
      <Attachment state="uploading" progress={0.62} meta="62% of 18 MB">
        product-walkthrough.mp4
      </Attachment>
      <Attachment state="processing" meta="Extracting text">
        contract-signed.pdf
      </Attachment>
      <Attachment state="error" meta="File is larger than 25 MB" onRemove={() => {}}>
        dataset-export.csv
      </Attachment>
    </Stack>
  );
}
