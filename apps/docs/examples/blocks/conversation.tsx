import { Stack } from "@kookie-ui/react";

import { Conversation, Pictures, Reply, Step, Steps, Turn, UserMessage } from "../../blocks/conversation";
import { ArrowDownIcon } from "../../app/icons";

export default function Example() {
  return (
    <Conversation aria-label="Conversation" jumpLabel="Jump to the latest" jumpIcon={<ArrowDownIcon />}>
      <Turn id="u1" from="person">
        <UserMessage attachments={<div role="img" aria-label="Product shot" style={{ aspectRatio: "4 / 3" }} />}>
          Launch images for a new sneaker, from this product shot
        </UserMessage>
      </Turn>
      <Turn id="a1" from="agent">
        <Stack gap="5">
          <Steps summary="3 steps">
            <Step>Read the graph</Step>
            <Step>Added 10 nodes</Step>
            <Step>Ran 4 nodes</Step>
          </Steps>
          <Pictures>
            <div role="img" aria-label="Draft 1" />
            <div role="img" aria-label="Draft 2" />
          </Pictures>
          <Reply>Two directions. Which one should the final follow?</Reply>
        </Stack>
      </Turn>
    </Conversation>
  );
}
