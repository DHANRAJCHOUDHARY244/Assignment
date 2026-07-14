import { AuthService } from "../../src/services/AuthService";

describe("AuthService", () => {
  const authService = new AuthService();

  it("hashes and verifies passwords", async () => {
    const hash = await authService.hashPassword("Secret123!");
    expect(hash).not.toBe("Secret123!");
    await expect(
      authService.comparePassword("Secret123!", hash),
    ).resolves.toBe(true);
    await expect(
      authService.comparePassword("wrong", hash),
    ).resolves.toBe(false);
  });

  it("rejects invalid access tokens", () => {
    expect(() => authService.verifyAccessToken("not-a-jwt")).toThrow(
      "Invalid or expired access token",
    );
  });
});
