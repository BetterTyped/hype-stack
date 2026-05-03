import { PosthogProvider } from "./posthog/posthog";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PosthogProvider>
      {children}
      <Toaster />
    </PosthogProvider>
  );
}
