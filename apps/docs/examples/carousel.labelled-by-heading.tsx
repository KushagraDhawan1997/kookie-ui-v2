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
  Heading,
  Stack,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

const PROJECTS = [
  { name: "Website redesign", owner: "Shruti Bhatia" },
  { name: "Mobile onboarding", owner: "Shruti Bhatia" },
  { name: "Billing migration", owner: "Shruti Bhatia" },
  { name: "Help centre", owner: "Shruti Bhatia" },
  { name: "Brand refresh", owner: "Shruti Bhatia" },
];

export default function Example() {
  return (
    <Carousel aria-labelledby="recent-projects">
      <Stack gap="4">
        <Flex justify="space-between" align="center" gap="4">
          <Heading size="5" id="recent-projects" render={<h2 />}>
            Recent projects
          </Heading>
          <Flex gap="2">
            <CarouselPrevious>
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext>
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
        </Flex>
        <CarouselRail fade>
          <Flex gap="4">
            {PROJECTS.map((project) => (
              <CarouselItem key={project.name} style={{ inlineSize: "14rem", flex: "none" }}>
                <Card render={<a href="#project" />}>
                  <Stack gap="1">
                    <Text size="3" weight="medium">
                      {project.name}
                    </Text>
                    <Text size="2" emphasis="medium">
                      {project.owner}
                    </Text>
                  </Stack>
                </Card>
              </CarouselItem>
            ))}
          </Flex>
        </CarouselRail>
      </Stack>
    </Carousel>
  );
}
