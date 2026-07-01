import { DevServerBanner } from "@/components/dev/dev-server-banner";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Toaster first so it subscribes to Sonner before the rest of the tree
          mounts; otherwise a toast fired in a child's mount effect (e.g. the
          OAuth error on the login page) is dropped before the Toaster listens. */}
      <Toaster />
      <DevServerBanner />
      {children}
    </>
  );
}
