import { Link, Stack } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

const SCREEN_OPTIONS = { title: "Not found" };

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <View className="bg-page-background flex-1 items-center justify-center gap-4 p-4">
        <Text variant="h3">This screen doesn&apos;t exist.</Text>
        <Link href="/" asChild>
          <Button variant="outline">
            <Text>Go to home screen</Text>
          </Button>
        </Link>
      </View>
    </>
  );
}
