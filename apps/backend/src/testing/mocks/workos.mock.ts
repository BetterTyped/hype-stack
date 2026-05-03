/**
 * Reusable WorkOS mock for integration tests.
 *
 * WorkOS is the ONLY auth provider -- it's external SaaS, so we mock it.
 * Everything else (DB, Valkey, S3) uses real Docker services.
 *
 * Usage:
 *   import { createWorkosMock, installWorkosMock } from "@backend/testing/mocks/workos.mock";
 *
 *   const workosMock = createWorkosMock();
 *   installWorkosMock(workosMock);
 *
 *   // Then in tests:
 *   workosMock.userManagement.authenticateWithPassword.mockResolvedValue({ ... });
 */
import * as context from "@backend/context";

export type WorkosUserManagementMock = {
  createUser: ReturnType<typeof vi.fn>;
  authenticateWithPassword: ReturnType<typeof vi.fn>;
  authenticateWithEmailVerification: ReturnType<typeof vi.fn>;
  authenticateWithCode: ReturnType<typeof vi.fn>;
  authenticateWithOrganizationSelection: ReturnType<typeof vi.fn>;
  getAuthorizationUrl: ReturnType<typeof vi.fn>;
  revokeSession: ReturnType<typeof vi.fn>;
  loadSealedSession: ReturnType<typeof vi.fn>;
  createPasswordReset: ReturnType<typeof vi.fn>;
  resetPassword: ReturnType<typeof vi.fn>;
  sendInvitation: ReturnType<typeof vi.fn>;
  acceptInvitation: ReturnType<typeof vi.fn>;
  findInvitationByToken: ReturnType<typeof vi.fn>;
  listInvitations: ReturnType<typeof vi.fn>;
  createOrganizationMembership: ReturnType<typeof vi.fn>;
  listOrganizationMemberships: ReturnType<typeof vi.fn>;
};

export type WorkosOrganizationsMock = {
  createOrganization: ReturnType<typeof vi.fn>;
  deleteOrganization: ReturnType<typeof vi.fn>;
  getOrganization: ReturnType<typeof vi.fn>;
  updateOrganization: ReturnType<typeof vi.fn>;
};

export type WorkosMock = {
  userManagement: WorkosUserManagementMock;
  organizations: WorkosOrganizationsMock;
};

export function createWorkosMock(): WorkosMock {
  return {
    userManagement: {
      createUser: vi.fn(),
      authenticateWithPassword: vi.fn(),
      authenticateWithEmailVerification: vi.fn(),
      authenticateWithCode: vi.fn(),
      authenticateWithOrganizationSelection: vi.fn(),
      getAuthorizationUrl: vi.fn(),
      revokeSession: vi.fn(),
      loadSealedSession: vi.fn(),
      createPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      sendInvitation: vi.fn(),
      acceptInvitation: vi.fn(),
      findInvitationByToken: vi.fn(),
      listInvitations: vi.fn(),
      createOrganizationMembership: vi.fn(),
      listOrganizationMemberships: vi.fn(),
    },
    organizations: {
      createOrganization: vi.fn(),
      deleteOrganization: vi.fn(),
      getOrganization: vi.fn(),
      updateOrganization: vi.fn(),
    },
  };
}

/**
 * Install the WorkOS mock onto the context module.
 * Call this BEFORE importing any feature module that reads `workos` from context.
 */
export function installWorkosMock(mock: WorkosMock): void {
  Object.defineProperty(context, "workos", {
    get: () => mock,
    configurable: true,
  });
}
