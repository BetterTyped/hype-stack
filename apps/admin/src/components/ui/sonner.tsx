import { Toaster as Sonner, ToasterProps } from "sonner";

const TOASTER_STYLE = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
} as React.CSSProperties;

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner className="toaster group" style={TOASTER_STYLE} {...props} />;
};

export { Toaster };
