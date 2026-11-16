import React, { useMemo } from "react";
import Svg, { Path, Rect } from "react-native-svg";
import { Text } from "@/components/ui";
import { qrcodegen } from "@/lib/vendor/qrcodegen";

interface QrisPayloadCodeProps {
  payload: string;
}

/**
 * Render a Duitku QRIS string fully on-device. Never send QR/payment payloads
 * to third-party QR generation services.
 */
export function QrisPayloadCode({ payload }: QrisPayloadCodeProps) {
  const code = useMemo(() => {
    try {
      return qrcodegen.QrCode.encodeText(payload, qrcodegen.QrCode.Ecc.MEDIUM);
    } catch {
      return null;
    }
  }, [payload]);

  const path = useMemo(() => {
    if (!code) return "";
    const segments: string[] = [];
    for (let y = 0; y < code.size; y++) {
      for (let x = 0; x < code.size; x++) {
        if (code.getModule(x, y)) {
          segments.push(`M${x + 4},${y + 4}h1v1h-1z`);
        }
      }
    }
    return segments.join("");
  }, [code]);

  if (!code) {
    return (
      <Text accessibilityRole="alert" className="text-destructive">
        Payload QRIS tidak dapat ditampilkan. Jangan membayar sebelum instruksi valid tersedia.
      </Text>
    );
  }

  const size = code.size + 8; // Standard 4-module quiet zone on all sides.
  return (
    <Svg width={240} height={240} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" />
      <Path d={path} fill="#000000" />
    </Svg>
  );
}
