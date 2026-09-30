import React from "react";
import { Box, Text, Heading, VStack, HStack } from "@/components/ui";

interface DoctorAboutCardProps {
  aboutText?: string;
  tags?: string[];
}

export function DoctorAboutCard({
  aboutText = "Berpengalaman luas dalam penanganan gangguan kecemasan menyeluruh (GAD), episode depresi mayor, insomnia, dan evaluasi pengobatan medis psikiatri berbasis bukti (evidence-based). Mengedepankan ruang bicara yang aman, hangat, dan tanpa penghakiman.",
  tags = [
    "Terapi Kognitif Perilaku (CBT)",
    "Mindfulness Klinis",
    "Farmakoterapi",
  ],
}: DoctorAboutCardProps) {
  return (
    <VStack space="xs" className="mt-4">
      <Heading size="xs" bold className="text-foreground px-1">
        Tentang Praktisi
      </Heading>
      <Box className="bg-card rounded-2xl p-4 border border-border">
        <Text size="xs" className="text-muted-foreground leading-relaxed">
          {aboutText}
        </Text>
        <HStack space="xs" className="mt-3 flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Box key={tag} className="bg-muted px-2.5 py-1 rounded-lg">
              <Text size="xs" bold className="text-foreground text-[11px]">
                {tag}
              </Text>
            </Box>
          ))}
        </HStack>
      </Box>
    </VStack>
  );
}
