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
import { m } from "@/paraglide/messages.js";

// Replaces only this screen when it crashes; the root layout keeps working.
export { PageError as ErrorBoundary } from "@/components/errors/page-error";

const SCREEN_OPTIONS = {
  title: m.app_title(),
  headerRight: () => <ThemeToggle />,
};

const LOGO_STYLE: ImageStyle = {
  height: 72,
  width: 72,
};

const modules = [
  { icon: KeyRoundIcon, label: m.home_module_auth_label(), detail: m.home_module_auth_detail() },
  { icon: ServerIcon, label: m.home_module_backend_label(), detail: m.home_module_backend_detail() },
  { icon: BellIcon, label: m.home_module_notifications_label(), detail: m.home_module_notifications_detail() },
  { icon: ZapIcon, label: m.home_module_realtime_label(), detail: m.home_module_realtime_detail() },
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
            {m.home_hero_heading()}
          </Text>
          <Text variant="muted" className="text-center">
            {m.home_hero_subtitle()}
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
            <CardTitle>{m.home_start_title()}</CardTitle>
            <CardDescription>
              Edit <Text variant="code">src/routes/index.tsx</Text> and call the backend through{" "}
              <Text variant="code">sdk</Text> from <Text variant="code">@/api/sdk</Text>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-row gap-2">
            <Button className="flex-1">
              <Text>{m.home_get_started()}</Text>
              <Icon as={ArrowRight} className="size-4" />
            </Button>
            <Button variant="outline" className="flex-1">
              <Text>{m.home_components()}</Text>
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </>
  );
}
