import type { LoginValues } from "./auth-validation";
import { apiFetch } from "./api-client";
import type { AuthUser, UserRole } from "./types";

export { API_BASE_URL } from "./api-client";

/** User shape returned by the NestJS auth API. */
export interface ApiUser {
  readonly _id: string;
  readonly email: string;
  readonly name: string;
  readonly role: "admin" | "user";
  readonly address?: string;
  readonly phone?: string;
  readonly isEmailVerified?: boolean;
}

export interface LoginApiResponse {
  readonly accessToken: string;
  readonly user: ApiUser;
}

export interface AuthSession {
  readonly user: AuthUser;
  readonly accessToken: string;
}

export type AuthErrorCode = "invalid-credentials" | "email-not-verified" | "network-error";

export interface AuthSuccess {
  readonly ok: true;
  readonly session: AuthSession;
}

export interface AuthFailure {
  readonly ok: false;
  readonly code: AuthErrorCode;
  readonly message: string;
}

export type AuthResult = AuthSuccess | AuthFailure;

function mapApiRole(role: ApiUser["role"]): UserRole {
  return role === "admin" ? "admin" : "customer";
}

/** Maps a backend user record to the frontend auth model. */
export function mapApiUserToAuthUser(apiUser: ApiUser): AuthUser {
  return {
    id: apiUser._id,
    name: apiUser.name,
    email: apiUser.email,
    role: mapApiRole(apiUser.role),
    address: apiUser.address,
    phone: apiUser.phone,
  };
}

/** Authenticates with email/password and returns a JWT session. */
export async function loginApi(values: LoginValues): Promise<AuthResult> {
  const result = await apiFetch<LoginApiResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: values.email.trim(),
      password: values.password,
    }),
  });

  if (!result.ok) {
    if (result.status === 0) {
      return {
        ok: false,
        code: "network-error",
        message: result.message,
      };
    }

    if (result.status === 403) {
      return {
        ok: false,
        code: "email-not-verified",
        message: "Vui lòng xác minh email trước khi đăng nhập.",
      };
    }

    return {
      ok: false,
      code: "invalid-credentials",
      message: "Email hoặc mật khẩu không đúng.",
    };
  }

  return {
    ok: true,
    session: {
      user: mapApiUserToAuthUser(result.data.user),
      accessToken: result.data.accessToken,
    },
  };
}

/** Loads the current user profile using a stored access token. */
export async function getMeApi(
  accessToken: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false }> {
  const result = await apiFetch<ApiUser>("/api/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!result.ok) {
    return { ok: false };
  }

  return { ok: true, user: mapApiUserToAuthUser(result.data) };
}
