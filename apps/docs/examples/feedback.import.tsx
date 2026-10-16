"use client";

import * as React from "react";
import { Button, Card, Flex, Heading, Progress, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const TOTAL = 24;

export default function Example() {
  const [uploaded, setUploaded] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const done = uploaded === TOTAL;

  React.useEffect(() => {
    if (!uploading) return;
    const timer = setInterval(() => {
      setUploaded((n) => {
        if (n + 1 >= TOTAL) setUploading(false);
        return Math.min(n + 1, TOTAL);
      });
    }, 120);
    return () => clearInterval(timer);
  }, [uploading]);

  const start = () => {
    setUploaded(0);
    setUploading(true);
  };

  return (
    <Card size="3" style={{ maxWidth: "24rem" }}>
      <Stack gap="4">
        <Heading size="6">Import files</Heading>

        {done ? (
          <Text size="3" tone="success">Imported {TOTAL} files.</Text>
        ) : (
          <Stack gap="2">
            <Progress value={uploading ? (uploaded / TOTAL) * 100 : null} aria-label="Importing files" />
            <Text size="2" emphasis="medium">
              {uploaded} of {TOTAL} files
            </Text>
          </Stack>
        )}

        <Flex justify="flex-end">
          <Button emphasis="loud" loading={uploading} onClick={start}>
            {done ? "Import again" : "Import"}
          </Button>
        </Flex>
      </Stack>
    </Card>
  );
}
