import { type ErrorBoundaryProps, Link } from "expo-router";
import { ArrowLeftIcon, RefreshCwIcon, TriangleAlertIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Linking, View } from "react-native";

import { appConfig } from "@hype-stack/enums";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

const ISSUES_URL = `https://github.com/${appConfig.repository.owner}/${appConfig.repository.name}/issues`;

/**
 * Root error boundary, exported as `ErrorBoundary` from the root layout -
 * the mobile counterpart of the frontend's AppError route error component.
 */
export const AppError = ({ error, retry }: ErrorBoundaryProps) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <View className="bg-page-background flex-1 items-center justify-center gap-6 p-6">
      <View className="bg-destructive/10 size-20 items-center justify-center rounded-full">
        <Icon as={TriangleAlertIcon} className="text-destructive size-10" />
      </View>

      <View className="items-center gap-2">
        <Text variant="h3" className="text-center">
          App crashed
        </Text>
        <Text variant="muted" className="text-center">
          {error.message || "Something went wrong"}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Link href="/" asChild>
          <Button variant="secondary">
            <Icon as={ArrowLeftIcon} className="size-4" />
            <Text>Go to Home</Text>
          </Button>
        </Link>
        <Button variant="ghost" onPress={() => void retry()}>
          <Icon as={RefreshCwIcon} className="size-4" />
          <Text>Try again</Text>
        </Button>
      </View>

      <Button variant="link" onPress={() => void Linking.openURL(ISSUES_URL)}>
        <Text variant="muted">If the problem persists, report a bug</Text>
      </Button>
    </View>
  );
};
