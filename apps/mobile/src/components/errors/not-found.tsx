import { Link } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { m } from "@/paraglide/messages.js";

/** Rendered by the +not-found route - the mobile counterpart of the frontend's NotFound. */
export const NotFound = () => {
  return (
    <View className="bg-page-background flex-1 items-center justify-center gap-4 p-4">
      <Text variant="h3">{m.not_found_heading()}</Text>
      <Link href="/" asChild>
        <Button variant="outline">
          <Text>{m.not_found_go_home()}</Text>
        </Button>
      </Link>
    </View>
  );
};
