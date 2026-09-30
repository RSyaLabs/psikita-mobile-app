import { Alert as RNAlert, Platform } from "react-native";

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
};

if (Platform.OS === "web" && typeof window !== "undefined") {
  RNAlert.alert = (
    title: string,
    message?: string,
    buttons?: AlertButton[],
  ) => {
    const fullMessage = message ? `${title}\n\n${message}` : title;

    if (buttons && buttons.length > 1) {
      const confirmButton =
        buttons.find((b) => {
          const t = (b.text || "").toLowerCase();
          return (
            t.includes("ya") ||
            t.includes("setuju") ||
            t.includes("ok") ||
            t.includes("lanjut") ||
            t.includes("kirim") ||
            t.includes("selesai") ||
            t.includes("hapus") ||
            t.includes("tarik") ||
            t.includes("terima") ||
            t.includes("aktifkan") ||
            b.style === "destructive"
          );
        }) || buttons[buttons.length - 1];

      const cancelButton =
        buttons.find((b) => {
          const t = (b.text || "").toLowerCase();
          return (
            t.includes("batal") ||
            t.includes("tidak") ||
            t.includes("kembali") ||
            b.style === "cancel"
          );
        }) || buttons[0];

      const result = window.confirm(fullMessage);
      if (result) {
        confirmButton?.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    } else {
      window.alert(fullMessage);
      if (buttons && buttons[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  };
}

export { RNAlert as Alert };
