/**
 * Reusable Resend mock for integration tests.
 * Resend is external SaaS -- mock it.
 */
import * as resendModule from "@backend/libs/email/resend";

export type ResendMock = {
  emails: {
    send: ReturnType<typeof vi.fn>;
  };
};

export function createResendMock(): ResendMock {
  return {
    emails: {
      send: vi.fn().mockResolvedValue({ id: "mock_email_id" }),
    },
  };
}

export function installResendMock(mock: ResendMock): void {
  Object.defineProperty(resendModule, "resend", {
    get: () => mock,
    configurable: true,
  });
}
