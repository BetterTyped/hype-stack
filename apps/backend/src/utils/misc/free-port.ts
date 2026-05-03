import { execSync } from "child_process";
import { createConnection } from "net";

export const freePort = async (port: number): Promise<void> => {
  if (process.env.NODE_ENV !== "development") return;

  const isPortTaken = await new Promise<boolean>((resolve) => {
    const socket = createConnection({ port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
  });

  if (!isPortTaken) return;

  try {
    execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
  } catch {
    // Already free
  }
};
