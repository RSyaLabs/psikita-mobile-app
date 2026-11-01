import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertTriangle, RefreshCw } from "lucide-react-native";

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
        <SafeAreaView style={styles.container}>
          <View style={styles.iconCircle}>
            <AlertTriangle size={32} color="#4A3B6B" />
          </View>
          <Text style={styles.title}>Terjadi Kendala Teknis</Text>
          <Text style={styles.description}>
            Tenang, data konsultasi Anda aman. Silakan muat ulang tampilan untuk
            melanjutkan sesi.
          </Text>
          <Pressable onPress={this.handleReset} style={styles.button}>
            <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Muat Ulang Layar</Text>
          </Pressable>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F7EE",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EAE4F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#CFC8D8",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262130",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4B4656",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    maxWidth: 320,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4A3B6B",
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
