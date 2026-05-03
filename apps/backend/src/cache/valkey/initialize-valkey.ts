import { logger } from "@backend/libs/logger/logger";
import Valkey from "iovalkey";

export type ValkeyClient = Valkey;

export const initializeValkeyClient = async (): Promise<Valkey> => {
  const url = process.env.VALKEY_URL;

  const client = new Valkey(url, { password: process.env.VALKEY_PASSWORD });

  client.on("error", (error) => {
    logger.error({ message: "Valkey Client Error", error: (error as Error).message || error });
  });

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      client.off("error", onError);
      resolve();
    };
    const onError = (err: unknown) => {
      client.off("ready", onReady);
      reject(err);
    };
    client.once("ready", onReady);
    client.once("error", onError);
  }).catch((error) => {
    logger.error({
      message: "Valkey Connection Failed",
      url: process.env.VALKEY_URL,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  });

  return client;
};
