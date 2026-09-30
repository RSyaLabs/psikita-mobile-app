import React from "react";
import {
  Button,
  ButtonText,
  Card,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@/components/ui";

type StateRole = "progressbar" | "summary" | "alert";

export interface AsyncStateProps {
  label?: string;
  description?: string;
  testID?: string;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ErrorStateProps extends AsyncStateProps {
  errorLabel?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

interface StateShellProps extends AsyncStateProps {
  label: string;
  role: StateRole;
  busy?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function StateShell({
  label,
  description,
  testID,
  className = "",
  role,
  busy = false,
  action,
  children,
}: StateShellProps) {
  return (
    <VStack space="sm">
      <Card
        testID={testID}
        accessible
        accessibilityRole={role}
        accessibilityLabel={label}
        accessibilityHint={description}
        accessibilityState={busy ? { busy: true } : undefined}
        accessibilityLiveRegion={role === "alert" ? "assertive" : "polite"}
        className={`items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 ${className}`}
      >
        {children}
      </Card>
      {action}
    </VStack>
  );
}

export function LoadingState({
  label = "Memuat data",
  description,
  testID,
  className,
}: AsyncStateProps) {
  return (
    <StateShell
      label={label}
      description={description}
      testID={testID}
      className={className}
      role="progressbar"
      busy
    >
      <Spinner size="large" className="text-primary" aria-label={label} />
      <Heading level={2} size="sm" bold className="text-center text-foreground">
        {label}
      </Heading>
      {description ? (
        <Text size="sm" className="text-center text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </StateShell>
  );
}

export function EmptyState({
  label = "Belum ada data",
  description,
  testID,
  className,
  actionLabel,
  onAction,
}: AsyncStateProps) {
  const action =
    actionLabel && onAction ? (
      <Button
        size="sm"
        variant="outline"
        onPress={onAction}
        accessibilityLabel={actionLabel}
        className="mt-1 self-center"
      >
        <ButtonText>{actionLabel}</ButtonText>
      </Button>
    ) : null;

  return (
    <StateShell
      label={label}
      description={description}
      testID={testID}
      className={className}
      role="summary"
      action={action}
    >
      <Heading level={2} size="sm" bold className="text-center text-foreground">
        {label}
      </Heading>
      {description ? (
        <Text size="sm" className="text-center text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </StateShell>
  );
}

export function ErrorState({
  label,
  errorLabel,
  description,
  onRetry,
  retryLabel = "Coba lagi",
  testID,
  className,
}: ErrorStateProps) {
  const resolvedLabel = errorLabel ?? label ?? "Terjadi kendala";
  const action = onRetry ? (
    <Button
      size="sm"
      variant="outline"
      onPress={onRetry}
      accessibilityLabel={retryLabel}
      className="self-center"
    >
      <ButtonText>{retryLabel}</ButtonText>
    </Button>
  ) : null;

  return (
    <StateShell
      label={resolvedLabel}
      description={description}
      testID={testID}
      className={className}
      role="alert"
      action={action}
    >
      <Heading
        level={2}
        size="sm"
        bold
        className="text-center text-destructive"
      >
        {resolvedLabel}
      </Heading>
      {description ? (
        <Text size="sm" className="text-center text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </StateShell>
  );
}

export function UnavailableState({
  label = "Fitur belum tersedia",
  description,
  testID,
  className,
}: AsyncStateProps) {
  return (
    <StateShell
      label={label}
      description={description}
      testID={testID}
      className={className}
      role="alert"
    >
      <Heading level={2} size="sm" bold className="text-center text-foreground">
        {label}
      </Heading>
      {description ? (
        <Text size="sm" className="text-center text-muted-foreground">
          {description}
        </Text>
      ) : null}
    </StateShell>
  );
}
