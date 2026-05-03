import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
};

export function PosthogProvider({ children }: { children: React.ReactNode }) {
  if (!import.meta.env.VITE_PUBLIC_POSTHOG_KEY) {
    return children;
  }

  return (
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      {children}
    </PostHogProvider>
  );
}
