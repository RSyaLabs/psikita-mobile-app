import React, { useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import {
  Box,
  Heading,
  HStack,
  Image,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export const CAROUSEL_SLIDES = [
  {
    id: "1",
    title: "Lagi banyak pikiran?",
    subtitle: "Ceritakan apa yang sedang kamu rasakan.",
    image:
      "https://images.unsplash.com/photo-1770108763069-1e5729f01b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzEwNDJ8&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: "2",
    title: "Konsultasi dengan psikolog.",
    subtitle: "Bicara langsung dengan psikolog atau psikiater.",
    image:
      "https://images.unsplash.com/photo-1573495804664-b1c0849525af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "3",
    title: "Dukungan BPJS Kesehatan.",
    subtitle: "Dapat digunakan dengan rujukan faskes pertama.",
    image:
      "https://images.unsplash.com/photo-1758691461990-03b49d969495?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

export function LoginHeroCarousel() {
  const { width, height } = useWindowDimensions();
  const maxContainerWidth = 440;
  const effectiveWidth = Math.min(width, maxContainerWidth);
  const cardWidth = Math.max(effectiveWidth - 40, 280);
  const cardHeight = Math.min(Math.max(height * 0.45, 300), 380);
  const carouselRef = useRef<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <Box className="w-full">
      {/* Hero Carousel Zone */}
      <Box
        style={{ height: cardHeight }}
        className="w-full rounded-2xl overflow-hidden mb-3.5 bg-muted"
      >
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={cardWidth}
          snapToAlignment="start"
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / cardWidth);
            setActiveSlide(index);
          }}
          className="w-full h-full"
        >
          {CAROUSEL_SLIDES.map((slide) => (
            <Box
              key={slide.id}
              style={{ width: cardWidth, height: cardHeight }}
              className="relative"
            >
              <Image
                source={{ uri: slide.image }}
                alt={slide.title}
                className="w-full h-full"
                resizeMode="cover"
              />
              <Box className="absolute inset-0 bg-black/25" />

              <Box className="absolute bottom-3 left-3 right-3 bg-primary/95 rounded-xl p-3.5">
                <VStack space="xs">
                  <Heading
                    level={2}
                    size="md"
                    bold
                    className="text-primary-foreground"
                  >
                    {slide.title}
                  </Heading>
                  <Text
                    size="xs"
                    className="text-primary-foreground/90 leading-relaxed"
                  >
                    {slide.subtitle}
                  </Text>
                </VStack>
              </Box>
            </Box>
          ))}
        </ScrollView>
      </Box>

      {/* Interactive Slider Dots */}
      <HStack space="xs" className="items-center justify-center">
        {CAROUSEL_SLIDES.map((_, idx) => {
          const isActive = activeSlide === idx;
          return (
            <Pressable
              key={idx}
              onPress={() => {
                haptics.light();
                setActiveSlide(idx);
                carouselRef.current?.scrollTo({
                  x: idx * cardWidth,
                  animated: true,
                });
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="py-1 px-1"
            >
              <Box
                className={
                  isActive
                    ? "w-6 h-2 bg-primary rounded-full"
                    : "w-2 h-2 bg-border rounded-full"
                }
              />
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}
