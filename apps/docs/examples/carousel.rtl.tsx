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
  Stack,
  Text,
  iconStroke,
} from "@kookie-ui/react";

const ITEMS = ["الفواتير", "المشاريع", "الأعضاء", "التقارير", "الإعدادات"];

// In a right-to-left page the rail starts on the right. "Previous" still moves toward the
// start, so its arrow points right.
export default function Example() {
  return (
    <Box dir="rtl" lang="ar">
      <Carousel aria-label="الأقسام">
        <Stack gap="4">
          <Flex gap="2">
            <CarouselPrevious aria-label="السابق">
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselPrevious>
            <CarouselNext aria-label="التالي">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={iconStroke} aria-hidden />
            </CarouselNext>
          </Flex>
          <CarouselRail fade>
            <Flex gap="4">
              {ITEMS.map((name) => (
                <CarouselItem key={name} style={{ inlineSize: "10rem", flex: "none" }}>
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
    </Box>
  );
}
