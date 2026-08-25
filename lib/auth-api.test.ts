import { afterEach, describe, expect, it, vi } from "vitest";
import { loginApi } from "./auth-api";

const fetchMock = vi.fn();

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("loginApi", () => {
  it("returns a session on success", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: "jwt-token",
        user: {
          _id: "user-1",
          email: "user@dreamkit.vn",
          name: "User",
          role: "user",
        },
      }),
    });

    const result = await loginApi({
      email: "user@dreamkit.vn",
      password: "secret123",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.accessToken).toBe("jwt-token");
      expect(result.session.user.role).toBe("customer");
    }
  });

  it("maps 401 to invalid credentials", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({ message: "Invalid credentials" }),
    });

    const result = await loginApi({
      email: "user@dreamkit.vn",
      password: "wrong",
    });

    expect(result).toEqual({
      ok: false,
      code: "invalid-credentials",
      message: "Email hoặc mật khẩu không đúng.",
    });
  });

  it("maps 403 to email not verified", async () => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: async () => ({ message: "Email not verified" }),
    });

    const result = await loginApi({
      email: "user@dreamkit.vn",
      password: "secret123",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("email-not-verified");
    }
  });
});
