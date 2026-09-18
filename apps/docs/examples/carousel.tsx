import { Carousel, CarouselItem, CarouselNext, CarouselPrevious, CarouselRail, Flex, Stack, Text } from "@kookie-ui/react";

const COVERS = ["Wan Image to Video", "GPT Image", "Clarity Upscaler", "BiRefNet", "Flux Kontext"];

export default function Example() {
  return (
    <Carousel aria-label="Models">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Text weight="medium">Models</Text>
          <Flex gap="2">
            <CarouselPrevious>‹</CarouselPrevious>
            <CarouselNext>›</CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {COVERS.map((name) => (
              <CarouselItem key={name} style={{ inlineSize: "12rem", flex: "none" }}>
                <Stack gap="2">
                  <div
                    style={{
                      aspectRatio: "4 / 3",
                      borderRadius: "var(--radius-surface-1)",
                      background: "var(--neutral-3)",
                    }}
                  />
                  <Text size="2">{name}</Text>
                </Stack>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
