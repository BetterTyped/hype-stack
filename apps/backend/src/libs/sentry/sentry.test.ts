import * as Sentry from "@sentry/node";
import { createServer } from "node:http";

import { onError } from "../../middleware/error/error-middleware";
import { initSentry } from "./sentry";

describe("initSentry", () => {
  const originalDsn = process.env.SENTRY_DSN;

  afterEach(async () => {
    process.env.SENTRY_DSN = originalDsn;
    await Sentry.close();
  });

  it("delivers an unexpected error from the error middleware to the configured DSN", async () => {
    // Arrange
    let envelope = "";
    const server = createServer((request, response) => {
      request.setEncoding("utf8");
      request.on("data", (chunk: string) => {
        envelope += chunk;
      });
      request.on("end", () => {
        response.writeHead(200);
        response.end();
      });
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Failed to start test Sentry server");
    process.env.SENTRY_DSN = `http://public@127.0.0.1:${address.port}/1`;

    // Act
    initSentry();
    onError(new Error("backend sentry regression"));
    await Sentry.flush(2_000);
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    // Assert
    expect(envelope).toContain("backend sentry regression");
  });
});
