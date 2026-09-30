import React, { Component, ErrorInfo, ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertTriangle, RefreshCw } from "lucide-react-native";
import {
  Box,
  Heading,
  Text,
  Button,
  ButtonText,
  ButtonIcon,
} from "@/components/ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[AppErrorBoundary] Caught exception:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
          <Box className="w-16 h-16 rounded-full bg-secondary/15 items-center justify-center mb-4 border border-secondary/30">
            <AlertTriangle size={32} className="text-secondary" />
          </Box>
          <Heading size="md" bold className="text-foreground text-center mb-2">
            Terjadi Kendala Teknis
          </Heading>
          <Text
            size="sm"
            className="text-muted-foreground text-center mb-6 leading-relaxed max-w-[320px]"
          >
            Tenang, data konsultasi Anda aman. Silakan muat ulang tampilan untuk
            melanjutkan sesi.
          </Text>
          <Button
            size="default"
            onPress={this.handleReset}
            className="flex-row items-center gap-2 bg-primary px-6 h-12 rounded-xl"
          >
            <ButtonIcon as={RefreshCw} className="text-primary-foreground" />
            <ButtonText className="text-primary-foreground font-semibold text-sm">
              Muat Ulang Layar
            </ButtonText>
          </Button>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}
