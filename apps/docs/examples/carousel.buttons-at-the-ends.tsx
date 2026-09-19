import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
  Box,
  Card,
  Carousel,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRail,
  Flex,
  Text,
  iconStroke,
} from "@kookie-ui/react";

const PLANS = ["Starter", "Team", "Business", "Enterprise", "Education"];

export default function Example() {
  return (
    <Carousel aria-label="Plans">
      <Flex gap="3" align="center">
        <CarouselPrevious aria-label="Previous plans">
          <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
        </CarouselPrevious>
        <Box flexGrow="1" minWidth="0">
          <CarouselRail>
            <Flex gap="3">
              {PLANS.map((plan) => (
                <CarouselItem key={plan} style={{ inlineSize: "10rem", flex: "none" }}>
                  <Card>
                    <Text size="2" weight="medium">
                      {plan}
                    </Text>
                  </Card>
                </CarouselItem>
              ))}
            </Flex>
          </CarouselRail>
        </Box>
        <CarouselNext aria-label="Next plans">
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
        </CarouselNext>
      </Flex>
    </Carousel>
  );
}
