import { Stack } from "expo-router";
import { ArrowRight, BellIcon, KeyRoundIcon, ServerIcon, ZapIcon } from "lucide-react-native";
import { Image, type ImageStyle, ScrollView, View } from "react-native";

import logoSource from "@/assets/images/logo.png";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

// Replaces only this screen when it crashes; the root layout keeps working.
export { PageError as ErrorBoundary } from "@/components/errors/page-error";

const SCREEN_OPTIONS = {
  title: "Hype Stack",
  headerRight: () => <ThemeToggle />,
};

const LOGO_STYLE: ImageStyle = {
  height: 72,
  width: 72,
};

const modules = [
  { icon: KeyRoundIcon, label: "Authentication", detail: "Auth, MFA & email flows" },
  { icon: ServerIcon, label: "Backend API", detail: "Hono, Prisma, Kysely, Valkey cache" },
  { icon: BellIcon, label: "Notifications", detail: "In-app + email with real-time delivery" },
  { icon: ZapIcon, label: "Real-time", detail: "Type-safe WebSockets with HyperFetch" },
];

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        className="bg-page-background flex-1"
        contentContainerClassName="items-center gap-8 p-4 pb-16"
        testID="home-screen"
      >
        <View className="items-center gap-3 pt-4">
          <Image source={logoSource} style={LOGO_STYLE} resizeMode="contain" />
          <Text variant="h3" className="text-center">
            Stop building boilerplate.
          </Text>
          <Text variant="muted" className="text-center">
            The same design tokens and the same typed API client as the web app, running on React Native.
          </Text>
        </View>

        <Separator />

        <View className="w-full gap-3">
          {modules.map(({ icon, label, detail }) => (
            <Card key={label} className="w-full">
              <CardHeader className="flex-row items-center gap-3">
                <View className="bg-primary/10 size-9 items-center justify-center rounded-lg">
                  <Icon as={icon} className="text-primary size-4" />
                </View>
                <View className="flex-1">
                  <CardTitle>{label}</CardTitle>
                  <CardDescription>{detail}</CardDescription>
                </View>
              </CardHeader>
            </Card>
          ))}
        </View>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Start here</CardTitle>
            <CardDescription>
              Edit <Text variant="code">src/routes/index.tsx</Text> and call the backend through{" "}
              <Text variant="code">sdk</Text> from <Text variant="code">@/api/sdk</Text>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-row gap-2">
            <Button className="flex-1">
              <Text>Get Started</Text>
              <Icon as={ArrowRight} className="size-4" />
            </Button>
            <Button variant="outline" className="flex-1">
              <Text>Components</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
