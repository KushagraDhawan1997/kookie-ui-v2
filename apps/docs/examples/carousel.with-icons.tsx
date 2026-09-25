import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const TEMPLATES = ["Invoice", "Project brief", "Meeting notes", "Release plan", "Weekly report", "Budget"];

export default function Example() {
  return (
    <Carousel aria-label="Templates">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Text weight="medium">Templates</Text>
          <Flex gap="2">
            <CarouselPrevious aria-label="Previous templates">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext aria-label="Next templates">
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {TEMPLATES.map((name) => (
              <CarouselItem key={name} style={{ inlineSize: "12rem", flex: "none" }}>
                <Card>
                  <Text size="2" weight="medium">
                    {name}
                  </Text>
                </Card>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
