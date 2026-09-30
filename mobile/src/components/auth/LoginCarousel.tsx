import React, { useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Box, Heading, Image, ScrollView, Text, VStack } from "@/components/ui";

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

export function LoginCarousel() {
  const { width, height } = useWindowDimensions();
  const maxContainerWidth = 440;
  const effectiveWidth = Math.min(width, maxContainerWidth);
  const cardWidth = Math.max(effectiveWidth - 40, 280);
  const cardHeight = Math.min(Math.max(height * 0.45, 300), 380);
  const carouselRef = useRef<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <VStack space="md" className="items-center">
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const offsetX = e.nativeEvent.contentOffset.x;
          const index = Math.round(offsetX / cardWidth);
          setActiveSlide(index);
        }}
        contentContainerStyle={{
          alignItems: "center",
        }}
        className="w-full"
      >
        {CAROUSEL_SLIDES.map((slide) => (
          <Box
            key={slide.id}
            style={{ width: cardWidth, height: cardHeight }}
            className="rounded-3xl overflow-hidden relative shadow-lg mx-auto"
          >
            <Image
              source={{ uri: slide.image }}
              alt={slide.title}
              className="w-full h-full object-cover"
              resizeMode="cover"
            />
            <Box
              className="absolute inset-0 justify-end p-6"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              }}
            >
              <Heading
                level={2}
                size="2xl"
                bold
                className="text-white mb-2 leading-tight drop-shadow-md"
              >
                {slide.title}
              </Heading>
              <Text
                size="sm"
                className="text-white/90 leading-relaxed font-medium drop-shadow"
              >
                {slide.subtitle}
              </Text>
            </Box>
          </Box>
        ))}
      </ScrollView>

      {/* Dots Indicator */}
      <Box className="flex-row items-center justify-center gap-1.5 mt-2">
        {CAROUSEL_SLIDES.map((_, idx) => (
          <Box
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeSlide === idx ? "w-6 bg-primary" : "w-2 bg-muted"
            }`}
          />
        ))}
      </Box>
    </VStack>
  );
}
